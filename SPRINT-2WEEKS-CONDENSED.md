# 🚀 AI Design Studio - 2-Week Sprint Documentation
## Condensed Development Guide: Core Features & Deployment

> **Fast-Track Learning**: Complete guide covering frontend, backend, Docker, and deployment in 2 weeks. AI integration reserved for future sprints.

---

## 📅 Sprint Timeline

**Week 1**: Foundation, HTML/CSS, Fabric.js, Theme System  
**Week 2**: Backend API, Docker, Integration, Deployment

---

# WEEK 1: Frontend Development

## Day 1: Project Setup

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript ES6+, Fabric.js 5.3.0
- **Backend**: Node.js 16+, Express.js 4.18.2
- **DevOps**: Docker, Docker Compose, PM2

### Setup Commands
```bash
npm init -y
npm install express cors dotenv multer socket.io sharp
npm install --save-dev nodemon jest

mkdir -p app/{core,managers,ui,styles} server/routes pages data video
```

### Core Configuration (app/config.js)
```javascript
const APP_CONFIG = {
  API_URL: 'http://localhost:3000/api',
  canvas: {
    defaultWidth: 1920,
    defaultHeight: 1080,
    backgroundColor: '#ffffff',
    gridSize: 20
  },
  presets: {
    'Social Media': [
      { name: 'Instagram Post', width: 1080, height: 1080 },
      { name: 'Instagram Story', width: 1080, height: 1920 }
    ]
  },
  shortcuts: {
    'v': 'select', 't': 'text', 'r': 'rectangle',
    'ctrl+z': 'undo', 'ctrl+y': 'redo'
  }
};
```

---

## Day 2-3: HTML Pages & Theme System

### Editor Page Structure (pages/editor.html)
```html
<!DOCTYPE html>
<html data-theme="dark">
<head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
  <link rel="stylesheet" href="../app/styles/main.css">
</head>
<body>
  <!-- Top Menu Bar -->
  <nav class="navbar">
    <div class="navbar-left">
      <div class="logo"><i class="fas fa-wand-magic-sparkles"></i> AI Design Studio</div>
      <div class="menu-bar">
        <div class="menu-item">File
          <div class="dropdown">
            <a onclick="app.project.createProject()">New</a>
            <a onclick="app.project.saveProject()">Save</a>
          </div>
        </div>
      </div>
    </div>
    <div class="navbar-center">
      <button id="undoBtn"><i class="fas fa-undo"></i></button>
      <button id="redoBtn"><i class="fas fa-redo"></i></button>
      <span id="zoomLevel">100%</span>
    </div>
    <div class="navbar-right">
      <button onclick="app.theme.toggle()"><i class="fas fa-moon"></i></button>
      <button onclick="app.project.saveProject()" class="btn-primary">Save</button>
    </div>
  </nav>

  <!-- Editor Grid -->
  <div class="editor-container">
    <!-- Left Toolbar -->
    <aside class="left-toolbar">
      <button data-tool="select" class="tool-btn active"><i class="fas fa-mouse-pointer"></i></button>
      <button data-tool="rectangle" class="tool-btn"><i class="fas fa-square"></i></button>
      <button data-tool="circle" class="tool-btn"><i class="fas fa-circle"></i></button>
      <button data-tool="text" class="tool-btn"><i class="fas fa-font"></i></button>
    </aside>

    <!-- Canvas -->
    <main class="canvas-section">
      <div id="canvasWrapper"><canvas id="fabricCanvas"></canvas></div>
    </main>

    <!-- Right Panel -->
    <aside class="right-panel">
      <div class="panel-tabs">
        <button class="tab-btn active" data-tab="layers">Layers</button>
        <button class="tab-btn" data-tab="properties">Properties</button>
      </div>
      <div id="layersPanel" class="panel-content active">
        <div id="layersList"></div>
      </div>
      <div id="propertiesPanel" class="panel-content">
        <div id="propertiesContent"></div>
      </div>
    </aside>
  </div>

  <script src="../app/config.js"></script>
  <script src="../app/core/canvas.js"></script>
  <script src="../app/managers/theme.js"></script>
  <script src="../app/main.js"></script>
</body>
</html>
```

### Landing Page with Video Background
```html
<div class="video-background">
  <video autoplay muted loop playsinline>
    <source src="../video/background.mp4" type="video/mp4">
  </video>
  <div class="video-overlay"></div>
</div>
```

### CSS Theme System (app/styles/main.css)
```css
:root {
  --bg-primary: #0E0E0E;
  --bg-secondary: #1C1C1C;
  --text-primary: #FFFFFF;
  --teal: #00BFA6;
  --spacing-md: 16px;
  --radius-md: 8px;
  --transition-base: 0.3s ease;
}

[data-theme="light"] {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --text-primary: #1C1C1C;
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition-base);
}

.editor-container {
  display: grid;
  grid-template-columns: 60px 1fr 320px;
  height: calc(100vh - 60px);
}
```

