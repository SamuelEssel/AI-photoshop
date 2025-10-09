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
      <div class="modal-dialog">
        <div class="modal-header">
          <h2><i class="fas fa-download"></i> Export Design</h2>
          <button class="close-btn" onclick="app.ui.closeModal('exportModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
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
            </div>
          </div>
          
          <div id="exportOptions">
            <div class="form-group">
              <label>Quality</label>
              <input type="range" id="exportQuality" min="0.1" max="1" step="0.1" value="0.9">
            </div>
            <div class="form-group">
              <label>Scale</label>
              <select id="exportScale">
                <option value="1">1x (Original)</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="4">4x</option>
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

  selectFormat(format) {
    this.selectedFormat = format;
    
    document.querySelectorAll('.export-format-item').forEach(item => {
      item.classList.toggle('active', item.dataset.format === format);
    });

    // Show/hide options based on format
    const options = document.getElementById('exportOptions');
    if (options) {
      options.style.display = format === 'SVG' ? 'none' : 'block';
    }
  }

  async exportNow() {
    const format = this.selectedFormat;
    const quality = parseFloat(document.getElementById('exportQuality')?.value || 0.9);
    const scale = parseFloat(document.getElementById('exportScale')?.value || 1);

    app.ui.closeModal('exportModal');
    Utils.showLoading(`Exporting as ${format}...`);

    try {
      let data, filename, mimeType;

      switch (format) {
        case 'PNG':
          data = app.canvas.toDataURL('png', quality);
          filename = `${app.project.currentProject?.title || 'design'}.png`;
          mimeType = 'image/png';
          break;

        case 'JPEG':
          data = app.canvas.toDataURL('jpeg', quality);
          filename = `${app.project.currentProject?.title || 'design'}.jpg`;
          mimeType = 'image/jpeg';
          break;

        case 'SVG':
          data = app.canvas.toSVG();
          filename = `${app.project.currentProject?.title || 'design'}.svg`;
          mimeType = 'image/svg+xml';
          break;

        case 'JSON':
          data = JSON.stringify(app.canvas.toJSON(), null, 2);
          filename = `${app.project.currentProject?.title || 'design'}.json`;
          mimeType = 'application/json';
          break;

        default:
          throw new Error('Unsupported format');
      }

      // Download file
      if (data.startsWith('data:')) {
        // Base64 data URL
        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        link.click();
      } else {
        // Plain text
        Utils.downloadFile(data, filename, mimeType);
      }

      Utils.showToast(`Exported as ${format}!`, 'success');

    } catch (error) {
      Utils.showToast('Export failed: ' + error.message, 'error');
    } finally {
      Utils.hideLoading();
    }
  }

  async exportPDF() {
    Utils.showToast('PDF export requires additional library', 'info');
    // TODO: Implement PDF export using jsPDF
  }
}

if (typeof window !== 'undefined') {
  window.ExportManager = ExportManager;
}
