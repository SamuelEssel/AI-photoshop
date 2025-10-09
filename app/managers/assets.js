// Asset Management Module

class AssetManager {
  constructor() {
    this.assets = [];
  }

  init() {
    this.loadAssets();
  }

  async loadAssets() {
    // Load assets from local storage or API
    const stored = localStorage.getItem('assets');
    if (stored) {
      this.assets = JSON.parse(stored);
      this.render();
    }
  }

  render() {
    const container = document.getElementById('assetsGrid');
    if (!container) return;

    if (this.assets.length === 0) {
      container.innerHTML = `
        <div class="no-selection" style="grid-column: 1 / -1;">
          <i class="fas fa-images"></i>
          <p>No assets yet</p>
          <button class="btn-primary" onclick="app.assets.upload()">
            <i class="fas fa-upload"></i> Upload Asset
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.assets.map(asset => `
      <div class="asset-item" onclick="app.assets.addToCanvas('${asset.id}')" title="${asset.name}">
        <img src="${asset.url}" alt="${asset.name}">
        <div class="asset-item-name">${asset.name}</div>
      </div>
    `).join('');
  }

  upload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      
      for (const file of files) {
        await this.uploadFile(file);
      }
    };
    
    input.click();
  }

  async uploadFile(file) {
    Utils.showLoading('Uploading asset...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${APP_CONFIG.API_URL}/assets/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const asset = await response.json();
      
      // Also convert to base64 for local storage
      const base64 = await Utils.imageToBase64(file);
      asset.url = base64;
      asset.name = file.name;

      this.assets.push(asset);
      this.saveAssets();
      this.render();

      Utils.showToast('Asset uploaded!', 'success');

    } catch (error) {
      console.error('Upload error:', error);
      
      // Fallback to local storage
      const base64 = await Utils.imageToBase64(file);
      const asset = {
        id: Utils.generateId(),
        name: file.name,
        url: base64,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };

      this.assets.push(asset);
      this.saveAssets();
      this.render();

      Utils.showToast('Asset added locally', 'success');
    } finally {
      Utils.hideLoading();
    }
  }

  async addToCanvas(assetId) {
    const asset = this.assets.find(a => a.id === assetId);
    if (!asset) return;

    fabric.Image.fromURL(asset.url, (img) => {
      img.set({
        left: 100,
        top: 100,
        id: Utils.generateId(),
        name: asset.name
      });

      // Scale to reasonable size
      const maxSize = 400;
      if (img.width > maxSize || img.height > maxSize) {
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        img.scale(scale);
      }

      app.canvas.addObject(img);
      Utils.showToast('Asset added to canvas', 'success');
    }, { crossOrigin: 'anonymous' });
  }

  deleteAsset(assetId) {
    this.assets = this.assets.filter(a => a.id !== assetId);
    this.saveAssets();
    this.render();
    Utils.showToast('Asset deleted', 'success');
  }

  saveAssets() {
    localStorage.setItem('assets', JSON.stringify(this.assets));
  }
}

if (typeof window !== 'undefined') {
  window.AssetManager = AssetManager;
}
