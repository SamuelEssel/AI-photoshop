/**
 * Contact Page JavaScript
 * Handles form validation, submission, FAQ toggles, and map integration
 */

document.addEventListener('DOMContentLoaded', function() {
    // Form validation and submission
    initContactForm();
    
    // FAQ accordion functionality
    initFaqAccordion();
    
    // Initialize map if the container exists
    if (document.getElementById('map')) {
        initMap();
    }
});

/**
 * Initialize contact form validation and AJAX submission
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    const successMessage = document.querySelector('.success-message');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset previous error states
        resetFormErrors();
        
        // Validate form
        let isValid = true;
        
        if (!validateField(nameInput, 'Please enter your name')) {
            isValid = false;
        }
        
        if (!validateEmail(emailInput)) {
            isValid = false;
        }
        
        if (!validateField(subjectInput, 'Please enter a subject')) {
            isValid = false;
        }
        
        if (!validateField(messageInput, 'Please enter your message')) {
            isValid = false;
        }
        
        if (isValid) {
            // Submit form via AJAX
            submitForm(contactForm);
        }
    });
    
    // Real-time validation on blur
    nameInput.addEventListener('blur', function() {
        validateField(nameInput, 'Please enter your name');
    });
    
    emailInput.addEventListener('blur', function() {
        validateEmail(emailInput);
    });
    
    subjectInput.addEventListener('blur', function() {
        validateField(subjectInput, 'Please enter a subject');
    });
    
    messageInput.addEventListener('blur', function() {
        validateField(messageInput, 'Please enter your message');
    });
}

/**
 * Validate a required field
 * @param {HTMLElement} field - The input field to validate
 * @param {string} errorMessage - Error message to display
 * @returns {boolean} - Whether the field is valid
 */
function validateField(field, errorMessage) {
    const errorElement = field.nextElementSibling;
    
    if (!field.value.trim()) {
        field.classList.add('error');
        if (errorElement && errorElement.classList.contains('form-error')) {
            errorElement.textContent = errorMessage;
        }
        return false;
    } else {
        field.classList.remove('error');
        return true;
    }
}

/**
 * Validate email field
 * @param {HTMLElement} emailField - The email input field
 * @returns {boolean} - Whether the email is valid
 */
function validateEmail(emailField) {
    const errorElement = emailField.nextElementSibling;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailField.value.trim()) {
        emailField.classList.add('error');
        if (errorElement && errorElement.classList.contains('form-error')) {
            errorElement.textContent = 'Please enter your email address';
        }
        return false;
    } else if (!emailRegex.test(emailField.value.trim())) {
        emailField.classList.add('error');
        if (errorElement && errorElement.classList.contains('form-error')) {
            errorElement.textContent = 'Please enter a valid email address';
        }
        return false;
    } else {
        emailField.classList.remove('error');
        return true;
    }
}

/**
 * Reset all form error states
 */
function resetFormErrors() {
    const errorFields = document.querySelectorAll('.form-control.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
    
    const errorMessages = document.querySelectorAll('.form-error');
    errorMessages.forEach(message => {
        message.textContent = '';
    });
}

/**
 * Submit form via AJAX
 * @param {HTMLFormElement} form - The form to submit
 */
function submitForm(form) {
    const submitButton = form.querySelector('.btn-submit');
    const originalButtonText = submitButton.textContent;
    const successMessage = document.querySelector('.success-message');
    
    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    // Prepare form data
    const formData = new FormData(form);
    
    // Send AJAX request
    fetch('contact_process.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        
        if (data.success) {
            // Show success message
            successMessage.style.display = 'block';
            successMessage.textContent = data.message || 'Your message has been sent successfully!';
            
            // Reset form
            form.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        } else {
            // Show error notification
            showNotification(data.message || 'There was an error sending your message. Please try again.', 'error');
        }
    })
    .catch(error => {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        
        // Show error notification
        showNotification('There was an error sending your message. Please try again.', 'error');
        console.error('Error:', error);
    });
}

/**
 * Initialize FAQ accordion functionality
 */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Toggle current item
            item.classList.toggle('active');
            
            // Close other items (optional - for accordion behavior)
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
        });
    });
}

/**
 * Initialize Google Maps
 */
function initMap() {
    // This function would typically contain Google Maps API initialization
    // For demonstration purposes, we'll just add a placeholder comment
    console.log('Map initialization would go here');
    
    // Example Google Maps initialization (commented out as it requires API key)
    /*
    const mapOptions = {
        center: { lat: 40.7128, lng: -74.0060 }, // Example: New York coordinates
        zoom: 14
    };
    
    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
    
    // Add marker
    const marker = new google.maps.Marker({
        position: { lat: 40.7128, lng: -74.0060 },
        map: map,
        title: 'Our Office'
    });
    */
}

/**
 * Show notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set notification content and type
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.style.display = 'block';
    
    // Add animation class
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove element after animation completes
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 5000);
}

// Add notification styles if not already in CSS
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            transform: translateY(-20px);
            opacity: 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 300px;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .notification.success {
            background-color: #00b894;
        }
        
        .notification.error {
            background-color: #d63031;
        }
        
        .notification.warning {
            background-color: #fdcb6e;
            color: #2d3436;
        }
        
        .notification.info {
            background-color: #0984e3;
        }
    `;
    document.head.appendChild(style);
}