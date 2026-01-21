# 📋 AI Design Studio - Sprint Documentation Part 1
## Project Planning & Initial Setup

> **For Students**: This document explains how the AI-powered Photoshop project was built from scratch, including every decision, tool, and setup step.

---

## 🎯 Sprint Overview

**Sprint Duration**: Week 1  
**Team Size**: 1-2 developers  
**Goal**: Set up project foundation, choose tech stack, and create initial architecture

---

## 📖 Table of Contents

1. [Project Concept & Requirements](#project-concept--requirements)
2. [Technology Stack Selection](#technology-stack-selection)
3. [Development Environment Setup](#development-environment-setup)
4. [Project Structure](#project-structure)
5. [Configuration Files](#configuration-files)
6. [Version Control Setup](#version-control-setup)

---

## 🎨 Project Concept & Requirements

### Vision Statement
Create a web-based AI-powered design tool that combines:
- Professional canvas editing (like Photoshop/Figma)
- AI image generation from text prompts
- Automatic layer extraction from images
- Modern, intuitive user interface

### Core Requirements

#### Functional Requirements
1. **Canvas Editor**
   - Draw shapes (rectangle, circle, polygon)
   - Add and edit text
   - Upload and manipulate images
   - Transform objects (move, scale, rotate)
   - Layer management system
   - Undo/redo functionality

2. **AI Features**
   - Text-to-image generation (Stable Diffusion)
   - Automatic object segmentation (SAM)
   - Layer extraction from generated images

3. **Project Management**
   - Save/load projects
   - Export to multiple formats (PNG, JPEG, SVG, PDF)
   - Template library
   - Asset management

4. **User Experience**
   - Modern dark theme UI
   - Keyboard shortcuts
   - Responsive panels
   - Toast notifications
   - Loading states

#### Non-Functional Requirements
- **Performance**: Canvas should handle 100+ objects smoothly
- **Compatibility**: Support Chrome, Firefox, Edge, Safari
- **Scalability**: Modular architecture for easy feature additions
- **Security**: API key protection, input validation
- **Documentation**: Comprehensive guides for users and developers

---

## 🛠️ Technology Stack Selection

### Why These Technologies?

#### Frontend: HTML5 + CSS3 + Vanilla JavaScript
**Decision Reasoning**:
- ✅ No build step required - faster development
- ✅ Easier for students to understand (no framework complexity)
- ✅ Better performance for canvas operations
- ✅ Direct DOM manipulation for fine control
- ❌ More boilerplate code than frameworks
- ❌ Manual state management

**Alternatives Considered**:
- React: Too much overhead for canvas-heavy app
- Vue: Good option, but adds complexity
- Svelte: Excellent choice, but less learning resources

#### Canvas Library: Fabric.js 5.3.0
**Decision Reasoning**:
- ✅ Industry-standard canvas library
- ✅ Rich object manipulation features
- ✅ Built-in serialization (save/load)
- ✅ Excellent documentation
- ✅ Active community

**Alternatives Considered**:
- Konva.js: Good, but less features
- Paper.js: Focused on vector graphics
- Native Canvas API: Too low-level

**Key Fabric.js Features Used**:
```javascript
// Object creation
const rect = new fabric.Rect({
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  fill: '#00BFA6'
});

// Transformations
obj.set({ left: 50, top: 50, angle: 45 });

// Serialization
const json = canvas.toJSON();
canvas.loadFromJSON(json);

// Export
const dataURL = canvas.toDataURL('png');
```

#### Backend: Node.js + Express.js
**Decision Reasoning**:
- ✅ JavaScript everywhere (same language as frontend)
- ✅ npm ecosystem (millions of packages)
- ✅ Non-blocking I/O (good for AI requests)
- ✅ Easy WebSocket integration
- ❌ Single-threaded (but event-driven)

**Express.js Benefits**:
- Minimalist and unopinionated
- Easy routing
- Rich middleware ecosystem
- RESTful API friendly

#### AI Service: Python + Flask
**Decision Reasoning**:
- ✅ Python is the standard for AI/ML
- ✅ PyTorch, Transformers, Diffusers all Python-based
- ✅ Flask is lightweight and simple
- ✅ Easy integration with Node.js backend
- ❌ Requires separate service (microservices)

#### AI Models
1. **Stable Diffusion** (Text-to-Image)
   - Open source
   - High quality generation
   - Customizable parameters

2. **SAM - Segment Anything Model** (Image Segmentation)
   - State-of-the-art segmentation
   - From Meta AI Research
   - Works on any image

3. **CLIP** (Object Classification)
   - Multi-modal (text + image)
   - Zero-shot classification
   - Helps label extracted layers

---

## 💻 Development Environment Setup

### Step 1: Install Prerequisites

#### Node.js (v16+)
```bash
# Download from nodejs.org
# Verify installation
node --version
npm --version
```

#### Python (3.8+)
```bash
# Download from python.org
# Verify installation
python --version
pip --version
```

#### Git
```bash
# Download from git-scm.com
# Verify installation
git --version
```

#### Code Editor: VS Code
**Recommended Extensions**:
- ESLint - JavaScript linting
- Prettier - Code formatting
- Live Server - Local development server
- Path Intellisense - File path autocomplete
- GitLens - Git visualization

### Step 2: Create Project Directory

```bash
# Create project folder
mkdir ai-design-studio
cd ai-design-studio

# Initialize Git repository
git init

# Initialize npm project
npm init -y

# Create Python virtual environment (optional but recommended)
python -m venv venv
# Activate: venv\Scripts\activate (Windows) or source venv/bin/activate (Mac/Linux)
```

### Step 3: Install Dependencies

#### Node.js Dependencies
```bash
# Production dependencies
npm install express cors dotenv multer ws uuid axios sharp body-parser socket.io canvas

# Development dependencies
npm install --save-dev nodemon jest
```

**What each package does**:
- `express` - Web framework
- `cors` - Enable cross-origin requests
- `dotenv` - Environment variables
- `multer` - File upload handling
- `ws` - WebSocket support
- `uuid` - Generate unique IDs
- `axios` - HTTP client
- `sharp` - Image processing
- `body-parser` - Parse request bodies
- `socket.io` - Real-time communication
- `canvas` - Server-side canvas
- `nodemon` - Auto-restart on changes (dev)
- `jest` - Testing framework (dev)

#### Python Dependencies
```bash
# Install from requirements.txt
pip install flask flask-cors torch torchvision transformers diffusers accelerate opencv-python numpy pillow scipy scikit-image requests python-dotenv

# Install SAM from GitHub
pip install git+https://github.com/facebookresearch/segment-anything.git

# Install CLIP from GitHub
pip install git+https://github.com/openai/CLIP.git
```

---

## 📁 Project Structure

### Final Directory Structure
```
ai-design-studio/
├── app/                      # Frontend application
│   ├── ai/                   # AI integration modules
│   │   ├── generator.js      # Text-to-image generation
│   │   └── sam.js            # SAM segmentation
│   ├── core/                 # Core functionality
│   │   ├── canvas.js         # Canvas management
│   │   ├── layers.js         # Layer system
│   │   ├── history.js        # Undo/redo
│   │   └── properties.js     # Properties panel
│   ├── managers/             # Resource managers
│   │   ├── project.js        # Project CRUD
│   │   ├── assets.js         # Asset management
│   │   ├── export.js         # Export handling
│   │   ├── templates.js      # Template system
│   │   └── theme.js          # Theme switching
│   ├── ui/                   # UI components
│   │   ├── tools.js          # Drawing tools
│   │   ├── modals.js         # Modal dialogs
│   │   ├── keyboard.js       # Keyboard shortcuts
│   │   ├── navigation.js     # Page routing
│   │   └── dashboard.js      # Dashboard UI
│   ├── utils/                # Utilities
│   │   └── helpers.js        # Helper functions
│   ├── styles/               # CSS files
│   │   ├── main.css          # Global styles
│   │   ├── editor.css        # Editor layout
│   │   ├── panels.css        # Side panels
│   │   ├── modals.css        # Modal styles
│   │   ├── landing.css       # Landing page
│   │   ├── dashboard.css     # Dashboard
│   │   └── onboarding.css    # Onboarding
│   ├── features/             # Feature modules
│   │   └── enhanced.js       # Advanced features
│   ├── config.js             # App configuration
│   └── main.js               # Application entry
├── server/                   # Node.js backend
│   ├── routes/               # API routes
│   │   ├── projects.js       # Project endpoints
│   │   ├── ai.js             # AI generation endpoints
│   │   ├── assets.js         # Asset endpoints
│   │   └── sam.js            # SAM endpoints
│   └── index.js              # Server entry point
├── ai-service/               # Python AI service
│   └── app.py                # Flask AI server
├── pages/                    # HTML pages
│   ├── landing.html          # Landing page
│   ├── onboarding.html       # Onboarding wizard
│   ├── dashboard.html        # Project dashboard
│   ├── editor.html           # Main editor
│   ├── generate.html         # AI generation
│   └── export.html           # Export page
├── data/                     # Data storage
│   ├── projects/             # Saved projects
│   ├── uploads/              # User uploads
│   └── generated/            # AI generated images
├── assets/                   # Static assets
├── tests/                    # Test files
├── index.html                # Main entry point
├── index-landing.html        # Router page
├── package.json              # Node dependencies
├── requirements.txt          # Python dependencies
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── Dockerfile                # Docker container
├── docker-compose.yml        # Multi-service setup
└── README.md                 # Project documentation
```

### Why This Structure?

**Modular Architecture**:
- Each module has a single responsibility
- Easy to locate and modify code
- Scalable - can add new modules easily

**Separation of Concerns**:
- `app/` - Frontend code
- `server/` - Backend API
- `ai-service/` - AI processing (separate service)

**Feature-Based Organization**:
- `ai/` - All AI-related code together
- `managers/` - Resource management
- `ui/` - User interface components

---

## ⚙️ Configuration Files

### package.json
```json
{
  "name": "ai-design-studio",
  "version": "1.0.0",
  "description": "AI-powered design studio",
  "main": "server/index.js",
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    // ... other dependencies
  }
}
```

**Key Scripts**:
- `npm start` - Run production server
- `npm run dev` - Run with auto-reload
- `npm test` - Run tests

### requirements.txt
```
flask==3.0.0
torch==2.1.0
transformers==4.35.0
diffusers==0.24.0
# ... other dependencies
```

### .env.example
```env
# Server Configuration
PORT=3000
AI_SERVICE_URL=http://localhost:5000

# AI Model Configuration
TEXT2IMG_MODEL=stabilityai/stable-diffusion-2-1
SAM_MODEL_TYPE=vit_h
SAM_CHECKPOINT=sam_vit_h_4b8939.pth

# API Keys (Optional)
HUGGINGFACE_TOKEN=your_token_here
STABILITY_API_KEY=your_key_here
```

**Security Note**: Never commit `.env` to Git!

### app/config.js
```javascript
const APP_CONFIG = {
  API_URL: 'http://localhost:3000/api',
  AI_SERVICE_URL: 'http://localhost:5000',
  
  canvas: {
    defaultWidth: 1920,
    defaultHeight: 1080,
    minWidth: 64,
    maxWidth: 8192,
    backgroundColor: '#ffffff',
    gridSize: 20
  },
  
  presets: {
    'Social Media': [
      { name: 'Instagram Post', width: 1080, height: 1080 },
      { name: 'Instagram Story', width: 1080, height: 1920 }
    ]
  }
};
```

**Purpose**: Centralized configuration for easy maintenance

---

## 🔧 Version Control Setup

### .gitignore
```
# Dependencies
node_modules/
__pycache__/

# Environment
.env
.env.local

# Data
data/projects/*.json
data/uploads/*
data/generated/*

# AI Models
*.pth
*.ckpt
models/

# IDE
.vscode/
.idea/

# Logs
*.log
```

### Initial Commit
```bash
git add .
git commit -m "Initial project setup with tech stack"
git branch -M main
git remote add origin https://github.com/username/ai-design-studio.git
git push -u origin main
```

---

## 📚 Key Learnings

### What Went Well
✅ Modular structure made development organized  
✅ Vanilla JS kept complexity low  
✅ Fabric.js saved months of canvas development  
✅ Python microservice isolated AI concerns  

### Challenges Faced
⚠️ Large AI models require GPU (solved: CPU fallback)  
⚠️ Coordinating Node.js + Python services  
⚠️ Managing canvas state for undo/redo  

### Best Practices Applied
1. **Separation of Concerns**: Each file has one job
2. **Configuration Management**: All settings in config.js
3. **Environment Variables**: Sensitive data in .env
4. **Version Control**: Meaningful commit messages
5. **Documentation**: README, SETUP guides

---

## 🎓 Student Exercises

1. **Modify Config**: Add your own canvas presets for different use cases
2. **Explore Dependencies**: Read documentation for Express.js and Fabric.js
3. **Set Up Environment**: Install all prerequisites and run `npm install`
4. **Understand Structure**: Map out which files handle which features
5. **Create Branch**: Practice Git by creating a feature branch

---

## ⏭️ Next Steps

Continue to **SPRINT-PART2-FRONTEND.md** to learn how we built:
- HTML page structure
- CSS styling system
- JavaScript modules
- Canvas implementation
- Layer management
- UI components

---

**Sprint 1 Complete! ✨**  
*Foundation is solid - ready for frontend development.*