### Theme Manager (app/managers/theme.js)
```javascript
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
  }

  init() {
    this.setTheme(this.currentTheme);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}
```

---

## Day 4-5: Fabric.js Canvas & Tools

### Canvas Manager (app/core/canvas.js)
```javascript
class CanvasManager {
  constructor() {
    this.canvas = null;
    this.zoom = 1;
  }

  init() {
    this.canvas = new fabric.Canvas('fabricCanvas', {
      width: APP_CONFIG.canvas.defaultWidth,
      height: APP_CONFIG.canvas.defaultHeight,
      backgroundColor: APP_CONFIG.canvas.backgroundColor,
      preserveObjectStacking: true
    });

    this.setupEventListeners();
    this.enableMouseWheelZoom();
  }

  setupEventListeners() {
    this.canvas.on('selection:created', (e) => {
      app.properties.update(e.selected[0]);
      app.layers.updateSelection(e.selected);
    });

    this.canvas.on('object:modified', (e) => {
      app.history.saveState();
    });
  }

  enableMouseWheelZoom() {
    this.canvas.on('mouse:wheel', (opt) => {
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** opt.e.deltaY;
      zoom = Math.max(0.1, Math.min(10, zoom));
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
    });
  }

  zoomIn() { this.setZoom(this.zoom * 1.2); }
  zoomOut() { this.setZoom(this.zoom / 1.2); }

  setZoom(zoom) {
    this.zoom = Math.max(0.1, Math.min(10, zoom));
    this.canvas.setZoom(this.zoom);
    this.canvas.renderAll();
  }

  addObject(obj) {
    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    app.history.saveState();
    app.layers.refresh();
  }

  toJSON() {
    return this.canvas.toJSON(['id', 'name', 'type', 'locked']);
  }
}
```

### Tools Implementation (app/ui/tools.js)
```javascript
class ToolManager {
  constructor() {
    this.activeTool = 'select';
  }

  init() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => this.selectTool(btn.dataset.tool));
    });
  }

  selectTool(tool) {
    this.activeTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });

    switch(tool) {
      case 'rectangle': this.drawRectangle(); break;
      case 'circle': this.drawCircle(); break;
      case 'text': this.addText(); break;
    }
  }

  drawRectangle() {
    const rect = new fabric.Rect({
      left: 100, top: 100,
      width: 200, height: 150,
      fill: '#00BFA6',
      id: Date.now(),
      name: 'Rectangle'
    });
    app.canvas.addObject(rect);
  }

  drawCircle() {
    const circle = new fabric.Circle({
      left: 150, top: 150,
      radius: 75,
      fill: '#1E90FF',
      id: Date.now(),
      name: 'Circle'
    });
    app.canvas.addObject(circle);
  }

  addText() {
    const text = new fabric.IText('Double click to edit', {
      left: 100, top: 100,
      fontSize: 32,
      fill: '#FFFFFF',
      id: Date.now(),
      name: 'Text'
    });
    app.canvas.addObject(text);
  }
}
```

### Layer Manager (app/core/layers.js)
```javascript
class LayerManager {
  constructor() {
    this.layers = [];
  }

  refresh() {
    const objects = app.canvas.getObjects();
    this.layers = objects.map((obj, index) => ({
      id: obj.id || Date.now() + index,
      object: obj,
      name: obj.name || 'Layer ' + (index + 1),
      visible: obj.visible !== false,
      locked: obj.selectable === false
    }));
    this.render();
  }

  render() {
    const container = document.getElementById('layersList');
    container.innerHTML = this.layers.reverse().map(layer => `
      <div class="layer-item" onclick="app.layers.selectLayer('${layer.id}')">
        <button onclick="app.layers.toggleVisibility('${layer.id}', event)">
          <i class="fas ${layer.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
        </button>
        <span>${layer.name}</span>
      </div>
    `).join('');
  }

  toggleVisibility(layerId, event) {
    event?.stopPropagation();
    const layer = this.layers.find(l => l.id === layerId);
    if (layer) {
      layer.visible = !layer.visible;
      layer.object.visible = layer.visible;
      app.canvas.canvas.renderAll();
      this.render();
    }
  }
}
```

---

# WEEK 2: Backend & Deployment

## Day 6-7: Express Backend

### Server Entry (server/index.js)
```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..')));

const projectRoutes = require('./routes/projects');
const assetRoutes = require('./routes/assets');

app.use('/api/projects', projectRoutes);
app.use('/api/assets', assetRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Project Routes (server/routes/projects.js)
```javascript
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PROJECTS_DIR = path.join(__dirname, '../../data/projects');

