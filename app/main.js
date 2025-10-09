// Main Application Entry Point

class AIDesignStudio {
  constructor() {
    // Initialize all managers
    this.canvas = new CanvasManager();
    this.layers = new LayerManager();
    this.history = new HistoryManager();
    this.properties = new PropertiesManager();
    this.ai = new AIGenerator();
    this.sam = new SAMIntegration();
    this.project = new ProjectManager();
    this.assets = new AssetManager();
    this.export = new ExportManager();
    this.templates = new TemplateManager();
    this.theme = new ThemeManager();
    this.tools = new ToolsManager();
    this.ui = new UIManager();
    this.keyboard = new KeyboardManager();
    this.share = new ShareManager();
    this.enhanced = new EnhancedFeatures();
  }

  async init() {
    console.log('🎨 Initializing AI Design Studio...');
    
    try {
      // Initialize core systems
      this.canvas.init();
      this.layers.init();
      this.history.init();
      this.properties.init();
      
      // Initialize AI systems
      this.ai.init();
      this.sam.init();
      
      // Initialize managers
      this.theme.init();
      this.project.init();
      this.assets.init();
      this.templates.init();
      this.tools.init();
      this.ui.init();
      this.keyboard.init();
      this.enhanced.init();
      
      // Check URL parameters
      this.checkURLParameters();
      
      // Show welcome message
      this.showWelcome();
      
      console.log('✅ AI Design Studio initialized successfully!');
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      Utils.showToast('Failed to initialize application', 'error');
    }
  }

  checkURLParameters() {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    
    if (projectId) {
      this.project.load(projectId);
    }

    // Check for template info from dashboard
    const templateInfo = sessionStorage.getItem('templateInfo');
    if (templateInfo) {
      try {
        const template = JSON.parse(templateInfo);
        // Set canvas size based on template
        this.canvas.setCanvasSize(template.width, template.height);
        Utils.showToast(`Template loaded: ${template.name} (${template.width} × ${template.height})`, 'success');
        // Clear the session storage
        sessionStorage.removeItem('templateInfo');
      } catch (error) {
        console.error('Failed to load template:', error);
      }
    }
  }

  showWelcome() {
    // Check if first time user
    const hasVisited = localStorage.getItem('hasVisited');
    
    if (!hasVisited) {
      setTimeout(() => {
        Utils.showToast('Welcome to AI Design Studio! Press Ctrl+? for shortcuts', 'info', 5000);
        localStorage.setItem('hasVisited', 'true');
      }, 1000);
    }
  }

  // Quick access methods
  newProject() {
    this.templates.showNewProjectDialog();
  }

  generateImage(prompt) {
    document.getElementById('promptInput').value = prompt;
    this.ai.generate();
  }

  addText(text = 'Hello World') {
    const textObj = new fabric.IText(text, {
      left: 100,
      top: 100,
      fontSize: 48,
      fill: '#000000',
      fontFamily: 'Arial',
      id: Utils.generateId(),
      name: 'Text'
    });
    
    this.canvas.addObject(textObj);
    this.canvas.canvas.setActiveObject(textObj);
  }

