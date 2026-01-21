const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const geminiService = require('../services/gemini');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';
const GENERATED_DIR = path.join(__dirname, '../../data/generated');
const USE_GEMINI = process.env.USE_GEMINI !== 'false'; // Default to Gemini

// Ensure directory exists
fs.mkdir(GENERATED_DIR, { recursive: true }).catch(console.error);

// Health check endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    gemini: USE_GEMINI,
    timestamp: new Date().toISOString()
  });
});

// Text-to-image generation
router.post('/generate', async (req, res) => {
  try {
    const { prompt, width, height, style, seed, steps, guidance, negativePrompt, numberResults } = req.body;

    console.log('📝 Received generation request:', {
      prompt: prompt?.substring(0, 50) + '...',
      width,
      height,
      steps,
      guidance,
      negativePrompt: negativePrompt?.substring(0, 30),
      USE_GEMINI
    });

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let result;

    if (USE_GEMINI) {
      console.log('🎨 Using Gemini API for generation...');
      // Use Gemini API
      try {
        const images = await geminiService.generateImage({
          prompt,
          negativePrompt: negativePrompt || '',
          width: width || 1024,
          height: height || 1024,
          numberResults: numberResults || 1
        });

        const generationId = uuidv4();
        result = {
          id: generationId,
          prompt,
          imageUrl: images[0].imageUrl,
          imageUUID: images[0].imageUUID,
          imageBase64: images[0].imageBase64, // Base64 data URL from Gemini
          seed: images[0].seed,
          cost: images[0].cost,
          timestamp: new Date().toISOString(),
          allImages: images // If multiple results were requested
        };

        // Save generation metadata
        await fs.writeFile(
          path.join(GENERATED_DIR, `${generationId}.json`),
          JSON.stringify(result, null, 2)
        );

        res.json(result);
      } catch (geminiError) {
        console.error('Gemini generation error:', geminiError);
        throw geminiError;
      }
    } else {
      // Fallback to Python AI service
      const response = await axios.post(`${AI_SERVICE_URL}/generate`, {
        prompt,
        width: width || 512,
        height: height || 512,
        style: style || 'realistic',
        seed: seed || Math.floor(Math.random() * 1000000),
        num_inference_steps: steps || 50,
        guidance_scale: guidance || 7.5
      }, {
        timeout: 120000 // 2 minutes
      });

      const generationId = uuidv4();
      result = {
        id: generationId,
        prompt,
        imageUrl: response.data.image_url,
        imageBase64: response.data.image_base64,
        seed: response.data.seed,
        timestamp: new Date().toISOString()
      };

      // Save generation metadata
      await fs.writeFile(
        path.join(GENERATED_DIR, `${generationId}.json`),
        JSON.stringify(result, null, 2)
      );

      res.json(result);
    }
  } catch (error) {
    console.error('❌ Error generating image:', error.message);
    console.error('Full error:', error);
    
    // Return mock data for development if service is not available
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message.includes('Gemini')) {
      console.log('⚠️  AI service unavailable, returning mock data');
      return res.json({
        id: uuidv4(),
        prompt: req.body.prompt,
        imageUrl: 'https://via.placeholder.com/1024x1024/4A90E2/ffffff?text=Mock+Image',
        imageBase64: null,
        seed: 12345,
        timestamp: new Date().toISOString(),
        mock: true
      });
    }
    
    // Return proper error response
    return res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Inpainting - regenerate specific layer
router.post('/inpaint', async (req, res) => {
  try {
    const { imageBase64, maskBase64, prompt, inputImage, maskImage, width, height, steps, guidance, strength } = req.body;

    if ((!imageBase64 && !inputImage) || (!maskBase64 && !maskImage) || !prompt) {
      return res.status(400).json({ 
        error: 'image, mask, and prompt are required' 
      });
    }

    if (USE_RUNWARE) {
      // Use Runware API
      const images = await runwareService.inpaintImage({
        prompt,
        inputImage: inputImage || imageBase64,
        maskImage: maskImage || maskBase64,
        width: width || 1024,
        height: height || 1024,
        steps: steps || 50,
        guidanceScale: guidance || 7.5,
        strength: strength || 0.8
      });

      res.json({
        id: uuidv4(),
        imageUrl: images[0].imageUrl,
        imageUUID: images[0].imageUUID,
        imageBase64: null,
        cost: images[0].cost,
        timestamp: new Date().toISOString()
      });
    } else {
      // Fallback to Python AI service
      const response = await axios.post(`${AI_SERVICE_URL}/inpaint`, {
        image: imageBase64,
        mask: maskBase64,
        prompt
      }, {
        timeout: 120000
      });

      res.json({
        id: uuidv4(),
        imageUrl: response.data.image_url,
        imageBase64: response.data.image_base64,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error inpainting:', error.message);
    res.status(500).json({ 
      error: 'Failed to inpaint image',
      details: error.message 
    });
  }
});

// Image variation
router.post('/variation', async (req, res) => {
  try {
    const { imageBase64, prompt, strength, inputImage, width, height, steps, guidance } = req.body;

    if (!imageBase64 && !inputImage) {
      return res.status(400).json({ error: 'Image is required' });
    }

    if (USE_RUNWARE) {
      // Use Runware API
      const images = await runwareService.createVariation({
        prompt: prompt || '',
        inputImage: inputImage || imageBase64,
        strength: strength || 0.75,
        width: width || 1024,
        height: height || 1024,
        steps: steps || 50,
        guidanceScale: guidance || 7.5
      });

      res.json({
        id: uuidv4(),
        imageUrl: images[0].imageUrl,
        imageUUID: images[0].imageUUID,
        imageBase64: null,
        cost: images[0].cost,
        timestamp: new Date().toISOString()
      });
    } else {
      // Fallback to Python AI service
      const response = await axios.post(`${AI_SERVICE_URL}/variation`, {
        image: imageBase64,
        prompt: prompt || '',
        strength: strength || 0.75
      }, {
        timeout: 120000
      });

      res.json({
        id: uuidv4(),
        imageUrl: response.data.image_url,
        imageBase64: response.data.image_base64,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error creating variation:', error.message);
    res.status(500).json({ 
      error: 'Failed to create variation',
      details: error.message 
    });
  }
});

// Additional Runware-specific endpoints
router.post('/upscale', async (req, res) => {
  try {
    const { inputImage, upscaleFactor } = req.body;

    if (!inputImage) {
      return res.status(400).json({ error: 'Input image is required' });
    }

    if (!USE_RUNWARE) {
      return res.status(501).json({ error: 'Upscaling is only available with Runware' });
    }

    const result = await runwareService.upscaleImage({
      inputImage,
      upscaleFactor: upscaleFactor || 4
    });

    res.json({
      id: uuidv4(),
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error upscaling image:', error.message);
    res.status(500).json({ 
      error: 'Failed to upscale image',
      details: error.message 
    });
  }
});

router.post('/remove-background', async (req, res) => {
  try {
    const { inputImage, rgba } = req.body;

    if (!inputImage) {
      return res.status(400).json({ error: 'Input image is required' });
    }

    if (!USE_RUNWARE) {
      return res.status(501).json({ error: 'Background removal is only available with Runware' });
    }

    const result = await runwareService.removeBackground({
      inputImage,
      rgba: rgba || [255, 255, 255, 0]
    });

    res.json({
      id: uuidv4(),
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error removing background:', error.message);
    res.status(500).json({ 
      error: 'Failed to remove background',
      details: error.message 
    });
  }
});

router.post('/caption', async (req, res) => {
  try {
    const { inputImage } = req.body;

    if (!inputImage) {
      return res.status(400).json({ error: 'Input image is required' });
    }

    if (!USE_RUNWARE) {
      return res.status(501).json({ error: 'Image captioning is only available with Runware' });
    }

    const result = await runwareService.getImageCaption({ inputImage });

    res.json({
      id: uuidv4(),
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating caption:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate caption',
      details: error.message 
    });
  }
});

module.exports = router;
