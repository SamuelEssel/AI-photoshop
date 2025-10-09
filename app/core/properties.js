// Properties Panel Module

class PropertiesManager {
  constructor() {
    this.currentObject = null;
  }

  init() {
    // Initialize properties panel
  }

  update(obj) {
    if (!obj) {
      this.clear();
      return;
    }

    this.currentObject = obj;
    const container = document.getElementById('propertiesContent');
    if (!container) return;

    const type = this.getObjectType(obj);
    container.innerHTML = this.generatePropertiesHTML(obj, type);
    this.attachEventListeners();
  }

  getObjectType(obj) {
    if (obj.type === 'image') return 'image';
    if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') return 'text';
    if (obj.type === 'path') return 'vector';
    if (obj.type === 'group') return 'group';
    return 'shape';
  }

  generatePropertiesHTML(obj, type) {
    let html = `
      <div class="property-section">
        <div class="property-section-title">Transform</div>
        ${this.getTransformHTML(obj)}
      </div>
      
      <div class="property-section">
        <div class="property-section-title">Appearance</div>
        ${this.getAppearanceHTML(obj, type)}
      </div>
    `;

    if (type === 'text') {
      html += `<div class="property-section">
        <div class="property-section-title">Text</div>
        ${this.getTextHTML(obj)}
      </div>`;
    }

    return html;
  }

  getTransformHTML(obj) {
    return `
      <div class="property-group">
        <label>Position</label>
        <div class="property-row">
          <input type="number" id="prop-x" value="${Math.round(obj.left)}" step="1">
          <input type="number" id="prop-y" value="${Math.round(obj.top)}" step="1">
        </div>
      </div>
      <div class="property-group">
        <label>Size</label>
        <div class="property-row">
          <input type="number" id="prop-width" value="${Math.round(obj.width * obj.scaleX)}" step="1">
          <input type="number" id="prop-height" value="${Math.round(obj.height * obj.scaleY)}" step="1">
        </div>
      </div>
      <div class="property-group">
        <label>Rotation</label>
        <input type="number" id="prop-angle" value="${Math.round(obj.angle)}" min="0" max="360" step="1">
      </div>
    `;
  }

  getAppearanceHTML(obj, type) {
    return `
      <div class="property-group">
        <div class="property-label-inline">
          <label>Opacity</label>
          <span class="property-value">${Math.round(obj.opacity * 100)}%</span>
        </div>
        <input type="range" id="prop-opacity" min="0" max="1" step="0.01" value="${obj.opacity}">
      </div>
      
      <div class="property-group">
        <label>Blend Mode</label>
        <select id="prop-blend-mode">
          <option value="source-over" ${obj.globalCompositeOperation === 'source-over' ? 'selected' : ''}>Normal</option>
          <option value="multiply" ${obj.globalCompositeOperation === 'multiply' ? 'selected' : ''}>Multiply</option>
          <option value="screen" ${obj.globalCompositeOperation === 'screen' ? 'selected' : ''}>Screen</option>
          <option value="overlay" ${obj.globalCompositeOperation === 'overlay' ? 'selected' : ''}>Overlay</option>
          <option value="darken" ${obj.globalCompositeOperation === 'darken' ? 'selected' : ''}>Darken</option>
          <option value="lighten" ${obj.globalCompositeOperation === 'lighten' ? 'selected' : ''}>Lighten</option>
          <option value="color-dodge" ${obj.globalCompositeOperation === 'color-dodge' ? 'selected' : ''}>Color Dodge</option>
          <option value="color-burn" ${obj.globalCompositeOperation === 'color-burn' ? 'selected' : ''}>Color Burn</option>
          <option value="hard-light" ${obj.globalCompositeOperation === 'hard-light' ? 'selected' : ''}>Hard Light</option>
          <option value="soft-light" ${obj.globalCompositeOperation === 'soft-light' ? 'selected' : ''}>Soft Light</option>
          <option value="difference" ${obj.globalCompositeOperation === 'difference' ? 'selected' : ''}>Difference</option>
          <option value="exclusion" ${obj.globalCompositeOperation === 'exclusion' ? 'selected' : ''}>Exclusion</option>
        </select>
      </div>
      
      ${type !== 'image' ? `
        <div class="property-group">
          <label>Fill Color</label>
          <div class="property-row">
            <input type="color" id="prop-fill" value="${obj.fill || '#000000'}">
            <button class="btn-sm" onclick="app.enhanced.showGradientDialog()" title="Gradient Fill">
              <i class="fas fa-fill-drip"></i>
            </button>
          </div>
        </div>
      ` : ''}
      ${type === 'shape' || type === 'vector' ? `
        <div class="property-group">
          <label>Stroke Color</label>
          <input type="color" id="prop-stroke" value="${obj.stroke || '#000000'}">
        </div>
        <div class="property-group">
          <div class="property-label-inline">
            <label>Stroke Width</label>
            <span class="property-value">${obj.strokeWidth || 0}px</span>
          </div>
          <input type="range" id="prop-stroke-width" min="0" max="20" step="1" value="${obj.strokeWidth || 0}">
        </div>
        ${obj.type === 'rect' ? `
          <div class="property-group">
            <div class="property-label-inline">
              <label>Border Radius</label>
              <span class="property-value">${obj.rx || 0}px</span>
            </div>
            <input type="range" id="prop-border-radius" min="0" max="100" step="1" value="${obj.rx || 0}">
          </div>
        ` : ''}
      ` : ''}
    `;
  }

