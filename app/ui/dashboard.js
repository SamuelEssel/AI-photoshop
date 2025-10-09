// Dashboard Interactivity

// View toggle (grid/list)
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const view = this.dataset.view;
        const grid = document.getElementById('projectsGrid');
        
        if (view === 'list') {
            grid.classList.add('list-view');
        } else {
            grid.classList.remove('list-view');
        }
    });
});

// Search functionality
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        const projects = document.querySelectorAll('.project-card');
        
        projects.forEach(project => {
            const title = project.querySelector('h3').textContent.toLowerCase();
            if (title.includes(query)) {
                project.style.display = '';
            } else {
                project.style.display = 'none';
            }
        });
    });
}

// File upload handler
document.getElementById('uploadFile')?.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        // Redirect to editor with uploaded file
        window.location.href = 'editor.html';
    }
});

// Project card hover animation
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Notification badge click
document.querySelector('.notification-badge')?.addEventListener('click', function(e) {
    e.stopPropagation();
    alert('You have 3 new notifications:\n\n1. Project "Abstract Design" was shared\n2. New template available\n3. AI generation complete');
});

// Settings click
document.querySelectorAll('.btn-icon').forEach(btn => {
    const icon = btn.querySelector('i');
    if (icon?.classList.contains('fa-cog')) {
        btn.addEventListener('click', function() {
            alert('Settings panel coming soon!\n\nWill include:\n- Theme preferences\n- Canvas defaults\n- Account settings\n- Keyboard shortcuts');
        });
    }
});

// User avatar menu
document.querySelector('.user-avatar')?.addEventListener('click', function() {
    alert('User Menu:\n\n- Profile\n- Account Settings\n- Billing\n- Help & Support\n- Sign Out');
});

// Add animation class on load
window.addEventListener('load', function() {
    document.querySelectorAll('.action-card, .project-card, .template-card').forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s backwards`;
        }, 50);
    });
});

// Welcome message for first-time users
const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
if (prefs.theme && !sessionStorage.getItem('welcomeShown')) {
    sessionStorage.setItem('welcomeShown', 'true');
    
    // Show welcome toast
    showToast('Welcome to AI Design Studio! 🎨', 'success');
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #1C1C1C;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        border-left: 4px solid ${type === 'success' ? '#43A047' : '#00BFA6'};
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        animation: slideInRight 0.3s ease;
        z-index: 10000;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N - New project
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        window.location.href = 'generate.html';
    }
    
    // Ctrl/Cmd + O - Open project
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        document.querySelector('.project-card')?.click();
    }
    
    // Escape - Close any modals
    if (e.key === 'Escape') {
        // Close modals if any
    }
});

// Add CSS animation definitions if not already present
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Template opening functionality
function openTemplate(templateName, width, height) {
    // Store template info in sessionStorage
    sessionStorage.setItem('templateInfo', JSON.stringify({
        name: templateName,
        width: width,
        height: height
    }));
    
    // Redirect to editor
    window.location.href = '../editor.html';
}

// Scroll to templates section
function scrollToTemplates() {
    const templatesSection = document.querySelector('.templates-section');
    if (templatesSection) {
        templatesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Highlight templates briefly
        templatesSection.style.transition = 'background 0.5s ease';
        templatesSection.style.background = 'rgba(0, 191, 166, 0.1)';
        setTimeout(() => {
            templatesSection.style.background = '';
        }, 1000);
    }
}

// Make functions globally available
window.openTemplate = openTemplate;
window.scrollToTemplates = scrollToTemplates;

// Dashboard Settings (Theme Switcher Modal)
function showDashboardSettings() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    // Create modal if doesn't exist
    let modal = document.getElementById('dashboardSettingsModal');
    if (!modal) {
        modal = createSettingsModal(currentTheme);
        document.body.appendChild(modal);
    }
    
    // Update selected theme
    const themeInputs = modal.querySelectorAll('input[name="theme"]');
    themeInputs.forEach(input => {
        input.checked = (input.value === currentTheme);
    });
    
    modal.classList.add('active');
}

function createSettingsModal(currentTheme) {
    const modal = document.createElement('div');
    modal.id = 'dashboardSettingsModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-dialog" style="max-width: 600px;">
            <div class="modal-header">
                <h2><i class="fas fa-cog"></i> Settings</h2>
                <button class="close-btn" onclick="hideSettingsModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="settings-section">
                    <h3><i class="fas fa-palette"></i> Theme</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">Choose your preferred color theme</p>
                    
                    <div class="theme-selector">
                        <label class="theme-option">
                            <input type="radio" name="theme" value="dark" ${currentTheme === 'dark' ? 'checked' : ''}>
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
                        
                        <label class="theme-option">
                            <input type="radio" name="theme" value="light" ${currentTheme === 'light' ? 'checked' : ''}>
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
                        
                        <label class="theme-option">
                            <input type="radio" name="theme" value="contrast" ${currentTheme === 'contrast' ? 'checked' : ''}>
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
                        
                        <label class="theme-option">
                            <input type="radio" name="theme" value="blue" ${currentTheme === 'blue' ? 'checked' : ''}>
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
                        
                        <label class="theme-option">
                            <input type="radio" name="theme" value="purple" ${currentTheme === 'purple' ? 'checked' : ''}>
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
            </div>
            
            <div class="modal-footer">
                <button class="btn-secondary" onclick="hideSettingsModal()">Close</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const themeInputs = modal.querySelectorAll('input[name="theme"]');
    themeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.checked) {
                setTheme(e.target.value);
            }
        });
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideSettingsModal();
        }
    });
    
    return modal;
}

function hideSettingsModal() {
    const modal = document.getElementById('dashboardSettingsModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function setTheme(themeName) {
    const themes = ['dark', 'light', 'contrast', 'blue', 'purple'];
    
    // Remove all theme classes
    themes.forEach(theme => {
        document.body.classList.remove(`theme-${theme}`);
    });
    
    // Add new theme
    document.body.classList.add(`theme-${themeName}`);
    
    // Save to localStorage
    localStorage.setItem('theme', themeName);
    
    // Show notification
    showToast(`Theme changed to ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}!`, 'success');
}

// Load saved theme on page load
window.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }
});

window.showDashboardSettings = showDashboardSettings;
window.hideSettingsModal = hideSettingsModal;

// Add cursor pointer to clickable elements
document.addEventListener('DOMContentLoaded', function() {
    // Make template cards show pointer cursor
    document.querySelectorAll('.template-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Make nav items show pointer cursor
    document.querySelectorAll('.nav-item').forEach(item => {
        item.style.cursor = 'pointer';
    });
});
