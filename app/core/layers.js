// Layer Management Module

class LayerManager {
  constructor() {
    this.layers = [];
    this.selectedLayers = [];
  }

  init() {
    this.setupEventListeners();
    this.refresh();
  }

  setupEventListeners() {
    // Layer search
    const searchInput = document.getElementById('layerSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterLayers(e.target.value);
      });
    }

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.currentTarget.dataset.tab);
      });
    });
    
    // Setup layer drag-and-drop reordering
    this.setupLayerDragDrop();
  }

  setupLayerDragDrop() {
    const container = document.getElementById('layersList');
    if (!container) return;
    
    // Use event delegation for drag events
    container.addEventListener('dragstart', (e) => {
      const layerItem = e.target.closest('.layer-item');
      if (!layerItem) return;
      
      layerItem.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', layerItem.dataset.layerId);
      
      // Store the dragged layer id
      this._draggedLayerId = layerItem.dataset.layerId;
    });
    
    container.addEventListener('dragend', (e) => {
      const layerItem = e.target.closest('.layer-item');
      if (layerItem) {
        layerItem.classList.remove('dragging');
      }
      this._draggedLayerId = null;
      
      // Remove all drop indicators
      container.querySelectorAll('.layer-item').forEach(item => {
        item.classList.remove('drop-above', 'drop-below');
      });
    });
    
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      const layerItem = e.target.closest('.layer-item');
      if (!layerItem || layerItem.dataset.layerId === this._draggedLayerId) return;
      
      // Determine if dropping above or below
      const rect = layerItem.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      
      // Remove previous indicators
      container.querySelectorAll('.layer-item').forEach(item => {
        item.classList.remove('drop-above', 'drop-below');
      });
      
      if (e.clientY < midY) {
        layerItem.classList.add('drop-above');
      } else {
        layerItem.classList.add('drop-below');
      }
    });
    
    container.addEventListener('dragleave', (e) => {
      const layerItem = e.target.closest('.layer-item');
      if (layerItem) {
        layerItem.classList.remove('drop-above', 'drop-below');
      }
    });
    
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      
      const targetItem = e.target.closest('.layer-item');
      if (!targetItem || !this._draggedLayerId) return;
      
      const targetLayerId = targetItem.dataset.layerId;
      if (targetLayerId === this._draggedLayerId) return;
      
      // Determine drop position
      const rect = targetItem.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const dropAbove = e.clientY < midY;
      
      // Reorder layers
      this.reorderLayer(this._draggedLayerId, targetLayerId, dropAbove);
      
      // Clean up
      container.querySelectorAll('.layer-item').forEach(item => {
        item.classList.remove('drop-above', 'drop-below', 'dragging');
      });
      this._draggedLayerId = null;
    });
  }

  reorderLayer(draggedId, targetId, dropAbove) {
    const draggedLayer = this.layers.find(l => l.id === draggedId);
    const targetLayer = this.layers.find(l => l.id === targetId);
    
    if (!draggedLayer || !targetLayer) return;
    
    const canvas = app.canvas.canvas;
    const objects = canvas.getObjects();
    
    // Get current indices
    const draggedIndex = objects.indexOf(draggedLayer.object);
    const targetIndex = objects.indexOf(targetLayer.object);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Calculate new index
    // Note: In the layers panel, layers are displayed in reverse order (top layer first)
    // So "drop above" in the UI means the layer should be in front (higher z-index)
    // And "drop below" means the layer should be behind (lower z-index)
    let newIndex;
    if (dropAbove) {
      // Drop above in UI = move to front of target
      newIndex = targetIndex + 1;
    } else {
      // Drop below in UI = move behind target
      newIndex = targetIndex;
    }
    
    // Adjust if dragging from above
    if (draggedIndex < newIndex) {
      newIndex--;
    }
    
    // Move the object
    canvas.moveTo(draggedLayer.object, newIndex);
    canvas.renderAll();
    
    // Refresh layers panel
    this.refresh();
    app.history.saveState();
    
    Utils.showToast('Layer reordered', 'success');
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.panel-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}Panel`);
    });
  }

  refresh() {
    const objects = app.canvas.getObjects();
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

  getDefaultName(obj) {
    const typeNames = {
      'rect': 'Rectangle',
      'circle': 'Circle',
      'triangle': 'Triangle',
      'polygon': 'Polygon',
      'path': 'Path',
      'text': 'Text',
      'i-text': 'Text',
      'textbox': 'Text Box',
      'image': 'Image',
      'group': 'Group'
    };
    
    return typeNames[obj.type] || 'Layer';
  }

  getLayerType(obj) {
    if (obj.type === 'image') return 'image';
    if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') return 'text';
    if (obj.type === 'path') return 'vector';
    if (obj.type === 'group') return 'group';
    return 'shape';
  }

  render() {
    const container = document.getElementById('layersList');
    if (!container) return;

    if (this.layers.length === 0) {
      container.innerHTML = `
        <div class="no-selection">
          <i class="fas fa-layer-group"></i>
          <p>No layers yet</p>
        </div>
      `;
      return;
    }

    // Render layers in reverse order (top layer first)
    const reversedLayers = [...this.layers].reverse();
    
    container.innerHTML = reversedLayers.map(layer => `
      <div class="layer-item ${this.isSelected(layer) ? 'active' : ''} ${layer.locked ? 'locked' : ''}"
           data-layer-id="${layer.id}"
           draggable="${!layer.locked}"
           onclick="app.layers.selectLayer('${layer.id}', event)">
        
        <button class="layer-visibility" data-visible="${layer.visible}"
                onclick="app.layers.toggleVisibility('${layer.id}', event)"
                title="${layer.visible ? 'Hide layer' : 'Show layer'}">
          <i class="fas ${layer.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
        </button>
        
        <div class="layer-icon ${layer.type === 'image' ? 'has-thumbnail' : ''}">
          ${this.getLayerIcon(layer)}
        </div>
        
        <div class="layer-info">
          <div class="layer-name">${layer.name}</div>
          <div class="layer-type">${this.getLayerTypeLabel(layer.type)}</div>
        </div>
        
        ${layer.locked ? '<div class="layer-locked"><i class="fas fa-lock"></i></div>' : ''}
      </div>
    `).join('');
  }

  getLayerIcon(layer) {
    const icons = {
      'image': '<i class="fas fa-image"></i>',
      'text': '<i class="fas fa-font"></i>',
      'vector': '<i class="fas fa-bezier-curve"></i>',
      'shape': '<i class="fas fa-shapes"></i>',
      'group': '<i class="fas fa-layer-group"></i>'
    };
    
    // For image layers, try to show thumbnail
    if (layer.type === 'image' && layer.object._element) {
      return `<img src="${layer.object.getSrc()}" alt="${layer.name}">`;
    }
    
    return icons[layer.type] || icons['shape'];
  }

  getLayerTypeLabel(type) {
    const labels = {
      'image': 'Image Layer',
      'text': 'Text Layer',
      'vector': 'Vector Path',
      'shape': 'Shape',
      'group': 'Group'
    };
    return labels[type] || 'Layer';
  }

  isSelected(layer) {
    return this.selectedLayers.some(l => l.id === layer.id);
  }

  selectLayer(layerId, event) {
    if (event) {
      event.stopPropagation();
    }

    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) return;

    app.canvas.canvas.setActiveObject(layer.object);
    app.canvas.canvas.renderAll();
  }

  updateSelection(objects) {
    this.selectedLayers = objects ? objects.map(obj => {
      return this.layers.find(l => l.object === obj);
    }).filter(Boolean) : [];
    
    this.render();
    
    // Update selection info in bottom bar
    const selectionInfo = document.getElementById('selectionInfo');
    if (selectionInfo) {
      if (this.selectedLayers.length === 0) {
        selectionInfo.textContent = 'No selection';
      } else if (this.selectedLayers.length === 1) {
        selectionInfo.textContent = this.selectedLayers[0].name;
      } else {
        selectionInfo.textContent = `${this.selectedLayers.length} layers selected`;
      }
    }
  }

  clearSelection() {
    this.selectedLayers = [];
    this.render();
  }

  toggleVisibility(layerId, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) {
      console.warn('Layer not found:', layerId);
      return;
    }

    // Toggle visibility
    layer.visible = !layer.visible;
    layer.object.set('visible', layer.visible);
    
    // Force canvas update
    app.canvas.canvas.requestRenderAll();
    
    // Re-render layers panel
    this.render();
    app.history.saveState();
  }

  toggleLock(layerId) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) return;

    layer.locked = !layer.locked;
    layer.object.selectable = !layer.locked;
    layer.object.evented = !layer.locked;
    app.canvas.canvas.renderAll();
    this.render();
  }

  add() {
    // Add new rectangle as default
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: '#3b82f6',
      id: Utils.generateId(),
      name: 'Rectangle'
    });

    app.canvas.addObject(rect);
  }

  duplicate() {
    const activeObject = app.canvas.getActiveObject();
    if (!activeObject) {
      Utils.showToast('Select a layer to duplicate', 'warning');
      return;
    }

    activeObject.clone((cloned) => {
      cloned.set({
        left: activeObject.left + 20,
        top: activeObject.top + 20,
        id: Utils.generateId(),
        name: activeObject.name + ' Copy'
      });
      
      app.canvas.addObject(cloned);
      Utils.showToast('Layer duplicated', 'success');
    });
  }

  delete() {
    const activeObject = app.canvas.getActiveObject();
    if (!activeObject) {
      Utils.showToast('Select a layer to delete', 'warning');
      return;
    }

    if (confirm('Are you sure you want to delete this layer?')) {
      app.canvas.removeObject(activeObject);
      Utils.showToast('Layer deleted', 'success');
    }
  }

  rename(layerId, newName) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) return;

    layer.name = newName;
    layer.object.name = newName;
    this.render();
  }

  moveUp(layerId) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) return;

    layer.object.bringForward();
    app.canvas.canvas.renderAll();
    this.refresh();
    app.history.saveState();
  }

  moveDown(layerId) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) return;

    layer.object.sendBackwards();
    app.canvas.canvas.renderAll();
    this.refresh();
    app.history.saveState();
  }

  moveToTop(layerId) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) return;

    layer.object.bringToFront();
    app.canvas.canvas.renderAll();
    this.refresh();
    app.history.saveState();
  }

  moveToBottom(layerId) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) return;

    layer.object.sendToBack();
    app.canvas.canvas.renderAll();
    this.refresh();
    app.history.saveState();
  }

  group() {
    const activeSelection = app.canvas.canvas.getActiveObject();
    if (!activeSelection || activeSelection.type !== 'activeSelection') {
      Utils.showToast('Select multiple layers to group', 'warning');
      return;
    }

    const group = activeSelection.toGroup();
    group.set({
      id: Utils.generateId(),
      name: 'Group'
    });
    
    app.canvas.canvas.renderAll();
    this.refresh();
    app.history.saveState();
    Utils.showToast('Layers grouped', 'success');
  }

  ungroup() {
    const activeObject = app.canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') {
      Utils.showToast('Select a group to ungroup', 'warning');
      return;
    }

    activeObject.toActiveSelection();
    app.canvas.canvas.renderAll();
    this.refresh();
    app.history.saveState();
    Utils.showToast('Group ungrouped', 'success');
  }

  filterLayers(searchTerm) {
    const items = document.querySelectorAll('.layer-item');
    const term = searchTerm.toLowerCase();

    items.forEach(item => {
      const name = item.querySelector('.layer-name').textContent.toLowerCase();
      item.style.display = name.includes(term) ? 'flex' : 'none';
    });
  }
}

// Export for use in main app
if (typeof window !== 'undefined') {
  window.LayerManager = LayerManager;
}