  getTextHTML(obj) {
    return `
      <div class="property-group">
        <label>Font Size</label>
        <input type="number" id="prop-font-size" value="${obj.fontSize}" min="8" max="200" step="1">
      </div>
      <div class="property-group">
        <label>Font Family</label>
        <select id="prop-font-family">
          <option value="Arial" ${obj.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
          <option value="Helvetica" ${obj.fontFamily === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
          <option value="Times New Roman" ${obj.fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
          <option value="Courier New" ${obj.fontFamily === 'Courier New' ? 'selected' : ''}>Courier New</option>
        </select>
      </div>
      <div class="property-group">
        <label>Text Align</label>
        <select id="prop-text-align">
          <option value="left" ${obj.textAlign === 'left' ? 'selected' : ''}>Left</option>
          <option value="center" ${obj.textAlign === 'center' ? 'selected' : ''}>Center</option>
          <option value="right" ${obj.textAlign === 'right' ? 'selected' : ''}>Right</option>
        </select>
      </div>
    `;
  }

  attachEventListeners() {
    const obj = this.currentObject;
    if (!obj) return;

    // Transform
    this.addListener('prop-x', (val) => { obj.set('left', parseFloat(val)); });
    this.addListener('prop-y', (val) => { obj.set('top', parseFloat(val)); });
    this.addListener('prop-width', (val) => { obj.scaleToWidth(parseFloat(val)); });
    this.addListener('prop-height', (val) => { obj.scaleToHeight(parseFloat(val)); });
    this.addListener('prop-angle', (val) => { obj.set('angle', parseFloat(val)); });

    // Appearance
    this.addListener('prop-opacity', (val) => { 
      obj.set('opacity', parseFloat(val)); 
      this.updateValueDisplay('prop-opacity', Math.round(val * 100) + '%');
    });
    this.addListener('prop-fill', (val) => { obj.set('fill', val); });
    this.addListener('prop-stroke', (val) => { obj.set('stroke', val); });
    this.addListener('prop-stroke-width', (val) => { 
      obj.set('strokeWidth', parseFloat(val));
      this.updateValueDisplay('prop-stroke-width', val + 'px');
    });

    // Text
    this.addListener('prop-font-size', (val) => { obj.set('fontSize', parseFloat(val)); });
    this.addListener('prop-font-family', (val) => { obj.set('fontFamily', val); });
    this.addListener('prop-text-align', (val) => { obj.set('textAlign', val); });

    // Blend mode
    this.addListener('prop-blend-mode', (val) => { obj.set('globalCompositeOperation', val); });

    // Border radius
    this.addListener('prop-border-radius', (val) => {
      obj.set('rx', parseFloat(val));
      obj.set('ry', parseFloat(val));
      this.updateValueDisplay('prop-border-radius', val + 'px');
    });
  }

  addListener(id, callback) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', (e) => {
        callback(e.target.value);
        app.canvas.render();
      });
      element.addEventListener('change', () => {
        app.history.saveState();
      });
    }
  }

  updateValueDisplay(inputId, value) {
    const input = document.getElementById(inputId);
    if (input && input.previousElementSibling) {
      const valueSpan = input.previousElementSibling.querySelector('.property-value');
      if (valueSpan) valueSpan.textContent = value;
    }
  }

  clear() {
    this.currentObject = null;
    const container = document.getElementById('propertiesContent');
    if (container) {
      container.innerHTML = `
        <div class="no-selection">
          <i class="fas fa-hand-pointer"></i>
          <p>Select an object to view properties</p>
        </div>
      `;
    }
  }
}

if (typeof window !== 'undefined') {
  window.PropertiesManager = PropertiesManager;
}
