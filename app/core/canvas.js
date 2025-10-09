// Canvas Management Module

class CanvasManager {
  constructor() {
    this.canvas = null;
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
    this.gridEnabled = false;
    this.rulersEnabled = false;
    this.guidesEnabled = true;
    this.guides = [];
    this.snapToGrid = APP_CONFIG.canvas.snapToGrid;
  }

  init() {
    const canvasElement = document.getElementById('fabricCanvas');
    
    this.canvas = new fabric.Canvas('fabricCanvas', {
      width: APP_CONFIG.canvas.defaultWidth,
      height: APP_CONFIG.canvas.defaultHeight,
      backgroundColor: APP_CONFIG.canvas.backgroundColor,
      preserveObjectStacking: true,
      selection: true,
      renderOnAddRemove: true,
      centeredScaling: false,
      centeredRotation: true
    });

    this.setupEventListeners();
    this.enableMouseWheelZoom();
    this.updateCanvasDisplay();
    
    console.log('Canvas initialized:', this.canvas.width, 'x', this.canvas.height);
  }

  setupEventListeners() {
    // Selection events
    this.canvas.on('selection:created', (e) => {
      app.properties.update(e.selected[0]);
      app.layers.updateSelection(e.selected);
    });

    this.canvas.on('selection:updated', (e) => {
      app.properties.update(e.selected[0]);
      app.layers.updateSelection(e.selected);
    });

    this.canvas.on('selection:cleared', () => {
      app.properties.clear();
      app.layers.clearSelection();
    });

    // Object modification events
    this.canvas.on('object:modified', (e) => {
      app.history.saveState();
      app.properties.update(e.target);
    });

    this.canvas.on('object:moving', (e) => {
      if (this.snapToGrid) {
        this.snapObjectToGrid(e.target);
      }
    });

    this.canvas.on('object:scaling', (e) => {
      app.properties.update(e.target);
    });

    this.canvas.on('object:rotating', (e) => {
      app.properties.update(e.target);
    });

    // Mouse events
    this.canvas.on('mouse:move', (e) => {
      const pointer = this.canvas.getPointer(e.e);
      this.updateCursorPosition(pointer.x, pointer.y);
    });

    // Render complete
    this.canvas.on('after:render', () => {
      if (this.gridEnabled) {
        this.drawGrid();
      }
    });
  }

  snapObjectToGrid(obj) {
    const gridSize = APP_CONFIG.canvas.gridSize;
    obj.set({
      left: Utils.roundToStep(obj.left, gridSize),
      top: Utils.roundToStep(obj.top, gridSize)
    });
    obj.setCoords();
  }

  updateCursorPosition(x, y) {
    const posElement = document.getElementById('cursorPosition');
    if (posElement) {
      posElement.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
    }
  }

  updateCanvasDisplay() {
    const sizeElement = document.getElementById('canvasSize');
    if (sizeElement) {
      sizeElement.textContent = `${this.canvas.width} × ${this.canvas.height}`;
    }
    
    const zoomElement = document.getElementById('zoomLevel');
    if (zoomElement) {
      zoomElement.textContent = `${Math.round(this.zoom * 100)}%`;
    }
  }

  // Zoom functions
  zoomIn() {
    this.setZoom(Math.min(this.zoom * 1.2, 10));
  }

  zoomOut() {
    this.setZoom(Math.max(this.zoom / 1.2, 0.1));
  }

  setZoom(zoom) {
    this.zoom = zoom;
    this.canvas.setZoom(zoom);
    this.canvas.renderAll();
    this.updateCanvasDisplay();
  }

  zoomToFit() {
    this.fitToScreen();
  }

  zoomToActual() {
    this.setZoom(1);
  }

  fitToScreen() {
    const wrapper = document.getElementById('canvasWrapper');
    const padding = 100;
    
    const scaleX = (wrapper.clientWidth - padding) / this.canvas.width;
    const scaleY = (wrapper.clientHeight - padding) / this.canvas.height;
    const scale = Math.min(scaleX, scaleY);
    
    this.setZoom(scale);
  }

