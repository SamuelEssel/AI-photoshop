// Navigation System for AI Design Studio

function navigateTo(page) {
    const routes = {
        'landing': '../index-landing.html',
        'onboarding': 'onboarding.html',
        'dashboard': 'dashboard.html',
        'generate': 'generate.html',
        'editor': 'editor.html'
    };
    
    if (routes[page]) {
        window.location.href = routes[page];
    }
}

// Check if first visit
document.addEventListener('DOMContentLoaded', function() {
    const hasVisited = localStorage.getItem('hasVisited');
    
    if (!hasVisited && window.location.pathname.includes('landing')) {
        // First visit - show onboarding after landing
        console.log('First visit detected');
    }
});

// Save user preferences
function savePreferences(theme, canvasSize) {
    localStorage.setItem('theme', theme);
    localStorage.setItem('defaultCanvas', canvasSize);
    localStorage.setItem('hasVisited', 'true');
}

// Get user preferences
function getPreferences() {
    return {
        theme: localStorage.getItem('theme') || 'dark',
        defaultCanvas: localStorage.getItem('defaultCanvas') || 'poster',
        hasVisited: localStorage.getItem('hasVisited') === 'true'
    };
}

// Apply theme
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
}

// Initialize
const prefs = getPreferences();
applyTheme(prefs.theme);
