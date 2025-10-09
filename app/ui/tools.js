// Tools Module

class ToolsManager {
  constructor() {
    this.activeTool = 'select';
    this.isDrawing = false;
    this.drawingObject = null;
  }

  init() {
    this.setupToolButtons();
    this.setupCanvasTools();
  }

  setupToolButtons() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tool = e.currentTarget.dataset.tool;
        if (tool) {
          this.selectTool(tool);
        }
      });
    });
  }

  selectTool(tool) {
    this.activeTool = tool;

    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });

    // Configure canvas based on tool
    this.configureCanvasForTool(tool);

    // Update status bar
    if (app.enhanced) {
      app.enhanced.updateToolDisplay(tool);
    }

    // Show/hide brush controls
    if (tool === 'brush' || tool === 'pen' || tool === 'eraser') {
      if (app.enhanced) app.enhanced.showBrushControls();
    } else {
      if (app.enhanced) app.enhanced.hideBrushControls();
    }
  }

  configureCanvasForTool(tool) {
    const canvas = app.canvas.canvas;

    switch (tool) {
      case 'select':
        canvas.selection = true;
        canvas.isDrawingMode = false;
        canvas.defaultCursor = 'default';
        break;

      case 'hand':
        canvas.selection = false;
        canvas.isDrawingMode = false;
        canvas.defaultCursor = 'grab';
        break;

      case 'brush':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = 5;
        canvas.freeDrawingBrush.color = '#000000';
        // Reset composite operation to normal
        if (canvas.freeDrawingBrush.globalCompositeOperation) {
          canvas.freeDrawingBrush.globalCompositeOperation = 'source-over';
        }
        break;

      case 'pen':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = 2;
        canvas.freeDrawingBrush.color = '#000000';
        // Reset composite operation to normal
        canvas.freeDrawingBrush.globalCompositeOperation = 'source-over';
        canvas.defaultCursor = 'crosshair';
        break;

      case 'eraser':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        // Create PencilBrush with destination-out composite operation
        const eraserBrush = new fabric.PencilBrush(canvas);
        eraserBrush.width = 20;
        eraserBrush.color = 'white';
        canvas.freeDrawingBrush = eraserBrush;
        
        // Set composite operation to actually erase
        canvas.freeDrawingBrush.globalCompositeOperation = 'destination-out';
        canvas.defaultCursor = 'crosshair';
        break;

      case 'text':
        canvas.selection = true;
        canvas.isDrawingMode = false;
        canvas.defaultCursor = 'text';
        break;

      default:
        canvas.selection = true;
        canvas.isDrawingMode = false;
        canvas.defaultCursor = 'crosshair';
    }
  }

  setupCanvasTools() {
    const canvas = app.canvas.canvas;

    canvas.on('mouse:down', (e) => this.handleMouseDown(e));
    canvas.on('mouse:move', (e) => this.handleMouseMove(e));
    canvas.on('mouse:up', (e) => this.handleMouseUp(e));
  }

  handleMouseDown(e) {
    if (this.activeTool === 'select' || this.activeTool === 'hand') return;

    this.isDrawing = true;
    const pointer = app.canvas.canvas.getPointer(e.e);

    switch (this.activeTool) {
      case 'rectangle':
        this.drawingObject = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2
        });
        app.canvas.canvas.add(this.drawingObject);
        break;

      case 'circle':
        this.drawingObject = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: '#8b5cf6',
          stroke: '#6d28d9',
          strokeWidth: 2
        });
        app.canvas.canvas.add(this.drawingObject);
        break;

      case 'triangle':
        this.drawingObject = new fabric.Triangle({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: '#ec4899',
          stroke: '#be185d',
          strokeWidth: 2
        });
        app.canvas.canvas.add(this.drawingObject);
        break;

      case 'star':
        // Create star immediately, not drawing mode
        app.addStar(5);
        this.isDrawing = false;
        this.selectTool('select');
        break;

      case 'line':
        this.drawingObject = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: '#000000',
          strokeWidth: 3
        });
        app.canvas.canvas.add(this.drawingObject);
        break;

      case 'polygon':
        // Create hexagon immediately
        app.addPolygon(6);
        this.isDrawing = false;
        this.selectTool('select');
        break;

      case 'text':
        const text = new fabric.IText('Click to edit', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 24,
          fill: '#000000',
          id: Utils.generateId(),
          name: 'Text'
        });
        app.canvas.addObject(text);
        app.canvas.canvas.setActiveObject(text);
        text.enterEditing();
        this.isDrawing = false;
        // Switch to select after adding text
        this.selectTool('select');
        break;

      case 'image':
        this.addImageFromFile();
        this.isDrawing = false;
        // Tool will auto-switch in addImageFromFile callback
        break;

      case 'crop':
        app.enhanced.enableCrop();
        this.isDrawing = false;
        // Switch to select after enabling crop
        this.selectTool('select');
        break;
    }
  }

  handleMouseMove(e) {
    if (!this.isDrawing || !this.drawingObject) return;

    const pointer = app.canvas.canvas.getPointer(e.e);

    switch (this.activeTool) {
      case 'rectangle':
        const width = pointer.x - this.drawingObject.left;
        const height = pointer.y - this.drawingObject.top;
        this.drawingObject.set({ width: Math.abs(width), height: Math.abs(height) });
        if (width < 0) this.drawingObject.set({ left: pointer.x });
        if (height < 0) this.drawingObject.set({ top: pointer.y });
        break;

      case 'circle':
        const radius = Math.abs(pointer.x - this.drawingObject.left);
        this.drawingObject.set({ radius });
        break;

      case 'triangle':
        const triWidth = pointer.x - this.drawingObject.left;
        const triHeight = pointer.y - this.drawingObject.top;
        this.drawingObject.set({ width: Math.abs(triWidth), height: Math.abs(triHeight) });
        if (triWidth < 0) this.drawingObject.set({ left: pointer.x });
        if (triHeight < 0) this.drawingObject.set({ top: pointer.y });
        break;

      case 'line':
        this.drawingObject.set({ x2: pointer.x, y2: pointer.y });
        break;
    }

    app.canvas.canvas.renderAll();
  }

  handleMouseUp(e) {
    if (!this.isDrawing) return;

    this.isDrawing = false;

    if (this.drawingObject) {
      this.drawingObject.set({
        id: Utils.generateId(),
        name: this.activeTool.charAt(0).toUpperCase() + this.activeTool.slice(1)
      });

      app.canvas.canvas.setActiveObject(this.drawingObject);
      app.history.saveState();
      app.layers.refresh();
      this.drawingObject = null;
    }

    // Only switch back to select for shape tools, not for drawing tools
    const continuousTools = ['brush', 'pen', 'eraser'];
    if (!continuousTools.includes(this.activeTool)) {
      this.selectTool('select');
    }
  }

  addImageFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        // User cancelled, switch back to select
        this.selectTool('select');
        return;
      }

      const base64 = await Utils.imageToBase64(file);
      
      fabric.Image.fromURL(base64, (img) => {
        img.set({
          left: 100,
          top: 100,
          id: Utils.generateId(),
          name: file.name
        });

        // Scale to reasonable size
        const maxSize = 400;
        if (img.width > maxSize || img.height > maxSize) {
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          img.scale(scale);
        }

        app.canvas.addObject(img);
        
        // Switch back to select tool after adding image
        this.selectTool('select');
      });
    };
    
    // Also handle cancel (when dialog is closed without selecting)
    input.oncancel = () => {
      this.selectTool('select');
    };
    
    input.click();
  }

  addShape(shapeType) {
    let shape;
    
    switch (shapeType) {
      case 'triangle':
        shape = new fabric.Triangle({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: '#ec4899'
        });
        break;

      case 'polygon':
        shape = new fabric.Polygon([
          { x: 50, y: 0 },
          { x: 100, y: 38 },
          { x: 81, y: 100 },
          { x: 19, y: 100 },
          { x: 0, y: 38 }
        ], {
          left: 100,
          top: 100,
          fill: '#f59e0b'
        });
        break;

      case 'star':
        const starPoints = [];
        const outerRadius = 50;
        const innerRadius = 25;
        const points = 5;
        
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / points) * i;
          starPoints.push({
            x: radius * Math.sin(angle),
            y: -radius * Math.cos(angle)
          });
        }
        
        shape = new fabric.Polygon(starPoints, {
          left: 100,
          top: 100,
          fill: '#f59e0b',
          stroke: '#d97706',
          strokeWidth: 2
        });
        break;

      case 'line':
        shape = new fabric.Line([0, 0, 150, 0], {
          left: 100,
          top: 100,
          stroke: '#000000',
          strokeWidth: 3
        });
        break;

      case 'arrow':
        const line = new fabric.Line([0, 0, 100, 0], {
          stroke: '#000000',
          strokeWidth: 3
        });
        const triangle = new fabric.Triangle({
          left: 100,
          top: -5,
          width: 15,
          height: 15,
          fill: '#000000',
          angle: 90
        });
        shape = new fabric.Group([line, triangle], {
          left: 100,
          top: 100
        });
        break;

      case 'hexagon':
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          hexPoints.push({
            x: 50 * Math.cos(angle),
            y: 50 * Math.sin(angle)
          });
        }
        shape = new fabric.Polygon(hexPoints, {
          left: 100,
          top: 100,
          fill: '#10b981'
        });
        break;
    }

    if (shape) {
      shape.set({
        id: Utils.generateId(),
        name: shapeType.charAt(0).toUpperCase() + shapeType.slice(1)
      });
      app.canvas.addObject(shape);
    }
  }

  // Brush controls
  setBrushSize(size) {
    if (app.canvas.canvas.isDrawingMode) {
      app.canvas.canvas.freeDrawingBrush.width = size;
    }
  }

  setBrushColor(color) {
    if (app.canvas.canvas.isDrawingMode && (this.activeTool === 'brush' || this.activeTool === 'pen')) {
      app.canvas.canvas.freeDrawingBrush.color = color;
    }
  }

  // Eraser mode
  enableEraser() {
    this.activeTool = 'eraser';
    app.canvas.canvas.isDrawingMode = true;
    app.canvas.canvas.freeDrawingBrush.color = app.canvas.canvas.backgroundColor || '#ffffff';
    app.canvas.canvas.freeDrawingBrush.width = 20;
  }

  disableEraser() {
    app.canvas.canvas.isDrawingMode = false;
    this.selectTool('select');
  }
}

if (typeof window !== 'undefined') {
  window.ToolsManager = ToolsManager;
}
