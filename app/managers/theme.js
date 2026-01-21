// Theme Manager - Handle theme switching and persistence

class ThemeManager {
  constructor() {
    this.currentTheme = 'dark';
    this.themes = ['dark', 'light', 'contrast', 'blue', 'purple'];
    this.isInitializing = true;
  }

  init() {
    console.log('🎨 Initializing Theme Manager...');
    
    this.isInitializing = true;
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && this.themes.includes(savedTheme)) {
      this.setTheme(savedTheme, true);
    } else {
      this.setTheme('dark', true);
    }
    
    this.isInitializing = false;
    
    // Create settings modal if it doesn't exist
    this.createSettingsModal();
  }

  setTheme(themeName, silent = false) {
    if (!this.themes.includes(themeName)) {
      console.warn(`Theme "${themeName}" not found. Using default.`);
      themeName = 'dark';
    }

    // Remove all theme classes
    this.themes.forEach(theme => {
      document.body.classList.remove(`theme-${theme}`);
    });

    // Add new theme class
    document.body.classList.add(`theme-${themeName}`);

    // Save to localStorage
    localStorage.setItem('theme', themeName);

    this.currentTheme = themeName;

    console.log(`✅ Theme set to: ${themeName}`);

    // Show notification only if user actively changed theme (not on init)
    if (!silent && !this.isInitializing && typeof Utils !== 'undefined' && Utils.showToast) {
      const themeNames = {
        'dark': 'Dark',
        'light': 'Light',
        'contrast': 'High Contrast',
        'blue': 'Blue',
        'purple': 'Purple'
      };
      Utils.showToast(`Theme changed to ${themeNames[themeName]}`, 'success');
    }

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));
  }

  getTheme() {
    return this.currentTheme;
  }

  getAvailableThemes() {
    return this.themes;
  }

  showSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.classList.add('active');
      
      // Update selected theme
      const themeInputs = modal.querySelectorAll('input[name="theme"]');
      themeInputs.forEach(input => {
        input.checked = (input.value === this.currentTheme);
      });
    }
  }

  hideSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  createSettingsModal() {
    // Check if modal already exists
    if (document.getElementById('settingsModal')) {
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'settingsModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 600px;">
        <div class="modal-header">
          <h2><i class="fas fa-cog"></i> Settings</h2>
          <button class="close-btn" onclick="app.theme.hideSettingsModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Theme Selection -->
          <div class="settings-section">
            <h3><i class="fas fa-palette"></i> Theme</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">Choose your preferred color theme</p>
            
            <div class="theme-selector">
              <!-- Dark Theme -->
              <label class="theme-option">
                <input type="radio" name="theme" value="dark" ${this.currentTheme === 'dark' ? 'checked' : ''}>
                <div class="theme-card">
                  <div class="theme-preview theme-swatch-dark">
                    <div class="theme-icon"><i class="fas fa-moon"></i></div>
                  </div>
                  <div class="theme-info">
                    <div class="theme-name">Dark</div>
                    <div class="theme-desc">Default theme</div>
                  </div>
                  <div class="theme-check"><i class="fas fa-check-circle"></i></div>
                </div>
              </label>
              
              <!-- Light Theme -->
              <label class="theme-option">
                <input type="radio" name="theme" value="light" ${this.currentTheme === 'light' ? 'checked' : ''}>
                <div class="theme-card">
                  <div class="theme-preview theme-swatch-light">
                    <div class="theme-icon" style="color: #1f2937;"><i class="fas fa-sun"></i></div>
                  </div>
                  <div class="theme-info">
                    <div class="theme-name">Light</div>
                    <div class="theme-desc">Bright & clean</div>
                  </div>
                  <div class="theme-check"><i class="fas fa-check-circle"></i></div>
                </div>
              </label>
              
              <!-- High Contrast Theme -->
              <label class="theme-option">
                <input type="radio" name="theme" value="contrast" ${this.currentTheme === 'contrast' ? 'checked' : ''}>
                <div class="theme-card">
                  <div class="theme-preview theme-swatch-contrast">
                    <div class="theme-icon"><i class="fas fa-adjust"></i></div>
                  </div>
                  <div class="theme-info">
                    <div class="theme-name">High Contrast</div>
                    <div class="theme-desc">Maximum visibility</div>
                  </div>
                  <div class="theme-check"><i class="fas fa-check-circle"></i></div>
                </div>
              </label>
              
              <!-- Blue Theme -->
              <label class="theme-option">
                <input type="radio" name="theme" value="blue" ${this.currentTheme === 'blue' ? 'checked' : ''}>
                <div class="theme-card">
                  <div class="theme-preview theme-swatch-blue">
                    <div class="theme-icon"><i class="fas fa-water"></i></div>
                  </div>
                  <div class="theme-info">
                    <div class="theme-name">Blue</div>
                    <div class="theme-desc">Ocean vibes</div>
                  </div>
                  <div class="theme-check"><i class="fas fa-check-circle"></i></div>
                </div>
              </label>
              
              <!-- Purple Theme -->
              <label class="theme-option">
                <input type="radio" name="theme" value="purple" ${this.currentTheme === 'purple' ? 'checked' : ''}>
                <div class="theme-card">
                  <div class="theme-preview theme-swatch-purple">
                    <div class="theme-icon"><i class="fas fa-star"></i></div>
                  </div>
                  <div class="theme-info">
                    <div class="theme-name">Purple</div>
                    <div class="theme-desc">Royal & elegant</div>
                  </div>
                  <div class="theme-check"><i class="fas fa-check-circle"></i></div>
                </div>
              </label>
            </div>
          </div>

          <!-- Canvas Settings -->
          <div class="settings-section" style="margin-top: 2rem;">
            <h3><i class="fas fa-image"></i> Canvas Defaults</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">Default canvas settings for new projects</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>Default Width</label>
                <input type="number" id="defaultWidth" value="1920" min="1" max="10000">
              </div>
              <div class="form-group">
                <label>Default Height</label>
                <input type="number" id="defaultHeight" value="1080" min="1" max="10000">
              </div>
            </div>
          </div>

          <!-- Keyboard Shortcuts Info -->
          <div class="settings-section" style="margin-top: 2rem;">
            <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h3>
            <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; font-size: 13px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <div><strong>Ctrl+Z</strong> - Undo</div>
                <div><strong>Ctrl+Y</strong> - Redo</div>
                <div><strong>Ctrl+C</strong> - Copy</div>
                <div><strong>Ctrl+V</strong> - Paste</div>
                <div><strong>Ctrl+D</strong> - Duplicate</div>
                <div><strong>Ctrl+G</strong> - Group</div>
                <div><strong>V</strong> - Select Tool</div>
                <div><strong>T</strong> - Text Tool</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" onclick="app.theme.hideSettingsModal()">Close</button>
          <button class="btn-primary" onclick="app.theme.saveSettings()">
            <i class="fas fa-save"></i> Save Settings
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners to theme options
    const themeInputs = modal.querySelectorAll('input[name="theme"]');
    themeInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.setTheme(e.target.value);
        }
      });
    });

    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideSettingsModal();
      }
    });
  }

  saveSettings() {
    // Save canvas defaults
    const width = parseInt(document.getElementById('defaultWidth')?.value);
    const height = parseInt(document.getElementById('defaultHeight')?.value);

    if (width && height) {
      localStorage.setItem('defaultCanvasWidth', width);
      localStorage.setItem('defaultCanvasHeight', height);
    }

    this.hideSettingsModal();
    
    if (typeof Utils !== 'undefined' && Utils.showToast) {
      Utils.showToast('Settings saved successfully!', 'success');
    }
  }
}

if (typeof window !== 'undefined') {
  window.ThemeManager = ThemeManager;
}
