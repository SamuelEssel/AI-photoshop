// Pricing page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Billing toggle functionality
    const billingToggle = document.getElementById('billing-toggle');
    const monthlyPrices = document.querySelectorAll('.price-monthly');
    const annualPrices = document.querySelectorAll('.price-annual');
    const toggleLabels = document.querySelectorAll('.toggle-label');
    
    if (billingToggle) {
        billingToggle.addEventListener('change', function() {
            if (this.checked) {
                // Annual billing
                monthlyPrices.forEach(price => price.style.display = 'none');
                annualPrices.forEach(price => price.style.display = 'block');
                toggleLabels[1].classList.add('active');
                toggleLabels[0].classList.remove('active');
                
                // Show savings badges
                document.querySelectorAll('.savings-badge').forEach(badge => {
                    badge.style.display = 'inline-flex';
                });
            } else {
                // Monthly billing
                monthlyPrices.forEach(price => price.style.display = 'block');
                annualPrices.forEach(price => price.style.display = 'none');
                toggleLabels[0].classList.add('active');
                toggleLabels[1].classList.remove('active');
                
                // Hide savings badges
                document.querySelectorAll('.savings-badge').forEach(badge => {
                    badge.style.display = 'none';
                });
            }
        });
    }
    
    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Toggle current item
            item.classList.toggle('active');
            
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
        });
    });
    
    // Plan selection and CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-btn');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.getAttribute('data-plan');
            
            // In a real application, this would redirect to signup with the selected plan
            // For now, we'll just show an alert
            alert(`You selected the ${plan} plan! In a real application, you would be redirected to sign up.`);
        });
    });
});