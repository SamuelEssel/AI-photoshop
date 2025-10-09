// Features page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Add animation to feature items when they come into view
    const featureItems = document.querySelectorAll('.feature-item');
    
    if (featureItems.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });

        featureItems.forEach(item => {
            observer.observe(item);
        });
    }
    
    // Interactive demo buttons
    const demoButtons = document.querySelectorAll('.demo-button');
    demoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const demoId = this.getAttribute('data-demo');
            const demoContainer = document.getElementById(demoId);
            
            // Toggle active demo
            document.querySelectorAll('.feature-demo').forEach(demo => {
                demo.classList.remove('active');
            });
            demoContainer.classList.add('active');
            
            // Update button states
            demoButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Add animation to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    
    if (featureCards.length > 0) {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add a slight delay for each card to create a cascade effect
                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, index * 100);
                }
            });
        }, { threshold: 0.1 });

        featureCards.forEach(card => {
            cardObserver.observe(card);
        });
    }
    
    // Implement drag and drop functionality for the demo
    const draggableElements = document.querySelectorAll('.draggable-element');
    
    draggableElements.forEach(element => {
        element.addEventListener('dragstart', function(e) {
            this.classList.add('dragging');
            e.dataTransfer.setData('text/plain', this.id);
        });
        
        element.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });
    
    const demoCanvas = document.querySelector('.demo-canvas');
    if (demoCanvas) {
        demoCanvas.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        
        demoCanvas.addEventListener('drop', function(e) {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                const rect = demoCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left - (draggable.offsetWidth / 2);
                const y = e.clientY - rect.top - (draggable.offsetHeight / 2);
                
                // Keep element within canvas bounds
                const maxX = rect.width - draggable.offsetWidth;
                const maxY = rect.height - draggable.offsetHeight;
                
                draggable.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
                draggable.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
            }
        });
    }
    
    // Layer panel interactivity
    const layerItems = document.querySelectorAll('.layer-item');
    layerItems.forEach(item => {
        item.addEventListener('click', function() {
            layerItems.forEach(layer => layer.classList.remove('active'));
            this.classList.add('active');
        });
        
        const visibilityIcon = item.querySelector('.layer-visibility');
        if (visibilityIcon) {
            visibilityIcon.addEventListener('click', function(e) {
                e.stopPropagation();
                const icon = this.querySelector('i');
                if (icon.classList.contains('fa-eye')) {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }
    });
});