  addRectangle() {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: '#3b82f6',
      id: Utils.generateId(),
      name: 'Rectangle'
    });
    
    this.canvas.addObject(rect);
  }

  addCircle() {
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 75,
      fill: '#8b5cf6',
      id: Utils.generateId(),
      name: 'Circle'
    });
    
    this.canvas.addObject(circle);
  }

  addTriangle() {
    const triangle = new fabric.Triangle({
      left: 100,
      top: 100,
      width: 150,
      height: 130,
      fill: '#ec4899',
      id: Utils.generateId(),
      name: 'Triangle'
    });
    
    this.canvas.addObject(triangle);
  }

  addStar(points = 5) {
    const starPoints = [];
    const outerRadius = 50;
    const innerRadius = 25;
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / points) * i;
      starPoints.push({
        x: radius * Math.sin(angle),
        y: -radius * Math.cos(angle)
      });
    }
    
    const star = new fabric.Polygon(starPoints, {
      left: 100,
      top: 100,
      fill: '#f59e0b',
      id: Utils.generateId(),
      name: 'Star'
    });
    
    this.canvas.addObject(star);
  }

  addLine() {
    const line = new fabric.Line([50, 50, 200, 50], {
      left: 100,
      top: 100,
      stroke: '#000000',
      strokeWidth: 3,
      id: Utils.generateId(),
      name: 'Line'
    });
    
    this.canvas.addObject(line);
  }

  addPolygon(sides = 6) {
    const points = [];
    const radius = 50;
    
    for (let i = 0; i < sides; i++) {
      const angle = (2 * Math.PI / sides) * i - Math.PI / 2;
      points.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      });
    }
    
    const polygon = new fabric.Polygon(points, {
      left: 100,
      top: 100,
      fill: '#10b981',
      id: Utils.generateId(),
      name: 'Polygon'
    });
    
    this.canvas.addObject(polygon);
  }

  addImage(url) {
    fabric.Image.fromURL(url, (img) => {
      img.set({
        left: 100,
        top: 100,
        id: Utils.generateId(),
        name: 'Image'
      });
      
      // Scale to fit if too large
      const maxSize = 500;
      if (img.width > maxSize || img.height > maxSize) {
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        img.scale(scale);
      }
      
      this.canvas.addObject(img);
    }, { crossOrigin: 'anonymous' });
  }

  // Selection & Manipulation
  duplicate() {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject) {
      Utils.showToast('No object selected', 'warning');
      return;
    }
    
    activeObject.clone((cloned) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
        id: Utils.generateId(),
        name: cloned.name + ' Copy'
      });
      
      this.canvas.addObject(cloned);
      this.canvas.canvas.setActiveObject(cloned);
      this.canvas.render();
    });
  }

  deleteSelected() {
    const activeObjects = this.canvas.canvas.getActiveObjects();
    if (activeObjects.length === 0) {
      Utils.showToast('No objects selected', 'warning');
      return;
    }
    
    activeObjects.forEach(obj => {
      this.canvas.removeObject(obj);
    });
    
    this.canvas.canvas.discardActiveObject();
    this.canvas.render();
  }

  groupSelected() {
    const activeObjects = this.canvas.canvas.getActiveObjects();
    if (activeObjects.length < 2) {
      Utils.showToast('Select at least 2 objects to group', 'warning');
      return;
    }
    
    const group = new fabric.Group(activeObjects, {
      id: Utils.generateId(),
      name: 'Group'
    });
    
    activeObjects.forEach(obj => this.canvas.canvas.remove(obj));
    this.canvas.addObject(group);
  }

  ungroupSelected() {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') {
      Utils.showToast('Select a group to ungroup', 'warning');
      return;
    }
    
    const items = activeObject._objects;
    activeObject._restoreObjectsState();
    this.canvas.canvas.remove(activeObject);
    
    items.forEach(item => {
      this.canvas.canvas.add(item);
    });
    
    this.canvas.render();
    this.layers.refresh();
  }

  // Layer Ordering
  bringForward() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.canvas.bringForward(activeObject);
      this.canvas.render();
      this.layers.refresh();
    }
  }

  sendBackward() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.canvas.sendBackwards(activeObject);
      this.canvas.render();
      this.layers.refresh();
    }
  }

  bringToFront() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.canvas.bringToFront(activeObject);
      this.canvas.render();
      this.layers.refresh();
    }
  }

  sendToBack() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.canvas.sendToBack(activeObject);
      this.canvas.render();
      this.layers.refresh();
    }
  }

  // Alignment
  alignLeft() {
    const activeObjects = this.canvas.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    
    const leftmost = Math.min(...activeObjects.map(obj => obj.left));
    activeObjects.forEach(obj => obj.set({ left: leftmost }));
    this.canvas.render();
  }

  alignCenter() {
    const activeObjects = this.canvas.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    
    const centerX = this.canvas.canvas.width / 2;
    activeObjects.forEach(obj => {
      obj.set({ left: centerX - (obj.width * obj.scaleX) / 2 });
    });
    this.canvas.render();
  }

  alignRight() {
    const activeObjects = this.canvas.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    
    const rightmost = Math.max(...activeObjects.map(obj => obj.left + obj.width * obj.scaleX));
    activeObjects.forEach(obj => {
      obj.set({ left: rightmost - obj.width * obj.scaleX });
    });
    this.canvas.render();
  }

  alignTop() {
    const activeObjects = this.canvas.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    
    const topmost = Math.min(...activeObjects.map(obj => obj.top));
    activeObjects.forEach(obj => obj.set({ top: topmost }));
    this.canvas.render();
  }

  alignMiddle() {
    const activeObjects = this.canvas.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    
    const centerY = this.canvas.canvas.height / 2;
    activeObjects.forEach(obj => {
      obj.set({ top: centerY - (obj.height * obj.scaleY) / 2 });
    });
    this.canvas.render();
  }

  alignBottom() {
    const activeObjects = this.canvas.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    
    const bottommost = Math.max(...activeObjects.map(obj => obj.top + obj.height * obj.scaleY));
    activeObjects.forEach(obj => {
      obj.set({ top: bottommost - obj.height * obj.scaleY });
    });
    this.canvas.render();
  }

  // Transform
  flipHorizontal() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({ flipX: !activeObject.flipX });
      this.canvas.render();
      this.history.saveState();
    }
  }

  flipVertical() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({ flipY: !activeObject.flipY });
      this.canvas.render();
      this.history.saveState();
    }
  }

  rotate(angle) {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.rotate((activeObject.angle + angle) % 360);
      this.canvas.render();
      this.history.saveState();
    }
  }

  // Filters & Effects
  applyFilter(filterType) {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') {
      Utils.showToast('Select an image to apply filters', 'warning');
      return;
    }
    
    activeObject.filters = activeObject.filters || [];
    
    switch (filterType) {
      case 'grayscale':
        activeObject.filters.push(new fabric.Image.filters.Grayscale());
        break;
      case 'sepia':
        activeObject.filters.push(new fabric.Image.filters.Sepia());
        break;
      case 'blur':
        activeObject.filters.push(new fabric.Image.filters.Blur({ blur: 0.5 }));
        break;
      case 'brightness':
        activeObject.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.2 }));
        break;
      case 'contrast':
        activeObject.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.2 }));
        break;
      case 'invert':
        activeObject.filters.push(new fabric.Image.filters.Invert());
        break;
    }
    
    activeObject.applyFilters();
    this.canvas.render();
    this.history.saveState();
  }

  removeFilters() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
      activeObject.filters = [];
      activeObject.applyFilters();
      this.canvas.render();
      this.history.saveState();
    }
  }

  // Copy & Paste
  copy() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned) => {
        this._clipboard = cloned;
      });
      Utils.showToast('Copied', 'success');
    }
  }

  paste() {
    if (!this._clipboard) {
      Utils.showToast('Nothing to paste', 'warning');
      return;
    }
    
    this._clipboard.clone((clonedObj) => {
      clonedObj.set({
        left: clonedObj.left + 20,
        top: clonedObj.top + 20,
        id: Utils.generateId(),
        evented: true
      });
      
      if (clonedObj.type === 'activeSelection') {
        clonedObj.canvas = this.canvas.canvas;
        clonedObj.forEachObject((obj) => {
          obj.set({ id: Utils.generateId() });
          this.canvas.canvas.add(obj);
        });
        clonedObj.setCoords();
      } else {
        this.canvas.canvas.add(clonedObj);
      }
      
      this._clipboard.top += 20;
      this._clipboard.left += 20;
      this.canvas.canvas.setActiveObject(clonedObj);
      this.canvas.render();
      this.history.saveState();
    });
  }

  // Developer utilities
  getCanvasJSON() {
    return this.canvas.toJSON();
  }

  loadCanvasJSON(json) {
    return this.canvas.fromJSON(json);
  }

  exportAsPNG() {
    const dataURL = this.canvas.toDataURL('png', 1);
    const link = document.createElement('a');
    link.download = 'design.png';
    link.href = dataURL;
    link.click();
  }

  clear() {
    if (confirm('Are you sure you want to clear the canvas?')) {
      this.canvas.clear();
      Utils.showToast('Canvas cleared', 'success');
    }
  }

  // Debug mode
  enableDebugMode() {
    console.log('🐛 Debug mode enabled');
    window.DEBUG = {
      canvas: this.canvas,
      layers: this.layers,
      history: this.history,
      fabricCanvas: this.canvas.canvas
    };
    Utils.showToast('Debug mode enabled. Check console.', 'info');
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AIDesignStudio();
  window.app.init();
  
  // Expose app globally for console access
  console.log('💡 Access the app via window.app');
  console.log('💡 Try: app.generateImage("a beautiful sunset")');
  console.log('💡 Try: app.addText("Hello World")');
  console.log('💡 Try: app.enableDebugMode()');
});

// Prevent accidental page unload
window.addEventListener('beforeunload', (e) => {
  if (window.app && window.app.project && window.app.project.isDirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});
