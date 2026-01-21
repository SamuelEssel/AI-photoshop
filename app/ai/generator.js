// AI Image Generation Module
// Uses Runware API for advanced image generation

class AIGenerator {
  constructor() {
    this.isGenerating = false;
    this.generationHistory = [];
    this.runwareClient = window.runwareClient || null;
  }

  init() {
    this.setupSliders();
  }

  setupSliders() {
    // Steps slider
    const stepsSlider = document.getElementById('promptSteps');
    const stepsValue = document.getElementById('stepsValue');
    if (stepsSlider && stepsValue) {
      stepsSlider.addEventListener('input', (e) => {
        stepsValue.textContent = e.target.value;
      });
    }

    // Guidance slider
    const guidanceSlider = document.getElementById('promptGuidance');
    const guidanceValue = document.getElementById('guidanceValue');
    if (guidanceSlider && guidanceValue) {
      guidanceSlider.addEventListener('input', (e) => {
        guidanceValue.textContent = e.target.value;
      });
    }
  }

  showPromptDialog() {
    const modal = document.getElementById('promptModal');
    if (modal) {
      modal.classList.add('active');
      document.getElementById('promptInput')?.focus();
    }
  }

  async generate() {
    if (this.isGenerating) {
      Utils.showToast('Generation already in progress', 'warning');
      return;
    }

    const prompt = document.getElementById('promptInput')?.value.trim();
    if (!prompt) {
      Utils.showToast('Please enter a prompt', 'warning');
      return;
    }

    const negativePrompt = document.getElementById('promptNegative')?.value.trim() || '';
    const width = parseInt(document.getElementById('promptWidth')?.value) || 1024;
    const height = parseInt(document.getElementById('promptHeight')?.value) || 1024;
    const style = document.getElementById('promptStyle')?.value || 'realistic';
    const seed = document.getElementById('promptSeed')?.value || null;
    const steps = parseInt(document.getElementById('promptSteps')?.value) || 50;
    const guidance = parseFloat(document.getElementById('promptGuidance')?.value) || 7.5;
    const numberResults = parseInt(document.getElementById('promptNumberResults')?.value) || 1;

    this.isGenerating = true;
    Utils.showLoading('Generating Image...');
    app.ui.closeModal('promptModal');

    try {
      console.log('🎨🎨🎨 === GENERATION STARTED === 🎨🎨🎨');
      console.log('Prompt:', prompt);
      console.log('Size:', width, 'x', height);
      
      let response;
      
      // Use Runware client if available
      if (this.runwareClient) {
        console.log('✅ Using Runware client');
        console.log('⏳ Calling runwareClient.generateImage...');
        
        try {
          response = await this.runwareClient.generateImage({
            prompt,
            negativePrompt,
            width,
            height,
            style,
            seed,
            steps,
            guidance,
            numberResults
          });
          console.log('✅ Runware client returned response:', response);
        } catch (clientError) {
          console.error('❌ Runware client error:', clientError);
          throw clientError;
        }
      } else {
        console.log('⚠️ Using fallback API');

        // Fallback to direct API call
        response = await Utils.api('/ai/generate', {
          method: 'POST',
          body: JSON.stringify({
            prompt,
            negativePrompt,
            width,
            height,
            style,
            seed,
            steps,
            guidance,
            numberResults
          })
        });
      }

      console.log('Generation response:', response);

      // Verify we have an image
      const imageSource = response.imageUrl || response.imageBase64;
      if (!imageSource) {
        throw new Error('No image returned from generation');
      }

      // Add generated image to canvas
      await this.addGeneratedImage(imageSource, {
        prompt,
        seed: response.seed,
        generationId: response.id,
        cost: response.cost
      });
      
      console.log('✅ Image successfully added to canvas!');

      // Save to history
      this.generationHistory.push(response);

      // Show cost if available
      console.log('🎉🎉🎉 === GENERATION COMPLETE === 🎉🎉🎉');
      if (response.cost) {
        const message = `✅ AI IMAGE GENERATED! Cost: $${response.cost.toFixed(4)}`;
        console.log(message);
        Utils.showToast(message, 'success');
      } else {
        const message = '✅ AI IMAGE GENERATED AND ADDED TO CANVAS!';
        console.log(message);
        Utils.showToast(message, 'success');
      }

      // Ask if user wants to convert to layers
      if (confirm('Convert this image to editable layers using SAM?')) {
        await app.sam.segmentImage(response.imageUrl || response.imageBase64);
      }

    } catch (error) {
      console.error('Generation error:', error);
      Utils.showToast('Failed to generate image: ' + error.message, 'error');
    } finally {
      this.isGenerating = false;
      Utils.hideLoading();
    }
  }

