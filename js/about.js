// About page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Team member card interactions
    const teamMembers = document.querySelectorAll('.team-member');
    
    teamMembers.forEach(member => {
        member.addEventListener('mouseenter', function() {
            this.classList.add('active');
        });
        
        member.addEventListener('mouseleave', function() {
            this.classList.remove('active');
        });
        
        // Social links
        const socialLinks = member.querySelectorAll('.social-links a');
        socialLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });
    });
    
    // Timeline animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // Simple animation when scrolling to timeline items
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    timelineItems.forEach(item => {
        observer.observe(item);
    });
    
    // Testimonial slider
    const testimonialSlider = document.querySelector('.testimonial-slider');
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (testimonialSlider && testimonials.length > 0) {
        let currentIndex = 0;
        
        // Show the first testimonial
        testimonials[0].classList.add('active');
        
        // Update testimonial display
        function showTestimonial(index) {
            testimonials.forEach(testimonial => {
                testimonial.classList.remove('active');
            });
            
            testimonials[index].classList.add('active');
        }
        
        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentIndex = (currentIndex + 1) % testimonials.length;
                showTestimonial(currentIndex);
            });
        }
        
        // Previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
                showTestimonial(currentIndex);
            });
        }
        
        // Auto-rotate testimonials
        setInterval(function() {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
        }, 5000);
    }
});