/**
 * Settings JavaScript
 * Handles interactive functionality for the settings page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar toggle functionality
    initSidebar();
    
    // Initialize settings tabs
    initSettingsTabs();
    
    // Initialize form validation
    initFormValidation();
    
    // Initialize password strength meter
    initPasswordStrength();
    
    // Initialize theme switcher
    initThemeSwitcher();
    
    // Initialize notification system
    initNotifications();
});

/**
 * Initialize sidebar toggle functionality
 */
function initSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            if (mainContent) {
                mainContent.classList.toggle('expanded');
            }
            
            // Store sidebar state in local storage
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });
        
        // Check if sidebar state is stored in local storage
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            if (mainContent) {
                mainContent.classList.add('expanded');
            }
        }
    }
}

/**
 * Initialize settings tabs
 */
function initSettingsTabs() {
    const navLinks = document.querySelectorAll('.settings-nav-link');
    const contentSections = document.querySelectorAll('.settings-section');
    
    if (navLinks.length && contentSections.length) {
        // Show active section and hide others
        function showSection(sectionId) {
            contentSections.forEach(section => {
                if (section.id === sectionId) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
            
            // Update active nav link
            navLinks.forEach(link => {
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            
            // Update URL hash
            window.location.hash = sectionId;
            
            // Store active section in local storage
            localStorage.setItem('activeSettingsSection', sectionId);
        }
        
        // Add click event to nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('href').substring(1);
                showSection(sectionId);
            });
        });
        
        // Check if section is specified in URL hash
        let activeSection = window.location.hash.substring(1);
        
        // If no hash in URL, check local storage
        if (!activeSection) {
            activeSection = localStorage.getItem('activeSettingsSection');
        }
        
        // If still no active section, use first one
        if (!activeSection || !document.getElementById(activeSection)) {
            activeSection = contentSections[0].id;
        }
        
        // Show active section
        showSection(activeSection);
    }
}

/**
 * Initialize form validation
 */
function initFormValidation() {
    const forms = document.querySelectorAll('.settings-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check if form is valid
            if (validateForm(form)) {
                // Show loading state
                const submitBtn = form.querySelector('[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.textContent;
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Saving...';
                    
                    // Simulate form submission (replace with actual AJAX call)
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                        
                        // Show success notification
                        showNotification('Settings saved successfully!', 'success');
                    }, 1000);
                }
            }
        });
    });
    
    // Form validation function
    function validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Skip inputs that don't need validation
            if (input.type === 'submit' || input.type === 'button' || input.type === 'hidden') {
                return;
            }
            
            // Check required fields
            if (input.hasAttribute('required') && !input.value.trim()) {
                markInvalid(input, 'This field is required');
                isValid = false;
                return;
            }
            
            // Email validation
            if (input.type === 'email' && input.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value.trim())) {
                    markInvalid(input, 'Please enter a valid email address');
                    isValid = false;
                    return;
                }
            }
            
            // Password validation
            if (input.type === 'password' && input.id === 'newPassword' && input.value.trim()) {
                if (input.value.length < 8) {
                    markInvalid(input, 'Password must be at least 8 characters long');
                    isValid = false;
                    return;
                }
            }
            
            // Password confirmation validation
            if (input.type === 'password' && input.id === 'confirmPassword' && input.value.trim()) {
                const newPassword = form.querySelector('#newPassword');
                if (newPassword && input.value !== newPassword.value) {
                    markInvalid(input, 'Passwords do not match');
                    isValid = false;
                    return;
                }
            }
            
            // Mark as valid
            markValid(input);
        });
        
        return isValid;
    }
    
    // Mark input as invalid
    function markInvalid(input, message) {
        input.classList.add('is-invalid');
        
        // Find or create error message element
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('invalid-feedback')) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        
        errorElement.textContent = message;
    }
    
    // Mark input as valid
    function markValid(input) {
        input.classList.remove('is-invalid');
        
        // Remove error message if exists
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('invalid-feedback')) {
            errorElement.textContent = '';
        }
    }
    
    // Add input event listeners for real-time validation
    const allInputs = document.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (input.classList.contains('is-invalid')) {
                markValid(input);
            }
        });
    });
}

/**
 * Initialize password strength meter
 */
function initPasswordStrength() {
    const passwordInput = document.getElementById('newPassword');
    const strengthMeter = document.getElementById('passwordStrength');
    
    if (passwordInput && strengthMeter) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            // Update strength meter based on password
            if (password.length >= 8) strength += 1;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
            if (password.match(/\d/)) strength += 1;
            if (password.match(/[^a-zA-Z\d]/)) strength += 1;
            
            // Update strength meter UI
            strengthMeter.className = 'password-strength';
            
            if (password.length === 0) {
                strengthMeter.textContent = '';
            } else if (strength < 2) {
                strengthMeter.textContent = 'Weak';
                strengthMeter.classList.add('weak');
            } else if (strength < 4) {
                strengthMeter.textContent = 'Medium';
                strengthMeter.classList.add('medium');
            } else {
                strengthMeter.textContent = 'Strong';
                strengthMeter.classList.add('strong');
            }
        });
    }
}

/**
 * Initialize theme switcher
 */
function initThemeSwitcher() {
    const themeOptions = document.querySelectorAll('.theme-option');
    
    if (themeOptions.length) {
        themeOptions.forEach(option => {
            const input = option.querySelector('input[type="radio"]');
            
            if (input) {
                input.addEventListener('change', function() {
                    if (this.checked) {
                        // Remove active class from all options
                        themeOptions.forEach(opt => opt.classList.remove('active'));
                        
                        // Add active class to selected option
                        option.classList.add('active');
                        
                        // Apply theme
                        applyTheme(this.value);
                    }
                });
                
                // Check if this option is active
                if (input.checked) {
                    option.classList.add('active');
                }
            }
        });
        
        // Function to apply theme
        function applyTheme(theme) {
            // Store theme preference
            localStorage.setItem('theme', theme);
            
            // Apply theme to body
            document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
            document.body.classList.add('theme-' + theme);
            
            // Show notification
            showNotification('Theme updated to ' + theme.charAt(0).toUpperCase() + theme.slice(1), 'info');
        }
        
        // Check if theme is stored in local storage
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            const themeInput = document.querySelector(`.theme-option input[value="${storedTheme}"]`);
            if (themeInput && !themeInput.checked) {
                themeInput.checked = true;
                themeInput.dispatchEvent(new Event('change'));
            }
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
 * Handle avatar upload
 */
document.addEventListener('DOMContentLoaded', function() {
    const avatarInput = document.getElementById('avatarUpload');
    const avatarPreview = document.querySelector('.avatar-preview img');
    
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                };
                
                reader.readAsDataURL(this.files[0]);
                
                // Show notification
                showNotification('Avatar uploaded successfully. Click Save to apply changes.', 'info');
            }
        });
    }
    
    // Handle avatar remove button
    const removeAvatarBtn = document.querySelector('.avatar-remove-btn');
    if (removeAvatarBtn && avatarPreview) {
        removeAvatarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Set default avatar
            avatarPreview.src = 'assets/images/default-avatar.png';
            
            // Clear file input
            if (avatarInput) {
                avatarInput.value = '';
            }
            
            // Show notification
            showNotification('Avatar removed. Click Save to apply changes.', 'info');
        });
    }
});