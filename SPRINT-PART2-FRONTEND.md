# 🎨 AI Design Studio - Sprint Documentation Part 2
## Frontend Development (HTML, CSS, JavaScript)

> **For Students**: This part covers building the user interface, styling, and core JavaScript functionality.

---

## 🎯 Sprint Overview

**Sprint Duration**: Week 2-3  
**Goal**: Build complete frontend interface with canvas functionality  
**Key Deliverables**: Working editor UI, layer system, tools, properties panel

---

## 📖 Table of Contents

1. [HTML Structure](#html-structure)
2. [CSS Design System](#css-design-system)
3. [JavaScript Architecture](#javascript-architecture)
4. [Canvas Management](#canvas-management)
5. [Layer System](#layer-system)
6. [Tools Implementation](#tools-implementation)
7. [Properties Panel](#properties-panel)

---

## 🏗️ HTML Structure

### Main Editor Layout (index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Design Studio</title>
  
  <!-- External Libraries -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
  
  <!-- Application Styles -->
  <link rel="stylesheet" href="app/styles/main.css">
  <link rel="stylesheet" href="app/styles/editor.css">
  <link rel="stylesheet" href="app/styles/panels.css">
  <link rel="stylesheet" href="app/styles/modals.css">
</head>
<body>
  <!-- Top Navigation Bar -->
  <nav class="navbar">
    <div class="navbar-left">
      <h1>AI Design Studio</h1>
    </div>
    <div class="navbar-center">
      <button id="undoBtn"><i class="fas fa-undo"></i></button>
      <button id="redoBtn"><i class="fas fa-redo"></i></button>
      <span id="zoomLevel">100%</span>
    </div>
    <div class="navbar-right">
      <button id="saveBtn">Save</button>
      <button id="exportBtn">Export</button>
    </div>
  </nav>

  <!-- Main Editor Grid -->
  <div class="editor-container">
    <!-- Left Toolbar -->
    <aside class="left-toolbar">
      <button data-tool="select" class="tool-btn active">
        <i class="fas fa-mouse-pointer"></i>
      </button>
      <button data-tool="rectangle" class="tool-btn">
        <i class="fas fa-square"></i>
      </button>
      <button data-tool="circle" class="tool-btn">
        <i class="fas fa-circle"></i>
      </button>
      <button data-tool="text" class="tool-btn">
        <i class="fas fa-font"></i>
      </button>
      <button data-tool="image" class="tool-btn">
        <i class="fas fa-image"></i>
      </button>
    </aside>

    <!-- Canvas Section -->
    <main class="canvas-section">
      <div id="canvasWrapper">
        <canvas id="fabricCanvas"></canvas>
      </div>
    </main>

    <!-- Right Panels -->
    <aside class="right-panel">
      <div class="panel-tabs">
        <button class="tab-btn active" data-tab="layers">Layers</button>
        <button class="tab-btn" data-tab="properties">Properties</button>
        <button class="tab-btn" data-tab="assets">Assets</button>
      </div>
      
      <div id="layersPanel" class="panel-content active">
        <div id="layersList"></div>
      </div>
      
      <div id="propertiesPanel" class="panel-content">
        <div id="propertiesContent"></div>
      </div>
    </aside>
  </div>

  <!-- Modals -->
  <div id="promptModal" class="modal">
    <div class="modal-content">
      <h2>Generate AI Image</h2>
      <textarea id="promptInput" placeholder="Describe what you want to create..."></textarea>
      <button onclick="app.ai.generate()">Generate</button>
    </div>
  </div>

  <!-- Load Scripts -->
  <script src="app/config.js"></script>
  <script src="app/utils/helpers.js"></script>
  <script src="app/core/canvas.js"></script>
  <script src="app/core/layers.js"></script>
  <script src="app/core/history.js"></script>
  <script src="app/main.js"></script>
</body>
</html>
```

**Key Concepts**:
- **Grid Layout**: Editor uses CSS Grid for flexible panels
- **CDN Libraries**: Fabric.js and Font Awesome loaded from CDN
- **Modular Scripts**: Each JS file handles specific functionality
- **Semantic HTML**: Uses appropriate tags (`<nav>`, `<main>`, `<aside>`)

---

## 🎨 CSS Design System

### CSS Variables (app/styles/main.css)

```css
:root {
  /* Colors */
  --teal: #00BFA6;
  --teal-dark: #00a38a;
  --blue: #1E90FF;
  --orange: #FF8C00;
  --green: #43A047;
  --red: #E53935;
  
  /* Background */
  --bg-dark: #0E0E0E;
  --bg-secondary: #1C1C1C;
  --bg-tertiary: #2A2A2A;
  
  /* Text */
  --text-white: #FFFFFF;
  --text-gray: #B0B0B0;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Borders */
  --border-radius: 8px;
  --border-color: rgba(255, 255, 255, 0.1);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s ease;
}
```

**Why CSS Variables?**
- Easy theme switching
- Consistent design system
- One place to update colors
- Better maintainability

### Editor Grid Layout (app/styles/editor.css)

```css
.editor-container {
  display: grid;
  grid-template-columns: 60px 1fr 320px;
  grid-template-rows: 1fr;
  height: calc(100vh - 60px); /* Subtract navbar height */
  background: var(--bg-dark);
}

.left-toolbar {
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  gap: var(--spacing-sm);
}

.canvas-section {
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.right-panel {
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}
```

**Grid Benefits**:
- Responsive layout automatically
- Easy to adjust panel sizes
- Clean, modern structure

### Button Styles with Hover Effects

```css
.tool-btn {
  width: 44px;
  height: 44px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  color: var(--text-gray);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-white);
  transform: scale(1.05);
}

.tool-btn.active {
  background: var(--teal);
  color: white;
  border-color: var(--teal-dark);
}
```

### Custom Scrollbar

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--teal);
}
```

### Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.modal.active {
  animation: fadeIn 0.3s ease;
}
```

---

## 💻 JavaScript Architecture

### Module Pattern

Each JavaScript file exports a class:

```javascript
// app/core/canvas.js
class CanvasManager {
  constructor() {
    this.canvas = null;
    this.zoom = 1;
  }
  
  init() {
    // Initialize canvas
  }
  
  zoomIn() {
    // Zoom functionality
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.CanvasManager = CanvasManager;
}
```

### Main Application (app/main.js)

```javascript
// Main application class that ties everything together
class Application {
  constructor() {
    this.canvas = null;
    this.layers = null;
    this.history = null;
    this.properties = null;
    this.tools = null;
    this.ai = null;
    this.sam = null;
  }

  async init() {
    console.log('Initializing AI Design Studio...');
    
    // Initialize core modules
    this.canvas = new CanvasManager();
    this.canvas.init();
    
    this.layers = new LayerManager();
    this.layers.init();
    
    this.history = new HistoryManager();
    this.history.init();
    
    this.properties = new PropertiesManager();
    this.properties.init();
    
    this.tools = new ToolManager();
    this.tools.init();
    
    this.ai = new AIGenerator();
    this.ai.init();
    
    this.sam = new SAMManager();
    this.sam.init();
    
    this.keyboard = new KeyboardManager();
    this.keyboard.init();
    
    console.log('✓ Application initialized');
  }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new Application();
  app.init();
});
```

**Why This Pattern?**
- Clear initialization order
- Modules can communicate via `app.moduleName`
- Easy to debug
- Scalable architecture

---

## 🖼️ Canvas Management

### CanvasManager Class (app/core/canvas.js)

#### Initialization

```javascript
init() {
  // Create Fabric.js canvas
  this.canvas = new fabric.Canvas('fabricCanvas', {
    width: APP_CONFIG.canvas.defaultWidth,
    height: APP_CONFIG.canvas.defaultHeight,
    backgroundColor: APP_CONFIG.canvas.backgroundColor,
    preserveObjectStacking: true,
    selection: true
  });

  this.setupEventListeners();
  this.enableMouseWheelZoom();
  this.updateCanvasDisplay();
}
```

**Fabric.js Options Explained**:
- `preserveObjectStacking` - Keep layer order when selecting
- `selection` - Enable object selection
- `renderOnAddRemove` - Auto-render when objects change

#### Event Listeners

```javascript
setupEventListeners() {
  // When user selects an object
  this.canvas.on('selection:created', (e) => {
    app.properties.update(e.selected[0]);
    app.layers.updateSelection(e.selected);
  });

  // When object is modified (moved, scaled, etc)
  this.canvas.on('object:modified', (e) => {
    app.history.saveState(); // Save for undo
    app.properties.update(e.target);
  });

  // Snap to grid while moving
  this.canvas.on('object:moving', (e) => {
    if (this.snapToGrid) {
      this.snapObjectToGrid(e.target);
    }
  });
}
```

**Event Flow**:
1. User interacts with canvas
2. Fabric.js fires event
3. Event listener updates UI (properties, layers)
4. History manager saves state

#### Zoom Functions

```javascript
// Zoom in/out
zoomIn() {
  this.setZoom(Math.min(this.zoom * 1.2, 10)); // Max 10x
}

zoomOut() {
  this.setZoom(Math.max(this.zoom / 1.2, 0.1)); // Min 0.1x
}

setZoom(zoom) {
  this.zoom = zoom;
  this.canvas.setZoom(zoom);
  this.canvas.renderAll();
  this.updateCanvasDisplay();
}

// Mouse wheel zoom
enableMouseWheelZoom() {
  this.canvas.on('mouse:wheel', (opt) => {
    const delta = opt.e.deltaY;
    let zoom = this.canvas.getZoom();
    zoom *= 0.999 ** delta;
    
    // Clamp zoom level
    if (zoom > 10) zoom = 10;
    if (zoom < 0.1) zoom = 0.1;
    
    // Zoom to mouse position
    this.canvas.zoomToPoint(
      { x: opt.e.offsetX, y: opt.e.offsetY },
      zoom
    );
    
    this.zoom = zoom;
    this.updateCanvasDisplay();
    opt.e.preventDefault();
  });
}
```

**Zoom to Point**: Zooms while keeping mouse position fixed

#### Snap to Grid

```javascript
snapObjectToGrid(obj) {
  const gridSize = APP_CONFIG.canvas.gridSize;
  obj.set({
    left: Utils.roundToStep(obj.left, gridSize),
    top: Utils.roundToStep(obj.top, gridSize)
  });
  obj.setCoords(); // Update bounding box
}
```

#### Export Methods

```javascript
// Export as data URL
toDataURL(format = 'png', quality = 1) {
  return this.canvas.toDataURL({
    format: format,
    quality: quality,
    multiplier: 1 // Or 2 for 2x resolution
  });
}

// Export as SVG
toSVG() {
  return this.canvas.toSVG();
}

// Export as JSON (for saving projects)
toJSON() {
  return this.canvas.toJSON([
    'id', 'name', 'type', 'locked', 
    'layerType', 'maskId', 'originalPrompt'
  ]);
}
```

---

## 📚 Layer System

### LayerManager Class (app/core/layers.js)

#### Layer Data Structure

```javascript
{
  id: 'layer_abc123',
  object: fabricObject,      // Reference to Fabric.js object
  name: 'Rectangle 1',
  type: 'shape',             // shape, image, text, vector, group
  visible: true,
  locked: false,
  zIndex: 0
}
```

#### Refresh Layers

```javascript
refresh() {
  const objects = app.canvas.getObjects();
  
  // Map Fabric objects to layer data
  this.layers = objects.map((obj, index) => ({
    id: obj.id || Utils.generateId(),
    object: obj,
    name: obj.name || this.getDefaultName(obj),
    type: this.getLayerType(obj),
    visible: obj.visible !== false,
    locked: obj.selectable === false,
    zIndex: index
  }));

  this.render();
}
```

#### Render Layer List

```javascript
render() {
  const container = document.getElementById('layersList');
  
  // Show in reverse order (top layer first visually)
  const reversedLayers = [...this.layers].reverse();
  
  container.innerHTML = reversedLayers.map(layer => `
    <div class="layer-item ${this.isSelected(layer) ? 'active' : ''}"
         data-layer-id="${layer.id}"
         onclick="app.layers.selectLayer('${layer.id}', event)">
      
      <!-- Visibility Toggle -->
      <button class="layer-visibility"
              onclick="app.layers.toggleVisibility('${layer.id}', event)">
        <i class="fas ${layer.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
      </button>
      
      <!-- Layer Icon -->
      <div class="layer-icon">
        ${this.getLayerIcon(layer)}
      </div>
      
      <!-- Layer Info -->
      <div class="layer-info">
        <div class="layer-name">${layer.name}</div>
        <div class="layer-type">${this.getLayerTypeLabel(layer.type)}</div>
      </div>
      
      ${layer.locked ? '<i class="fas fa-lock"></i>' : ''}
    </div>
  `).join('');
}
```

#### Layer Operations

```javascript
// Toggle visibility
toggleVisibility(layerId, event) {
  event?.stopPropagation();
  const layer = this.layers.find(l => l.id === layerId);
  if (layer) {
    layer.visible = !layer.visible;
    layer.object.visible = layer.visible;
    app.canvas.render();
    this.render();
  }
}

// Delete layer
deleteLayer(layerId) {
  const layer = this.layers.find(l => l.id === layerId);
  if (layer) {
    app.canvas.removeObject(layer.object);
    this.refresh();
    app.history.saveState();
  }
}

// Rename layer
renameLayer(layerId, newName) {
  const layer = this.layers.find(l => l.id === layerId);
  if (layer) {
    layer.name = newName;
    layer.object.name = newName;
    this.render();
  }
}
```

---

## 🛠️ Tools Implementation

### ToolManager Class (app/ui/tools.js)

```javascript
class ToolManager {
  constructor() {
    this.activeTool = 'select';
    this.drawingMode = false;
  }

  init() {
    this.setupToolButtons();
  }

  setupToolButtons() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tool = btn.dataset.tool;
        this.selectTool(tool);
      });
    });
  }

  selectTool(tool) {
    this.activeTool = tool;
    
    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
    
    // Handle tool-specific logic
    switch(tool) {
      case 'select':
        this.enableSelectionMode();
        break;
      case 'rectangle':
        this.drawRectangle();
        break;
      case 'circle':
        this.drawCircle();
        break;
      case 'text':
        this.addText();
        break;
    }
  }

  drawRectangle() {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: '#00BFA6',
      stroke: '#00a38a',
      strokeWidth: 2,
      id: Utils.generateId(),
      name: 'Rectangle'
    });
    
    app.canvas.addObject(rect);
  }

  drawCircle() {
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      radius: 75,
      fill: '#1E90FF',
      stroke: '#1873cc',
      strokeWidth: 2,
      id: Utils.generateId(),
      name: 'Circle'
    });
    
    app.canvas.addObject(circle);
  }

  addText() {
    const text = new fabric.IText('Double click to edit', {
      left: 100,
      top: 100,
      fontSize: 32,
      fill: '#FFFFFF',
      fontFamily: 'Inter',
      id: Utils.generateId(),
      name: 'Text'
    });
    
    app.canvas.addObject(text);
  }
}
```

**fabric.IText**: Editable text (double-click to edit)

---

## 🎛️ Properties Panel

### PropertiesManager Class (app/core/properties.js)

```javascript
update(obj) {
  if (!obj) {
    this.clear();
    return;
  }

  const content = document.getElementById('propertiesContent');
  
  content.innerHTML = `
    <div class="property-group">
      <label>Position</label>
      <div class="property-row">
        <input type="number" value="${Math.round(obj.left)}" 
               oninput="app.properties.updateProperty('left', this.value)">
        <input type="number" value="${Math.round(obj.top)}" 
               oninput="app.properties.updateProperty('top', this.value)">
      </div>
    </div>
    
    <div class="property-group">
      <label>Size</label>
      <div class="property-row">
        <input type="number" value="${Math.round(obj.width * obj.scaleX)}" 
               oninput="app.properties.updateProperty('width', this.value)">
        <input type="number" value="${Math.round(obj.height * obj.scaleY)}" 
               oninput="app.properties.updateProperty('height', this.value)">
      </div>
    </div>
    
    <div class="property-group">
      <label>Fill Color</label>
      <input type="color" value="${obj.fill || '#000000'}" 
             oninput="app.properties.updateProperty('fill', this.value)">
    </div>
  `;
}

updateProperty(prop, value) {
  const obj = app.canvas.getActiveObject();
  if (!obj) return;
  
  obj.set(prop, parseFloat(value) || value);
  app.canvas.render();
  app.history.saveState();
}
```

---

## 📚 Key Learnings

### What We Built
✅ Complete HTML structure with semantic elements  
✅ CSS design system with variables  
✅ Modular JavaScript architecture  
✅ Fabric.js canvas integration  
✅ Layer management system  
✅ Tool system  
✅ Properties panel  

### Best Practices
1. **CSS Variables** - Maintainable design system
2. **Event-Driven Architecture** - Canvas events trigger UI updates
3. **Module Pattern** - Each class has single responsibility
4. **Declarative UI** - Template strings for dynamic content

---

## ⏭️ Next Steps

Continue to **SPRINT-PART3-BACKEND.md** to learn:
- Node.js server setup
- Express.js API routes
- Python Flask AI service
- WebSocket real-time features

---

**Sprint 2 Complete! ✨**  
*Frontend is fully functional - ready for backend integration.*
