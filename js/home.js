// Home page JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Testimonial slider functionality
    const testimonialSlider = document.querySelector('.testimonial-slider');
    if (testimonialSlider) {
        let isDown = false;
        let startX;
        let scrollLeft;

        testimonialSlider.addEventListener('mousedown', (e) => {
            isDown = true;
            testimonialSlider.classList.add('active');
            startX = e.pageX - testimonialSlider.offsetLeft;
            scrollLeft = testimonialSlider.scrollLeft;
        });

        testimonialSlider.addEventListener('mouseleave', () => {
            isDown = false;
            testimonialSlider.classList.remove('active');
        });

        testimonialSlider.addEventListener('mouseup', () => {
            isDown = false;
            testimonialSlider.classList.remove('active');
        });

        testimonialSlider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - testimonialSlider.offsetLeft;
            const walk = (x - startX) * 2;
            testimonialSlider.scrollLeft = scrollLeft - walk;
        });
    }

    // Add animation to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    if (featureCards.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });

        featureCards.forEach(card => {
            observer.observe(card);
        });
    }

    // Update navigation active state based on current page
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-btn').forEach(navLink => {
        const linkPath = navLink.getAttribute('href');
        if (linkPath && currentPath.includes(linkPath) && linkPath !== '/Webapp/') {
            navLink.classList.add('active');
        } else if (linkPath === '/Webapp/' && (currentPath === '/Webapp/' || currentPath === '/Webapp/index.php')) {
            navLink.classList.add('active');
        }
    });
});