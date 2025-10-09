from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import base64
import io
import os
from PIL import Image
import numpy as np
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Global model storage
models = {
    'text2img': None,
    'sam': None,
    'clip': None
}

def load_text2img_model():
    """Load Stable Diffusion or similar text-to-image model"""
    try:
        from diffusers import StableDiffusionPipeline
        
        model_id = os.getenv('TEXT2IMG_MODEL', 'stabilityai/stable-diffusion-2-1')
        pipe = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )
        
        if torch.cuda.is_available():
            pipe = pipe.to('cuda')
        
        models['text2img'] = pipe
        print('✓ Text-to-image model loaded')
    except Exception as e:
        print(f'✗ Failed to load text-to-image model: {e}')

def load_sam_model():
    """Load Segment Anything Model"""
    try:
        from segment_anything import sam_model_registry, SamAutomaticMaskGenerator, SamPredictor
        
        model_type = os.getenv('SAM_MODEL_TYPE', 'vit_h')
        checkpoint = os.getenv('SAM_CHECKPOINT', 'sam_vit_h_4b8939.pth')
        
        sam = sam_model_registry[model_type](checkpoint=checkpoint)
        
        if torch.cuda.is_available():
            sam = sam.to('cuda')
        
        models['sam'] = {
            'model': sam,
            'predictor': SamPredictor(sam),
            'auto_mask_generator': SamAutomaticMaskGenerator(sam)
        }
        print('✓ SAM model loaded')
    except Exception as e:
        print(f'✗ Failed to load SAM model: {e}')

def load_clip_model():
    """Load CLIP for image classification"""
    try:
        import clip
        
        model, preprocess = clip.load('ViT-B/32', device='cuda' if torch.cuda.is_available() else 'cpu')
        models['clip'] = {'model': model, 'preprocess': preprocess}
        print('✓ CLIP model loaded')
    except Exception as e:
        print(f'✗ Failed to load CLIP model: {e}')

# Initialize models on startup
@app.before_first_request
def init_models():
    print('Initializing AI models...')
    load_text2img_model()
    load_sam_model()
    load_clip_model()

def base64_to_image(base64_str):
    """Convert base64 string to PIL Image"""
    image_data = base64.b64decode(base64_str.split(',')[-1])
    return Image.open(io.BytesIO(image_data)).convert('RGB')

def image_to_base64(image):
    """Convert PIL Image to base64 string"""
    buffered = io.BytesIO()
    image.save(buffered, format='PNG')
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'models_loaded': {
            'text2img': models['text2img'] is not None,
            'sam': models['sam'] is not None,
            'clip': models['clip'] is not None
        }
    })

@app.route('/generate', methods=['POST'])
def generate_image():
    """Generate image from text prompt"""
    try:
        data = request.json
        prompt = data.get('prompt')
        width = data.get('width', 512)
        height = data.get('height', 512)
        seed = data.get('seed')
        steps = data.get('num_inference_steps', 50)
        guidance = data.get('guidance_scale', 7.5)
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        if models['text2img'] is None:
            return jsonify({'error': 'Text-to-image model not loaded'}), 503
        
        # Set seed for reproducibility
        generator = None
        if seed is not None:
            generator = torch.Generator(device='cuda' if torch.cuda.is_available() else 'cpu')
            generator.manual_seed(seed)
        
        # Generate image
        result = models['text2img'](
            prompt,
            width=width,
            height=height,
            num_inference_steps=steps,
            guidance_scale=guidance,
            generator=generator
        )
        
        image = result.images[0]
        image_base64 = image_to_base64(image)
        
        return jsonify({
            'image_base64': f'data:image/png;base64,{image_base64}',
            'image_url': None,  # Could save and return URL
            'seed': seed or 0,
            'prompt': prompt
        })
        
    except Exception as e:
        print(f'Error generating image: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/sam/segment', methods=['POST'])
def segment_image():
    """Segment image using SAM"""
    try:
        data = request.json
        image_base64 = data.get('image')
        points = data.get('points')  # [[x, y], ...]
        labels = data.get('labels')  # [1, 0, ...] (1=foreground, 0=background)
        threshold = data.get('threshold', 0.5)
        
        if not image_base64:
            return jsonify({'error': 'Image is required'}), 400
        
        if models['sam'] is None:
            return jsonify({'error': 'SAM model not loaded'}), 503
        
        # Convert image
        image = base64_to_image(image_base64)
        image_np = np.array(image)
        
        # Use auto mask generator if no points provided
        if points is None:
            masks = models['sam']['auto_mask_generator'].generate(image_np)
            
            # Filter and format masks
            filtered_masks = []
            for i, mask in enumerate(masks[:10]):  # Limit to top 10 masks
                if mask['stability_score'] >= threshold:
                    mask_data = {
                        'mask_base64': None,  # Could convert mask to base64
                        'bbox': {
                            'x': int(mask['bbox'][0]),
                            'y': int(mask['bbox'][1]),
                            'width': int(mask['bbox'][2]),
                            'height': int(mask['bbox'][3])
                        },
                        'confidence': float(mask['stability_score']),
                        'area': int(mask['area']),
                        'predicted_label': f'Object {i+1}',
                        'polygon_svg': None  # Could generate SVG path
                    }
                    filtered_masks.append(mask_data)
            
            return jsonify({
                'masks': filtered_masks,
                'width': image.width,
                'height': image.height
            })
        
        else:
            # Use predictor with specific points
            predictor = models['sam']['predictor']
            predictor.set_image(image_np)
            
            points_np = np.array(points)
            labels_np = np.array(labels) if labels else np.ones(len(points))
            
            masks, scores, _ = predictor.predict(
                point_coords=points_np,
                point_labels=labels_np,
                multimask_output=True
            )
            
            result_masks = []
            for i, (mask, score) in enumerate(zip(masks, scores)):
                if score >= threshold:
                    # Find bounding box
                    rows = np.any(mask, axis=1)
                    cols = np.any(mask, axis=0)
                    y_min, y_max = np.where(rows)[0][[0, -1]]
                    x_min, x_max = np.where(cols)[0][[0, -1]]
                    
                    result_masks.append({
                        'mask_base64': None,
                        'bbox': {
                            'x': int(x_min),
                            'y': int(y_min),
                            'width': int(x_max - x_min),
                            'height': int(y_max - y_min)
                        },
                        'confidence': float(score),
                        'area': int(mask.sum()),
                        'predicted_label': f'Mask {i+1}'
                    })
            
            return jsonify({
                'masks': result_masks,
                'width': image.width,
                'height': image.height
            })
        
    except Exception as e:
        print(f'Error segmenting image: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/inpaint', methods=['POST'])
def inpaint_image():
    """Inpaint image using mask"""
    try:
        data = request.json
        image_base64 = data.get('image')
        mask_base64 = data.get('mask')
        prompt = data.get('prompt')
        
        if not all([image_base64, mask_base64, prompt]):
            return jsonify({'error': 'Image, mask, and prompt are required'}), 400
        
        # TODO: Implement inpainting with Stable Diffusion Inpainting
        # For now, return placeholder
        return jsonify({
            'image_base64': image_base64,
            'image_url': None
        })
        
    except Exception as e:
        print(f'Error inpainting: {e}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PYTHON_AI_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
