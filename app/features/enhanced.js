// Enhanced Features Module - Blend Modes, Gradients, Effects, etc.

class EnhancedFeatures {
  constructor() {
    this.blendModes = [
      'source-over', 'multiply', 'screen', 'overlay', 'darken',
      'lighten', 'color-dodge', 'color-burn', 'hard-light',
      'soft-light', 'difference', 'exclusion', 'hue',
      'saturation', 'color', 'luminosity'
    ];
    
    this.currentGradient = null;
    this.cropMode = false;
    this.cropRect = null;
    this.autoSaveInterval = null;
  }

  init() {
    console.log('🎨 Initializing Enhanced Features...');
    this.setupDragAndDrop();
    this.setupColorPickers();
    this.setupBrushControls();
    this.startAutoSave();
    this.setupStatusBar();
  }

  // ===== Blend Modes =====
  setBlendMode(mode) {
    const obj = app.canvas.getActiveObject();
    if (!obj) {
      Utils.showToast('Select an object first', 'warning');
      return;
    }

    obj.set('globalCompositeOperation', mode);
    app.canvas.render();
    app.history.saveState();
    Utils.showToast(`Blend mode: ${mode}`, 'success');
  }

  getBlendModes() {
    return this.blendModes;
  }

  // ===== Gradient Fills =====
  createLinearGradient(colorStops) {
    const obj = app.canvas.getActiveObject();
    if (!obj) {
      Utils.showToast('Select an object first', 'warning');
      return;
    }

    const gradient = new fabric.Gradient({
      type: 'linear',
      coords: {
        x1: 0,
        y1: 0,
        x2: obj.width || 100,
        y2: 0
      },
      colorStops: colorStops || [
        { offset: 0, color: '#00BFA6' },
        { offset: 1, color: '#1E90FF' }
      ]
    });

    obj.set('fill', gradient);
    app.canvas.render();
    app.history.saveState();
  }

  createRadialGradient(colorStops) {
    const obj = app.canvas.getActiveObject();
    if (!obj) {
      Utils.showToast('Select an object first', 'warning');
      return;
    }

    const gradient = new fabric.Gradient({
      type: 'radial',
      coords: {
        x1: (obj.width || 100) / 2,
        y1: (obj.height || 100) / 2,
        r1: 0,
        x2: (obj.width || 100) / 2,
        y2: (obj.height || 100) / 2,
        r2: (obj.width || 100) / 2
      },
      colorStops: colorStops || [
        { offset: 0, color: '#ffffff' },
        { offset: 1, color: '#000000' }
      ]
    });

    obj.set('fill', gradient);
    app.canvas.render();
    app.history.saveState();
  }

  showGradientDialog() {
    const modal = document.getElementById('gradientModal');
    if (!modal) {
      this.createGradientModal();
    }
    app.ui.showModal('gradientModal');
  }

