// Asset Management Module

class AssetManager {
  constructor() {
    this.assets = [];
    this.searchTerm = '';
    this.filterType = 'all';
  }

  init() {
    this.loadAssets();
    this.setupDragAndDrop();
    
    // Setup search after a small delay to ensure DOM is ready
    setTimeout(() => {
      this.setupSearch();
    }, 100);
    
    // Initialize toolbar PNG previews
    this.initToolbarPreviews();
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

    // Filter assets
    const filteredAssets = this.assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesFilter = this.filterType === 'all' || asset.type.startsWith(`image/${this.filterType}`);
      return matchesSearch && matchesFilter;
    });

    if (filteredAssets.length === 0) {
      container.innerHTML = `
        <div class="no-selection" style="grid-column: 1 / -1;">
          <i class="fas fa-images"></i>
          <p>${this.assets.length === 0 ? 'No assets yet' : 'No assets match your search'}</p>
          ${this.assets.length === 0 ? `
            <button class="btn-primary" onclick="app.assets.upload()">
              <i class="fas fa-upload"></i> Upload Asset
            </button>
          ` : ''}
        </div>
      `;
      return;
    }

    container.innerHTML = filteredAssets.map(asset => `
      <div class="asset-item" draggable="true" data-asset-id="${asset.id}" ondragstart="app.assets.handleDragStart(event)">
        <div class="asset-item-preview" onclick="app.assets.addToCanvas('${asset.id}')" title="Click to add to canvas">
          <img src="${asset.url}" alt="${asset.name}">
        </div>
        <div class="asset-item-info">
          <div class="asset-item-name" title="${asset.name}">${this.truncateName(asset.name, 15)}</div>
          <div class="asset-item-size">${Utils.formatFileSize(asset.size)}</div>
        </div>
        <div class="asset-item-actions">
          <button class="asset-action-btn" onclick="app.assets.renameAsset('${asset.id}')" title="Rename">
            <i class="fas fa-edit"></i>
          </button>
          <button class="asset-action-btn" onclick="app.assets.deleteAsset('${asset.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  truncateName(name, maxLength) {
    if (name.length <= maxLength) return name;
    const ext = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 4) + '...';
    return `${truncated}.${ext}`;
  }

  setupSearch() {
    const searchInput = document.getElementById('assetSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.render();
      });
    }

    const filterSelect = document.getElementById('assetFilter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.filterType = e.target.value;
        this.render();
      });
    }
  }

  setupDragAndDrop() {
    // Setup drag and drop on canvas
    const canvasContainer = document.querySelector('.canvas-container');
    if (!canvasContainer) return;

    canvasContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      canvasContainer.classList.add('drag-over');
    });

    canvasContainer.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      canvasContainer.classList.remove('drag-over');
    });

    canvasContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      canvasContainer.classList.remove('drag-over');

      const assetId = e.dataTransfer.getData('assetId');
      if (assetId) {
        // Get drop position relative to canvas
        const rect = app.canvas.canvas.getElement().getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.addToCanvasAtPosition(assetId, x, y);
      }
    });
  }

  handleDragStart(event) {
    const assetId = event.target.closest('.asset-item').dataset.assetId;
    event.dataTransfer.setData('assetId', assetId);
    event.dataTransfer.effectAllowed = 'copy';
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
    // Validate file
    try {
      this.validateFile(file);
    } catch (error) {
      Utils.showToast(error.message, 'error');
      return;
    }

    Utils.showLoading('Uploading asset...');

    try {
      // Convert to base64 for local storage (Firebase will handle actual storage)
      const base64 = await Utils.imageToBase64(file);
      
      // Generate thumbnail
      const thumbnail = await this.generateThumbnail(base64, 200);
      
      const asset = {
        id: Utils.generateId(),
        name: file.name,
        url: base64,
        thumbnail: thumbnail,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };

      this.assets.push(asset);
      this.saveAssets();
      this.render();

      Utils.showToast('Asset added successfully!', 'success');

    } catch (error) {
      console.error('Upload error:', error);
      Utils.showToast('Failed to upload asset: ' + error.message, 'error');
    } finally {
      Utils.hideLoading();
    }
  }

  validateFile(file) {
    // File size validation (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    // File type validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PNG, JPEG, WebP, GIF, and SVG are supported.');
    }
  }

  async generateThumbnail(base64Url, maxSize = 200) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = base64Url;
    });
  }

  async addToCanvas(assetId) {
    this.addToCanvasAtPosition(assetId, 100, 100);
  }

  async addToCanvasAtPosition(assetId, x, y) {
    const asset = this.assets.find(a => a.id === assetId);
    if (!asset) return;

    Utils.showLoading('Adding to canvas...');

    try {
      fabric.Image.fromURL(asset.url, (img) => {
        if (!img) {
          Utils.showToast('Failed to load asset', 'error');
          Utils.hideLoading();
          return;
        }

        img.set({
          left: x,
          top: y,
          id: Utils.generateId(),
          name: asset.name.replace(/\.[^/.]+$/, '') // Remove extension
        });

        // Scale to reasonable size
        const maxSize = 400;
        if (img.width > maxSize || img.height > maxSize) {
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          img.scale(scale);
        }

        app.canvas.addObject(img);
        app.canvas.canvas.setActiveObject(img);
        app.history.saveState();
        app.layers.refresh();
        
        Utils.showToast('Asset added to canvas', 'success');
        Utils.hideLoading();
      }, { crossOrigin: 'anonymous' });
    } catch (error) {
      console.error('Error adding to canvas:', error);
      Utils.showToast('Failed to add asset to canvas', 'error');
      Utils.hideLoading();
    }
  }

  renameAsset(assetId) {
    const asset = this.assets.find(a => a.id === assetId);
    if (!asset) return;

    const newName = prompt('Enter new name:', asset.name);
    if (!newName || newName === asset.name) return;

    asset.name = newName;
    this.saveAssets();
    this.render();
    Utils.showToast('Asset renamed', 'success');
  }

  deleteAsset(assetId) {
    const asset = this.assets.find(a => a.id === assetId);
    if (!asset) return;

    if (!confirm(`Delete "${asset.name}"?`)) return;

    this.assets = this.assets.filter(a => a.id !== assetId);
    this.saveAssets();
    this.render();
    Utils.showToast('Asset deleted', 'success');
  }

  clearAllAssets() {
    if (!confirm('Delete all assets? This cannot be undone.')) return;

    this.assets = [];
    this.saveAssets();
    this.render();
    Utils.showToast('All assets deleted', 'success');
  }

  exportAssets() {
    const data = JSON.stringify(this.assets, null, 2);
    Utils.downloadFile(data, 'assets-backup.json', 'application/json');
    Utils.showToast('Assets exported', 'success');
  }

  async importAssets(file) {
    try {
      const text = await file.text();
      const importedAssets = JSON.parse(text);

      if (!Array.isArray(importedAssets)) {
        throw new Error('Invalid assets file');
      }

      this.assets = [...this.assets, ...importedAssets];
      this.saveAssets();
      this.render();
      Utils.showToast(`Imported ${importedAssets.length} assets`, 'success');
    } catch (error) {
      Utils.showToast('Failed to import assets: ' + error.message, 'error');
    }
  }

  saveAssets() {
    localStorage.setItem('assets', JSON.stringify(this.assets));
  }

  // Stickers & Icons Panel
  showStickersPanel() {
    this.createStickersModal();
    document.getElementById('stickersModal').style.display = 'flex';
  }

  createStickersModal() {
    if (document.getElementById('stickersModal')) return;

    const categories = {
      'Emojis': [
        { name: '😀', type: 'emoji' }, { name: '😍', type: 'emoji' }, { name: '🎉', type: 'emoji' },
        { name: '🔥', type: 'emoji' }, { name: '⭐', type: 'emoji' }, { name: '❤️', type: 'emoji' },
        { name: '👍', type: 'emoji' }, { name: '🎨', type: 'emoji' }, { name: '💡', type: 'emoji' },
        { name: '🚀', type: 'emoji' }, { name: '✨', type: 'emoji' }, { name: '🌟', type: 'emoji' },
        { name: '💎', type: 'emoji' }, { name: '🎯', type: 'emoji' }, { name: '🏆', type: 'emoji' },
        { name: '💪', type: 'emoji' }, { name: '🎵', type: 'emoji' }, { name: '📸', type: 'emoji' }
      ],
      'Arrows & Pointers': [
        { name: '➡️', type: 'emoji' }, { name: '⬅️', type: 'emoji' }, { name: '⬆️', type: 'emoji' },
        { name: '⬇️', type: 'emoji' }, { name: '↗️', type: 'emoji' }, { name: '↘️', type: 'emoji' },
        { name: '↙️', type: 'emoji' }, { name: '↖️', type: 'emoji' }, { name: '🔄', type: 'emoji' },
        { name: '👆', type: 'emoji' }, { name: '👇', type: 'emoji' }, { name: '👈', type: 'emoji' },
        { name: '👉', type: 'emoji' }, { name: '☝️', type: 'emoji' }, { name: '✋', type: 'emoji' }
      ],
      'Badges & Labels': [
        { name: '🏷️', type: 'emoji' }, { name: '📌', type: 'emoji' }, { name: '🔖', type: 'emoji' },
        { name: '✅', type: 'emoji' }, { name: '❌', type: 'emoji' }, { name: '⚠️', type: 'emoji' },
        { name: '🔴', type: 'emoji' }, { name: '🟢', type: 'emoji' }, { name: '🔵', type: 'emoji' },
        { name: '🟡', type: 'emoji' }, { name: '🟣', type: 'emoji' }, { name: '⚫', type: 'emoji' },
        { name: '⚪', type: 'emoji' }, { name: '🔶', type: 'emoji' }, { name: '🔷', type: 'emoji' }
      ],
      'Social & UI': [
        { name: '💬', type: 'emoji' }, { name: '💭', type: 'emoji' }, { name: '🗨️', type: 'emoji' },
        { name: '📱', type: 'emoji' }, { name: '💻', type: 'emoji' }, { name: '🖥️', type: 'emoji' },
        { name: '📧', type: 'emoji' }, { name: '📞', type: 'emoji' }, { name: '🔔', type: 'emoji' },
        { name: '🔍', type: 'emoji' }, { name: '⚙️', type: 'emoji' }, { name: '🔧', type: 'emoji' },
        { name: '📊', type: 'emoji' }, { name: '📈', type: 'emoji' }, { name: '📉', type: 'emoji' }
      ]
    };

    const modalHtml = `
      <div id="stickersModal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 700px; max-height: 85vh;">
          <div class="modal-header">
            <h3><i class="fas fa-icons"></i> Stickers & Icons Library</h3>
            <button class="modal-close" onclick="document.getElementById('stickersModal').style.display='none'">&times;</button>
          </div>
          <div class="modal-body" style="overflow-y: auto; max-height: 70vh;">
            
            <!-- Import Your Own PNGs Section -->
            <div class="sticker-category" data-category="My PNGs" style="background: var(--bg-secondary); padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 2px dashed var(--accent-color);">
              <h4 style="margin: 0 0 12px; color: var(--accent-color); font-size: 14px; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-upload"></i> Import Your Own PNG Images
              </h4>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
                Upload PNG images with transparent backgrounds to use as stickers
              </p>
              <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;">
                <button onclick="app.assets.importCustomPng()" 
                        style="padding: 10px 16px; background: var(--accent-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                  <i class="fas fa-file-import"></i> Import PNG Files
                </button>
                <button onclick="app.assets.importFromUrl()" 
                        style="padding: 10px 16px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                  <i class="fas fa-link"></i> Import from URL
                </button>
              </div>
              <div id="customPngGrid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; min-height: 60px;">
                ${this.getCustomPngs().length === 0 ? 
                  '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 12px; padding: 20px;">No custom PNGs yet. Import some above!</p>' : 
                  this.getCustomPngs().map(png => this.renderCustomPngItem(png)).join('')}
              </div>
            </div>

            <!-- Free PNG Resources Links -->
            <div class="sticker-category" style="background: linear-gradient(135deg, #667eea22, #764ba222); padding: 16px; border-radius: 12px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 12px; color: var(--text-primary); font-size: 14px; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-external-link-alt"></i> Free PNG Resources (Download & Import)
              </h4>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                <a href="https://www.flaticon.com/free-icons" target="_blank" style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; text-decoration: none; color: var(--text-primary); display: flex; align-items: center; gap: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                  <img src="https://cdn-icons-png.flaticon.com/128/5968/5968705.png" style="width: 32px; height: 32px;">
                  <div>
                    <div style="font-weight: 600; font-size: 13px;">Flaticon</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">Millions of free icons</div>
                  </div>
                </a>
                <a href="https://www.pngwing.com/" target="_blank" style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; text-decoration: none; color: var(--text-primary); display: flex; align-items: center; gap: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                  <span style="font-size: 24px;">🖼️</span>
                  <div>
                    <div style="font-weight: 600; font-size: 13px;">PNGWing</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">Free transparent PNGs</div>
                  </div>
                </a>
                <a href="https://www.cleanpng.com/" target="_blank" style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; text-decoration: none; color: var(--text-primary); display: flex; align-items: center; gap: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                  <span style="font-size: 24px;">✨</span>
                  <div>
                    <div style="font-weight: 600; font-size: 13px;">CleanPNG</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">HD transparent images</div>
                  </div>
                </a>
                <a href="https://www.stickpng.com/" target="_blank" style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; text-decoration: none; color: var(--text-primary); display: flex; align-items: center; gap: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                  <span style="font-size: 24px;">🏷️</span>
                  <div>
                    <div style="font-weight: 600; font-size: 13px;">StickPNG</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">Sticker-style PNGs</div>
                  </div>
                </a>
                <a href="https://www.pngegg.com/" target="_blank" style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; text-decoration: none; color: var(--text-primary); display: flex; align-items: center; gap: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                  <span style="font-size: 24px;">🥚</span>
                  <div>
                    <div style="font-weight: 600; font-size: 13px;">PNGEgg</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">Free PNG database</div>
                  </div>
                </a>
                <a href="https://www.freepik.com/free-photos-vectors/png" target="_blank" style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; text-decoration: none; color: var(--text-primary); display: flex; align-items: center; gap: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                  <span style="font-size: 24px;">🎨</span>
                  <div>
                    <div style="font-weight: 600; font-size: 13px;">Freepik</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">Vectors & PNGs</div>
                  </div>
                </a>
              </div>
            </div>
            
            <div class="stickers-search" style="margin-bottom: 16px;">
              <input type="text" id="stickerSearch" placeholder="Search stickers..." 
                     style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary); color: var(--text-primary);"
                     oninput="app.assets.filterStickers(this.value)">
            </div>
            ${Object.entries(categories).map(([category, items]) => `
              <div class="sticker-category" data-category="${category}">
                <h4 style="margin: 16px 0 8px; color: var(--text-secondary); font-size: 13px;">${category}</h4>
                <div class="sticker-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
                  ${items.map(item => `
                    <button class="sticker-item" onclick="app.assets.addStickerToCanvas('${item.name}', '${item.type}')"
                            style="font-size: 28px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.background='var(--accent-color)'; this.style.transform='scale(1.1)'"
                            onmouseout="this.style.background='var(--bg-tertiary)'; this.style.transform='scale(1)'">
                      ${item.name}
                    </button>
                  `).join('')}
                </div>
              </div>
            `).join('')}
            
            <div class="sticker-category" data-category="PNG Icons">
              <h4 style="margin: 16px 0 8px; color: var(--text-secondary); font-size: 13px;">Built-in PNG Icons</h4>
              <div class="sticker-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                ${this.getPngIcons().map(icon => `
                  <button class="sticker-item png-icon" onclick="app.assets.addPngIconToCanvas('${icon.url}', '${icon.name}')"
                          style="padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 4px;"
                          onmouseover="this.style.background='var(--accent-color)'; this.style.transform='scale(1.05)'"
                          onmouseout="this.style.background='var(--bg-tertiary)'; this.style.transform='scale(1)'">
                    <img src="${icon.url}" alt="${icon.name}" style="width: 40px; height: 40px; object-fit: contain;">
                    <span style="font-size: 10px; color: var(--text-secondary);">${icon.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  // Custom PNG management
  getCustomPngs() {
    const stored = localStorage.getItem('customPngs');
    return stored ? JSON.parse(stored) : [];
  }

  saveCustomPngs(pngs) {
    localStorage.setItem('customPngs', JSON.stringify(pngs));
  }

  renderCustomPngItem(png) {
    return `
      <div class="custom-png-item" style="position: relative; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px; cursor: pointer; transition: all 0.2s;"
           onmouseover="this.style.transform='scale(1.05)'; this.querySelector('.delete-btn').style.opacity='1'"
           onmouseout="this.style.transform='scale(1)'; this.querySelector('.delete-btn').style.opacity='0'">
        <img src="${png.url}" alt="${png.name}" 
             onclick="app.assets.addPngIconToCanvas('${png.url}', '${png.name}')"
             style="width: 100%; height: 50px; object-fit: contain; display: block;">
        <div style="font-size: 9px; color: var(--text-secondary); text-align: center; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${png.name}</div>
        <button class="delete-btn" onclick="event.stopPropagation(); app.assets.deleteCustomPng('${png.id}')"
                style="position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: #ef4444; color: white; border: none; cursor: pointer; font-size: 10px; opacity: 0; transition: opacity 0.2s;">×</button>
      </div>
    `;
  }

  importCustomPng() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      const pngs = this.getCustomPngs();
      
      for (const file of files) {
        if (file.type !== 'image/png') {
          Utils.showToast(`${file.name} is not a PNG file`, 'warning');
          continue;
        }
        
        try {
          const base64 = await Utils.imageToBase64(file);
          pngs.push({
            id: Utils.generateId(),
            name: file.name.replace('.png', ''),
            url: base64,
            addedAt: new Date().toISOString()
          });
        } catch (err) {
          Utils.showToast(`Failed to import ${file.name}`, 'error');
        }
      }
      
      this.saveCustomPngs(pngs);
      this.refreshCustomPngGrid();
      Utils.showToast(`Imported ${files.length} PNG(s)!`, 'success');
    };
    
    input.click();
  }

  importFromUrl() {
    const url = prompt('Enter the PNG image URL:');
    if (!url) return;
    
    if (!url.match(/\.(png|PNG)($|\?)/)) {
      Utils.showToast('URL should point to a PNG image', 'warning');
    }
    
    Utils.showLoading('Importing from URL...');
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      try {
        const base64 = canvas.toDataURL('image/png');
        const pngs = this.getCustomPngs();
        const name = url.split('/').pop().split('?')[0].replace('.png', '') || 'Imported PNG';
        
        pngs.push({
          id: Utils.generateId(),
          name: name.substring(0, 20),
          url: base64,
          addedAt: new Date().toISOString()
        });
        
        this.saveCustomPngs(pngs);
        this.refreshCustomPngGrid();
        Utils.showToast('PNG imported successfully!', 'success');
      } catch (err) {
        Utils.showToast('Failed to import - CORS restriction', 'error');
      }
      Utils.hideLoading();
    };
    img.onerror = () => {
      Utils.showToast('Failed to load image from URL', 'error');
      Utils.hideLoading();
    };
    img.src = url;
  }

  deleteCustomPng(id) {
    const pngs = this.getCustomPngs().filter(p => p.id !== id);
    this.saveCustomPngs(pngs);
    this.refreshCustomPngGrid();
    Utils.showToast('PNG removed', 'success');
  }

  refreshCustomPngGrid() {
    const grid = document.getElementById('customPngGrid');
    if (!grid) return;
    
    const pngs = this.getCustomPngs();
    if (pngs.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 12px; padding: 20px;">No custom PNGs yet. Import some above!</p>';
    } else {
      grid.innerHTML = pngs.map(png => this.renderCustomPngItem(png)).join('');
    }
    
    // Also refresh toolbar previews
    this.refreshToolbarPngPreviews();
  }

  refreshToolbarPngPreviews() {
    const container = document.getElementById('toolbarPngPreviews');
    const toolGroup = document.getElementById('myPngsToolGroup');
    if (!container || !toolGroup) return;
    
    const pngs = this.getCustomPngs();
    
    if (pngs.length === 0) {
      toolGroup.style.display = 'none';
      return;
    }
    
    toolGroup.style.display = 'flex';
    toolGroup.style.flexDirection = 'column';
    
    // Show up to 6 most recent PNGs in toolbar
    const recentPngs = pngs.slice(-6).reverse();
    
    container.innerHTML = recentPngs.map((png, idx) => `
      <div class="toolbar-png-item" 
           draggable="true"
           data-png-idx="${idx}"
           data-png-url="${png.url}"
           data-png-name="${png.name}"
           onclick="app.assets.addPngInstant('${png.id}')"
           title="${png.name} (drag to canvas)"
           style="width: 36px; height: 36px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px; cursor: grab; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
           onmouseover="this.style.borderColor='var(--accent-color)'; this.style.transform='scale(1.1)'"
           onmouseout="this.style.borderColor='var(--border-color)'; this.style.transform='scale(1)'">
        <img src="${png.url}" alt="${png.name}" style="width: 28px; height: 28px; object-fit: contain; pointer-events: none;">
      </div>
    `).join('');
    
    // Setup drag events for each item
    this.setupToolbarDragEvents();
  }

  setupToolbarDragEvents() {
    const items = document.querySelectorAll('.toolbar-png-item[draggable="true"]');
    
    items.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        // Store data for drag operation
        e.dataTransfer.setData('text/plain', JSON.stringify({
          url: item.dataset.pngUrl,
          name: item.dataset.pngName
        }));
        e.dataTransfer.effectAllowed = 'copy';
        item.style.opacity = '0.5';
        
        // Store globally for cross-element access
        window._draggedPng = {
          url: item.dataset.pngUrl,
          name: item.dataset.pngName
        };
      });
      
      item.addEventListener('dragend', (e) => {
        item.style.opacity = '1';
        window._draggedPng = null;
      });
    });
    
    // Setup canvas drop zone
    this.setupCanvasDropZone();
  }

  setupCanvasDropZone() {
    // Setup on multiple elements to ensure drop works
    const targets = [
      document.getElementById('canvasWrapper'),
      document.querySelector('.canvas-wrapper'),
      document.querySelector('.canvas-background'),
      document.querySelector('.canvas-section')
    ].filter(el => el && !el._pngDropSetup);
    
    if (targets.length === 0) return;
    
    targets.forEach(target => {
      target._pngDropSetup = true;
      
      target.addEventListener('dragover', (e) => {
        // Allow drop for any drag with our global marker
        if (window._draggedPng) {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'copy';
          target.style.outline = '3px dashed #3b82f6';
          target.style.outlineOffset = '-3px';
        }
      });
      
      target.addEventListener('dragleave', (e) => {
        target.style.outline = '';
        target.style.outlineOffset = '';
      });
      
      target.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        target.style.outline = '';
        target.style.outlineOffset = '';
        
        // Get PNG data from global store
        const pngData = window._draggedPng;
        
        if (pngData && pngData.url) {
          // Get drop position relative to canvas
          const canvasEl = app.canvas.canvas.getElement();
          const rect = canvasEl.getBoundingClientRect();
          const zoom = app.canvas.canvas.getZoom();
          const vpt = app.canvas.canvas.viewportTransform;
          
          const x = (e.clientX - rect.left - vpt[4]) / zoom;
          const y = (e.clientY - rect.top - vpt[5]) / zoom;
          
          // Instant add - no loading since it's already base64
          this.addPngInstantAtPosition(pngData.url, pngData.name, x, y);
          
          window._draggedPng = null;
        }
      });
    });
    
    console.log('✅ PNG drop zones setup on', targets.length, 'elements');
  }

  addPngInstant(pngId) {
    const pngs = this.getCustomPngs();
    const png = pngs.find(p => p.id === pngId);
    if (!png) return;
    
    this.addPngInstantAtPosition(png.url, png.name, 100 + Math.random() * 200, 100 + Math.random() * 200);
  }

  addPngInstantAtPosition(url, name, x, y) {
    // Since custom PNGs are stored as base64, they load instantly
    const img = new Image();
    img.onload = () => {
      const fabricImg = new fabric.Image(img, {
        left: x,
        top: y,
        id: Utils.generateId(),
        name: name || 'PNG'
      });
      
      // Scale to reasonable size
      const targetSize = 100;
      const scale = targetSize / Math.max(img.width, img.height);
      if (scale < 1) {
        fabricImg.scale(scale);
      }
      
      app.canvas.addObject(fabricImg);
      app.canvas.canvas.setActiveObject(fabricImg);
      app.canvas.canvas.renderAll();
      app.history.saveState();
    };
    img.src = url;
  }

  initToolbarPreviews() {
    // Initialize toolbar PNG previews on load
    setTimeout(() => {
      this.refreshToolbarPngPreviews();
      // Always setup drop zone even if no PNGs yet
      this.setupCanvasDropZone();
    }, 500);
    
    // Also setup after a longer delay to ensure canvas is ready
    setTimeout(() => {
      this.setupCanvasDropZone();
    }, 1500);
    
    // Setup global document drop handler as fallback
    this.setupGlobalDropHandler();
  }

  setupGlobalDropHandler() {
    if (window._globalPngDropSetup) return;
    window._globalPngDropSetup = true;
    
    // Prevent default drag behavior on document
    document.addEventListener('dragover', (e) => {
      if (window._draggedPng) {
        e.preventDefault();
      }
    });
    
    document.addEventListener('drop', (e) => {
      if (window._draggedPng) {
        e.preventDefault();
        
        const pngData = window._draggedPng;
        if (pngData && pngData.url && app && app.canvas && app.canvas.canvas) {
          // Get drop position relative to canvas
          const canvasEl = app.canvas.canvas.getElement();
          const rect = canvasEl.getBoundingClientRect();
          
          // Check if drop is within canvas bounds
          if (e.clientX >= rect.left && e.clientX <= rect.right &&
              e.clientY >= rect.top && e.clientY <= rect.bottom) {
            const zoom = app.canvas.canvas.getZoom();
            const vpt = app.canvas.canvas.viewportTransform;
            
            const x = (e.clientX - rect.left - vpt[4]) / zoom;
            const y = (e.clientY - rect.top - vpt[5]) / zoom;
            
            this.addPngInstantAtPosition(pngData.url, pngData.name, x, y);
          }
        }
        window._draggedPng = null;
      }
    });
    
    console.log('✅ Global PNG drop handler setup');
  }

  getPngIcons() {
    // Using free icon URLs from various CDNs
    return [
      { name: 'Star', url: 'https://cdn-icons-png.flaticon.com/128/1828/1828884.png' },
      { name: 'Heart', url: 'https://cdn-icons-png.flaticon.com/128/833/833472.png' },
      { name: 'Check', url: 'https://cdn-icons-png.flaticon.com/128/447/447147.png' },
      { name: 'Arrow', url: 'https://cdn-icons-png.flaticon.com/128/271/271228.png' },
      { name: 'Play', url: 'https://cdn-icons-png.flaticon.com/128/0/375.png' },
      { name: 'Pause', url: 'https://cdn-icons-png.flaticon.com/128/0/376.png' },
      { name: 'Music', url: 'https://cdn-icons-png.flaticon.com/128/3844/3844724.png' },
      { name: 'Camera', url: 'https://cdn-icons-png.flaticon.com/128/685/685655.png' },
      { name: 'Location', url: 'https://cdn-icons-png.flaticon.com/128/684/684908.png' },
      { name: 'User', url: 'https://cdn-icons-png.flaticon.com/128/1077/1077114.png' },
      { name: 'Settings', url: 'https://cdn-icons-png.flaticon.com/128/3524/3524659.png' },
      { name: 'Search', url: 'https://cdn-icons-png.flaticon.com/128/622/622669.png' },
      { name: 'Home', url: 'https://cdn-icons-png.flaticon.com/128/1946/1946488.png' },
      { name: 'Mail', url: 'https://cdn-icons-png.flaticon.com/128/561/561127.png' },
      { name: 'Phone', url: 'https://cdn-icons-png.flaticon.com/128/724/724664.png' },
      { name: 'Cart', url: 'https://cdn-icons-png.flaticon.com/128/3144/3144456.png' }
    ];
  }

  filterStickers(searchTerm) {
    const categories = document.querySelectorAll('.sticker-category');
    const term = searchTerm.toLowerCase();
    
    categories.forEach(cat => {
      const items = cat.querySelectorAll('.sticker-item');
      let hasVisible = false;
      
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const matches = text.includes(term) || term === '';
        item.style.display = matches ? 'flex' : 'none';
        if (matches) hasVisible = true;
      });
      
      cat.style.display = hasVisible ? 'block' : 'none';
    });
  }

  addStickerToCanvas(emoji, type) {
    const text = new fabric.Text(emoji, {
      left: 100 + Math.random() * 200,
      top: 100 + Math.random() * 200,
      fontSize: 72,
      id: Utils.generateId(),
      name: `Sticker ${emoji}`
    });
    
    app.canvas.addObject(text);
    app.canvas.canvas.setActiveObject(text);
    app.history.saveState();
    
    document.getElementById('stickersModal').style.display = 'none';
    Utils.showToast('Sticker added!', 'success');
  }

  addPngIconToCanvas(url, name) {
    Utils.showLoading('Adding icon...');
    
    fabric.Image.fromURL(url, (img) => {
      if (!img) {
        Utils.showToast('Failed to load icon', 'error');
        Utils.hideLoading();
        return;
      }
      
      img.set({
        left: 100 + Math.random() * 200,
        top: 100 + Math.random() * 200,
        id: Utils.generateId(),
        name: name
      });
      
      // Scale to reasonable size
      const targetSize = 100;
      const scale = targetSize / Math.max(img.width, img.height);
      img.scale(scale);
      
      app.canvas.addObject(img);
      app.canvas.canvas.setActiveObject(img);
      app.history.saveState();
      
      document.getElementById('stickersModal').style.display = 'none';
      Utils.showToast('Icon added!', 'success');
      Utils.hideLoading();
    }, { crossOrigin: 'anonymous' });
  }

  // Shapes Library Panel
  showShapesPanel() {
    this.createShapesModal();
    document.getElementById('shapesModal').style.display = 'flex';
  }

  createShapesModal() {
    if (document.getElementById('shapesModal')) return;

    const shapes = [
      { name: 'Rectangle', icon: '▬', action: 'addRectangle' },
      { name: 'Rounded Rect', icon: '▢', action: 'addRoundedRect' },
      { name: 'Circle', icon: '●', action: 'addCircle' },
      { name: 'Ellipse', icon: '⬭', action: 'addEllipse' },
      { name: 'Triangle', icon: '▲', action: 'addTriangle' },
      { name: 'Star', icon: '★', action: 'addStar' },
      { name: 'Pentagon', icon: '⬠', action: 'addPentagon' },
      { name: 'Hexagon', icon: '⬡', action: 'addHexagon' },
      { name: 'Arrow Right', icon: '➔', action: 'addArrowRight' },
      { name: 'Arrow Left', icon: '←', action: 'addArrowLeft' },
      { name: 'Arrow Up', icon: '↑', action: 'addArrowUp' },
      { name: 'Arrow Down', icon: '↓', action: 'addArrowDown' },
      { name: 'Line', icon: '─', action: 'addLine' },
      { name: 'Curved Line', icon: '∿', action: 'addCurvedLine' },
      { name: 'Speech Bubble', icon: '💬', action: 'addSpeechBubble' },
      { name: 'Callout', icon: '📢', action: 'addCallout' },
      { name: 'Badge', icon: '🏷️', action: 'addBadge' },
      { name: 'Banner', icon: '🎗️', action: 'addBanner' }
    ];

    const modalHtml = `
      <div id="shapesModal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h3><i class="fas fa-shapes"></i> Shape Library</h3>
            <button class="modal-close" onclick="document.getElementById('shapesModal').style.display='none'">&times;</button>
          </div>
          <div class="modal-body">
            <div class="shapes-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
              ${shapes.map(shape => `
                <button class="shape-item" onclick="app.assets.${shape.action}()"
                        style="padding: 16px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 8px;"
                        onmouseover="this.style.background='var(--accent-color)'; this.style.borderColor='var(--accent-color)'"
                        onmouseout="this.style.background='var(--bg-tertiary)'; this.style.borderColor='var(--border-color)'">
                  <span style="font-size: 28px;">${shape.icon}</span>
                  <span style="font-size: 11px; color: var(--text-secondary);">${shape.name}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  // Shape creation methods
  addRectangle() {
    const rect = new fabric.Rect({
      left: 100, top: 100, width: 150, height: 100,
      fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2,
      id: Utils.generateId(), name: 'Rectangle'
    });
    this.addShapeToCanvas(rect);
  }

  addRoundedRect() {
    const rect = new fabric.Rect({
      left: 100, top: 100, width: 150, height: 100, rx: 15, ry: 15,
      fill: '#8b5cf6', stroke: '#6d28d9', strokeWidth: 2,
      id: Utils.generateId(), name: 'Rounded Rectangle'
    });
    this.addShapeToCanvas(rect);
  }

  addCircle() {
    const circle = new fabric.Circle({
      left: 100, top: 100, radius: 60,
      fill: '#ec4899', stroke: '#be185d', strokeWidth: 2,
      id: Utils.generateId(), name: 'Circle'
    });
    this.addShapeToCanvas(circle);
  }

  addEllipse() {
    const ellipse = new fabric.Ellipse({
      left: 100, top: 100, rx: 80, ry: 50,
      fill: '#14b8a6', stroke: '#0d9488', strokeWidth: 2,
      id: Utils.generateId(), name: 'Ellipse'
    });
    this.addShapeToCanvas(ellipse);
  }

  addTriangle() {
    const triangle = new fabric.Triangle({
      left: 100, top: 100, width: 120, height: 100,
      fill: '#f59e0b', stroke: '#d97706', strokeWidth: 2,
      id: Utils.generateId(), name: 'Triangle'
    });
    this.addShapeToCanvas(triangle);
  }

  addStar() {
    const points = this.createStarPoints(5, 60, 30);
    const star = new fabric.Polygon(points, {
      left: 100, top: 100,
      fill: '#eab308', stroke: '#ca8a04', strokeWidth: 2,
      id: Utils.generateId(), name: 'Star'
    });
    this.addShapeToCanvas(star);
  }

  addPentagon() {
    const points = this.createPolygonPoints(5, 60);
    const pentagon = new fabric.Polygon(points, {
      left: 100, top: 100,
      fill: '#06b6d4', stroke: '#0891b2', strokeWidth: 2,
      id: Utils.generateId(), name: 'Pentagon'
    });
    this.addShapeToCanvas(pentagon);
  }

  addHexagon() {
    const points = this.createPolygonPoints(6, 60);
    const hexagon = new fabric.Polygon(points, {
      left: 100, top: 100,
      fill: '#84cc16', stroke: '#65a30d', strokeWidth: 2,
      id: Utils.generateId(), name: 'Hexagon'
    });
    this.addShapeToCanvas(hexagon);
  }

  addArrowRight() {
    const points = [
      { x: 0, y: 20 }, { x: 80, y: 20 }, { x: 80, y: 0 },
      { x: 120, y: 35 }, { x: 80, y: 70 }, { x: 80, y: 50 }, { x: 0, y: 50 }
    ];
    const arrow = new fabric.Polygon(points, {
      left: 100, top: 100,
      fill: '#ef4444', stroke: '#dc2626', strokeWidth: 2,
      id: Utils.generateId(), name: 'Arrow Right'
    });
    this.addShapeToCanvas(arrow);
  }

  addArrowLeft() {
    const points = [
      { x: 120, y: 20 }, { x: 40, y: 20 }, { x: 40, y: 0 },
      { x: 0, y: 35 }, { x: 40, y: 70 }, { x: 40, y: 50 }, { x: 120, y: 50 }
    ];
    const arrow = new fabric.Polygon(points, {
      left: 100, top: 100,
      fill: '#3b82f6', stroke: '#2563eb', strokeWidth: 2,
      id: Utils.generateId(), name: 'Arrow Left'
    });
    this.addShapeToCanvas(arrow);
  }

  addArrowUp() {
    const points = [
      { x: 20, y: 120 }, { x: 20, y: 40 }, { x: 0, y: 40 },
      { x: 35, y: 0 }, { x: 70, y: 40 }, { x: 50, y: 40 }, { x: 50, y: 120 }
    ];
    const arrow = new fabric.Polygon(points, {
      left: 100, top: 100,
      fill: '#22c55e', stroke: '#16a34a', strokeWidth: 2,
      id: Utils.generateId(), name: 'Arrow Up'
    });
    this.addShapeToCanvas(arrow);
  }

  addArrowDown() {
    const points = [
      { x: 20, y: 0 }, { x: 20, y: 80 }, { x: 0, y: 80 },
      { x: 35, y: 120 }, { x: 70, y: 80 }, { x: 50, y: 80 }, { x: 50, y: 0 }
    ];
    const arrow = new fabric.Polygon(points, {
      left: 100, top: 100,
      fill: '#f97316', stroke: '#ea580c', strokeWidth: 2,
      id: Utils.generateId(), name: 'Arrow Down'
    });
    this.addShapeToCanvas(arrow);
  }

  addLine() {
    const line = new fabric.Line([0, 0, 150, 0], {
      left: 100, top: 100,
      stroke: '#000000', strokeWidth: 3,
      id: Utils.generateId(), name: 'Line'
    });
    this.addShapeToCanvas(line);
  }

  addCurvedLine() {
    const path = new fabric.Path('M 0 50 Q 75 0 150 50', {
      left: 100, top: 100,
      fill: '', stroke: '#6366f1', strokeWidth: 3,
      id: Utils.generateId(), name: 'Curved Line'
    });
    this.addShapeToCanvas(path);
  }

  addSpeechBubble() {
    const path = new fabric.Path('M 10 10 L 140 10 Q 150 10 150 20 L 150 70 Q 150 80 140 80 L 50 80 L 30 100 L 40 80 L 20 80 Q 10 80 10 70 L 10 20 Q 10 10 20 10 Z', {
      left: 100, top: 100,
      fill: '#ffffff', stroke: '#374151', strokeWidth: 2,
      id: Utils.generateId(), name: 'Speech Bubble'
    });
    this.addShapeToCanvas(path);
  }

  addCallout() {
    const path = new fabric.Path('M 0 0 L 120 0 L 120 60 L 70 60 L 60 80 L 50 60 L 0 60 Z', {
      left: 100, top: 100,
      fill: '#fef3c7', stroke: '#f59e0b', strokeWidth: 2,
      id: Utils.generateId(), name: 'Callout'
    });
    this.addShapeToCanvas(path);
  }

  addBadge() {
    const points = this.createStarPoints(8, 50, 40);
    const badge = new fabric.Polygon(points, {
      left: 100, top: 100,
      fill: '#dc2626', stroke: '#991b1b', strokeWidth: 2,
      id: Utils.generateId(), name: 'Badge'
    });
    this.addShapeToCanvas(badge);
  }

  addBanner() {
    const path = new fabric.Path('M 0 10 L 20 0 L 20 10 L 130 10 L 130 0 L 150 10 L 150 50 L 130 60 L 130 50 L 20 50 L 20 60 L 0 50 Z', {
      left: 100, top: 100,
      fill: '#7c3aed', stroke: '#5b21b6', strokeWidth: 2,
      id: Utils.generateId(), name: 'Banner'
    });
    this.addShapeToCanvas(path);
  }

  createStarPoints(numPoints, outerRadius, innerRadius) {
    const points = [];
    const step = Math.PI / numPoints;
    for (let i = 0; i < 2 * numPoints; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      points.push({
        x: outerRadius + radius * Math.cos(angle),
        y: outerRadius + radius * Math.sin(angle)
      });
    }
    return points;
  }

  createPolygonPoints(numSides, radius) {
    const points = [];
    const step = (2 * Math.PI) / numSides;
    for (let i = 0; i < numSides; i++) {
      const angle = i * step - Math.PI / 2;
      points.push({
        x: radius + radius * Math.cos(angle),
        y: radius + radius * Math.sin(angle)
      });
    }
    return points;
  }

  addShapeToCanvas(shape) {
    app.canvas.addObject(shape);
    app.canvas.canvas.setActiveObject(shape);
    app.history.saveState();
    
    const modal = document.getElementById('shapesModal');
    if (modal) modal.style.display = 'none';
    
    Utils.showToast('Shape added!', 'success');
  }
}

if (typeof window !== 'undefined') {
  window.AssetManager = AssetManager;
}
