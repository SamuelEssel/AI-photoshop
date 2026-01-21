// Export Management Module

class ExportManager {
  constructor() {
    this.selectedFormat = 'PNG';
  }

  showDialog() {
    // Create export modal if it doesn't exist
    if (!document.getElementById('exportModal')) {
      this.createExportModal();
    }

    const modal = document.getElementById('exportModal');
    modal.classList.add('active');
  }

  createExportModal() {
    const modal = document.createElement('div');
    modal.id = 'exportModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 600px;">
        <div class="modal-header">
          <h2><i class="fas fa-download"></i> Export Design</h2>
          <button class="close-btn" onclick="app.ui.closeModal('exportModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <!-- Export Presets -->
          <div class="form-group">
            <label>Export Preset</label>
            <select id="exportPreset" onchange="app.export.applyPreset(this.value)">
              <option value="custom">Custom</option>
              <option value="web">Web (PNG, High Quality)</option>
              <option value="social">Social Media (JPEG, 2x Scale)</option>
              <option value="print">Print (PNG, 4x Scale)</option>
              <option value="vector">Vector (SVG)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Export Format</label>
            <div class="export-format-grid">
              <div class="export-format-item active" data-format="PNG" onclick="app.export.selectFormat('PNG')">
                <div class="export-format-icon"><i class="fas fa-file-image"></i></div>
                <div class="export-format-name">PNG</div>
                <div class="export-format-desc">Best for web</div>
              </div>
              <div class="export-format-item" data-format="JPEG" onclick="app.export.selectFormat('JPEG')">
                <div class="export-format-icon"><i class="fas fa-file-image"></i></div>
                <div class="export-format-name">JPEG</div>
                <div class="export-format-desc">Smaller size</div>
              </div>
              <div class="export-format-item" data-format="SVG" onclick="app.export.selectFormat('SVG')">
                <div class="export-format-icon"><i class="fas fa-vector-square"></i></div>
                <div class="export-format-name">SVG</div>
                <div class="export-format-desc">Vector</div>
              </div>
              <div class="export-format-item" data-format="PDF" onclick="app.export.selectFormat('PDF')">
                <div class="export-format-icon"><i class="fas fa-file-pdf"></i></div>
                <div class="export-format-name">PDF</div>
                <div class="export-format-desc">Document</div>
              </div>
            </div>
          </div>
          
          <div id="exportOptions">
            <div class="form-group">
              <label>Quality: <span id="qualityValue">90%</span></label>
              <input type="range" id="exportQuality" min="0.1" max="1" step="0.1" value="0.9" oninput="document.getElementById('qualityValue').textContent = Math.round(this.value * 100) + '%'">
            </div>
            <div class="form-group">
              <label>Scale</label>
              <select id="exportScale">
                <option value="1">1x (Original)</option>
                <option value="2">2x (Retina)</option>
                <option value="3">3x</option>
                <option value="4">4x (Print)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Background</label>
              <select id="exportBackground">
                <option value="white">White</option>
                <option value="transparent">Transparent (PNG only)</option>
                <option value="original">Original Canvas</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="app.ui.closeModal('exportModal')">Cancel</button>
          <button class="btn-primary" onclick="app.export.exportNow()">
            <i class="fas fa-download"></i> Export
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  applyPreset(preset) {
    const qualityInput = document.getElementById('exportQuality');
    const scaleSelect = document.getElementById('exportScale');
    
    switch(preset) {
      case 'web':
        this.selectFormat('PNG');
        if (qualityInput) qualityInput.value = 0.9;
        if (scaleSelect) scaleSelect.value = '1';
        break;
      case 'social':
        this.selectFormat('JPEG');
        if (qualityInput) qualityInput.value = 0.8;
        if (scaleSelect) scaleSelect.value = '2';
        break;
      case 'print':
        this.selectFormat('PNG');
        if (qualityInput) qualityInput.value = 1;
        if (scaleSelect) scaleSelect.value = '4';
        break;
      case 'vector':
        this.selectFormat('SVG');
        break;
    }
    
    // Update quality display
    document.getElementById('qualityValue').textContent = Math.round(qualityInput.value * 100) + '%';
  }

  selectFormat(format) {
    this.selectedFormat = format;
    
    document.querySelectorAll('.export-format-item').forEach(item => {
      item.classList.toggle('active', item.dataset.format === format);
    });

    // Show/hide options based on format
    const options = document.getElementById('exportOptions');
    const bgSelect = document.getElementById('exportBackground');
    
    if (options) {
      options.style.display = (format === 'SVG' || format === 'PDF') ? 'none' : 'block';
    }
    
    // Update preset selector
    document.getElementById('exportPreset').value = 'custom';
  }

  async exportNow() {
    const format = this.selectedFormat;
    const quality = parseFloat(document.getElementById('exportQuality')?.value || 0.9);
    const scale = parseFloat(document.getElementById('exportScale')?.value || 1);
    const bgOption = document.getElementById('exportBackground')?.value || 'original';

    app.ui.closeModal('exportModal');
    Utils.showLoading(`Exporting as ${format}...`);

    try {
      let data, filename, mimeType;
      const projectName = app.project.currentProject?.title || 'design';

      // Handle background option
      const originalBg = app.canvas.canvas.backgroundColor;
      if (bgOption === 'white') {
        app.canvas.canvas.backgroundColor = '#ffffff';
      } else if (bgOption === 'transparent') {
        app.canvas.canvas.backgroundColor = null;
      }

      switch (format) {
        case 'PNG':
          data = this.exportWithScale('png', quality, scale);
          filename = `${projectName}.png`;
          mimeType = 'image/png';
          break;

        case 'JPEG':
          data = this.exportWithScale('jpeg', quality, scale);
          filename = `${projectName}.jpg`;
          mimeType = 'image/jpeg';
          break;

        case 'SVG':
          data = app.canvas.canvas.toSVG();
          filename = `${projectName}.svg`;
          mimeType = 'image/svg+xml';
          break;

        case 'PDF':
          await this.exportPDF(projectName, quality, scale);
          // Restore background
          app.canvas.canvas.backgroundColor = originalBg;
          app.canvas.canvas.renderAll();
          Utils.showToast('Exported as PDF!', 'success');
          Utils.hideLoading();
          return; // Early return for PDF

        case 'JSON':
          data = JSON.stringify(app.canvas.toJSON(), null, 2);
          filename = `${projectName}.json`;
          mimeType = 'application/json';
          break;

        default:
          throw new Error('Unsupported format');
      }

      // Restore original background
      app.canvas.canvas.backgroundColor = originalBg;
      app.canvas.canvas.renderAll();

      // Download file
      if (data.startsWith('data:')) {
        // Base64 data URL
        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Plain text
        Utils.downloadFile(data, filename, mimeType);
      }

      Utils.showToast(`Exported as ${format}!`, 'success');

    } catch (error) {
      console.error('Export error:', error);
      Utils.showToast('Export failed: ' + error.message, 'error');
    } finally {
      Utils.hideLoading();
    }
  }

  exportWithScale(format, quality, scale) {
    if (scale === 1) {
      return app.canvas.canvas.toDataURL(`image/${format}`, quality);
    }

    // Export with scaling
    const originalWidth = app.canvas.canvas.width;
    const originalHeight = app.canvas.canvas.height;
    const multiplier = scale;

    // Set canvas multiplier
    app.canvas.canvas.setWidth(originalWidth * multiplier);
    app.canvas.canvas.setHeight(originalHeight * multiplier);
    app.canvas.canvas.setZoom(multiplier);

    // Export
    const dataUrl = app.canvas.canvas.toDataURL(`image/${format}`, quality);

    // Restore original size
    app.canvas.canvas.setWidth(originalWidth);
    app.canvas.canvas.setHeight(originalHeight);
    app.canvas.canvas.setZoom(1);
    app.canvas.canvas.renderAll();

    return dataUrl;
  }

  async exportPDF(filename, quality, scale) {
    try {
      // Check if jsPDF is loaded
      if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        // Load jsPDF dynamically
        await this.loadJsPDF();
      }

      const { jsPDF } = window.jspdf || window;
      
      // Get canvas dimensions
      const canvas = app.canvas.canvas;
      const width = canvas.width * scale;
      const height = canvas.height * scale;
      
      // Convert to mm (jsPDF uses mm)
      const pdfWidth = width * 0.264583; // pixels to mm
      const pdfHeight = height * 0.264583;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      // Export canvas as image
      const imgData = this.exportWithScale('png', quality, scale);
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Save PDF
      pdf.save(`${filename}.pdf`);
      
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('PDF export failed. jsPDF library may not be loaded.');
    }
  }

  async loadJsPDF() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load jsPDF'));
      document.head.appendChild(script);
    });
  }
}

if (typeof window !== 'undefined') {
  window.ExportManager = ExportManager;
}
