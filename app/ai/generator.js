// AI Image Generation Module

class AIGenerator {
  constructor() {
    this.isGenerating = false;
    this.generationHistory = [];
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

    const width = parseInt(document.getElementById('promptWidth')?.value) || 512;
    const height = parseInt(document.getElementById('promptHeight')?.value) || 512;
    const style = document.getElementById('promptStyle')?.value || 'realistic';
    const seed = document.getElementById('promptSeed')?.value || null;
    const steps = parseInt(document.getElementById('promptSteps')?.value) || 50;
    const guidance = parseFloat(document.getElementById('promptGuidance')?.value) || 7.5;

    this.isGenerating = true;
    Utils.showLoading('Generating image...');
    app.ui.closeModal('promptModal');

    try {
      const response = await Utils.api('/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          width,
          height,
          style,
          seed,
          steps,
          guidance
        })
      });

      console.log('Generation response:', response);

      // Add generated image to canvas
      await this.addGeneratedImage(response.imageBase64 || response.imageUrl, {
        prompt,
        seed: response.seed,
        generationId: response.id
      });

      // Save to history
      this.generationHistory.push(response);

      Utils.showToast('Image generated successfully!', 'success');

      // Ask if user wants to convert to layers
      if (confirm('Convert this image to editable layers using SAM?')) {
        await app.sam.segmentImage(response.imageBase64 || response.imageUrl);
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
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(imageSrc, (img) => {
        if (!img) {
          reject(new Error('Failed to load image'));
          return;
        }

        img.set({
          left: 100,
          top: 100,
          id: Utils.generateId(),
          name: 'Generated Image',
          originalPrompt: metadata.prompt,
          generationMeta: metadata
        });

        // Scale to fit if too large
        const maxSize = 800;
        if (img.width > maxSize || img.height > maxSize) {
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          img.scale(scale);
        }

        app.canvas.addObject(img);
        resolve(img);
      }, { crossOrigin: 'anonymous' });
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