  createGradientModal() {
    const modal = document.createElement('div');
    modal.id = 'gradientModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2><i class="fas fa-fill-drip"></i> Gradient Fill</h2>
          <button class="close-btn" onclick="app.ui.closeModal('gradientModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Gradient Type</label>
            <select id="gradientType">
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Start Color</label>
            <input type="color" id="gradientStart" value="#00BFA6">
          </div>
          
          <div class="form-group">
            <label>End Color</label>
            <input type="color" id="gradientEnd" value="#1E90FF">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="app.ui.closeModal('gradientModal')">Cancel</button>
          <button class="btn-primary" onclick="app.enhanced.applyGradient()">
            <i class="fas fa-check"></i> Apply
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  applyGradient() {
    const type = document.getElementById('gradientType').value;
    const start = document.getElementById('gradientStart').value;
    const end = document.getElementById('gradientEnd').value;

    const colorStops = [
      { offset: 0, color: start },
      { offset: 1, color: end }
    ];

    if (type === 'linear') {
      this.createLinearGradient(colorStops);
    } else {
      this.createRadialGradient(colorStops);
    }

    app.ui.closeModal('gradientModal');
  }

  // ===== Border Radius =====
  setBorderRadius(radius) {
    const obj = app.canvas.getActiveObject();
    if (!obj || obj.type !== 'rect') {
      Utils.showToast('Select a rectangle first', 'warning');
      return;
    }

    obj.set('rx', radius);
    obj.set('ry', radius);
    app.canvas.render();
    app.history.saveState();
  }

  // ===== Text Effects =====
  addTextShadow(options = {}) {
    const obj = app.canvas.getActiveObject();
    if (!obj || !['text', 'i-text', 'textbox'].includes(obj.type)) {
      Utils.showToast('Select text first', 'warning');
      return;
    }

    obj.set('shadow', {
      color: options.color || 'rgba(0,0,0,0.5)',
      blur: options.blur || 10,
      offsetX: options.offsetX || 5,
      offsetY: options.offsetY || 5
    });

    app.canvas.render();
    app.history.saveState();
  }

  addTextOutline(width = 2, color = '#000000') {
    const obj = app.canvas.getActiveObject();
    if (!obj || !['text', 'i-text', 'textbox'].includes(obj.type)) {
      Utils.showToast('Select text first', 'warning');
      return;
    }

    obj.set({
      stroke: color,
      strokeWidth: width,
      paintFirst: 'stroke'
    });

    app.canvas.render();
    app.history.saveState();
  }

  // ===== Crop Tool =====
  enableCrop() {
    const obj = app.canvas.getActiveObject();
    if (!obj || obj.type !== 'image') {
      Utils.showToast('Select an image to crop', 'warning');
      return;
    }

    this.cropMode = true;
    this.cropTarget = obj;

    // Create crop rectangle
    this.cropRect = new fabric.Rect({
      left: obj.left,
      top: obj.top,
      width: obj.width * obj.scaleX,
      height: obj.height * obj.scaleY,
      fill: 'rgba(0,0,0,0.3)',
      stroke: '#00BFA6',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: true,
      hasControls: true
    });

    app.canvas.canvas.add(this.cropRect);
    app.canvas.canvas.setActiveObject(this.cropRect);
    app.canvas.render();

    Utils.showToast('Resize the rectangle and click Apply Crop', 'info');
  }

  applyCrop() {
    if (!this.cropMode || !this.cropRect || !this.cropTarget) {
      Utils.showToast('No active crop operation', 'warning');
      return;
    }

    const cropRect = this.cropRect;
    const image = this.cropTarget;

    // Calculate crop area
    const left = (cropRect.left - image.left) / image.scaleX;
    const top = (cropRect.top - image.top) / image.scaleY;
    const width = cropRect.width / image.scaleX;
    const height = cropRect.height / image.scaleY;

    // Apply crop
    image.set({
      cropX: left,
      cropY: top,
      width: width,
      height: height
    });

    // Remove crop rectangle
    app.canvas.canvas.remove(this.cropRect);
    app.canvas.canvas.setActiveObject(image);

    this.cropMode = false;
    this.cropRect = null;
    this.cropTarget = null;

    app.canvas.render();
    app.history.saveState();
    Utils.showToast('Image cropped', 'success');
  }

  cancelCrop() {
    if (this.cropRect) {
      app.canvas.canvas.remove(this.cropRect);
    }

    this.cropMode = false;
    this.cropRect = null;
    this.cropTarget = null;

    app.canvas.render();
  }

  // ===== Drag & Drop =====
  setupDragAndDrop() {
    const canvasWrapper = document.getElementById('canvasWrapper');

    canvasWrapper.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      canvasWrapper.classList.add('drag-over');
    });

    canvasWrapper.addEventListener('dragleave', () => {
      canvasWrapper.classList.remove('drag-over');
    });