  async addGeneratedImage(imageSrc, metadata) {
    console.log('📸 Loading generated image:', imageSrc);
    
    if (!imageSrc) {
      throw new Error('No image source provided');
    }

    let imageUrl = imageSrc;

    // If it's an external URL (not base64), proxy it through our server to avoid CORS
    if (!imageSrc.startsWith('data:') && imageSrc.startsWith('http')) {
      console.log('🔄 Proxying external image to avoid CORS...');
      try {
        const proxyResponse = await fetch(`${APP_CONFIG.API_URL}/assets/proxy?url=${encodeURIComponent(imageSrc)}`);
        if (!proxyResponse.ok) {
          throw new Error('Failed to proxy image');
        }
        const proxyData = await proxyResponse.json();
        imageUrl = proxyData.dataUrl;
        console.log('✅ Image proxied successfully');
      } catch (proxyError) {
        console.error('❌ Proxy failed:', proxyError);
        throw new Error('Failed to load image: CORS proxy error');
      }
    }

    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(imageUrl, (img) => {
        if (!img || !img.width) {
          console.error('❌ Failed to load image');
          reject(new Error('Failed to load generated image'));
          return;
        }

        console.log(`✅ Image loaded successfully: ${img.width}x${img.height}`);

        img.set({
          left: 100,
          top: 100,
          id: Utils.generateId(),
          name: 'Generated Image',
          originalPrompt: metadata.prompt,
          generationMeta: metadata
        });

        // Scale to fit canvas if too large
        const maxSize = 800;
        if (img.width > maxSize || img.height > maxSize) {
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          img.scale(scale);
          console.log(`🔍 Scaled image to: ${Math.round(img.width * scale)}x${Math.round(img.height * scale)}`);
        }

        // Add to canvas
        app.canvas.addObject(img);
        app.canvas.canvas.setActiveObject(img);
        app.canvas.render();
        
        console.log('✅ Image added to canvas successfully');
        
        resolve(img);
      }, { 
        crossOrigin: 'anonymous'
      });
    });
  }

  async regenerateLayer(layerId) {
    const layer = app.layers.layers.find(l => l.id === layerId);
    if (!layer || !layer.object.originalPrompt) {
      Utils.showToast('This layer was not AI generated', 'warning');
      return;
    }

    const prompt = layer.object.originalPrompt;
    
    // Show simplified prompt dialog
    const newPrompt = window.prompt('Modify prompt (or keep same):', prompt);
    if (!newPrompt) return;

    Utils.showLoading('Regenerating layer...');

    try {
      const response = await Utils.api('/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt: newPrompt,
          width: Math.round(layer.object.width),
          height: Math.round(layer.object.height)
        })
      });

      // Replace layer image
      fabric.Image.fromURL(response.imageBase64 || response.imageUrl, (newImg) => {
        layer.object.setElement(newImg.getElement());
        layer.object.originalPrompt = newPrompt;
        app.canvas.render();
        app.history.saveState();
        Utils.showToast('Layer regenerated!', 'success');
      }, { crossOrigin: 'anonymous' });

    } catch (error) {
      Utils.showToast('Failed to regenerate: ' + error.message, 'error');
    } finally {
      Utils.hideLoading();
    }
  }

  getHistory() {
    return this.generationHistory;
  }
}

if (typeof window !== 'undefined') {
  window.AIGenerator = AIGenerator;
}
