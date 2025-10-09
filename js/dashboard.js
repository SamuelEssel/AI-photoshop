/**
 * Dashboard JavaScript
 * Handles interactive functionality for the dashboard page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard components
    initSidebar();
    initProjectCards();
    initTemplateCards();
    initNotifications();
});

/**
 * Initialize sidebar functionality
 */
function initSidebar() {
    // Toggle sidebar on mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggle = sidebarToggle && sidebarToggle.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnToggle && window.innerWidth < 992 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
}

/**
 * Initialize project card interactions
 */
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Add click event to project cards (excluding action buttons)
        card.addEventListener('click', function(event) {
            // Check if the click was on an action button
            if (!event.target.closest('.action-btn')) {
                const projectId = this.dataset.projectId || 
                                 this.querySelector('.action-btn.view-btn')?.href.split('id=')[1];
                
                if (projectId) {
                    window.location.href = `view_project.php?id=${projectId}`;
                }
            }
        });
    });
}

/**
 * Initialize template card interactions
 */
function initTemplateCards() {
    const templateCards = document.querySelectorAll('.template-card');
    
    templateCards.forEach(card => {
        // Add click event to template cards (excluding use button)
        card.addEventListener('click', function(event) {
            // Check if the click was on the use button
            if (!event.target.closest('.use-btn')) {
                const templateId = this.dataset.templateId || 
                                  this.querySelector('.use-btn')?.href.split('template=')[1];
                
                if (templateId) {
                    window.location.href = `editor.php?template=${templateId}`;
                }
            }
        });
    });
}

/**
 * Initialize notification system
 */
function initNotifications() {
    // Check for welcome notification
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('welcome')) {
        showNotification('Welcome to your dashboard!', 'success');
    }
}

/**
 * Show notification message
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, info, warning)
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Create notification content
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.innerHTML = `
        <i class="notification-icon fas fa-${getIconForType(type)}"></i>
        <span>${message}</span>
    `;
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.addEventListener('click', () => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Assemble notification
    notification.appendChild(content);
    notification.appendChild(closeBtn);
    
    // Add to document
    const notificationsContainer = document.querySelector('.notifications-container');
    if (!notificationsContainer) {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
        container.appendChild(notification);
    } else {
        notificationsContainer.appendChild(notification);
    }
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('notification-show');
    }, 10);
    
    // Auto-hide after duration
    if (duration) {
        setTimeout(() => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
}

/**
 * Get icon for notification type
 * @param {string} type - Notification type
 * @returns {string} - Icon name
 */
function getIconForType(type) {
    switch (type) {
        case 'success':
            return 'check-circle';
        case 'error':
            return 'exclamation-circle';
        case 'warning':
            return 'exclamation-triangle';
        case 'info':
        default:
            return 'info-circle';
    }
}

/**
 * Format date to relative time (e.g., "2 days ago")
 * @param {string} dateString - Date string
 * @returns {string} - Formatted relative time
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}