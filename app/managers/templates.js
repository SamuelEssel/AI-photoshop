// Template Manager - Presets for flyers, posters, social media, etc.

class TemplateManager {
  constructor() {
    this.templates = [];
    this.recentSizes = [];
    this.selectedTemplate = null;
    this.selectedBackground = 'white';
  }

  init() {
    console.log('📐 Initializing Template Manager...');
    this.loadTemplates();
    this.loadRecentSizes();
    this.setupEventListeners();
  }

  loadTemplates() {
    this.templates = [
      // Print Materials
      {
        id: 'flyer-letter',
        name: 'Flyer (Letter)',
        width: 2550,
        height: 3300,
        unit: 'px',
        dpi: 300,
        category: 'print',
        description: '8.5" × 11" at 300 DPI',
        icon: 'fa-file-alt'
      },
      {
        id: 'flyer-a4',
        name: 'Flyer (A4)',
        width: 2480,
        height: 3508,
        unit: 'px',
        dpi: 300,
        category: 'print',
        description: '210 × 297 mm at 300 DPI',
        icon: 'fa-file-alt'
      },
      {
        id: 'poster-small',
        name: 'Poster (Small)',
        width: 3300,
        height: 5100,
        unit: 'px',
        dpi: 300,
        category: 'print',
        description: '11" × 17" at 300 DPI',
        icon: 'fa-scroll'
      },
      {
        id: 'poster-medium',
        name: 'Poster (Medium)',
        width: 5400,
        height: 7200,
        unit: 'px',
        dpi: 300,
        category: 'print',
        description: '18" × 24" at 300 DPI',
        icon: 'fa-scroll'
      },
      {
        id: 'poster-large',
        name: 'Poster (Large)',
        width: 7200,
        height: 10800,
        unit: 'px',
        dpi: 300,
        category: 'print',
        description: '24" × 36" at 300 DPI',
        icon: 'fa-scroll'
      },
      {
        id: 'business-card',
        name: 'Business Card',
        width: 1050,
        height: 600,
        unit: 'px',
        dpi: 300,
        category: 'print',
        description: '3.5" × 2" at 300 DPI',
        icon: 'fa-address-card'
      },
      {
        id: 'postcard',
        name: 'Postcard',
        width: 1800,
        height: 1200,
        unit: 'px',
        dpi: 300,
        category: 'print',
        description: '6" × 4" at 300 DPI',
        icon: 'fa-envelope'
      },
      {
        id: 'brochure',
        name: 'Brochure (Tri-fold)',
        width: 3300,
        height: 2550,
        unit: 'px',
        dpi: 300,
        category: 'print',
        description: '11" × 8.5" at 300 DPI',
        icon: 'fa-book-open'
      },

      // Social Media
      {
        id: 'instagram-post',
        name: 'Instagram Post',
        width: 1080,
        height: 1080,
        unit: 'px',
        dpi: 72,
        category: 'social',
        description: '1:1 Square',
        icon: 'fa-instagram'
      },
      {
        id: 'instagram-story',
        name: 'Instagram Story',
        width: 1080,
        height: 1920,
        unit: 'px',
        dpi: 72,
        category: 'social',
        description: '9:16 Portrait',
        icon: 'fa-instagram'
      },
      {
        id: 'facebook-post',
        name: 'Facebook Post',
        width: 1200,
        height: 630,
        unit: 'px',
        dpi: 72,
        category: 'social',
        description: '1200 × 630 px',
        icon: 'fa-facebook'
      },
      {
        id: 'facebook-cover',
        name: 'Facebook Cover',
        width: 820,
        height: 312,
        unit: 'px',
        dpi: 72,
        category: 'social',
        description: '820 × 312 px',
        icon: 'fa-facebook'
      },
      {
        id: 'twitter-post',
        name: 'Twitter Post',
        width: 1200,
        height: 675,
        unit: 'px',
        dpi: 72,
        category: 'social',
        description: '16:9 Landscape',
        icon: 'fa-twitter'
      },
      {
        id: 'twitter-header',
        name: 'Twitter Header',
        width: 1500,
        height: 500,
        unit: 'px',
        dpi: 72,
        category: 'social',
        description: '1500 × 500 px',
        icon: 'fa-twitter'
      },
      {
        id: 'linkedin-post',
        name: 'LinkedIn Post',
        width: 1200,
        height: 627,
        unit: 'px',
        dpi: 72,
        category: 'social',
        description: '1200 × 627 px',
        icon: 'fa-linkedin'
      },
      {
        id: 'youtube-thumbnail',
        name: 'YouTube Thumbnail',
        width: 1280,
        height: 720,
        unit: 'px',
        dpi: 72,
        category: 'social',
        description: '1280 × 720 px',
        icon: 'fa-youtube'
      },
      {
        id: 'pinterest-pin',
        name: 'Pinterest Pin',
        width: 1000,
        height: 1500,
        unit: 'px',
        dpi: 72,
        category: 'social',
        description: '2:3 Portrait',
        icon: 'fa-pinterest'
      },

      // Web
      {
        id: 'web-banner',
        name: 'Web Banner',
        width: 1920,
        height: 500,
        unit: 'px',
        dpi: 72,
        category: 'web',
        description: '1920 × 500 px',
        icon: 'fa-window-maximize'
      },
      {
        id: 'blog-header',
        name: 'Blog Header',
        width: 1200,
        height: 600,
        unit: 'px',
        dpi: 72,
        category: 'web',
        description: '1200 × 600 px',
        icon: 'fa-blog'
      },
      {
        id: 'email-header',
        name: 'Email Header',
        width: 600,
        height: 200,
        unit: 'px',
        dpi: 72,
        category: 'web',
        description: '600 × 200 px',
        icon: 'fa-envelope'
      },
      {
        id: 'desktop-wallpaper',
        name: 'Desktop Wallpaper',
        width: 1920,
        height: 1080,
        unit: 'px',
        dpi: 72,
        category: 'web',
        description: 'Full HD 1920 × 1080',
        icon: 'fa-desktop'
      },
      {
        id: '4k-wallpaper',
        name: '4K Wallpaper',
        width: 3840,
        height: 2160,
        unit: 'px',
        dpi: 72,
        category: 'web',
        description: '4K 3840 × 2160',
        icon: 'fa-desktop'
      },

      // Mobile
      {
        id: 'mobile-screen',
        name: 'Mobile Screen',
        width: 1080,
        height: 1920,
        unit: 'px',
        dpi: 72,
        category: 'mobile',
        description: 'Full HD Portrait',
        icon: 'fa-mobile-alt'
      },
      {
        id: 'tablet-screen',
        name: 'Tablet Screen',
        width: 1536,
        height: 2048,
        unit: 'px',
        dpi: 72,
        category: 'mobile',
        description: 'iPad Pro',
        icon: 'fa-tablet-alt'
      },
      {
        id: 'mobile-wallpaper',
        name: 'Mobile Wallpaper',
        width: 1080,
        height: 1920,
        unit: 'px',
        dpi: 72,
        category: 'mobile',
        description: '9:16 Portrait',
        icon: 'fa-mobile-screen'
      }
    ];

    this.renderTemplates('all');
  }

