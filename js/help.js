/**
 * Help/Documentation Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initSearch();
    initFAQToggles();
    initFeedbackButtons();
    initArticleNavigation();
    initCategoryLinks();
});

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.querySelector('.help-search input');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        // If we're on the search results page
        const searchResults = document.querySelector('.help-search-results');
        if (searchResults) {
            filterSearchResults(searchTerm);
        }
        
        // If search is submitted
        if (e.key === 'Enter' && searchTerm.length > 0) {
            window.location.href = `search.php?q=${encodeURIComponent(searchTerm)}`;
        }
    });
}

/**
 * Filter search results based on search term
 */
function filterSearchResults(searchTerm) {
    const resultItems = document.querySelectorAll('.help-search-result-item');
    let hasResults = false;
    
    resultItems.forEach(item => {
        const title = item.querySelector('.help-search-result-title').textContent.toLowerCase();
        const content = item.querySelector('.help-search-result-content').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || content.includes(searchTerm)) {
            item.style.display = 'block';
            hasResults = true;
            
            // Highlight matching text
            highlightText(item, searchTerm);
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show or hide no results message
    const noResults = document.querySelector('.help-search-no-results');
    if (noResults) {
        noResults.style.display = hasResults ? 'none' : 'block';
    }
}

/**
 * Highlight matching text in search results
 */
function highlightText(element, searchTerm) {
    const titleElement = element.querySelector('.help-search-result-title');
    const contentElement = element.querySelector('.help-search-result-content');
    
    if (titleElement) {
        const originalTitle = titleElement.getAttribute('data-original') || titleElement.textContent;
        titleElement.setAttribute('data-original', originalTitle);
        
        const highlightedTitle = originalTitle.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
        );
        
        titleElement.innerHTML = highlightedTitle;
    }
    
    if (contentElement) {
        const originalContent = contentElement.getAttribute('data-original') || contentElement.textContent;
        contentElement.setAttribute('data-original', originalContent);
        
        const highlightedContent = originalContent.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
        );
        
        contentElement.innerHTML = highlightedContent;
    }
}

/**
 * Initialize FAQ toggle functionality
 */
function initFAQToggles() {
    const faqQuestions = document.querySelectorAll('.help-faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // Toggle active class on question
            this.classList.toggle('active');
            
            // Toggle answer visibility
            const answer = this.nextElementSibling;
            answer.classList.toggle('active');
        });
    });
}

/**
 * Initialize article feedback buttons
 */
function initFeedbackButtons() {
    const feedbackButtons = document.querySelectorAll('.help-article-feedback-button');
    
    feedbackButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            feedbackButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get feedback type (helpful or not helpful)
            const feedbackType = this.getAttribute('data-feedback');
            
            // Get article ID
            const articleId = document.querySelector('.help-article').getAttribute('data-article-id');
            
            // Send feedback to server
            sendFeedback(articleId, feedbackType);
            
            // Show thank you message
            const feedbackContainer = document.querySelector('.help-article-feedback');
            const thankYouMessage = document.createElement('div');
            thankYouMessage.className = 'help-article-feedback-thank-you';
            thankYouMessage.textContent = 'Thank you for your feedback!';
            
            feedbackContainer.innerHTML = '';
            feedbackContainer.appendChild(thankYouMessage);
        });
    });
}

/**
 * Send article feedback to server
 */
function sendFeedback(articleId, feedbackType) {
    // Create form data
    const formData = new FormData();
    formData.append('article_id', articleId);
    formData.append('feedback_type', feedbackType);
    
    // Send AJAX request
    fetch('../includes/article_feedback.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Feedback submitted:', data);
    })
    .catch(error => {
        console.error('Error submitting feedback:', error);
    });
}

/**
 * Initialize article navigation
 */
function initArticleNavigation() {
    const prevLink = document.querySelector('.help-article-navigation-link-prev');
    const nextLink = document.querySelector('.help-article-navigation-link-next');
    
    if (prevLink) {
        prevLink.addEventListener('click', function(e) {
            const prevArticleId = this.getAttribute('data-article-id');
            if (!prevArticleId) {
                e.preventDefault();
            }
        });
    }
    
    if (nextLink) {
        nextLink.addEventListener('click', function(e) {
            const nextArticleId = this.getAttribute('data-article-id');
            if (!nextArticleId) {
                e.preventDefault();
            }
        });
    }
}

/**
 * Initialize category links
 */
function initCategoryLinks() {
    const categoryLinks = document.querySelectorAll('.help-category-link');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const categoryId = this.getAttribute('data-category-id');
            if (!categoryId) {
                e.preventDefault();
            }
        });
    });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add notification to container
    const notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
        container.appendChild(notification);
    } else {
        notificationContainer.appendChild(notification);
    }
    
    // Add close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', function() {
        notification.remove();
    });
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

/**
 * Copy code block to clipboard
 */
function initCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(codeBlock => {
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-button';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.title = 'Copy to clipboard';
        
        // Add copy button to code block
        const pre = codeBlock.parentNode;
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
        
        // Add click event to copy button
        copyButton.addEventListener('click', function() {
            const code = codeBlock.textContent;
            navigator.clipboard.writeText(code).then(() => {
                // Show success message
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.classList.add('success');
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i>';
                    this.classList.remove('success');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code:', err);
                
                // Show error message
                this.innerHTML = '<i class="fas fa-times"></i>';
                this.classList.add('error');
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i>';
                    this.classList.remove('error');
                }, 2000);
            });
        });
    });
}

// Initialize code copy buttons when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initCodeCopyButtons();
});