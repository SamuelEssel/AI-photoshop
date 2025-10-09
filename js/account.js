document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const sidebarLinks = document.querySelectorAll('.account-sidebar-link');
    const sections = document.querySelectorAll('.account-section');
    
    // Mobile menu toggle
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    const accountSidebar = document.querySelector('.account-sidebar');
    const accountSidebarNav = document.querySelector('.account-sidebar-nav');
    
    // Insert mobile menu toggle before the sidebar
    accountSidebar.parentNode.insertBefore(mobileMenuToggle, accountSidebar);
    
    // Mobile menu functionality
    mobileMenuToggle.addEventListener('click', function() {
        accountSidebar.classList.toggle('mobile-visible');
        this.innerHTML = accountSidebar.classList.contains('mobile-visible') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    
    // Add mobile menu styles
    const mobileStyles = document.createElement('style');
    mobileStyles.textContent = `
        .mobile-menu-toggle {
            display: none;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
            cursor: pointer;
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        @media (max-width: 768px) {
            .mobile-menu-toggle {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .account-sidebar {
                position: fixed;
                left: -100%;
                top: 0;
                height: 100vh;
                z-index: 999;
                transition: left 0.3s ease;
                overflow-y: auto;
            }
            
            .account-sidebar.mobile-visible {
                left: 0;
                width: 80%;
                max-width: 300px;
            }
        }
    `;
    document.head.appendChild(mobileStyles);

    // Handle sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Skip if it's the "Back to Profile" link
            if (this.getAttribute('href') === 'profile.php') return;
            
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.style.display = 'none');
            
            // Show the target section
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).style.display = 'block';
            
            // Close mobile menu after clicking a link
            if (window.innerWidth <= 768) {
                accountSidebar.classList.remove('mobile-visible');
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    // Show only the first section initially
    sections.forEach((section, index) => {
        section.style.display = index === 0 ? 'block' : 'none';
    });

    // Avatar upload preview
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatar-preview-img');
    const removeAvatarBtn = document.getElementById('remove-avatar');
    
    // Store original avatar URL
    const originalAvatarSrc = avatarPreview.src;

    avatarUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    removeAvatarBtn.addEventListener('click', function() {
        // Reset to default avatar or original avatar
        avatarPreview.src = originalAvatarSrc;
        avatarUpload.value = '';
    });

    // Form submission handling
    const profileForm = document.getElementById('profile-form');
    const securityForm = document.getElementById('security-form');
    const notificationsForm = document.getElementById('notifications-form');

    // Profile form submission
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            bio: document.getElementById('bio').value,
            website: document.getElementById('website').value
        };
        
        // Validate form data
        if (!formData.firstName || !formData.lastName || !formData.email) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // In a real app, you would send this data to the server
        // For demo purposes, we'll just show a success message
        showNotification('Profile updated successfully', 'success');
    });

    // Security form submission
    securityForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Basic validation
        if (newPassword && newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }
        
        if (newPassword && newPassword.length < 8) {
            showNotification('Password must be at least 8 characters long', 'error');
            return;
        }
        
        // In a real app, you would send this data to the server
        showNotification('Security settings updated successfully', 'success');
    });

    // Notifications form submission
    notificationsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const notificationSettings = {
            emailUpdates: document.getElementById('email-updates').checked,
            projectNotifications: document.getElementById('project-notifications').checked,
            marketingEmails: document.getElementById('marketing-emails').checked
        };
        
        // In a real app, you would send this data to the server
        showNotification('Notification preferences saved', 'success');
    });

    // Helper function to show notifications
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles to the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: type === 'success' ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '4px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minWidth: '300px',
            zIndex: '1000',
            opacity: '0',
            transform: 'translateY(-20px)',
            transition: 'opacity 0.3s, transform 0.3s'
        });
        
        // Add the notification to the DOM
        document.body.appendChild(notification);
        
        // Trigger reflow to enable transition
        notification.offsetHeight;
        
        // Show the notification
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
        
        // Add click event to close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            hideNotification(notification);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideNotification(notification);
        }, 5000);
    }
    
    function hideNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
});