// ===================================
// THEME MANAGEMENT
// The initial theme is applied by an inline script in <head> to avoid a
// flash of the wrong theme; this module only syncs the toggle button.
// ===================================

const THEME_STORAGE_KEY = 'theme';
const THEME_ICONS = { light: '🌙', dark: '☀️' };

function getTheme() {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme, toggleButton) {
    document.documentElement.dataset.theme = theme;
    toggleButton.textContent = THEME_ICONS[theme];
}

function initTheme() {
    const toggleButton = document.querySelector('.theme-toggle');
    if (!toggleButton) return;

    applyTheme(getTheme(), toggleButton);

    toggleButton.addEventListener('click', () => {
        const newTheme = getTheme() === 'light' ? 'dark' : 'light';
        applyTheme(newTheme, toggleButton);

        try {
            localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch {
            // Storage unavailable (e.g. private mode) – theme just won't persist
        }
    });
}

// ===================================
// MOBILE MENU
// ===================================

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    const setMenuOpen = (isOpen) => {
        navLinks.classList.toggle('active', isOpen);
        toggle.classList.toggle('active', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
    };

    const isMenuOpen = () => navLinks.classList.contains('active');

    toggle.addEventListener('click', () => setMenuOpen(!isMenuOpen()));

    // Close when a link inside the menu is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenuOpen(false));
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen() && !navLinks.contains(e.target) && !toggle.contains(e.target)) {
            setMenuOpen(false);
        }
    });

    // Close with Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen()) {
            setMenuOpen(false);
            toggle.focus();
        }
    });

    // Close when switching to desktop layout
    window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
        if (e.matches) setMenuOpen(false);
    });
}

// ===================================
// NAVBAR BACKGROUND ON SCROLL
// ===================================

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const update = () => navbar.classList.toggle('scrolled', window.scrollY > 50);

    update();
    window.addEventListener('scroll', update, { passive: true });
}

// ===================================
// SCROLL ANIMATIONS
// ===================================

function initScrollAnimations() {
    const elements = document.querySelectorAll(
        '.scroll-fade, .scroll-slide-left, .scroll-slide-right, .portrait'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ===================================
// PLACEHOLDER LINKS
// ===================================

/**
 * Links with href="#" are placeholders for not yet published URLs.
 * Prevent them from opening a new tab / jumping to the top.
 */
function initPlaceholderLinks() {
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', (e) => e.preventDefault());
    });
}

// ===================================
// CONTACT FORM HANDLING
// ===================================

function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const submitBtn = form.querySelector('.submit-btn');
    const fields = form.querySelectorAll('input, textarea');
    const originalText = submitBtn.textContent;

    const markInvalid = (field) => {
        field.classList.toggle('is-invalid', !field.checkValidity());
    };

    fields.forEach(field => {
        field.addEventListener('blur', () => {
            field.classList.remove('is-filled');
            markInvalid(field);
        });

        field.addEventListener('input', () => {
            if (field.value.trim()) {
                field.classList.add('is-filled');
                field.classList.remove('is-invalid');
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            fields.forEach(markInvalid);
            form.querySelector(':invalid')?.focus();
            return;
        }

        submitBtn.textContent = 'Wird gesendet...';
        submitBtn.disabled = true;

        // Simulated submission – replace with an actual API call
        setTimeout(() => {
            submitBtn.textContent = 'Gesendet! ✓';
            submitBtn.classList.add('is-success');

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-success');
                fields.forEach(field => field.classList.remove('is-filled', 'is-invalid'));
                form.reset();
            }, 2000);
        }, 1500);
    });
}

// ===================================
// INITIALIZE
// (loaded with `defer` → runs after the DOM is parsed)
// ===================================

initTheme();
initMobileMenu();
initNavbarScroll();
initScrollAnimations();
initPlaceholderLinks();
initContactForm();
