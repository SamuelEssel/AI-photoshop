// Keyboard Shortcuts Module

class KeyboardManager {
  constructor() {
    this.pressedKeys = new Set();
  }

  init() {
    this.setupKeyboardListeners();
  }

  setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    // Don't trigger shortcuts when typing in input fields
    if (this.isInputFocused()) return;

    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const alt = e.altKey;

    this.pressedKeys.add(key);

    // Tool shortcuts
    if (!ctrl && !shift && !alt) {
      switch (key) {
        case 'v':
          app.tools.selectTool('select');
          e.preventDefault();
          break;
        case 't':
          app.tools.selectTool('text');
          e.preventDefault();
          break;
        case 'r':
          app.tools.selectTool('rectangle');
          e.preventDefault();
          break;
        case 'c':
          app.tools.selectTool('circle');
          e.preventDefault();
          break;
        case 'p':
          app.tools.selectTool('pen');
          e.preventDefault();
          break;
        case 'h':
          app.tools.selectTool('hand');
          e.preventDefault();
          break;
        case 'b':
          app.tools.selectTool('brush');
          e.preventDefault();
          break;
        case 'e':
          app.tools.selectTool('eraser');
          e.preventDefault();
          break;
        case 'i':
          app.tools.selectTool('image');
          e.preventDefault();
          break;
        case 'delete':
        case 'backspace':
          app.layers.delete();
          e.preventDefault();
          break;
        case 'escape':
          app.canvas.canvas.discardActiveObject();
          app.canvas.render();
          e.preventDefault();
          break;
      }
    }

    // Ctrl shortcuts
    if (ctrl && !shift) {
      switch (key) {
        case 'z':
          app.history.undo();
          e.preventDefault();
          break;
        case 'y':
          app.history.redo();
          e.preventDefault();
          break;
        case 's':
          app.project.save();
          e.preventDefault();
          break;
        case 'c':
          this.copySelection();
          e.preventDefault();
          break;
        case 'v':
          this.pasteSelection();
          e.preventDefault();
          break;
        case 'x':
          this.cutSelection();
          e.preventDefault();
          break;
        case 'd':
          app.layers.duplicate();
          e.preventDefault();
          break;
        case 'g':
          app.layers.group();
          e.preventDefault();
          break;
        case 'a':
          this.selectAll();
          e.preventDefault();
          break;
        case '=':
        case '+':
          app.canvas.zoomIn();
          e.preventDefault();
          break;
        case '-':
          app.canvas.zoomOut();
          e.preventDefault();
          break;
        case '0':
          app.canvas.fitToScreen();
          e.preventDefault();
          break;
      }
    }

    // Ctrl+Shift shortcuts
    if (ctrl && shift) {
      switch (key) {
        case 'z':
          app.history.redo();
          e.preventDefault();
          break;
        case 'g':
          app.layers.ungroup();
          e.preventDefault();
          break;
        case ']':
          app.bringToFront();
          e.preventDefault();
          break;
        case '[':
          app.sendToBack();
          e.preventDefault();
          break;
      }
    }

    // Ctrl+Alt shortcuts  
    if (ctrl && alt) {
      switch (key) {
        case 'n':
          app.newProject();
          e.preventDefault();
          break;
        case 'e':
          app.export.showDialog();
          e.preventDefault();
          break;
      }
    }

    // Bracket shortcuts for layer ordering
    if (!ctrl && !shift && !alt) {
      if (e.key === ']') {
        app.bringForward();
        e.preventDefault();
      } else if (e.key === '[') {
        app.sendBackward();
        e.preventDefault();
      }
    }

    // Arrow key nudging
    if (!ctrl && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      this.nudgeSelection(e.key, shift ? 10 : 1);
      e.preventDefault();
    }
  }

  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    this.pressedKeys.delete(key);
  }

  isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    );
  }

  copySelection() {
    const activeObject = app.canvas.getActiveObject();
    if (!activeObject) return;

    activeObject.clone((cloned) => {
      this.clipboard = cloned;
      Utils.showToast('Copied to clipboard', 'info', 1000);
    });
  }

  cutSelection() {
    const activeObject = app.canvas.getActiveObject();
    if (!activeObject) return;

    activeObject.clone((cloned) => {
      this.clipboard = cloned;
      app.canvas.removeObject(activeObject);
      Utils.showToast('Cut to clipboard', 'info', 1000);
    });
  }

  pasteSelection() {
    if (!this.clipboard) {
      Utils.showToast('Nothing to paste', 'warning');
      return;
    }

    this.clipboard.clone((cloned) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
        id: Utils.generateId()
      });
      
      app.canvas.addObject(cloned);
      app.canvas.canvas.setActiveObject(cloned);
      Utils.showToast('Pasted', 'info', 1000);
    });
  }

  selectAll() {
    const objects = app.canvas.getObjects();
    if (objects.length === 0) return;

    const selection = new fabric.ActiveSelection(objects, {
      canvas: app.canvas.canvas
    });
    
    app.canvas.canvas.setActiveObject(selection);
    app.canvas.render();
  }

  nudgeSelection(direction, amount) {
    const activeObject = app.canvas.getActiveObject();
    if (!activeObject) return;

    switch (direction) {
      case 'ArrowUp':
        activeObject.top -= amount;
        break;
      case 'ArrowDown':
        activeObject.top += amount;
        break;
      case 'ArrowLeft':
        activeObject.left -= amount;
        break;
      case 'ArrowRight':
        activeObject.left += amount;
        break;
    }

    activeObject.setCoords();
    app.canvas.render();
    app.properties.update(activeObject);
  }
}

if (typeof window !== 'undefined') {
  window.KeyboardManager = KeyboardManager;
}
