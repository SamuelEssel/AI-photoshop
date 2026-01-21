let Runware;
try {
  const runwareModule = require('@runware/sdk-js');
  Runware = runwareModule.Runware || runwareModule.default || runwareModule;
  console.log('Runware SDK loaded successfully');
} catch (error) {
  console.error('Failed to load Runware SDK:', error.message);
  console.error('Make sure @runware/sdk-js is installed: npm install @runware/sdk-js');
}

/**
 * Runware Image Generation Service
 * Handles all interactions with the Runware API for AI image generation
 */
class RunwareService {
  constructor() {
    this.runware = null;
    this.isConnected = false;
    this.apiKey = process.env.RUNWARE_API_KEY || 'jOCKJdQj9Lwl6RbDNSw63g9M3vuO986f';
    
    if (!Runware) {
      console.error('⚠️ Runware SDK not available - AI generation will fail');
    }
  }

  /**
   * Initialize the Runware connection
   */
  async connect() {
    if (this.isConnected) {
      return;
    }

    if (!Runware) {
      throw new Error('Runware SDK not loaded. Please install: npm install @runware/sdk-js');
    }

    try {
      console.log('Initializing Runware SDK...');
      console.log('API Key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT SET');
      
      this.runware = await Runware.initialize({
        apiKey: this.apiKey,
        timeoutDuration: 90000, // 90 seconds
        shouldReconnect: true,
        globalMaxRetries: 3
      });
      
      this.isConnected = true;
      console.log('✅ Runware SDK connected successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Runware:', error);
      console.error('Error details:', error.message);
      throw new Error(`Failed to connect to Runware service: ${error.message}`);
    }
  }