router.get('/', async (req, res) => {
  const files = await fs.readdir(PROJECTS_DIR);
  const projects = await Promise.all(
    files.filter(f => f.endsWith('.json')).map(async (file) => {
      const content = await fs.readFile(path.join(PROJECTS_DIR, file), 'utf-8');
      return JSON.parse(content);
    })
  );
  res.json(projects);
});

router.post('/', async (req, res) => {
  const project = {
    id: uuidv4(),
    name: req.body.name || 'Untitled',
    created: new Date().toISOString(),
    canvasData: req.body.canvasData || {}
  };
  await fs.writeFile(
    path.join(PROJECTS_DIR, `${project.id}.json`),
    JSON.stringify(project, null, 2)
  );
  res.status(201).json(project);
});

module.exports = router;
```

---

## Day 8: Docker Containerization

### Dockerfile
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
```

### Commands
```bash
docker-compose build
docker-compose up -d
docker-compose logs -f
```

---

## Day 9-10: Integration & Testing (In Progress)

### Main Application (app/main.js)
```javascript
class Application {
  constructor() {
    this.canvas = null;
    this.layers = null;
    this.history = null;
    this.properties = null;
    this.theme = null;
    this.tools = null;
    this.project = null;
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

    this.theme = new ThemeManager();
    this.theme.init();

    this.tools = new ToolManager();
    this.tools.init();

    this.project = new ProjectManager();
    this.project.init();

    console.log('✓ Application initialized');
  }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new Application();
  app.init();
});
```

### Current Testing Checklist
- ✅ Canvas initialization and rendering
- ✅ Tool selection and object creation
- ✅ Layer visibility toggle
- ✅ Theme switching (dark/light)
- ✅ Zoom in/out functionality
- ⏳ Undo/redo system (in progress)
- ⏳ Properties panel updates (in progress)
- ⏳ Project save/load (backend integration ongoing)
- ⏳ Export functionality (in development)
- ⏳ Asset upload and management (pending)

### Known Issues to Fix
1. Canvas zoom resets on window resize
2. Layer ordering needs drag-and-drop support
3. Properties panel not updating on some object modifications
4. Theme toggle icon doesn't update immediately
5. History state size optimization needed

### Next Steps (Future Sprints)
- **Sprint 3**: AI Integration
  - Stable Diffusion text-to-image generation
  - SAM automatic segmentation
  - Layer extraction from AI images
- **Sprint 4**: Advanced Features
  - Filters and effects
  - Text formatting toolbar
  - Custom brushes
  - Gradient tools
- **Sprint 5**: Collaboration & Deployment
  - Real-time collaboration with WebSocket
  - User authentication
  - Cloud storage integration
  - Production deployment to AWS/Heroku

---

## 📚 Key Technologies Summary

### Frontend
- **Fabric.js**: Canvas object manipulation, transformations, serialization
- **CSS Grid**: 3-column layout (toolbar, canvas, panel)
- **CSS Variables**: Theme switching (dark/light)
- **ES6 Modules**: Class-based architecture

### Backend
- **Express.js**: RESTful API, static files, CORS
- **Multer**: File upload handling
- **Sharp**: Image processing
- **fs/promises**: Async file operations

### DevOps
- **Docker**: Containerization, multi-stage builds
- **PM2**: Process management, auto-restart
- **Nginx**: Reverse proxy, static serving

---

## 🎯 Critical Code Patterns

### Event-Driven Updates
```javascript
canvas.on('object:modified', () => {
  app.history.saveState();
  app.properties.update();
});
```

### Theme Persistence
```javascript
localStorage.setItem('theme', theme);
```

### API Integration
```javascript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, canvasData })
});
```

---

## 📊 Sprint Status

**Week 1**: ✅ Complete - Frontend foundation established  
**Week 2**: ⏳ In Progress - Backend integration and testing ongoing

### Current Progress: ~75% Complete

**Completed:**
- ✅ Project structure and configuration
- ✅ HTML pages (landing, editor, dashboard)
- ✅ CSS design system with theme support
- ✅ Fabric.js canvas integration
- ✅ Basic tools (shapes, text, selection)
- ✅ Layer system with visibility controls
- ✅ Express.js backend with project routes
- ✅ Docker containerization setup

**In Development:**
- ⏳ Undo/redo history system
- ⏳ Properties panel full functionality
- ⏳ Project save/load integration
- ⏳ Export to multiple formats
- ⏳ Asset management system

**Planned (Future Sprints):**
- 🔮 AI image generation (Stable Diffusion)
- 🔮 Automatic segmentation (SAM)
- 🔮 Real-time collaboration
- 🔮 Production deployment

---

**💡 This is a living document. The application is actively being developed with new features added regularly.**
