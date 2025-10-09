// SAM (Segment Anything Model) Integration Module

class SAMIntegration {
  constructor() {
    this.isSegmenting = false;
    this.currentMasks = [];
  }

  init() {
    // Initialize SAM integration
  }

  async convertToLayers() {
    const activeObject = app.canvas.getActiveObject();
    
    if (!activeObject || activeObject.type !== 'image') {
      Utils.showToast('Please select an image to convert to layers', 'warning');
      return;
    }

    const imageUrl = activeObject.getSrc();
    await this.segmentImage(imageUrl, activeObject);
  }

  async segmentImage(imageSrc, sourceObject = null) {
    if (this.isSegmenting) {
      Utils.showToast('Segmentation already in progress', 'warning');
      return;
    }

    this.isSegmenting = true;
    Utils.showLoading('Segmenting image with SAM...');

    try {
      // Convert image to base64 if it's a URL
      let imageBase64 = imageSrc;
      if (!imageSrc.startsWith('data:')) {
        imageBase64 = await this.imageUrlToBase64(imageSrc);
      }

      const response = await Utils.api('/sam/segment', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: imageBase64,
          threshold: APP_CONFIG.sam.minConfidence
        })
      });

      console.log('SAM response:', response);
      this.currentMasks = response.masks;

      if (response.masks.length === 0) {
        Utils.showToast('No masks found in image', 'warning');
        return;
      }

      // Remove original image if provided
      if (sourceObject) {
        app.canvas.removeObject(sourceObject);
      }

      // Create layers from masks
      await this.createLayersFromMasks(response.masks, imageSrc);

      Utils.showToast(`Created ${response.masks.length} layers from image!`, 'success');

    } catch (error) {
      console.error('SAM error:', error);
      Utils.showToast('Failed to segment image: ' + error.message, 'error');
    } finally {
      this.isSegmenting = false;
      Utils.hideLoading();
    }
  }

  async createLayersFromMasks(masks, sourceImage) {
    for (let i = 0; i < Math.min(masks.length, APP_CONFIG.sam.maxMasks); i++) {
      const mask = masks[i];
      
      try {
        // Create masked image layer
        await this.createMaskedLayer(sourceImage, mask, i);
      } catch (error) {
        console.error('Error creating layer from mask:', error);
      }
    }
  }

  async createMaskedLayer(sourceImage, mask, index) {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(sourceImage, (img) => {
        if (!img) {
          reject(new Error('Failed to load image'));
          return;
        }

        const bbox = mask.boundingBox;
        
        // Create image with bounding box
        const maskedImg = new fabric.Image(img.getElement(), {
          left: bbox.x,
          top: bbox.y,
          width: bbox.width,
          height: bbox.height,
          cropX: bbox.x,
          cropY: bbox.y,
          id: Utils.generateId(),
          name: mask.label || `Layer ${index + 1}`,
          maskId: mask.id,
          layerType: 'masked-image'
        });

        app.canvas.canvas.add(maskedImg);
        resolve(maskedImg);
      }, { crossOrigin: 'anonymous' });
    });
  }

  async imageUrlToBase64(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = reject;
      img.src = url;
    });
  }

  async refineMask(maskId, points, labels) {
    Utils.showLoading('Refining mask...');

    try {
      const mask = this.currentMasks.find(m => m.id === maskId);
      if (!mask) throw new Error('Mask not found');

      const response = await Utils.api('/sam/refine-mask', {
        method: 'POST',
        body: JSON.stringify({
          existingMask: mask.maskBase64,
          points,
          labels
        })
      });

      // Update mask
      mask.maskBase64 = response.maskBase64;
      mask.polygonSvg = response.polygonSvg;

      Utils.showToast('Mask refined!', 'success');

    } catch (error) {
      Utils.showToast('Failed to refine mask: ' + error.message, 'error');
    } finally {
      Utils.hideLoading();
    }
  }

  getCurrentMasks() {
    return this.currentMasks;
  }
}

if (typeof window !== 'undefined') {
  window.SAMIntegration = SAMIntegration;
}
