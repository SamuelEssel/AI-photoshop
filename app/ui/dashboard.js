// Dashboard Interactivity

// Project Management
class DashboardProjectManager {
    constructor() {
        this.projects = [];
        this.currentView = 'grid';
    }

    init() {
        this.loadProjects();
        this.renderProjects();
        this.setupViewToggle();
        this.setupSearch();
    }

    loadProjects() {
        // Load from localStorage
        const stored = localStorage.getItem('projects');
        if (stored) {
            try {
                this.projects = JSON.parse(stored);
            } catch (error) {
                console.error('Failed to load projects:', error);
                this.projects = [];
            }
        }

        // Check for autosave
        const autosave = localStorage.getItem('autosave');
        if (autosave) {
            try {
                const autosaveProject = JSON.parse(autosave);
                // Add autosave if not already in projects
                const exists = this.projects.some(p => p.id === autosaveProject.id);
                if (!exists) {
                    this.projects.unshift(autosaveProject);
                }
            } catch (error) {
                console.error('Failed to load autosave:', error);
            }
        }

        // Sort by updatedAt
        this.projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    renderProjects() {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        if (this.projects.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-folder-open" style="font-size: 4rem; color: var(--text-secondary); opacity: 0.3; margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">No projects yet</h3>
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Start creating to see your recent projects here</p>
                    <button onclick="window.location.href='editor.html'" class="btn-primary">
                        <i class="fas fa-plus"></i> Create New Project
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.projects.map(project => this.createProjectCard(project)).join('');

        // Add event listeners
        this.attachProjectListeners();
    }

    createProjectCard(project) {
        const thumbnail = this.generateThumbnail(project);
        const timeAgo = this.getTimeAgo(project.updatedAt);
        
        return `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-thumbnail" onclick="dashboardProjects.openProject('${project.id}')">
                    ${thumbnail}
                    <div class="project-overlay">
                        <button class="overlay-btn" onclick="event.stopPropagation(); dashboardProjects.openProject('${project.id}')" title="Open">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="overlay-btn" onclick="event.stopPropagation(); dashboardProjects.deleteProject('${project.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="project-info">
                    <h3>${this.escapeHtml(project.title || 'Untitled Project')}</h3>
                    <p>Modified ${timeAgo}</p>
                    <p style="font-size: 0.75rem; color: var(--text-muted);">${project.canvasWidth || 1920} × ${project.canvasHeight || 1080}</p>
                </div>
            </div>
        `;
    }

    generateThumbnail(project) {
        // If project has a thumbnail, use it
        if (project.thumbnail) {
            return `<img src="${project.thumbnail}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
        }

        // Generate from canvas data if available
        if (project.canvas && project.canvas.backgroundImage) {
            return `<img src="${project.canvas.backgroundImage.src}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
        }

        // Check if canvas has objects
        if (project.canvas && project.canvas.objects && project.canvas.objects.length > 0) {
            const firstObject = project.canvas.objects[0];
            if (firstObject.type === 'image' && firstObject.src) {
                return `<img src="${firstObject.src}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
            }
        }

        // Fallback to placeholder
        const colors = ['', 'teal', 'blue', 'orange', 'purple'];
        const icons = ['fa-image', 'fa-palette', 'fa-mountain', 'fa-sun', 'fa-star'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];

        return `
            <div class="thumbnail-placeholder ${randomColor}">
                <i class="fas ${randomIcon}"></i>
            </div>
        `;
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 172800) return 'yesterday';
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    openProject(projectId) {
        // Store project ID to load in editor
        sessionStorage.setItem('openProjectId', projectId);
        window.location.href = 'editor.html';
    }

    deleteProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        if (!confirm(`Delete "${project.title || 'Untitled Project'}"? This cannot be undone.`)) {
            return;
        }

        // Remove from array
        this.projects = this.projects.filter(p => p.id !== projectId);

        // Update localStorage
        localStorage.setItem('projects', JSON.stringify(this.projects));

        // Re-render
        this.renderProjects();

        showToast('Project deleted', 'success');
    }

    attachProjectListeners() {
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    setupViewToggle() {
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                this.currentView = button.dataset.view;
                const grid = document.getElementById('projectsGrid');
                
                if (this.currentView === 'list') {
                    grid.classList.add('list-view');
                } else {
                    grid.classList.remove('list-view');
                }
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const projectCards = document.querySelectorAll('.project-card');
            
            projectCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                if (title.includes(query)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Initialize project manager
const dashboardProjects = new DashboardProjectManager();
document.addEventListener('DOMContentLoaded', () => {
    dashboardProjects.init();
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
    
    // Redirect to editor (same directory as dashboard.html)
    window.location.href = 'editor.html';
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

// Assets Panel
function showAssetsPanel() {
    // Create assets modal if doesn't exist
    let modal = document.getElementById('assetsModal');
    if (!modal) {
        modal = createAssetsModal();
        document.body.appendChild(modal);
    }
    
    modal.classList.add('active');
}

function createAssetsModal() {
    const modal = document.createElement('div');
    modal.id = 'assetsModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-dialog" style="max-width: 800px;">
            <div class="modal-header">
                <h2><i class="fas fa-images"></i> Assets Library</h2>
                <button class="close-btn" onclick="hideAssetsModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="settings-section">
                    <h3><i class="fas fa-upload"></i> Upload Assets</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">Upload images, icons, and other design assets</p>
                    
                    <div style="background: var(--bg-tertiary); border: 2px dashed var(--border-color); border-radius: 12px; padding: 3rem; text-align: center; cursor: pointer;" onclick="document.getElementById('assetUpload').click()">
                        <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                        <h4>Click to upload or drag files here</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">Supports: JPG, PNG, SVG, WebP</p>
                    </div>
                    <input type="file" id="assetUpload" hidden accept="image/*" multiple>
                </div>
                
                <div class="settings-section" style="margin-top: 2rem;">
                    <h3><i class="fas fa-layer-group"></i> Recent Assets</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">Your recently uploaded assets</p>
                    
                    <div style="background: var(--bg-tertiary); border-radius: 12px; padding: 2rem; text-align: center;">
                        <i class="fas fa-folder-open" style="font-size: 3rem; color: var(--text-secondary); opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p style="color: var(--text-secondary);">No assets uploaded yet</p>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">Upload some images to see them here</p>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn-secondary" onclick="hideAssetsModal()">Close</button>
            </div>
        </div>
    `;
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideAssetsModal();
        }
    });
    
    // Handle file upload
    const fileInput = modal.querySelector('#assetUpload');
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            showToast(`${e.target.files.length} file(s) uploaded successfully!`, 'success');
            // In a real app, you'd save these to localStorage or a backend
        }
    });
    
    return modal;
}

function hideAssetsModal() {
    const modal = document.getElementById('assetsModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

window.showDashboardSettings = showDashboardSettings;
window.hideSettingsModal = hideSettingsModal;
window.showAssetsPanel = showAssetsPanel;
window.hideAssetsModal = hideAssetsModal;

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

// Toast notification helper (if Utils.showToast not available)
function showToast(message, type = 'info') {
    if (typeof Utils !== 'undefined' && Utils.showToast) {
        Utils.showToast(message, type);
        return;
    }

    // Fallback toast implementation
    const container = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span style="font-size: 1.25rem;">${icons[type] || icons.info}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 10000;
        display: flex;
        flex-direction: column;
    `;
    document.body.appendChild(container);
    return container;
}