  renderTemplates(category = 'all') {
    const grid = document.getElementById('templatesGrid');
    if (!grid) return;

    const filtered = category === 'all' 
      ? this.templates 
      : this.templates.filter(t => t.category === category);

    grid.innerHTML = filtered.map(template => `
      <div class="template-card" onclick="app.templates.selectTemplate('${template.id}')">
        <div class="template-icon">
          <i class="fas ${template.icon}"></i>
        </div>
        <div class="template-info">
          <h4>${template.name}</h4>
          <p>${template.description}</p>
          <span class="template-dimensions">${template.width} × ${template.height} px</span>
        </div>
      </div>
    `).join('');
  }

  selectTemplate(templateId) {
    this.selectedTemplate = this.templates.find(t => t.id === templateId);
    
    // Highlight selected template
    document.querySelectorAll('.template-card').forEach(card => {
      card.classList.remove('selected');
    });
    event.target.closest('.template-card').classList.add('selected');
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.new-project-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Category filtering
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderTemplates(btn.dataset.category);
      });
    });

    // Orientation buttons
    document.querySelectorAll('.orientation-btns button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.orientation-btns button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.orientation === 'portrait') {
          this.swapDimensions();
        }
      });
    });

    // Background options
    document.querySelectorAll('.bg-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedBackground = btn.dataset.bg;
        
        if (btn.dataset.bg === 'custom') {
          document.getElementById('customBgColor').click();
        }
      });
    });

    // Custom color picker
    const colorPicker = document.getElementById('customBgColor');
    if (colorPicker) {
      colorPicker.addEventListener('change', (e) => {
        this.selectedBackground = e.target.value;
      });
    }

    // Unit conversion
    const unitSelect = document.getElementById('customUnit');
    if (unitSelect) {
      unitSelect.addEventListener('change', () => {
        this.convertUnits();
      });
    }
  }

  switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.new-project-tabs .tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.new-project-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tab}Tab`).classList.add('active');
  }

  swapDimensions() {
    const widthInput = document.getElementById('customWidth');
    const heightInput = document.getElementById('customHeight');
    
    const temp = widthInput.value;
    widthInput.value = heightInput.value;
    heightInput.value = temp;
  }

  convertUnits() {
    const unit = document.getElementById('customUnit').value;
    const dpi = parseInt(document.getElementById('customDPI').value);
    const widthInput = document.getElementById('customWidth');
    const heightInput = document.getElementById('customHeight');

    // For now, just update labels
    // Full implementation would convert between units
    console.log(`Converting to ${unit} at ${dpi} DPI`);
  }

  createProject() {
    let width, height, background;

    // Get dimensions from selected template or custom
    const activeTab = document.querySelector('.new-project-content.active').id;

    if (activeTab === 'templatesTab' && this.selectedTemplate) {
      width = this.selectedTemplate.width;
      height = this.selectedTemplate.height;
    } else if (activeTab === 'customTab') {
      width = parseInt(document.getElementById('customWidth').value);
      height = parseInt(document.getElementById('customHeight').value);
    } else {
      Utils.showToast('Please select a template or enter custom dimensions', 'warning');
      return;
    }

    // Get background color
    background = this.getBackgroundColor();

    // Save to recent sizes
    this.saveRecentSize(width, height);

    // Create the canvas
    this.createCanvas(width, height, background);

    // Close modal
    app.ui.closeModal('newProjectModal');
  }

  getBackgroundColor() {
    switch (this.selectedBackground) {
      case 'white':
        return '#ffffff';
      case 'black':
        return '#000000';
      case 'transparent':
        return 'transparent';
      case 'custom':
        return document.getElementById('customBgColor').value;
      default:
        return '#ffffff';
    }
  }

  createCanvas(width, height, background) {
    console.log(`Creating canvas: ${width} × ${height}, background: ${background}`);
    
    // Clear existing canvas
    if (app.canvas.canvas) {
      app.canvas.canvas.clear();
    }

    // Set canvas size
    app.canvas.setSize(width, height);

    // Set background
    if (background !== 'transparent') {
      app.canvas.setBackgroundColor(background);
    }

    // Update UI
    document.getElementById('canvasSize').textContent = `${width} × ${height}`;
    
    Utils.showToast(`Canvas created: ${width} × ${height}`, 'success');
  }

  saveRecentSize(width, height) {
    const size = { width, height, timestamp: Date.now() };
    
    // Add to recent sizes (keep last 10)
    this.recentSizes.unshift(size);
    this.recentSizes = this.recentSizes.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('recentSizes', JSON.stringify(this.recentSizes));
    
    // Update UI
    this.renderRecentSizes();
  }

  loadRecentSizes() {
    const saved = localStorage.getItem('recentSizes');
    if (saved) {
      this.recentSizes = JSON.parse(saved);
      this.renderRecentSizes();
    }
  }

  renderRecentSizes() {
    const list = document.getElementById('recentSizesList');
    if (!list) return;

    if (this.recentSizes.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-history"></i>
          <p>No recent sizes yet</p>
        </div>
      `;
      return;
    }

    list.innerHTML = this.recentSizes.map(size => `
      <div class="recent-size-card" onclick="app.templates.useRecentSize(${size.width}, ${size.height})">
        <div class="recent-size-icon">
          <i class="fas fa-file"></i>
        </div>
        <div class="recent-size-info">
          <h4>${size.width} × ${size.height} px</h4>
          <p>${this.formatDate(size.timestamp)}</p>
        </div>
      </div>
    `).join('');
  }

  useRecentSize(width, height) {
    document.getElementById('customWidth').value = width;
    document.getElementById('customHeight').value = height;
    this.switchTab('custom');
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
  }

  showNewProjectDialog() {
    app.ui.showModal('newProjectModal');
  }
}
