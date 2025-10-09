/**
 * Project View Page JavaScript
 * Handles all interactive functionality for the project view page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dropdown functionality
    initDropdowns();
    
    // Initialize modal functionality
    initModals();
    
    // Initialize button actions
    initButtonActions();
    
    // Initialize comment functionality
    initComments();
});

/**
 * Initialize dropdown menus
 */
function initDropdowns() {
    const dropdownButtons = document.querySelectorAll('.dropdown button');
    
    dropdownButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const dropdown = this.closest('.dropdown');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach(openMenu => {
                if (openMenu !== menu) {
                    openMenu.classList.remove('show');
                }
            });
            
            // Toggle current dropdown
            menu.classList.toggle('show');
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    });
}

/**
 * Initialize modal functionality
 */
function initModals() {
    // Share modal
    const shareBtn = document.getElementById('shareBtn');
    const shareModal = document.getElementById('shareModal');
    const closeShareModal = document.getElementById('closeShareModal');
    
    if (shareBtn && shareModal) {
        shareBtn.addEventListener('click', function() {
            shareModal.style.display = 'flex';
        });
        
        closeShareModal.addEventListener('click', function() {
            shareModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === shareModal) {
                shareModal.style.display = 'none';
            }
        });
    }
    
    // Copy link functionality
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const shareLinkInput = document.getElementById('shareLink');
    
    if (copyLinkBtn && shareLinkInput) {
        copyLinkBtn.addEventListener('click', function() {
            shareLinkInput.select();
            document.execCommand('copy');
            
            // Change button text temporarily
            const originalText = copyLinkBtn.innerHTML;
            copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            setTimeout(function() {
                copyLinkBtn.innerHTML = originalText;
            }, 2000);
        });
    }
}

/**
 * Initialize button actions
 */
function initButtonActions() {
    // Edit button
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            const projectId = getProjectIdFromUrl();
            if (projectId) {
                window.location.href = `editor.php?id=${projectId}`;
            }
        });
    }
    
    // Duplicate button
    const duplicateBtn = document.getElementById('duplicateBtn');
    if (duplicateBtn) {
        duplicateBtn.addEventListener('click', function() {
            showNotification('Project duplicated successfully!', 'success');
        });
    }
    
    // Preview button
    const previewBtn = document.querySelector('.preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            const projectId = getProjectIdFromUrl();
            if (projectId) {
                // Open preview in new tab or modal
                window.open(`preview.php?id=${projectId}`, '_blank');
            }
        });
    }
    
    // Add tag button
    const addTagBtn = document.querySelector('.add-tag-btn');
    if (addTagBtn) {
        addTagBtn.addEventListener('click', function() {
            const tagName = prompt('Enter a new tag:');
            if (tagName && tagName.trim() !== '') {
                const tagsList = document.querySelector('.tags-list');
                const newTag = document.createElement('span');
                newTag.className = 'tag';
                newTag.textContent = tagName.trim();
                tagsList.insertBefore(newTag, addTagBtn);
            }
        });
    }
    
    // Add people button
    const addPeopleBtn = document.querySelector('.add-people-btn');
    if (addPeopleBtn) {
        addPeopleBtn.addEventListener('click', function() {
            // In a real app, this would open a modal to select users
            showNotification('Invite people functionality will be implemented soon!', 'info');
        });
    }
    
    // Invite button in share modal
    const inviteBtn = document.getElementById('inviteBtn');
    const shareEmailInput = document.getElementById('shareEmail');
    
    if (inviteBtn && shareEmailInput) {
        inviteBtn.addEventListener('click', function() {
            const email = shareEmailInput.value.trim();
            if (email === '') {
                showNotification('Please enter an email address', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // In a real app, this would send an invitation
            showNotification(`Invitation sent to ${email}`, 'success');
            shareEmailInput.value = '';
        });
    }
    
    // Social share buttons
    const socialButtons = document.querySelectorAll('.social-share-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.textContent.trim();
            showNotification(`Sharing to ${platform} will be implemented soon!`, 'info');
        });
    });
}

