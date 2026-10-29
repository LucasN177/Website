// ===================================
// THEME MANAGEMENT
// ===================================

/**
 * Toggle between light and dark theme.
 * The initial theme is applied by an inline script in <head> to avoid a flash.
 */
function toggleTheme() {
    const root = document.documentElement;
    const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', newTheme);

    try {
        localStorage.setItem('theme', newTheme);
    } catch (e) {
        // Storage unavailable (private mode etc.) – theme still switches for this visit
    }
}

// ===================================
// MOBILE MENU
// ===================================

function closeMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');

    navLinks.classList.remove('active');
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-label', 'Open menu');
}

/**
 * Toggle mobile navigation menu
 */
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!mobileToggle) return;

    mobileToggle.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        mobileToggle.classList.toggle('active', isActive);
        mobileToggle.setAttribute('aria-expanded', isActive);
        mobileToggle.setAttribute('aria-label', isActive ? 'Close menu' : 'Open menu');
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
    });
}

// ===================================
// SCROLL ANIMATIONS
// ===================================

/**
 * Reveal elements on scroll, staggering siblings inside the same grid
 */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('visible'));
        return;
    }

    // Stagger cards that share a parent
    elements.forEach(el => {
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        const index = siblings.indexOf(el);
        if (siblings.length > 1) {
            el.style.setProperty('--delay', `${Math.min(index, 6) * 0.07}s`);
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ===================================
// NAVBAR STATE ON SCROLL
// ===================================

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    const update = () => navbar.classList.toggle('scrolled', window.scrollY > 20);

    update();
    window.addEventListener('scroll', update, { passive: true });
}

// ===================================
// ACTIVE NAVIGATION HIGHLIGHT
// ===================================

/**
 * Highlight the nav item of the section currently in view
 */
function initActiveNavigation() {
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = [...links]
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    // Observe the hero too, so no link stays highlighted when back at the top
    const hero = document.getElementById('home');
    if (hero) sections.push(hero);

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            links.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));
}

// ===================================
// SERVICE CARD SPOTLIGHT
// ===================================

/**
 * Let the card glow follow the mouse pointer
 */
function initCardSpotlight() {
    document.querySelectorAll('.offer-card').forEach(card => {
        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
            card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        });
    });
}

// ===================================
// CONTACT FORM HANDLING
// ===================================

function validateField(field) {
    const group = field.closest('.form-group');
    const valid = field.value.trim() !== '' && (field.type !== 'email' || field.checkValidity());
    group.classList.toggle('invalid', !valid);
    return valid;
}

/**
 * Handle contact form submission
 */
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');

    if (!contactForm) return;

    const fields = contactForm.querySelectorAll('input, textarea');

    fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.closest('.form-group').classList.contains('invalid')) validateField(field);
        });
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const allValid = [...fields].map(validateField).every(Boolean);
        if (!allValid) {
            contactForm.querySelector('.invalid input, .invalid textarea').focus();
            return;
        }

        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            submitBtn.textContent = 'Sent! ✓';
            submitBtn.classList.add('success');

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('success');
                contactForm.reset();
            }, 2000);
        }, 1200);
    });
}

// ===================================
// INITIALIZE ALL FEATURES
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollAnimations();
    initNavbarScroll();
    initActiveNavigation();
    initCardSpotlight();
    initContactForm();

    document.querySelector('.theme-toggle')?.addEventListener('click', toggleTheme);

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
});

// Close mobile menu when resizing to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 960) closeMobileMenu();
});