  // Pan functions
  enablePanning() {
    this.canvas.selection = false;
    this.isPanning = true;
    let isDragging = false;
    let lastPosX, lastPosY;

    this.canvas.on('mouse:down', (opt) => {
      if (this.isPanning) {
        isDragging = true;
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
        this.canvas.defaultCursor = 'grabbing';
      }
    });

    this.canvas.on('mouse:move', (opt) => {
      if (isDragging && this.isPanning) {
        const e = opt.e;
        const vpt = this.canvas.viewportTransform;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        this.canvas.requestRenderAll();
        lastPosX = e.clientX;
        lastPosY = e.clientY;
      }
    });

    this.canvas.on('mouse:up', () => {
      if (this.isPanning) {
        isDragging = false;
        this.canvas.defaultCursor = 'grab';
      }
    });
  }

  disablePanning() {
    this.isPanning = false;
    this.canvas.selection = true;
    this.canvas.defaultCursor = 'default';
  }

  resetView() {
    this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    this.setZoom(1);
    this.canvas.renderAll();
  }

  // Mouse wheel zoom
  enableMouseWheelZoom() {
    this.canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      
      if (zoom > 10) zoom = 10;
      if (zoom < 0.1) zoom = 0.1;
      
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      this.zoom = zoom;
      this.updateCanvasDisplay();
      
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  // Canvas size management
  setCanvasSize(width, height) {
    this.canvas.setDimensions({
      width: Utils.clamp(width, APP_CONFIG.canvas.minWidth, APP_CONFIG.canvas.maxWidth),
      height: Utils.clamp(height, APP_CONFIG.canvas.minHeight, APP_CONFIG.canvas.maxHeight)
    });
    
    this.updateCanvasDisplay();
    app.history.saveState();
  }

  showSizeDialog() {
    // This will be implemented in the UI module
    app.ui.showCanvasSizeDialog();
  }

  // Grid functions
  toggleGrid() {
    this.gridEnabled = !this.gridEnabled;
    this.canvas.renderAll();
  }

  drawGrid() {
    const ctx = this.canvas.getContext();
    const gridSize = APP_CONFIG.canvas.gridSize;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= this.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= this.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
  }

  toggleRulers() {
    this.rulersEnabled = !this.rulersEnabled;
    // Implementation for rulers
    Utils.showToast(`Rulers ${this.rulersEnabled ? 'enabled' : 'disabled'}`, 'info');
  }

  toggleGuides() {
    this.guidesEnabled = !this.guidesEnabled;
    Utils.showToast(`Guides ${this.guidesEnabled ? 'enabled' : 'disabled'}`, 'info');
  }

  // Background
  setBackground(color) {
    this.canvas.backgroundColor = color;
    this.canvas.renderAll();
    app.history.saveState();
  }

  setBackgroundColor(color) {
    // Alias for setBackground for template manager
    this.setBackground(color);
  }

  // Alias for setCanvasSize for template manager
  setSize(width, height) {
    this.setCanvasSize(width, height);
  }

  // Clear canvas
  clear() {
    this.canvas.clear();
    this.canvas.backgroundColor = APP_CONFIG.canvas.backgroundColor;
    this.canvas.renderAll();
    app.history.saveState();
  }

  // Get selected object
  getActiveObject() {
    return this.canvas.getActiveObject();
  }

  // Get all objects
  getObjects() {
    return this.canvas.getObjects();
  }

  // Add object to canvas
  addObject(obj) {
    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.canvas.renderAll();
    app.history.saveState();
    app.layers.refresh();
  }

  // Remove object from canvas
  removeObject(obj) {
    this.canvas.remove(obj);
    this.canvas.renderAll();
    app.history.saveState();
    app.layers.refresh();
  }

  // Render canvas
  render() {
    this.canvas.renderAll();
  }

  // Export canvas as image
  toDataURL(format = 'png', quality = 1) {
    return this.canvas.toDataURL({
      format: format,
      quality: quality,
      multiplier: 1
    });
  }

  // Export canvas as SVG
  toSVG() {
    return this.canvas.toSVG();
  }

  // Get canvas state for saving
  toJSON() {
    return this.canvas.toJSON([
      'id', 'name', 'type', 'locked', 'layerType', 
      'maskId', 'generationMeta', 'originalPrompt'
    ]);
  }

  // Load canvas from JSON
  fromJSON(json) {
    return new Promise((resolve) => {
      this.canvas.loadFromJSON(json, () => {
        this.canvas.renderAll();
        app.layers.refresh();
        resolve();
      });
    });
  }
}

// Export for use in main app
if (typeof window !== 'undefined') {
  window.CanvasManager = CanvasManager;
}
