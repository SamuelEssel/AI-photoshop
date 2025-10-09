// History (Undo/Redo) Management Module

class HistoryManager {
  constructor() {
    this.states = [];
    this.currentIndex = -1;
    this.maxStates = APP_CONFIG.history.maxStates;
  }

  init() {
    // Save initial state
    this.saveState();
  }

  saveState() {
    // Remove any states after current index (when undoing and then making changes)
    this.states = this.states.slice(0, this.currentIndex + 1);

    // Get current canvas state
    const state = app.canvas.toJSON();
    this.states.push(state);

    // Limit history size
    if (this.states.length > this.maxStates) {
      this.states.shift();
    } else {
      this.currentIndex++;
    }

    console.log('State saved. Total states:', this.states.length, 'Current index:', this.currentIndex);
  }

  async undo() {
    if (!this.canUndo()) {
      Utils.showToast('Nothing to undo', 'info');
      return;
    }

    this.currentIndex--;
    await this.restoreState(this.states[this.currentIndex]);
    Utils.showToast('Undo', 'info', 1000);
  }

  async redo() {
    if (!this.canRedo()) {
      Utils.showToast('Nothing to redo', 'info');
      return;
    }

    this.currentIndex++;
    await this.restoreState(this.states[this.currentIndex]);
    Utils.showToast('Redo', 'info', 1000);
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.states.length - 1;
  }

  async restoreState(state) {
    await app.canvas.fromJSON(state);
    app.layers.refresh();
    app.properties.clear();
  }

  clear() {
    this.states = [];
    this.currentIndex = -1;
  }

  getStateCount() {
    return this.states.length;
  }
}

// Export for use in main app
if (typeof window !== 'undefined') {
  window.HistoryManager = HistoryManager;
}
