// Masking Tool Module - Manual brush-based masking without requiring Python service

class MaskingTool {
  constructor() {
    this.isActive = false;
    this.maskCanvas = null;
    this.maskCtx = null;
    this.targetImage = null;
    this.brushSize = 30;
    this.brushMode = 'add'; // 'add' or 'subtract'
    this.maskOverlay = null;
    this.isDrawingMask = false;
    this.lastPoint = null;
  }

  init() {
    this.setupMaskControls();
  }

  setupMaskControls() {
    // Create mask controls panel if it doesn't exist
    if (!document.getElementById('maskControls')) {
      const controlsHtml = `
        <div id="maskControls" class="mask-controls" style="display: none;">
          <div class="mask-controls-header">
            <span>Mask Tool</span>
            <button onclick="app.masking.exitMaskMode()" class="mask-close-btn">&times;</button>
          </div>
          <div class="mask-controls-body">
            <div class="mask-control-group">
              <label>Brush Size: <span id="maskBrushSizeValue">30</span>px</label>
              <input type="range" id="maskBrushSize" min="5" max="100" value="30" 
                     oninput="app.masking.setBrushSize(this.value)">
            </div>
            <div class="mask-control-group">
              <label>Mode:</label>
              <div class="mask-mode-buttons">
                <button id="maskAddBtn" class="mask-mode-btn active" onclick="app.masking.setMode('add')">
                  <i class="fas fa-plus"></i> Add
                </button>
                <button id="maskSubtractBtn" class="mask-mode-btn" onclick="app.masking.setMode('subtract')">
                  <i class="fas fa-minus"></i> Subtract
                </button>
              </div>
            </div>
            <div class="mask-actions">
              <button class="btn-primary" onclick="app.masking.applyMask()">
                <i class="fas fa-check"></i> Apply Mask
              </button>
              <button class="btn-secondary" onclick="app.masking.invertMask()">
                <i class="fas fa-exchange-alt"></i> Invert
              </button>
              <button class="btn-danger" onclick="app.masking.clearMask()">
                <i class="fas fa-trash"></i> Clear
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', controlsHtml);
      this.addMaskStyles();
    }
  }

  addMaskStyles() {
    if (document.getElementById('maskStyles')) return;
    
    const styles = `
      <style id="maskStyles">
        .mask-controls {
          position: fixed;
          top: 80px;
          right: 20px;
          width: 250px;
          background: var(--bg-secondary, #1e1e1e);
          border: 1px solid var(--border-color, #333);
          border-radius: 8px;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .mask-controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color, #333);
          font-weight: 600;
        }
        .mask-close-btn {
          background: none;
          border: none;
          color: var(--text-secondary, #888);
          font-size: 20px;
          cursor: pointer;
        }
        .mask-close-btn:hover {
          color: var(--text-primary, #fff);
        }
        .mask-controls-body {
          padding: 16px;
        }
        .mask-control-group {
          margin-bottom: 16px;
        }
        .mask-control-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: var(--text-secondary, #888);
        }
        .mask-control-group input[type="range"] {
          width: 100%;
        }
        .mask-mode-buttons {
          display: flex;
          gap: 8px;
        }
        .mask-mode-btn {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--border-color, #333);
          background: var(--bg-tertiary, #2a2a2a);
          color: var(--text-primary, #fff);
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .mask-mode-btn.active {
          background: var(--accent-color, #3b82f6);
          border-color: var(--accent-color, #3b82f6);
        }
        .mask-mode-btn:hover:not(.active) {
          background: var(--bg-hover, #333);
        }
        .mask-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mask-actions button {
          width: 100%;
          padding: 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-danger {
          background: #ef4444;
          border: none;
          color: white;
        }
        .btn-danger:hover {
          background: #dc2626;
        }
        .mask-overlay {
          position: absolute;
          pointer-events: none;
          opacity: 0.5;
        }
        .mask-cursor {
          position: fixed;
          border: 2px solid #fff;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          box-shadow: 0 0 0 1px #000;
        }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  startMasking() {
    const activeObject = app.canvas.getActiveObject();
    
    if (!activeObject || activeObject.type !== 'image') {
      Utils.showToast('Please select an image to mask', 'warning');
      return;
    }

    this.targetImage = activeObject;
    this.isActive = true;

    // Create mask canvas matching image dimensions
    this.createMaskCanvas();
    
    // Show controls
    document.getElementById('maskControls').style.display = 'block';
    
    // Setup mask drawing events
    this.setupMaskEvents();
    
    // Create cursor indicator
    this.createCursor();
    
    // Disable normal canvas selection
    app.canvas.canvas.selection = false;
    app.canvas.canvas.discardActiveObject();
    
    Utils.showToast('Mask mode active. Paint over areas to mask.', 'info');
  }

  createMaskCanvas() {
    const img = this.targetImage;
    const imgElement = img.getElement();
    
    // Create offscreen canvas for mask
    this.maskCanvas = document.createElement('canvas');
    this.maskCanvas.width = imgElement.naturalWidth || imgElement.width;
    this.maskCanvas.height = imgElement.naturalHeight || imgElement.height;
    this.maskCtx = this.maskCanvas.getContext('2d');
    
    // Fill with transparent (no mask initially)
    this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
    
    // Create visual overlay on fabric canvas
    this.updateMaskOverlay();
  }

  updateMaskOverlay() {
    // Remove ALL existing mask overlays first
    const allObjects = app.canvas.canvas.getObjects();
    const overlaysToRemove = allObjects.filter(obj => obj.isMaskOverlay);
    overlaysToRemove.forEach(obj => app.canvas.canvas.remove(obj));
    
    // Clear reference
    this.maskOverlay = null;

    const img = this.targetImage;
    if (!img) return;
    
    // Create fabric image from mask canvas
    const maskDataUrl = this.maskCanvas.toDataURL();
    
    fabric.Image.fromURL(maskDataUrl, (maskImg) => {
      if (!maskImg || !this.isActive) return;
      
      // Double-check no other overlays were added
      const existingOverlays = app.canvas.canvas.getObjects().filter(obj => obj.isMaskOverlay);
      existingOverlays.forEach(obj => app.canvas.canvas.remove(obj));
      
      maskImg.set({
        left: img.left,
        top: img.top,
        scaleX: img.scaleX,
        scaleY: img.scaleY,
        angle: img.angle,
        opacity: 0.5,
        selectable: false,
        evented: false,
        isMaskOverlay: true
      });
      
      this.maskOverlay = maskImg;
      app.canvas.canvas.add(maskImg);
      app.canvas.canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  }

  setupMaskEvents() {
    const canvas = app.canvas.canvas;
    
    this._onMouseDown = (e) => this.onMaskMouseDown(e);
    this._onMouseMove = (e) => this.onMaskMouseMove(e);
    this._onMouseUp = (e) => this.onMaskMouseUp(e);
    
    canvas.on('mouse:down', this._onMouseDown);
    canvas.on('mouse:move', this._onMouseMove);
    canvas.on('mouse:up', this._onMouseUp);
  }

  removeMaskEvents() {
    const canvas = app.canvas.canvas;
    
    if (this._onMouseDown) canvas.off('mouse:down', this._onMouseDown);
    if (this._onMouseMove) canvas.off('mouse:move', this._onMouseMove);
    if (this._onMouseUp) canvas.off('mouse:up', this._onMouseUp);
  }

  onMaskMouseDown(e) {
    if (!this.isActive) return;
    
    this.isDrawingMask = true;
    const pointer = app.canvas.canvas.getPointer(e.e);
    this.lastPoint = this.canvasToMaskCoords(pointer);
    this.drawMaskPoint(this.lastPoint);
  }

  onMaskMouseMove(e) {
    if (!this.isActive) return;
    
    const pointer = app.canvas.canvas.getPointer(e.e);
    this.updateCursorPosition(e.e);
    
    if (!this.isDrawingMask) return;
    
    const currentPoint = this.canvasToMaskCoords(pointer);
    this.drawMaskLine(this.lastPoint, currentPoint);
    this.lastPoint = currentPoint;
  }

  onMaskMouseUp(e) {
    if (!this.isActive) return;
    
    this.isDrawingMask = false;
    this.lastPoint = null;
    
    // Debounce overlay update to prevent duplicates
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
    }
    this._updateTimeout = setTimeout(() => {
      if (this.isActive) {
        this.updateMaskOverlay();
      }
    }, 100);
  }

  canvasToMaskCoords(pointer) {
    const img = this.targetImage;
    const imgElement = img.getElement();
    
    // Convert canvas coordinates to image coordinates
    const x = (pointer.x - img.left) / img.scaleX;
    const y = (pointer.y - img.top) / img.scaleY;
    
    return { x, y };
  }

  drawMaskPoint(point) {
    this.maskCtx.beginPath();
    this.maskCtx.arc(point.x, point.y, this.brushSize / 2, 0, Math.PI * 2);
    
    if (this.brushMode === 'add') {
      this.maskCtx.fillStyle = 'rgba(255, 0, 0, 1)';
      this.maskCtx.globalCompositeOperation = 'source-over';
    } else {
      this.maskCtx.globalCompositeOperation = 'destination-out';
    }
    
    this.maskCtx.fill();
  }

  drawMaskLine(from, to) {
    if (!from || !to) return;
    
    this.maskCtx.beginPath();
    this.maskCtx.moveTo(from.x, from.y);
    this.maskCtx.lineTo(to.x, to.y);
    this.maskCtx.lineWidth = this.brushSize;
    this.maskCtx.lineCap = 'round';
    this.maskCtx.lineJoin = 'round';
    
    if (this.brushMode === 'add') {
      this.maskCtx.strokeStyle = 'rgba(255, 0, 0, 1)';
      this.maskCtx.globalCompositeOperation = 'source-over';
    } else {
      this.maskCtx.globalCompositeOperation = 'destination-out';
    }
    
    this.maskCtx.stroke();
  }

  createCursor() {
    if (document.getElementById('maskCursor')) return;
    
    const cursor = document.createElement('div');
    cursor.id = 'maskCursor';
    cursor.className = 'mask-cursor';
    cursor.style.width = this.brushSize + 'px';
    cursor.style.height = this.brushSize + 'px';
    cursor.style.display = 'none';
    document.body.appendChild(cursor);
    
    // Show cursor when over canvas
    const canvasEl = app.canvas.canvas.upperCanvasEl;
    canvasEl.addEventListener('mouseenter', () => {
      if (this.isActive) cursor.style.display = 'block';
    });
    canvasEl.addEventListener('mouseleave', () => {
      cursor.style.display = 'none';
    });
  }

  updateCursorPosition(e) {
    const cursor = document.getElementById('maskCursor');
    if (!cursor || !this.isActive) return;
    
    cursor.style.left = (e.clientX - this.brushSize / 2) + 'px';
    cursor.style.top = (e.clientY - this.brushSize / 2) + 'px';
    cursor.style.display = 'block';
  }

  setBrushSize(size) {
    this.brushSize = parseInt(size);
    document.getElementById('maskBrushSizeValue').textContent = size;
    
    const cursor = document.getElementById('maskCursor');
    if (cursor) {
      cursor.style.width = size + 'px';
      cursor.style.height = size + 'px';
    }
  }

  setMode(mode) {
    this.brushMode = mode;
    
    document.getElementById('maskAddBtn').classList.toggle('active', mode === 'add');
    document.getElementById('maskSubtractBtn').classList.toggle('active', mode === 'subtract');
  }

  invertMask() {
    if (!this.maskCanvas) return;
    
    const imageData = this.maskCtx.getImageData(0, 0, this.maskCanvas.width, this.maskCanvas.height);
    const data = imageData.data;
    
    for (let i = 3; i < data.length; i += 4) {
      data[i] = 255 - data[i]; // Invert alpha
    }
    
    this.maskCtx.putImageData(imageData, 0, 0);
    this.updateMaskOverlay();
    
    Utils.showToast('Mask inverted', 'success');
  }

  clearMask() {
    if (!this.maskCanvas) return;
    
    this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
    this.updateMaskOverlay();
    
    Utils.showToast('Mask cleared', 'success');
  }

  applyMask() {
    if (!this.targetImage || !this.maskCanvas) {
      Utils.showToast('No mask to apply', 'warning');
      return;
    }

    const img = this.targetImage;
    const imgElement = img.getElement();
    
    // Create result canvas
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = this.maskCanvas.width;
    resultCanvas.height = this.maskCanvas.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    // Draw original image
    resultCtx.drawImage(imgElement, 0, 0);
    
    // Apply mask (remove masked areas)
    resultCtx.globalCompositeOperation = 'destination-out';
    resultCtx.drawImage(this.maskCanvas, 0, 0);
    
    // Create new fabric image from result
    const resultDataUrl = resultCanvas.toDataURL('image/png');
    
    fabric.Image.fromURL(resultDataUrl, (newImg) => {
      if (!newImg) {
        Utils.showToast('Failed to apply mask', 'error');
        return;
      }
      
      newImg.set({
        left: img.left,
        top: img.top,
        scaleX: img.scaleX,
        scaleY: img.scaleY,
        angle: img.angle,
        id: Utils.generateId(),
        name: 'Masked Image'
      });
      
      // Remove original and add masked version
      app.canvas.canvas.remove(img);
      app.canvas.addObject(newImg);
      app.canvas.canvas.setActiveObject(newImg);
      
      this.exitMaskMode();
      Utils.showToast('Mask applied successfully!', 'success');
    }, { crossOrigin: 'anonymous' });
  }

  exitMaskMode() {
    this.isActive = false;
    this.isDrawingMask = false;
    
    // Remove ALL mask overlays from canvas
    const allObjects = app.canvas.canvas.getObjects();
    const overlaysToRemove = allObjects.filter(obj => obj.isMaskOverlay);
    overlaysToRemove.forEach(obj => app.canvas.canvas.remove(obj));
    this.maskOverlay = null;
    
    // Remove events
    this.removeMaskEvents();
    
    // Hide controls
    const controls = document.getElementById('maskControls');
    if (controls) controls.style.display = 'none';
    
    // Hide cursor
    const cursor = document.getElementById('maskCursor');
    if (cursor) cursor.style.display = 'none';
    
    // Re-enable canvas selection
    app.canvas.canvas.selection = true;
    
    // Clear references
    this.maskCanvas = null;
    this.maskCtx = null;
    this.targetImage = null;
    
    app.canvas.canvas.renderAll();
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.MaskingTool = MaskingTool;
}
