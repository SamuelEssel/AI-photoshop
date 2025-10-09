# AI Design Studio - Setup Guide

##  Quick Start

### Prerequisites

**Node.js Backend:**
- Node.js 16+ and npm
- Windows/Mac/Linux

**Python AI Services:**
- Python 3.8+
- CUDA-capable GPU (recommended for AI models)
- At least 8GB RAM (16GB+ recommended)

---

##  Installation

### 1. Install Node.js Dependencies

```bash
npm install
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Download AI Models

**For SAM (Segment Anything):**
```bash
# Download SAM checkpoint
wget https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth
```

**For Text-to-Image:**
- Models will be downloaded automatically on first use via Hugging Face
- Make sure you have enough disk space (~10GB)

### 4. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
AI_SERVICE_URL=http://localhost:5000
HUGGINGFACE_TOKEN=your_token_here  # Optional but recommended
```

---

##  Running the Application

### Start Backend Server (Terminal 1)

```bash
npm start
# Or for development with auto-reload:
npm run dev
```

Server will run on `http://localhost:3000`

### Start AI Service (Terminal 2)

```bash
python ai-service/app.py
```

AI service will run on `http://localhost:5000`

### Open the Application

Open your browser and navigate to:
```
http://localhost:3000/index.html
```

---

##  Features Overview

### Core Features
 **Fabric.js Canvas** - Professional canvas with full transform controls
 **AI Image Generation** - Text-to-image using Stable Diffusion
 **SAM Integration** - Automatic layer extraction from images
 **Layer Management** - Full layer system with visibility, locking, grouping
 **Properties Panel** - Dynamic properties based on selection
 **Undo/Redo** - Full history management
**Asset Manager** - Upload and manage image assets
**Export** - PNG, JPEG, SVG, JSON export
**Keyboard Shortcuts** - Professional shortcuts for all tools

### AI Features
- **Text-to-Image Generation** with customizable parameters
- **Automatic Segmentation** using Meta's SAM
- **Layer-wise Editing** of AI-generated content
- **Regenerate Individual Layers** while preserving transforms

### Tools
- Select (V)
- Hand (H)
- Rectangle (R)
- Circle (C)
- Text (T)
- Pen (P)
- Brush (B)
- Eraser (E)
- Image Upload (I)

---

## ⌨ Keyboard Shortcuts

### Tools
- `V` - Select tool
- `T` - Text tool
- `R` - Rectangle
- `C` - Circle
- `P` - Pen
- `H` - Hand (pan)
- `B` - Brush
- `E` - Eraser
- `I` - Image upload

### Actions
- `Ctrl+Z` - Undo
- `Ctrl+Y` / `Ctrl+Shift+Z` - Redo
- `Ctrl+S` - Save project
- `Ctrl+C` - Copy
- `Ctrl+V` - Paste
- `Ctrl+X` - Cut
- `Ctrl+D` - Duplicate
- `Ctrl+G` - Group
- `Ctrl+Shift+G` - Ungroup
- `Ctrl+A` - Select all
- `Delete` / `Backspace` - Delete selected
- `Esc` - Deselect

### View
- `Ctrl++` - Zoom in
- `Ctrl+-` - Zoom out
- `Ctrl+0` - Fit to screen

### Nudging
- `Arrow Keys` - Nudge 1px
- `Shift+Arrow Keys` - Nudge 10px

---

##  Configuration

### Canvas Presets

Edit `app/config.js` to add custom artboard presets:

```javascript
presets: {
  'Custom': [
    { name: 'My Size', width: 1200, height: 800 }
  ]
}
```

### AI Model Configuration

Edit `.env` to configure AI models:

```env
# Text-to-Image Model
TEXT2IMG_MODEL=stabilityai/stable-diffusion-2-1

# SAM Model
SAM_MODEL_TYPE=vit_h
SAM_CHECKPOINT=sam_vit_h_4b8939.pth
```

---

##  Troubleshooting

### AI Service Not Starting

**Issue:** CUDA out of memory
**Solution:** Use CPU mode by setting in `ai-service/app.py`:
```python
torch.float32  # Instead of torch.float16
device = 'cpu'  # Instead of 'cuda'
```

**Issue:** SAM model not found
**Solution:** Download the checkpoint and place in project root:
```bash
wget https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth
```

### Canvas Not Loading

**Issue:** Fabric.js not loading
**Solution:** Check your internet connection or download Fabric.js locally

**Issue:** Blank canvas
**Solution:** Check browser console for errors, ensure all scripts are loaded in correct order

### Export Not Working

**Issue:** Export button does nothing
**Solution:** Check if canvas has content, try different export format

---

##  Project Structure

```
ai-design-studio/
├── app/
│   ├── ai/              # AI integration modules
│   ├── core/            # Core canvas, layers, history
│   ├── managers/        # Project, assets, export
│   ├── ui/              # UI components, tools, keyboard
│   ├── utils/           # Helper functions
│   ├── styles/          # CSS stylesheets
│   └── config.js        # Application configuration
├── server/              # Node.js backend
│   ├── routes/          # API routes
│   └── index.js         # Server entry point
├── ai-service/          # Python AI service
│   └── app.py          # Flask AI server
├── data/                # Generated data storage
├── index.html           # Main application page
├── package.json         # Node dependencies
└── requirements.txt     # Python dependencies
```

---
##  Deployment

### Frontend (Static)

Deploy `index.html` and `app/` directory to any static hosting:
- Netlify
- Vercel
- GitHub Pages
- AWS S3

### Backend (Node.js)

Deploy to:
- Heroku
- DigitalOcean
- AWS EC2
- Railway

### AI Service (Python)

Deploy to:
- AWS EC2 with GPU
- Google Cloud with GPU
- Paperspace
- RunPod

**Note:** AI service requires GPU for optimal performance

---

##  API Keys

### Hugging Face (Recommended)

Get a free token at https://huggingface.co/settings/tokens

Add to `.env`:
```env
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxx
```

### Alternative: Stability AI

For higher quality generations:
```env
STABILITY_API_KEY=sk-xxxxxxxxxxxxx
```

---

##  Documentation

- [Full README](README.md) - Complete project documentation
- [API Documentation](docs/API.md) - Backend API reference
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

---

##  Support

- **Issues:** https://github.com/yourrepo/issues
- **Discussions:** https://github.com/yourrepo/discussions
- **Email:** support@aidesignstudio.com

---

##  License

MIT License - see LICENSE file for details

---

## will implement Segment Anything (SAM) & Stable Diffusion later

Built with:
- [Fabric.js](http://fabricjs.com/) - Canvas library
- [Segment Anything (SAM)](https://segment-anything.com/) - Meta AI
- [Stable Diffusion](https://stability.ai/) - Image generation
- [Flask](https://flask.palletsprojects.com/) - Python web framework
- [Express](https://expressjs.com/) - Node.js framework




