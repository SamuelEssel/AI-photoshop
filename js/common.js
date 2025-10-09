// Common JavaScript for all pages
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuToggle && mobileMenu && mobileMenuClose) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        mobileMenuClose.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Set active navigation link based on current page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav .nav-btn, .mobile-menu-nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath === linkPath || 
            (currentPath.includes('/pages/') && linkPath.includes('/pages/') && 
             currentPath.split('/').pop() === linkPath.split('/').pop())) {
            link.classList.add('active');
        }
    });
    
    // Notification toggle
    const notificationToggle = document.querySelector('.notification-toggle');
    const notificationPanel = document.querySelector('.notification-panel');
    
    if (notificationToggle && notificationPanel) {
        notificationToggle.addEventListener('click', function(e) {
            e.preventDefault();
            notificationPanel.classList.toggle('active');
            
            // Close user dropdown if open
            if (userDropdown && userDropdown.classList.contains('active')) {
                userDropdown.classList.remove('active');
            }
        });
        
        // Close notification panel when clicking outside
        document.addEventListener('click', function(e) {
            if (!notificationToggle.contains(e.target) && 
                !notificationPanel.contains(e.target)) {
                notificationPanel.classList.remove('active');
            }
        });
    }
    
    // User dropdown toggle
    const userToggle = document.querySelector('.user-toggle');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userToggle && userDropdown) {
        userToggle.addEventListener('click', function(e) {
            e.preventDefault();
            userDropdown.classList.toggle('active');
            
            // Close notification panel if open
            if (notificationPanel && notificationPanel.classList.contains('active')) {
                notificationPanel.classList.remove('active');
            }
        });
        
        // Close user dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userToggle.contains(e.target) && 
                !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
});