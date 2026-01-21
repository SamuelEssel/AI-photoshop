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
    const fonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia',
      'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
      'Palatino Linotype', 'Lucida Console', 'Lucida Sans Unicode',
      'Garamond', 'Book Antiqua', 'Arial Black', 'Century Gothic'
    ];
    
    const fontOptions = fonts.map(font => 
      `<option value="${font}" ${obj.fontFamily === font ? 'selected' : ''} style="font-family: '${font}'">${font}</option>`
    ).join('');
    
    return `
      <div class="property-group">
        <label>Font Family</label>
        <select id="prop-font-family" style="font-family: '${obj.fontFamily}'">
          ${fontOptions}
        </select>
      </div>
      <div class="property-group">
        <label>Font Size</label>
        <input type="number" id="prop-font-size" value="${obj.fontSize}" min="8" max="200" step="1">
      </div>
      <div class="property-group">
        <label>Font Style</label>
        <div class="text-style-buttons">
          <button class="style-btn ${obj.fontWeight === 'bold' ? 'active' : ''}" id="prop-bold" title="Bold">
            <i class="fas fa-bold"></i>
          </button>
          <button class="style-btn ${obj.fontStyle === 'italic' ? 'active' : ''}" id="prop-italic" title="Italic">
            <i class="fas fa-italic"></i>
          </button>
          <button class="style-btn ${obj.underline ? 'active' : ''}" id="prop-underline" title="Underline">
            <i class="fas fa-underline"></i>
          </button>
          <button class="style-btn ${obj.linethrough ? 'active' : ''}" id="prop-strikethrough" title="Strikethrough">
            <i class="fas fa-strikethrough"></i>
          </button>
        </div>
      </div>
      <div class="property-group">
        <label>Text Align</label>
        <div class="text-style-buttons">
          <button class="style-btn ${obj.textAlign === 'left' ? 'active' : ''}" id="prop-align-left" title="Align Left">
            <i class="fas fa-align-left"></i>
          </button>
          <button class="style-btn ${obj.textAlign === 'center' ? 'active' : ''}" id="prop-align-center" title="Align Center">
            <i class="fas fa-align-center"></i>
          </button>
          <button class="style-btn ${obj.textAlign === 'right' ? 'active' : ''}" id="prop-align-right" title="Align Right">
            <i class="fas fa-align-right"></i>
          </button>
          <button class="style-btn ${obj.textAlign === 'justify' ? 'active' : ''}" id="prop-align-justify" title="Justify">
            <i class="fas fa-align-justify"></i>
          </button>
        </div>
      </div>
      <div class="property-group">
        <label>Line Height</label>
        <input type="number" id="prop-line-height" value="${obj.lineHeight || 1.16}" min="0.5" max="3" step="0.1">
      </div>
      <div class="property-group">
        <label>Letter Spacing</label>
        <input type="number" id="prop-char-spacing" value="${obj.charSpacing || 0}" min="-100" max="500" step="10">
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
    this.addListener('prop-font-family', (val) => { 
      obj.set('fontFamily', val);
      // Update the select element to show the font
      const select = document.getElementById('prop-font-family');
      if (select) select.style.fontFamily = val;
    });
    this.addListener('prop-line-height', (val) => { obj.set('lineHeight', parseFloat(val)); });
    this.addListener('prop-char-spacing', (val) => { obj.set('charSpacing', parseFloat(val)); });

    // Text style buttons
    this.addStyleButton('prop-bold', () => {
      const isBold = obj.fontWeight === 'bold';
      obj.set('fontWeight', isBold ? 'normal' : 'bold');
      return !isBold;
    });
    this.addStyleButton('prop-italic', () => {
      const isItalic = obj.fontStyle === 'italic';
      obj.set('fontStyle', isItalic ? 'normal' : 'italic');
      return !isItalic;
    });
    this.addStyleButton('prop-underline', () => {
      obj.set('underline', !obj.underline);
      return obj.underline;
    });
    this.addStyleButton('prop-strikethrough', () => {
      obj.set('linethrough', !obj.linethrough);
      return obj.linethrough;
    });

    // Text alignment buttons
    this.addStyleButton('prop-align-left', () => {
      obj.set('textAlign', 'left');
      this.updateAlignButtons('left');
      return true;
    });
    this.addStyleButton('prop-align-center', () => {
      obj.set('textAlign', 'center');
      this.updateAlignButtons('center');
      return true;
    });
    this.addStyleButton('prop-align-right', () => {
      obj.set('textAlign', 'right');
      this.updateAlignButtons('right');
      return true;
    });
    this.addStyleButton('prop-align-justify', () => {
      obj.set('textAlign', 'justify');
      this.updateAlignButtons('justify');
      return true;
    });

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

  addStyleButton(id, callback) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        const isActive = callback();
        element.classList.toggle('active', isActive);
        app.canvas.render();
        app.history.saveState();
      });
    }
  }

  updateAlignButtons(activeAlign) {
    const alignments = ['left', 'center', 'right', 'justify'];
    alignments.forEach(align => {
      const btn = document.getElementById(`prop-align-${align}`);
      if (btn) {
        btn.classList.toggle('active', align === activeAlign);
      }
    });
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