/**
 * Initialize comment functionality
 */
function initComments() {
    const commentInput = document.querySelector('.comment-input');
    const commentBtn = document.querySelector('.comment-input-actions .btn-primary');
    const cancelBtn = document.querySelector('.comment-input-actions .btn-text');
    
    if (commentInput && commentBtn) {
        commentBtn.addEventListener('click', function() {
            const commentText = commentInput.value.trim();
            if (commentText === '') {
                showNotification('Please enter a comment', 'error');
                return;
            }
            
            // Add new comment to the list
            addNewComment(commentText);
            commentInput.value = '';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            commentInput.value = '';
        });
    }
    
    // Comment action buttons (Reply, Edit, Delete)
    document.querySelectorAll('.comment-actions .btn-text').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            const commentItem = this.closest('.comment-item');
            
            if (action === 'Reply') {
                // Focus on comment input and add @mention
                const authorName = commentItem.querySelector('.comment-author').textContent;
                commentInput.value = `@${authorName} `;
                commentInput.focus();
            } else if (action === 'Edit') {
                // In a real app, this would enable editing the comment
                showNotification('Edit comment functionality will be implemented soon!', 'info');
            } else if (action === 'Delete') {
                if (confirm('Are you sure you want to delete this comment?')) {
                    commentItem.remove();
                    showNotification('Comment deleted successfully!', 'success');
                }
            }
        });
    });
}

/**
 * Add a new comment to the comments list
 */
function addNewComment(text) {
    const commentsList = document.querySelector('.comments-list');
    const addComment = document.querySelector('.add-comment');
    
    // Create new comment element
    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    
    // Get current user avatar (using owner avatar for demo)
    const userAvatar = document.querySelector('.add-comment .comment-avatar img').src;
    
    // Current date
    const now = new Date();
    
    newComment.innerHTML = `
        <div class="comment-avatar">
            <img src="${userAvatar}" alt="Current User">
        </div>
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-author">You</span>
                <span class="comment-date">Just now</span>
            </div>
            <p class="comment-text">${text}</p>
            <div class="comment-actions">
                <button class="btn-text">Reply</button>
                <button class="btn-text">Edit</button>
                <button class="btn-text">Delete</button>
            </div>
        </div>
    `;
    
    // Insert new comment before the add comment form
    commentsList.insertBefore(newComment, addComment);
    
    // Add event listeners to new comment buttons
    const actionButtons = newComment.querySelectorAll('.comment-actions .btn-text');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            
            if (action === 'Reply') {
                const commentInput = document.querySelector('.comment-input');
                commentInput.value = '@You ';
                commentInput.focus();
            } else if (action === 'Edit') {
                showNotification('Edit comment functionality will be implemented soon!', 'info');
            } else if (action === 'Delete') {
                if (confirm('Are you sure you want to delete this comment?')) {
                    newComment.remove();
                    showNotification('Comment deleted successfully!', 'success');
                }
            }
        });
    });
    
    showNotification('Comment added successfully!', 'success');
}

/**
 * Show a notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getIconForType(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                background-color: white;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                z-index: 1100;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                animation: slideIn 0.3s ease-out;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
            }
            
            .notification-content i {
                margin-right: 10px;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #6c757d;
            }
            
            .notification.success {
                border-left: 4px solid #28a745;
            }
            
            .notification.error {
                border-left: 4px solid #dc3545;
            }
            
            .notification.info {
                border-left: 4px solid #17a2b8;
            }
            
            .notification.warning {
                border-left: 4px solid #ffc107;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        closeNotification(notification);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
}

/**
 * Close a notification with animation
 */
function closeNotification(notification) {
    notification.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
        notification.remove();
    }, 300);
}

/**
 * Get icon class for notification type
 */
function getIconForType(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        case 'info':
        default:
            return 'fa-info-circle';
    }
}

/**
 * Get project ID from URL
 */
function getProjectIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}