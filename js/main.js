// ===== MAIN JAVASCRIPT FILE =====

// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav__link');
const header = document.getElementById('header');
const contactForm = document.getElementById('contact-form');
const carouselContainer = document.querySelector('.case-studies__carousel');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const carouselDots = document.getElementById('carousel-dots');

// ===== MOBILE NAVIGATION =====
function showMenu() {
    navMenu.classList.add('show');
    document.body.classList.add('no-scroll');
}

function hideMenu() {
    navMenu.classList.remove('show');
    document.body.classList.remove('no-scroll');
}

// Event listeners for mobile menu
if (navToggle) {
    navToggle.addEventListener('click', showMenu);
}

if (navClose) {
    navClose.addEventListener('click', hideMenu);
}

// Close menu when clicking on nav links
navLinks.forEach(link => {
    link.addEventListener('click', hideMenu);
});

// ===== HEADER SCROLL EFFECT =====
function handleHeaderScroll() {
    if (window.scrollY >= 50) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
}

window.addEventListener('scroll', handleHeaderScroll);

// ===== SMOOTH SCROLLING FOR NAVIGATION LINKS =====
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        const headerHeight = header.offsetHeight;
        const elementPosition = element.offsetTop - headerHeight;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

// Add smooth scrolling to all navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        if (target.startsWith('#')) {
            smoothScroll(target);
        }
    });
});

// ===== ANIMATED COUNTERS =====
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// Initialize counters when they come into view
function initCounters() {
    const counters = document.querySelectorAll('.stat__number[data-target]');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                entry.target.classList.add('counted');
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

// ===== CASE STUDIES CAROUSEL =====
class Carousel {
    constructor(container) {
        this.container = container;
        this.cards = container.querySelectorAll('.case-study-card');
        this.currentIndex = 0;
        this.cardWidth = 400; // Width of each card + gap
        this.init();
    }
    
    init() {
        this.createDots();
        this.updateCarousel();
        this.bindEvents();
    }
    
    createDots() {
        if (!carouselDots) return;
        
        carouselDots.innerHTML = '';
        this.cards.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(index));
            carouselDots.appendChild(dot);
        });
    }
    
    updateCarousel() {
        const translateX = -this.currentIndex * (this.cardWidth + 24); // 24px gap
        this.container.style.transform = `translateX(${translateX}px)`;
        
        // Update dots
        const dots = carouselDots?.querySelectorAll('.carousel-dot');
        dots?.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.cards.length;
        this.updateCarousel();
    }
    
    prev() {
        this.currentIndex = this.currentIndex === 0 ? this.cards.length - 1 : this.currentIndex - 1;
        this.updateCarousel();
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }
    
    bindEvents() {
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prev());
        }
        
        // Auto-play carousel
        setInterval(() => {
            this.next();
        }, 5000);
        
        // Touch/swipe support for mobile
        let startX = 0;
        let endX = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        });
    }
}

// Initialize carousel
if (carouselContainer) {
    new Carousel(carouselContainer);
}

// ===== FORM HANDLING =====
function validateForm(formData) {
    const errors = [];
    
    if (!formData.get('name')?.trim()) {
        errors.push('Name is required');
    }
    
    if (!formData.get('email')?.trim()) {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.get('email'))) {
        errors.push('Please enter a valid email address');
    }
    
    if (!formData.get('company')?.trim()) {
        errors.push('Company name is required');
    }
    
    if (!formData.get('role')) {
        errors.push('Please select your role');
    }
    
    return errors;
}

function showFormMessage(message, isError = false) {
    // Remove existing messages
    const existingMessage = contactForm.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${isError ? 'form-message--error' : 'form-message--success'}`;
    messageDiv.textContent = message;
    
    // Add styles
    messageDiv.style.cssText = `
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        ${isError 
            ? 'background: #fed7d7; color: #c53030; border: 1px solid #feb2b2;' 
            : 'background: #c6f6d5; color: #2f855a; border: 1px solid #9ae6b4;'
        }
    `;
    
    contactForm.insertBefore(messageDiv, contactForm.firstChild);
    
    // Auto-remove success messages
    if (!isError) {
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const errors = validateForm(formData);
    
    if (errors.length > 0) {
        showFormMessage(errors.join(', '), true);
        return;
    }
    
    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        // Simulate form submission (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real application, you would send the data to your server
        // const response = await fetch('/api/contact', {
        //     method: 'POST',
        //     body: formData
        // });
        
        showFormMessage('Thank you! We\'ll be in touch within 24 hours to schedule your free AI strategy session.');
        contactForm.reset();
        
    } catch (error) {
        showFormMessage('Sorry, there was an error sending your message. Please try again or contact us directly.', true);
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.value-card, .service-card, .differentiator, .case-study-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });
}

// ===== PERFORMANCE OPTIMIZATIONS =====
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
function initAccessibility() {
    // Add keyboard navigation for carousel
    document.addEventListener('keydown', (e) => {
        if (e.target.closest('.case-studies__carousel')) {
            if (e.key === 'ArrowLeft') {
                prevBtn?.click();
            } else if (e.key === 'ArrowRight') {
                nextBtn?.click();
            }
        }
    });
    
    // Add focus management for mobile menu
    const focusableElements = navMenu.querySelectorAll('a, button');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    navMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        } else if (e.key === 'Escape') {
            hideMenu();
            navToggle.focus();
        }
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initCounters();
    initScrollAnimations();
    lazyLoadImages();
    initAccessibility();
    
    // Add loading animation
    document.body.classList.add('loaded');
});

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimize scroll events
window.addEventListener('scroll', throttle(handleHeaderScroll, 16));

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// ===== ANALYTICS INTEGRATION =====
function trackEvent(eventName, properties = {}) {
    // Google Analytics 4 example
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    // You can add other analytics services here
    console.log('Event tracked:', eventName, properties);
}

// Track form submissions
if (contactForm) {
    contactForm.addEventListener('submit', () => {
        trackEvent('form_submit', {
            form_name: 'contact_form'
        });
    });
}

// Track button clicks
document.addEventListener('click', (e) => {
    if (e.target.matches('.btn--primary')) {
        trackEvent('cta_click', {
            button_text: e.target.textContent.trim(),
            page_section: e.target.closest('section')?.className || 'unknown'
        });
    }
});

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
