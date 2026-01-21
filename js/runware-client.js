/**
 * Runware Client Module
 * Frontend integration for Runware image generation API
 */

class RunwareClient {
  constructor() {
    // Use absolute URL to Node.js server, or relative if on same server
    this.apiBaseUrl = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.API_URL) 
      ? `${APP_CONFIG.API_URL}/ai` 
      : 'http://localhost:3000/api/ai';
    this.isGenerating = false;
    this.currentGeneration = null;
  }

  /**
   * Generate images from text prompt
   * @param {Object} params - Generation parameters
   * @param {Function} onProgress - Progress callback for partial results
   * @returns {Promise<Object>} Generated image data
   */
  async generateImage(params, onProgress = null) {
    if (this.isGenerating) {
      throw new Error('Generation already in progress');
    }

    const {
      prompt,
      negativePrompt = '',
      width = 1024,
      height = 1024,
      steps = 50,
      guidance = 7.5,
      seed = null,
      numberResults = 1,
      style = 'realistic'
    } = params;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    this.isGenerating = true;

    try {
      console.log('🌐 RunwareClient: Fetching from API:', `${this.apiBaseUrl}/generate`);
      console.log('📦 Request body:', { prompt, width, height, steps });
      
      const response = await fetch(`${this.apiBaseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          width,
          height,
          steps,
          guidance,
          seed,
          numberResults,
          style
        })
      });

      console.log('📡 Response received. Status:', response.status, response.statusText);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ API returned error:', error);
        throw new Error(error.error || 'Generation failed');
      }

      const result = await response.json();
      console.log('✅ API returned result:', result);
      
      return {
        id: result.id,
        imageUrl: result.imageUrl,
        imageUUID: result.imageUUID,
        seed: result.seed,
        cost: result.cost,
        timestamp: result.timestamp,
        allImages: result.allImages || [result]
      };

    } catch (error) {
      console.error('Runware generation error:', error);
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Create image variation (image-to-image)
   * @param {Object} params - Variation parameters
   * @returns {Promise<Object>} Generated variation
   */
  async createVariation(params) {
    const {
      inputImage,
      prompt = '',
      strength = 0.75,
      width = 1024,
      height = 1024,
      steps = 50,
      guidance = 7.5
    } = params;

    if (!inputImage) {
      throw new Error('Input image is required');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/variation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputImage,
          prompt,
          strength,
          width,
          height,
          steps,
          guidance
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Variation creation failed');
      }

      return await response.json();

    } catch (error) {
      console.error('Runware variation error:', error);
      throw error;
    }
  }

  /**
   * Inpaint image (edit specific areas)
   * @param {Object} params - Inpainting parameters
   * @returns {Promise<Object>} Inpainted image
   */
  async inpaintImage(params) {
    const {
      inputImage,
      maskImage,
      prompt,
      width = 1024,
      height = 1024,
      steps = 50,
      guidance = 7.5,
      strength = 0.8
    } = params;

    if (!inputImage || !maskImage || !prompt) {
      throw new Error('Input image, mask, and prompt are required');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/inpaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputImage,
          maskImage,
          prompt,
          width,
          height,
          steps,
          guidance,
          strength
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Inpainting failed');
      }

      return await response.json();

    } catch (error) {
      console.error('Runware inpainting error:', error);
      throw error;
    }
  }

  /**
   * Upscale an image using GAN
   * @param {Object} params - Upscaling parameters
   * @returns {Promise<Object>} Upscaled image
   */
  async upscaleImage(params) {
    const {
      inputImage,
      upscaleFactor = 4
    } = params;

    if (!inputImage) {
      throw new Error('Input image is required');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/upscale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputImage,
          upscaleFactor
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upscaling failed');
      }

      return await response.json();

    } catch (error) {
      console.error('Runware upscaling error:', error);
      throw error;
    }
  }

  /**
   * Remove background from an image
   * @param {Object} params - Background removal parameters
   * @returns {Promise<Object>} Image with removed background
   */
  async removeBackground(params) {
    const {
      inputImage,
      rgba = [255, 255, 255, 0]
    } = params;

    if (!inputImage) {
      throw new Error('Input image is required');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/remove-background`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputImage,
          rgba
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Background removal failed');
      }

      return await response.json();

    } catch (error) {
      console.error('Runware background removal error:', error);
      throw error;
    }
  }

  /**
   * Get caption/description for an image
   * @param {Object} params - Captioning parameters
   * @returns {Promise<Object>} Image caption
   */
  async getImageCaption(params) {
    const { inputImage } = params;

    if (!inputImage) {
      throw new Error('Input image is required');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/caption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputImage })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Caption generation failed');
      }

      return await response.json();

    } catch (error) {
      console.error('Runware captioning error:', error);
      throw error;
    }
  }

  /**
   * Convert a canvas or image element to base64
   * @param {HTMLCanvasElement|HTMLImageElement} element
   * @returns {String} Base64 image data
   */
  elementToBase64(element) {
    if (element instanceof HTMLCanvasElement) {
      return element.toDataURL('image/png');
    } else if (element instanceof HTMLImageElement) {
      const canvas = document.createElement('canvas');
      canvas.width = element.naturalWidth || element.width;
      canvas.height = element.naturalHeight || element.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(element, 0, 0);
      return canvas.toDataURL('image/png');
    }
    throw new Error('Unsupported element type');
  }

  /**
   * Upload an image and get a URL for use with Runware
   * @param {File|Blob} file - Image file
   * @returns {Promise<String>} Image URL
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result.url;

    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Check if currently generating
   * @returns {Boolean}
   */
  get isBusy() {
    return this.isGenerating;
  }
}

// Create singleton instance
if (typeof window !== 'undefined') {
  window.RunwareClient = RunwareClient;
  window.runwareClient = new RunwareClient();
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RunwareClient;
}
