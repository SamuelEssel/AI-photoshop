// Modal & UI Management Module

class UIManager {
  constructor() {
    this.activeModal = null;
  }

  init() {
    this.setupModalClosers();
  }

  setupModalClosers() {
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      this.activeModal = modalId;
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      if (this.activeModal === modalId) {
        this.activeModal = null;
      }
    }
  }

  toggleAdvanced() {
    const advancedOptions = document.getElementById('advancedOptions');
    if (advancedOptions) {
      const isHidden = advancedOptions.style.display === 'none';
      advancedOptions.style.display = isHidden ? 'block' : 'none';
      
      const btn = event.currentTarget;
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isHidden ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
      }
    }
  }

  showCanvasSizeDialog() {
    if (!document.getElementById('canvasSizeModal')) {
      this.createCanvasSizeModal();
    }
    this.showModal('canvasSizeModal');
  }

  createCanvasSizeModal() {
    const modal = document.createElement('div');
    modal.id = 'canvasSizeModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2><i class="fas fa-ruler-combined"></i> Canvas Size</h2>
          <button class="close-btn" onclick="app.ui.closeModal('canvasSizeModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Presets</label>
            <div class="preset-grid" id="canvasPresets"></div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Width (px)</label>
              <input type="number" id="canvasWidthInput" value="${app.canvas.canvas.width}" min="64" max="8192">
            </div>
            <div class="form-group">
              <label>Height (px)</label>
              <input type="number" id="canvasHeightInput" value="${app.canvas.canvas.height}" min="64" max="8192">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="app.ui.closeModal('canvasSizeModal')">Cancel</button>
          <button class="btn-primary" onclick="app.ui.applyCanvasSize()">
            <i class="fas fa-check"></i> Apply
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.populateCanvasPresets();
  }

  populateCanvasPresets() {
    const container = document.getElementById('canvasPresets');
    if (!container) return;

    const presets = [];
    Object.entries(APP_CONFIG.presets).forEach(([category, sizes]) => {
      sizes.forEach(preset => presets.push(preset));
    });

    container.innerHTML = presets.slice(0, 6).map(preset => `
      <div class="preset-item" onclick="app.ui.selectPreset(${preset.width}, ${preset.height})">
        <div class="preset-name">${preset.name}</div>
        <div class="preset-size">${preset.width} × ${preset.height}</div>
      </div>
    `).join('');
  }

  selectPreset(width, height) {
    document.getElementById('canvasWidthInput').value = width;
    document.getElementById('canvasHeightInput').value = height;
  }

  applyCanvasSize() {
    const width = parseInt(document.getElementById('canvasWidthInput').value);
    const height = parseInt(document.getElementById('canvasHeightInput').value);
    
    if (width && height) {
      app.canvas.setCanvasSize(width, height);
      this.closeModal('canvasSizeModal');
      Utils.showToast('Canvas size updated', 'success');
    }
  }

  showMenu(menuType) {
    // Create context menu
    const menu = this.createMenu(menuType);
    if (menu) {
      document.body.appendChild(menu);
      
      // Position near button
      const rect = event.currentTarget.getBoundingClientRect();
      menu.style.top = rect.bottom + 'px';
      menu.style.left = rect.left + 'px';
      
      // Close on click outside
      setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
          if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
          }
        });
      }, 0);
    }
  }

  createMenu(menuType) {
    const menus = {
      file: [
        { icon: 'fa-file', label: 'New', action: () => app.project.createNewProject() },
        { icon: 'fa-folder-open', label: 'Open', action: () => this.showOpenDialog() },
        { icon: 'fa-save', label: 'Save', action: () => app.project.save() },
        { icon: 'fa-download', label: 'Export', action: () => app.export.showDialog() },
        { separator: true },
        { icon: 'fa-file-import', label: 'Import JSON', action: () => this.showImportDialog() }
      ],
      edit: [
        { icon: 'fa-undo', label: 'Undo', action: () => app.history.undo(), shortcut: 'Ctrl+Z' },
        { icon: 'fa-redo', label: 'Redo', action: () => app.history.redo(), shortcut: 'Ctrl+Y' },
        { separator: true },
        { icon: 'fa-copy', label: 'Duplicate', action: () => app.layers.duplicate(), shortcut: 'Ctrl+D' },
        { icon: 'fa-trash', label: 'Delete', action: () => app.layers.delete(), shortcut: 'Del' }
      ],
      view: [
        { icon: 'fa-border-all', label: 'Toggle Grid', action: () => app.canvas.toggleGrid() },
        { icon: 'fa-ruler-combined', label: 'Toggle Rulers', action: () => app.canvas.toggleRulers() },
        { icon: 'fa-expand', label: 'Fit to Screen', action: () => app.canvas.fitToScreen() }
      ]
    };

    const items = menus[menuType];
    if (!items) return null;

    const menu = document.createElement('div');
    menu.className = 'dropdown-menu active';
    
    menu.innerHTML = items.map(item => {
      if (item.separator) {
        return '<div class="dropdown-separator"></div>';
      }
      return `
        <div class="dropdown-item" onclick="this.parentElement.remove()">
          <i class="fas ${item.icon}"></i>
          <span>${item.label}</span>
          ${item.shortcut ? `<span style="margin-left: auto; opacity: 0.5; font-size: 12px;">${item.shortcut}</span>` : ''}
        </div>
      `;
    }).join('');

    // Add click handlers
    const menuItems = menu.querySelectorAll('.dropdown-item');
    menuItems.forEach((element, index) => {
      const item = items.filter(i => !i.separator)[index];
      if (item && item.action) {
        element.addEventListener('click', item.action);
      }
    });

    return menu;
  }

  showOpenDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        await app.project.importFromJSON(file);
      }
    };
    
    input.click();
  }

  showImportDialog() {
    this.showOpenDialog();
  }
}

// Share functionality
class ShareManager {
  showDialog() {
    if (!document.getElementById('shareModal')) {
      this.createShareModal();
    }
    app.ui.showModal('shareModal');
    this.generateShareLink();
  }

  createShareModal() {
    const modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2><i class="fas fa-share-nodes"></i> Share Project</h2>
          <button class="close-btn" onclick="app.ui.closeModal('shareModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Share Link</label>
            <div class="property-row">
              <input type="text" id="shareLink" readonly>
              <button class="btn-sm" onclick="app.share.copyLink()">
                <i class="fas fa-copy"></i> Copy
              </button>
            </div>
            <div class="form-hint">Anyone with this link can view your project</div>
          </div>
          
          <div class="form-group">
            <label>Export & Share</label>
            <button class="btn-secondary" onclick="app.share.shareAsImage()" style="width: 100%;">
              <i class="fas fa-image"></i> Share as Image
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  generateShareLink() {
    const projectId = app.project.currentProject?.id || 'demo';
    const link = `${window.location.origin}/?project=${projectId}`;
    const input = document.getElementById('shareLink');
    if (input) {
      input.value = link;
    }
  }

  copyLink() {
    const input = document.getElementById('shareLink');
    if (input) {
      input.select();
      document.execCommand('copy');
      Utils.showToast('Link copied to clipboard!', 'success');
    }
  }

  async shareAsImage() {
    const imageData = app.canvas.toDataURL('png', 1);
    
    // Create download
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `${app.project.currentProject?.title || 'design'}.png`;
    link.click();
    
    Utils.showToast('Image downloaded!', 'success');
  }
}

if (typeof window !== 'undefined') {
  window.UIManager = UIManager;
  window.ShareManager = ShareManager;
}