    canvasWrapper.addEventListener('drop', (e) => {
      e.preventDefault();
      canvasWrapper.classList.remove('drag-over');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileUpload(files[0]);
      }
    });
  }

  handleFileUpload(file) {
    if (!file.type.startsWith('image/')) {
      Utils.showToast('Please upload an image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        img.set({
          left: 100,
          top: 100,
          id: Utils.generateId(),
          name: file.name
        });

        // Scale to fit
        const maxSize = 500;
        if (img.width > maxSize || img.height > maxSize) {
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          img.scale(scale);
        }

        app.canvas.addObject(img);
        Utils.showToast('Image added', 'success');
      });
    };
    reader.readAsDataURL(file);
  }

  // ===== Color Pickers =====
  setupColorPickers() {
    const fillInput = document.getElementById('fillColorInput');
    const strokeInput = document.getElementById('strokeColorInput');

    if (fillInput) {
      fillInput.addEventListener('change', (e) => {
        const obj = app.canvas.getActiveObject();
        if (obj) {
          obj.set('fill', e.target.value);
          app.canvas.render();
          app.history.saveState();
        }
        
        // Update swatch
        const swatch = fillInput.parentElement.querySelector('.swatch-display');
        if (swatch) swatch.style.background = e.target.value;
      });
    }

    if (strokeInput) {
      strokeInput.addEventListener('change', (e) => {
        const obj = app.canvas.getActiveObject();
        if (obj) {
          obj.set('stroke', e.target.value);
          app.canvas.render();
          app.history.saveState();
        }
        
        // Update swatch
        const swatch = strokeInput.parentElement.querySelector('.swatch-display');
        if (swatch) swatch.style.background = e.target.value;
      });
    }
  }

  // ===== Brush Controls =====
  setupBrushControls() {
    // Add brush size control to canvas top toolbar
    const zoomControls = document.querySelector('.zoom-controls');
    if (zoomControls) {
      const brushControls = document.createElement('div');
      brushControls.className = 'brush-controls';
      brushControls.id = 'brushControls';
      brushControls.style.display = 'none';
      brushControls.innerHTML = `
        <label style="font-size: 12px; margin-right: 8px;">Brush Size:</label>
        <input type="range" id="brushSize" min="1" max="50" value="5" style="width: 100px;">
        <span id="brushSizeDisplay" style="margin-left: 8px; font-size: 12px;">5px</span>
      `;
      
      zoomControls.parentElement.appendChild(brushControls);

      // Add event listener
      const brushSize = document.getElementById('brushSize');
      if (brushSize) {
        brushSize.addEventListener('input', (e) => {
          const size = parseInt(e.target.value);
          document.getElementById('brushSizeDisplay').textContent = size + 'px';
          
          if (app.canvas.canvas.isDrawingMode) {
            app.canvas.canvas.freeDrawingBrush.width = size;
          }
        });
      }
    }
  }

  showBrushControls() {
    const brushControls = document.getElementById('brushControls');
    if (brushControls) {
      brushControls.style.display = 'flex';
      brushControls.style.alignItems = 'center';
    }
  }

  hideBrushControls() {
    const brushControls = document.getElementById('brushControls');
    if (brushControls) {
      brushControls.style.display = 'none';
    }
  }

  // ===== Auto-Save =====
  startAutoSave() {
    // Auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      this.autoSave();
    }, 30000);
  }

  autoSave() {
    try {
      const json = app.canvas.toJSON();
      localStorage.setItem('autoSave', JSON.stringify(json));
      localStorage.setItem('autoSaveTime', new Date().toISOString());
      
      this.updateAutoSaveStatus('Auto-saved');
      
      setTimeout(() => {
        this.updateAutoSaveStatus('Saved');
      }, 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  loadAutoSave() {
    try {
      const autoSave = localStorage.getItem('autoSave');
      if (autoSave) {
        const json = JSON.parse(autoSave);
        app.canvas.fromJSON(json);
        
        const time = localStorage.getItem('autoSaveTime');
        if (time) {
          const date = new Date(time);
          Utils.showToast(`Loaded auto-save from ${date.toLocaleString()}`, 'info');
        }
      }
    } catch (error) {
      console.error('Failed to load auto-save:', error);
    }
  }

  updateAutoSaveStatus(text) {
    const status = document.getElementById('autoSaveStatus');
    if (status) {
      status.textContent = text;
    }
  }

  // ===== Status Bar Updates =====
  setupStatusBar() {
    // Update cursor position
    app.canvas.canvas.on('mouse:move', (e) => {
      const pointer = app.canvas.canvas.getPointer(e.e);
      const cursor = document.getElementById('cursorPosition');
      if (cursor) {
        cursor.textContent = `X: ${Math.round(pointer.x)}, Y: ${Math.round(pointer.y)}`;
      }
    });

    // Update selection info
    app.canvas.canvas.on('selection:created', (e) => {
      this.updateSelectionInfo(e.selected[0]);
    });

    app.canvas.canvas.on('selection:updated', (e) => {
      this.updateSelectionInfo(e.selected[0]);
    });

    app.canvas.canvas.on('selection:cleared', () => {
      const info = document.getElementById('selectionInfo');
      if (info) info.textContent = 'No selection';
    });

    // Update zoom display
    const originalSetZoom = app.canvas.setZoom.bind(app.canvas);
    app.canvas.setZoom = (zoom) => {
      originalSetZoom(zoom);
      this.updateZoomDisplay(zoom);
    };
  }

  updateSelectionInfo(obj) {
    const info = document.getElementById('selectionInfo');
    if (info && obj) {
      const type = obj.type;
      const name = obj.name || type;
      info.textContent = `${name} (${Math.round(obj.width * obj.scaleX)} × ${Math.round(obj.height * obj.scaleY)})`;
    }
  }

  updateZoomDisplay(zoom) {
    const display = document.getElementById('zoomDisplay');
    if (display) {
      display.textContent = Math.round(zoom * 100) + '%';
    }
    
    const zoomLevel = document.getElementById('zoomLevel');
    if (zoomLevel) {
      zoomLevel.textContent = Math.round(zoom * 100) + '%';
    }
  }

  updateToolDisplay(toolName) {
    const display = document.getElementById('activeTool');
    if (display) {
      const names = {
        'select': 'Select Tool',
        'hand': 'Hand Tool',
        'rectangle': 'Rectangle Tool',
        'circle': 'Circle Tool',
        'triangle': 'Triangle Tool',
        'star': 'Star Tool',
        'line': 'Line Tool',
        'polygon': 'Polygon Tool',
        'pen': 'Pen Tool',
        'brush': 'Brush Tool',
        'eraser': 'Eraser Tool',
        'text': 'Text Tool',
        'image': 'Image Tool',
        'crop': 'Crop Tool'
      };
      display.textContent = names[toolName] || 'Select Tool';
    }
  }
}

if (typeof window !== 'undefined') {
  window.EnhancedFeatures = EnhancedFeatures;
}
