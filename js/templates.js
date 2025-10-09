// Templates page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Category filtering
    const categoryButtons = document.querySelectorAll('.category-btn');
    const templateCards = document.querySelectorAll('.template-card');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            
            // Filter templates
            templateCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Template search functionality
    const searchInput = document.getElementById('template-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            templateCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const category = card.querySelector('.template-category').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || category.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Template preview modal
    const modal = document.getElementById('template-preview-modal');
    const previewButtons = document.querySelectorAll('.preview-btn');
    const closeModal = document.querySelector('.close-modal');
    const previewImage = document.getElementById('preview-image');
    const previewTitle = document.getElementById('preview-title');
    const useTemplateBtn = document.getElementById('use-template-btn');
    
    previewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const templateId = this.getAttribute('data-template');
            const templateCard = this.closest('.template-card');
            const templateTitle = templateCard.querySelector('h3').textContent;
            const templateImage = templateCard.querySelector('img').src;
            
            // Set modal content
            previewImage.src = templateImage;
            previewTitle.textContent = templateTitle;
            
            // Set use template button action
            useTemplateBtn.setAttribute('data-template', templateId);
            
            // Show modal
            modal.style.display = 'flex';
        });
    });
    
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Use template button in modal
    if (useTemplateBtn) {
        useTemplateBtn.addEventListener('click', function() {
            const templateId = this.getAttribute('data-template');
            window.location.href = `/Webapp/pages/editor.php?template=${templateId}`;
        });
    }
    
    // Use template buttons on cards
    const useButtons = document.querySelectorAll('.use-btn');
    useButtons.forEach(button => {
        button.addEventListener('click', function() {
            const templateId = this.getAttribute('data-template');
            window.location.href = `/Webapp/pages/editor.php?template=${templateId}`;
        });
    });
    
    // Pagination (simplified)
    const pageButtons = document.querySelectorAll('.page-btn');
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                pageButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                // In a real implementation, this would load new templates
                // For now, we'll just show a message
                console.log('Loading page: ' + this.textContent);
            }
        });
    });
});