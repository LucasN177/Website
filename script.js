// ===================================
// HELPERS
// ===================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ===================================
// THEME
// The initial theme is applied by an inline script in <head>.
// ===================================

const THEME_STORAGE_KEY = 'theme';
const THEME_COLORS = { light: '#ffffff', dark: '#070b16' };

function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
        return null;
    }
}

function initTheme() {
    const root = document.documentElement;
    const toggle = document.querySelector('.theme-toggle');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (theme, { animate = false } = {}) => {
        if (animate) {
            root.classList.add('theme-transition');
            window.setTimeout(() => root.classList.remove('theme-transition'), 350);
        }
        root.dataset.theme = theme;
        metaThemeColor?.setAttribute('content', THEME_COLORS[theme]);
        toggle?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    };

    applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');

    toggle?.addEventListener('click', () => {
        const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next, { animate: true });
        try {
            localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
            // Storage unavailable – preference just won't persist
        }
    });

    // Follow the OS setting as long as the user hasn't chosen explicitly
    systemDark.addEventListener('change', (e) => {
        if (!getStoredTheme()) applyTheme(e.matches ? 'dark' : 'light', { animate: true });
    });
}

// ===================================
// MOBILE MENU
// ===================================

function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.site-nav');
    if (!toggle || !nav) return;

    const desktop = window.matchMedia('(min-width: 960px)');
    const isOpen = () => nav.classList.contains('is-open');

    const setOpen = (open) => {
        nav.classList.toggle('is-open', open);
        document.body.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) {
            setOpen(false);
            toggle.focus();
        }
    });

    desktop.addEventListener('change', (e) => {
        if (e.matches) setOpen(false);
    });
}

// ===================================
// HEADER: SCROLLED STATE + PROGRESS BAR
// ===================================

function initHeader() {
    const header = document.querySelector('.site-header');
    const progress = document.querySelector('.scroll-progress');
    if (!header) return;

    let ticking = false;

    const update = () => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        header.classList.toggle('is-scrolled', scrollY > 8);
        progress?.style.setProperty('--progress', maxScroll > 0 ? (scrollY / maxScroll).toFixed(4) : 0);
        ticking = false;
    };

    update();
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
}

// ===================================
// ACTIVE NAVIGATION LINK
// ===================================

function initActiveNav() {
    const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
    const sections = links
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    const setActive = (id) => {
        links.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));

    // Clear highlight when scrolled back into the hero
    const hero = document.querySelector('.hero');
    if (hero) {
        new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setActive(null);
        }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
    }
}

// ===================================
// SCROLL REVEAL
// ===================================

function initReveal() {
    const elements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
}

// ===================================
// ANIMATED COUNTERS
// ===================================

function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (prefersReducedMotion.matches) return;

    const animate = (el) => {
        const target = Number(el.dataset.count);
        const duration = 1400;
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = String(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(step);
        };

        el.textContent = '0';
        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    counters.forEach(el => observer.observe(el));
}

// ===================================
// CARD SPOTLIGHT (follows the cursor)
// ===================================

function initCardSpotlight() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
            card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        });
    });
}

// ===================================
// PLACEHOLDER LINKS
// href="#" marks URLs that aren't published yet.
// ===================================

function initPlaceholderLinks() {
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', (e) => e.preventDefault());
    });
}

// ===================================
// CONTACT FORM
// ===================================

const FIELD_MESSAGES = {
    name: { valueMissing: 'Please enter your name.' },
    email: {
        valueMissing: 'Please enter your email address.',
        typeMismatch: 'Please enter a valid email address.'
    },
    message: { valueMissing: 'Please enter a message.' }
};

function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const submitBtn = form.querySelector('.submit-btn');
    const submitLabel = submitBtn.querySelector('.btn-label');
    const status = form.querySelector('.form-status');
    const fields = [...form.querySelectorAll('input[required], textarea[required]')];
    const defaultLabel = submitLabel.textContent;

    const validateField = (field) => {
        const errorEl = document.getElementById(`${field.id}-error`);
        const messages = FIELD_MESSAGES[field.name] ?? {};
        let message = '';

        if (field.validity.valueMissing || !field.value.trim()) {
            message = messages.valueMissing ?? 'This field is required.';
        } else if (field.validity.typeMismatch) {
            message = messages.typeMismatch ?? 'Please check this field.';
        }

        field.classList.toggle('is-invalid', Boolean(message));
        field.setAttribute('aria-invalid', String(Boolean(message)));
        if (errorEl) errorEl.textContent = message;
        return !message;
    };

    fields.forEach(field => {
        field.addEventListener('blur', () => {
            if (field.value) validateField(field);
        });
        field.addEventListener('input', () => {
            if (field.classList.contains('is-invalid')) validateField(field);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        status.textContent = '';

        const invalid = fields.filter(field => !validateField(field));
        if (invalid.length) {
            invalid[0].focus();
            return;
        }

        submitBtn.disabled = true;
        submitLabel.textContent = 'Sending…';

        // TODO: replace the simulation with a real request (e.g. Formspree, own API)
        window.setTimeout(() => {
            submitBtn.classList.add('is-success');
            submitLabel.textContent = 'Message sent';
            status.textContent = 'Thank you! I\'ll get back to you as soon as possible.';
            form.reset();

            window.setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-success');
                submitLabel.textContent = defaultLabel;
            }, 2500);
        }, 1200);
    });
}

// ===================================
// FOOTER YEAR
// ===================================

function initYear() {
    document.querySelectorAll('[data-year]').forEach(el => {
        el.textContent = String(new Date().getFullYear());
    });
}

// ===================================
// INITIALIZE (script is loaded with `defer`)
// ===================================

initTheme();
initMobileMenu();
initHeader();
initActiveNav();
initReveal();
initCounters();
initCardSpotlight();
initPlaceholderLinks();
initContactForm();
initYear();
