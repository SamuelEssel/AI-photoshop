// Application Configuration
const APP_CONFIG = {
  // API Configuration
  API_URL: 'http://localhost:3000/api',
  AI_SERVICE_URL: 'http://localhost:5000',
  
  // Canvas Configuration
  canvas: {
    defaultWidth: 1920,
    defaultHeight: 1080,
    minWidth: 64,
    maxWidth: 8192,
    minHeight: 64,
    maxHeight: 8192,
    backgroundColor: '#ffffff',
    gridSize: 20,
    snapToGrid: true,
    snapThreshold: 5
  },
  
  // Artboard Presets
  presets: {
    'Social Media': [
      { name: 'Instagram Post', width: 1080, height: 1080 },
      { name: 'Instagram Story', width: 1080, height: 1920 },
      { name: 'Facebook Post', width: 1200, height: 630 },
      { name: 'Twitter Post', width: 1200, height: 675 },
      { name: 'LinkedIn Post', width: 1200, height: 627 }
    ],
    'Web': [
      { name: 'Desktop HD', width: 1920, height: 1080 },
      { name: 'Desktop 4K', width: 3840, height: 2160 },
      { name: 'Tablet', width: 1024, height: 768 },
      { name: 'Mobile', width: 375, height: 812 }
    ],
    'Print': [
      { name: 'A4', width: 2480, height: 3508 },
      { name: 'Letter', width: 2550, height: 3300 },
      { name: 'Business Card', width: 1050, height: 600 },
      { name: 'Poster', width: 4200, height: 5940 }
    ]
  },
  
  // AI Generation Settings
  ai: {
    defaultWidth: 512,
    defaultHeight: 512,
    defaultSteps: 50,
    defaultGuidance: 7.5,
    maxGenerationsPerDay: 50,
    timeout: 120000 // 2 minutes
  },
  
  // SAM Settings
  sam: {
    minConfidence: 0.5,
    maxMasks: 10,
    autoSegmentThreshold: 0.7
  },
  
  // History Settings
  history: {
    maxStates: 50,
    saveInterval: 5000 // Auto-save every 5 seconds
  },
  
  // Export Settings
  export: {
    formats: ['PNG', 'JPEG', 'SVG', 'PDF', 'JSON'],
    defaultFormat: 'PNG',
    defaultQuality: 0.9,
    defaultDPI: 72
  },
  
  // Keyboard Shortcuts
  shortcuts: {
    'v': 'select',
    't': 'text',
    'r': 'rectangle',
    'c': 'circle',
    'p': 'pen',
    'h': 'hand',
    'b': 'brush',
    'e': 'eraser',
    'i': 'image',
    'ctrl+z': 'undo',
    'ctrl+y': 'redo',
    'ctrl+shift+z': 'redo',
    'ctrl+s': 'save',
    'ctrl+c': 'copy',
    'ctrl+v': 'paste',
    'ctrl+x': 'cut',
    'ctrl+d': 'duplicate',
    'ctrl+g': 'group',
    'ctrl+shift+g': 'ungroup',
    'delete': 'delete',
    'backspace': 'delete',
    'ctrl+a': 'selectAll',
    'escape': 'deselect',
    'ctrl++': 'zoomIn',
    'ctrl+-': 'zoomOut',
    'ctrl+0': 'zoomReset'
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_CONFIG;
}