  /**
   * Ensure connection is established
   */
  async ensureConnection() {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  /**
   * Generate images from text prompt
   * @param {Object} params - Generation parameters
   * @returns {Promise<Array>} Generated images
   */
  async generateImage(params) {
    await this.ensureConnection();

    const {
      prompt,
      negativePrompt = '',
      width = 1024,
      height = 1024,
      model = 'runware:101@1',
      steps = 50,
      guidanceScale = 7.5,
      seed = null,
      numberResults = 1,
      style = 'realistic'
    } = params;

    try {
      console.log(`🎨 Generating image with Runware...`);
      console.log(`   Prompt: "${prompt?.substring(0, 60)}..."`);
      console.log(`   Size: ${width}x${height}, Steps: ${steps}`);

      const requestParams = {
        positivePrompt: prompt,
        model,
        width,
        height,
        numberResults,
        includeCost: true,
        outputFormat: 'base64'
      };

      // Optional parameters - only add if provided
      if (negativePrompt) {
        requestParams.negativePrompt = negativePrompt;
      }
      
      if (seed) {
        requestParams.seed = Number(seed);
      }
      
      if (steps) {
        requestParams.steps = Number(steps);
      }
      
      if (guidanceScale) {
        requestParams.CFGScale = Number(guidanceScale);
      }

      console.log('   Request params:', JSON.stringify(requestParams, null, 2));

      // Request images
      const images = await this.runware.requestImages(requestParams);

      console.log(`✅ Successfully generated ${images.length} image(s)`);
      console.log(`   Output format: base64`);
      
      return images.map(img => ({
        imageUrl: img.imageURL || null,
        imageBase64: img.imageBase64 ? `data:image/jpeg;base64,${img.imageBase64}` : null,
        imageUUID: img.imageUUID,
        seed: img.seed,
        cost: img.cost,
        model: model
      }));

    } catch (error) {
      console.error('❌ Runware generation error:', error);
      
      // Handle Runware-specific error format
      let errorMsg = 'Unknown error';
      if (error?.error) {
        // Runware returns errors in error.error object
        const runwareError = error.error;
        errorMsg = runwareError.message || runwareError.code || JSON.stringify(runwareError);
        
        // Specific handling for insufficient credits
        if (runwareError.code === 'insufficientCredits') {
          errorMsg = '⚠️ Insufficient credits. Please add credits at https://my.runware.ai/wallet';
        }
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      
      console.error('   Formatted error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Generate image with inpainting (for editing specific areas)
   * @param {Object} params - Inpainting parameters
   * @returns {Promise<Array>} Generated images
   */
  async inpaintImage(params) {
    await this.ensureConnection();

    const {
      prompt,
      inputImage,
      maskImage,
      width = 1024,
      height = 1024,
      model = 'runware:101@1',
      steps = 50,
      guidanceScale = 7.5,
      strength = 0.8
    } = params;

    try {
      console.log('Inpainting image with Runware');

      const images = await this.runware.requestImages({
        positivePrompt: prompt,
        inputImage,
        maskImage,
        width,
        height,
        model,
        steps,
        CFGScale: guidanceScale,
        strength,
        outputFormat: 'URL',
        includeCost: true
      });

      return images.map(img => ({
        imageUrl: img.imageURL,
        imageUUID: img.imageUUID,
        seed: img.seed,
        cost: img.cost
      }));

    } catch (error) {
      console.error('Runware inpainting error:', error);
      throw new Error(`Inpainting failed: ${error.message}`);
    }
  }

  /**
   * Create image variation (image-to-image)
   * @param {Object} params - Variation parameters
   * @returns {Promise<Array>} Generated images
   */
  async createVariation(params) {
    await this.ensureConnection();

    const {
      prompt,
      inputImage,
      strength = 0.75,
      width = 1024,
      height = 1024,
      model = 'runware:101@1',
      steps = 50,
      guidanceScale = 7.5
    } = params;

    try {
      console.log('Creating image variation with Runware');

      const images = await this.runware.requestImages({
        positivePrompt: prompt || '',
        inputImage,
        strength,
        width,
        height,
        model,
        steps,
        CFGScale: guidanceScale,
        outputFormat: 'URL',
        includeCost: true
      });

      return images.map(img => ({
        imageUrl: img.imageURL,
        imageUUID: img.imageUUID,
        seed: img.seed,
        cost: img.cost
      }));

    } catch (error) {
      console.error('Runware variation error:', error);
      throw new Error(`Variation creation failed: ${error.message}`);
    }
  }

  /**
   * Upscale an image using GAN
   * @param {Object} params - Upscaling parameters
   * @returns {Promise<Object>} Upscaled image
   */
  async upscaleImage(params) {
    await this.ensureConnection();

    const {
      inputImage,
      upscaleFactor = 4
    } = params;

    try {
      console.log('Upscaling image with Runware');

      const result = await this.runware.upscaleGan({
        inputImage,
        upscaleFactor,
        outputFormat: 'URL',
        includeCost: true
      });

      return {
        imageUrl: result[0].imageURL,
        imageUUID: result[0].imageUUID,
        cost: result[0].cost
      };

    } catch (error) {
      console.error('Runware upscaling error:', error);
      throw new Error(`Upscaling failed: ${error.message}`);
    }
  }

  /**
   * Remove background from an image
   * @param {Object} params - Background removal parameters
   * @returns {Promise<Object>} Image with removed background
   */
  async removeBackground(params) {
    await this.ensureConnection();

    const {
      inputImage,
      rgba = [255, 255, 255, 0] // Default transparent background
    } = params;

    try {
      console.log('Removing background with Runware');

      const result = await this.runware.removeImageBackground({
        inputImage,
        rgba,
        outputFormat: 'URL',
        includeCost: true
      });

      return {
        imageUrl: result[0].imageURL,
        imageUUID: result[0].imageUUID,
        cost: result[0].cost
      };

    } catch (error) {
      console.error('Runware background removal error:', error);
      throw new Error(`Background removal failed: ${error.message}`);
    }
  }

  /**
   * Get text caption for an image
   * @param {Object} params - Captioning parameters
   * @returns {Promise<Object>} Image caption
   */
  async getImageCaption(params) {
    await this.ensureConnection();

    const { inputImage } = params;

    try {
      console.log('Generating image caption with Runware');

      const result = await this.runware.requestImageToText({
        inputImage,
        includeCost: true
      });

      return {
        text: result[0].text,
        cost: result[0].cost
      };

    } catch (error) {
      console.error('Runware captioning error:', error);
      throw new Error(`Caption generation failed: ${error.message}`);
    }
  }

  /**
   * Disconnect from Runware
   */
  async disconnect() {
    if (this.runware && this.isConnected) {
      try {
        await this.runware.disconnect();
        this.isConnected = false;
        console.log('Runware SDK disconnected');
      } catch (error) {
        console.error('Error disconnecting from Runware:', error);
      }
    }
  }
}

// Create singleton instance
const runwareService = new RunwareService();

module.exports = runwareService;
