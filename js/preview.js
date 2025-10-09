/**
 * Preview JavaScript
 * Handles interactive functionality for the project preview page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize device preview switcher
    initDevicePreview();
    
    // Initialize zoom controls
    initZoomControls();
    
    // Initialize share modal
    initShareModal();
    
    // Initialize notification system
    initNotifications();
});

/**
 * Initialize device preview switcher
 */
function initDevicePreview() {
    const deviceButtons = document.querySelectorAll('.preview-device-btn');
    const frameContainer = document.querySelector('.preview-frame-container');
    
    if (deviceButtons.length && frameContainer) {
        deviceButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                deviceButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get device type
                const deviceType = this.getAttribute('data-device');
                
                // Remove all device classes from frame container
                frameContainer.classList.remove('desktop', 'tablet', 'mobile');
                
                // Add new device class
                frameContainer.classList.add(deviceType);
                
                // Store selected device in local storage
                localStorage.setItem('selectedPreviewDevice', deviceType);
                
                // Reset zoom level when changing device
                setZoomLevel(100);
            });
        });
        
        // Check if device preference is stored in local storage
        const storedDevice = localStorage.getItem('selectedPreviewDevice');
        if (storedDevice) {
            // Find the button for stored device
            const storedDeviceButton = document.querySelector(`.preview-device-btn[data-device="${storedDevice}"]`);
            if (storedDeviceButton) {
                // Trigger click event
                storedDeviceButton.click();
            }
        }
    }
}

/**
 * Initialize zoom controls
 */
function initZoomControls() {
    const zoomInBtn = document.querySelector('.preview-zoom-in');
    const zoomOutBtn = document.querySelector('.preview-zoom-out');
    const zoomResetBtn = document.querySelector('.preview-zoom-reset');
    const zoomLevelEl = document.querySelector('.preview-zoom-level');
    const frameContainer = document.querySelector('.preview-frame-container');
    
    if (zoomInBtn && zoomOutBtn && zoomResetBtn && zoomLevelEl && frameContainer) {
        // Set initial zoom level
        let zoomLevel = 100;
        
        // Zoom in button click
        zoomInBtn.addEventListener('click', function() {
            if (zoomLevel < 200) {
                zoomLevel += 10;
                setZoomLevel(zoomLevel);
            }
        });
        
        // Zoom out button click
        zoomOutBtn.addEventListener('click', function() {
            if (zoomLevel > 50) {
                zoomLevel -= 10;
                setZoomLevel(zoomLevel);
            }
        });
        
        // Zoom reset button click
        zoomResetBtn.addEventListener('click', function() {
            zoomLevel = 100;
            setZoomLevel(zoomLevel);
        });
        
        // Function to set zoom level
        window.setZoomLevel = function(level) {
            zoomLevel = level;
            
            // Update zoom level display
            zoomLevelEl.textContent = `${zoomLevel}%`;
            
            // Apply zoom to frame container
            frameContainer.style.transform = `scale(${zoomLevel / 100})`;
            
            // Store zoom level in local storage
            localStorage.setItem('previewZoomLevel', zoomLevel);
        };
        
        // Check if zoom level is stored in local storage
        const storedZoomLevel = localStorage.getItem('previewZoomLevel');
        if (storedZoomLevel) {
            setZoomLevel(parseInt(storedZoomLevel));
        }
    }
}

/**
 * Initialize share modal
 */
function initShareModal() {
    const shareBtn = document.querySelector('.preview-share-btn');
    const shareModal = document.querySelector('.share-modal');
    const closeBtn = document.querySelector('.share-modal-close');
    const copyLinkBtn = document.querySelector('.copy-link-btn');
    const linkInput = document.querySelector('.share-link-input input');
    
    if (shareBtn && shareModal) {
        // Open share modal
        shareBtn.addEventListener('click', function() {
            shareModal.classList.add('active');
        });
        
        // Close share modal when clicking close button
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                shareModal.classList.remove('active');
            });
        }
        
        // Close share modal when clicking outside
        shareModal.addEventListener('click', function(e) {
            if (e.target === shareModal) {
                shareModal.classList.remove('active');
            }
        });
        
        // Copy link to clipboard
        if (copyLinkBtn && linkInput) {
            copyLinkBtn.addEventListener('click', function() {
                linkInput.select();
                document.execCommand('copy');
                
                // Show notification
                showNotification('Link copied to clipboard!', 'success');
            });
        }
    }
}

/**
 * Initialize notification system
 */
function initNotifications() {
    // Create notifications container if it doesn't exist
    let notificationsContainer = document.querySelector('.notifications-container');
    
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        document.body.appendChild(notificationsContainer);
    }
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info, warning)
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.notifications-container');
    
    if (container) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Create notification content
        notification.innerHTML = `
            <div class="notification-icon">
                ${getNotificationIcon(type)}
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add notification to container
        container.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Add close button event
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeNotification(notification);
            });
        }
        
        // Auto close after duration
        if (duration > 0) {
            setTimeout(() => {
                closeNotification(notification);
            }, duration);
        }
    }
    
    // Function to close notification
    function closeNotification(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // Get icon based on notification type
    function getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"/></svg>';
            case 'error':
                return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/></svg>';
            case 'warning':
                return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/></svg>';
            case 'info':
            default:
                return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/></svg>';
        }
    }
}

/**
 * Handle fullscreen toggle
 */
document.addEventListener('DOMContentLoaded', function() {
    const fullscreenBtn = document.querySelector('.preview-fullscreen-btn');
    const previewContent = document.querySelector('.preview-content');
    
    if (fullscreenBtn && previewContent) {
        fullscreenBtn.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                // Enter fullscreen
                if (previewContent.requestFullscreen) {
                    previewContent.requestFullscreen();
                } else if (previewContent.mozRequestFullScreen) {
                    previewContent.mozRequestFullScreen();
                } else if (previewContent.webkitRequestFullscreen) {
                    previewContent.webkitRequestFullscreen();
                } else if (previewContent.msRequestFullscreen) {
                    previewContent.msRequestFullscreen();
                }
                
                fullscreenBtn.classList.add('active');
                fullscreenBtn.querySelector('i').className = 'fas fa-compress';
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                
                fullscreenBtn.classList.remove('active');
                fullscreenBtn.querySelector('i').className = 'fas fa-expand';
            }
        });
        
        // Update button when fullscreen changes
        document.addEventListener('fullscreenchange', updateFullscreenButton);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
        document.addEventListener('mozfullscreenchange', updateFullscreenButton);
        document.addEventListener('MSFullscreenChange', updateFullscreenButton);
        
        function updateFullscreenButton() {
            if (document.fullscreenElement) {
                fullscreenBtn.classList.add('active');
                fullscreenBtn.querySelector('i').className = 'fas fa-compress';
            } else {
                fullscreenBtn.classList.remove('active');
                fullscreenBtn.querySelector('i').className = 'fas fa-expand';
            }
        }
    }
});

/**
 * Handle download button
 */
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.querySelector('.preview-download-btn');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            // Get project ID from data attribute
            const projectId = this.getAttribute('data-project-id');
            
            if (projectId) {
                // Redirect to download endpoint
                window.location.href = `../download.php?id=${projectId}`;
            } else {
                showNotification('Project ID not found!', 'error');
            }
        });
    }
});