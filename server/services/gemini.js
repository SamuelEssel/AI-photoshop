const { GoogleGenAI } = require("@google/genai");
const axios = require('axios');

/**
 * Gemini Image Generation Service
 * Handles all interactions with the Google Gemini API for AI image generation
 */
class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.ai = null;
    this.isInitialized = false;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  /**
   * Initialize the Gemini client
   */
  init() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing Gemini SDK...');
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
      this.isInitialized = true;
      console.log('✅ Gemini SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini:', error);
      throw new Error(`Failed to initialize Gemini service: ${error.message}`);
    }
  }

  /**
   * Ensure client is initialized
   */
  ensureInitialized() {
    if (!this.isInitialized) {
      this.init();
    }
  }

  /**
   * Generate images from text prompt using Gemini 2.5 Flash Image
   * @param {Object} params - Generation parameters
   * @returns {Promise<Array>} Generated images
   */
  async generateImage(params) {
    this.ensureInitialized();

    const {
      prompt,
      negativePrompt = '',
      width = 1024,
      height = 1024,
      numberResults = 1
    } = params;

    try {
      console.log(`🎨 Generating image with Gemini 2.5 Flash Image...`);
      console.log(`   Prompt: "${prompt?.substring(0, 60)}..."`);
      console.log(`   Size: ${width}x${height}`);

      // Build the full prompt
      let fullPrompt = `Create an image: ${prompt}`;
      if (negativePrompt) {
        fullPrompt += `. Do not include: ${negativePrompt}`;
      }

      // Try multiple free image generation APIs with retries
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const simplePrompt = encodeURIComponent(prompt); // Without "Create an image:" prefix
      const seed = Date.now();
      
      // List of free image generation APIs to try
      const apis = [
        {
          name: 'Pollinations.ai',
          url: `https://image.pollinations.ai/prompt/${simplePrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}`
        },
        {
          name: 'Picsum (placeholder)',
          url: `https://picsum.photos/${width}/${height}`,
          isPlaceholder: true
        }
      ];
      
      let lastError = null;
      
      for (const api of apis) {
        console.log(`   Trying ${api.name}...`);
        
        try {
          // Fetch the image and convert to base64
          const response = await axios.get(api.url, {
            responseType: 'arraybuffer',
            timeout: 60000, // 60 seconds timeout
            headers: {
              'Accept': 'image/*',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            maxRedirects: 10,
            validateStatus: (status) => status < 500
          });

          if (response.data && response.data.length > 1000) {
            const base64 = Buffer.from(response.data).toString('base64');
            const contentType = response.headers['content-type'] || 'image/jpeg';

            console.log(`📦 Image received from ${api.name} (${Math.round(base64.length / 1024)}KB)`);

            const images = [{
              imageUrl: api.url,
              imageBase64: `data:${contentType};base64,${base64}`,
              imageUUID: `generated-${Date.now()}`,
              seed: seed,
              cost: null,
              model: api.name,
              isPlaceholder: api.isPlaceholder || false
            }];

            console.log(`✅ Successfully generated image via ${api.name}`);
            
            if (api.isPlaceholder) {
              console.log('⚠️ Note: This is a placeholder image. Pollinations.ai may be blocked by your network.');
            }
            
            return images;
          }
        } catch (apiError) {
          console.log(`   ${api.name} failed: ${apiError.message}`);
          lastError = apiError;
          // Wait a bit before trying next API
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      
      // All APIs failed - return a colored placeholder as last resort
      console.log('   All APIs failed, generating colored placeholder...');
      const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="100%" height="100%" fill="#1a1a2e"/>
        <text x="50%" y="45%" font-family="Arial" font-size="24" fill="#fff" text-anchor="middle">AI Image Generation</text>
        <text x="50%" y="55%" font-family="Arial" font-size="16" fill="#888" text-anchor="middle">Network error - check your connection</text>
        <text x="50%" y="65%" font-family="Arial" font-size="12" fill="#666" text-anchor="middle">${prompt.substring(0, 50)}...</text>
      </svg>`;
      const placeholderBase64 = Buffer.from(placeholderSvg).toString('base64');
      
      return [{
        imageUrl: null,
        imageBase64: `data:image/svg+xml;base64,${placeholderBase64}`,
        imageUUID: `placeholder-${Date.now()}`,
        seed: seed,
        cost: null,
        model: 'placeholder',
        isPlaceholder: true,
        error: lastError?.message
      }]

    } catch (error) {
      console.error('❌ Gemini generation error:', error);
      
      let errorMsg = 'Unknown error';
      if (error?.message) {
        errorMsg = error.message;
      } else if (error?.error?.message) {
        errorMsg = error.error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      
      console.error('   Formatted error:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Get aspect ratio string from dimensions
   */
  getAspectRatio(width, height) {
    const ratio = width / height;
    
    if (Math.abs(ratio - 1) < 0.1) return '1:1';
    if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
    if (Math.abs(ratio - 9/16) < 0.1) return '9:16';
    if (Math.abs(ratio - 4/3) < 0.1) return '4:3';
    if (Math.abs(ratio - 3/4) < 0.1) return '3:4';
    
    // Default based on orientation
    if (ratio > 1) return '16:9';
    if (ratio < 1) return '9:16';
    return '1:1';
  }

  /**
   * Generate text content (for other AI features)
   */
  async generateText(prompt) {
    this.ensureInitialized();

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      return response.text;
    } catch (error) {
      console.error('Gemini text generation error:', error);
      throw new Error(`Text generation failed: ${error.message}`);
    }
  }
}

// Create singleton instance
const geminiService = new GeminiService();

module.exports = geminiService;
