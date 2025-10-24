// ===================================
// Smooth Scrolling for Navigation
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// Mobile Menu Toggle
// ===================================
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// ===================================
// Animated Counter for Stats
// ===================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.ceil(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    
    updateCounter();
}

// Intersection Observer for Stats Animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute('data-target'));
            animateCounter(entry.target, target);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(stat => {
    statsObserver.observe(stat);
});

// ===================================
// Progress Bar Animation
// ===================================
const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bars = entry.target.querySelectorAll('.bar-fill');
            bars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
            progressObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const skillsSection = document.querySelector('.skills-progress');
if (skillsSection) {
    progressObserver.observe(skillsSection);
}

// ===================================
// Progress Circle Animation
// ===================================
const circleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const circle = entry.target;
            const progress = parseInt(circle.getAttribute('data-progress'));
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (progress / 100) * circumference;
            
            const progressFill = circle.querySelector('.progress-fill');
            progressFill.style.strokeDashoffset = offset;
            
            circleObserver.unobserve(circle);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.progress-circle').forEach(circle => {
    circleObserver.observe(circle);
});

// ===================================
// Module Card Filtering
// ===================================
let currentFilter = 'all';

function filterModules(difficulty) {
    currentFilter = difficulty;
    const modules = document.querySelectorAll('.module-card');
    
    modules.forEach(module => {
        if (difficulty === 'all' || module.getAttribute('data-difficulty') === difficulty) {
            module.style.display = 'block';
            setTimeout(() => {
                module.style.opacity = '1';
                module.style.transform = 'translateY(0)';
            }, 10);
        } else {
            module.style.opacity = '0';
            module.style.transform = 'translateY(20px)';
            setTimeout(() => {
                module.style.display = 'none';
            }, 300);
        }
    });
}

// Create filter buttons (if you want to add them to your HTML)
function createFilterButtons() {
    const modulesSection = document.querySelector('.modules');
    const container = modulesSection.querySelector('.container');
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-buttons';
    filterContainer.innerHTML = `
        <button class="filter-btn active" data-filter="all">All Modules</button>
        <button class="filter-btn" data-filter="beginner">Beginner</button>
        <button class="filter-btn" data-filter="intermediate">Intermediate</button>
        <button class="filter-btn" data-filter="advanced">Advanced</button>
        <button class="filter-btn" data-filter="expert">Expert</button>
    `;
    
    container.insertBefore(filterContainer, container.querySelector('.modules-grid'));
    
    // Add event listeners to filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterModules(btn.getAttribute('data-filter'));
        });
    });
}

// Uncomment if you want filter buttons
// createFilterButtons();

// ===================================
// Contact Form Handling
// ===================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };
        
        // Simulate form submission
        console.log('Form submitted:', formData);
        
        // Show success message
        alert('Thank you for your message! This is a demo form - in production, this would be sent to a server.');
        
        // Reset form
        contactForm.reset();
    });
}

// ===================================
// Module Detail Modal
// ===================================
let currentModuleId = null;

function showModuleDetails(moduleCard) {
    const title = moduleCard.querySelector('.module-title').textContent;
    const description = moduleCard.querySelector('.module-description').textContent;
    const skills = Array.from(moduleCard.querySelectorAll('.skill-tag')).map(tag => tag.textContent);
    const duration = moduleCard.querySelector('.module-duration').textContent;
    const difficulty = moduleCard.getAttribute('data-difficulty');
    
    console.log('Module Details:', { title, description, skills, duration, difficulty });
    
    // In a real application, you would show a modal here
    alert(`${title}\n\n${description}\n\nSkills: ${skills.join(', ')}\nDuration: ${duration}\nDifficulty: ${difficulty}`);
}

// Add click listeners to "View Details" buttons
document.querySelectorAll('.module-card .btn-small').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const moduleCard = btn.closest('.module-card');
        showModuleDetails(moduleCard);
    });
});

// ===================================
// Scroll Progress Indicator
// ===================================
function updateScrollProgress() {
    const scrollProgress = document.createElement('div');
    scrollProgress.className = 'scroll-progress';
    scrollProgress.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(scrollProgress);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollProgress.style.width = scrolled + '%';
    });
}

updateScrollProgress();

// ===================================
// Navbar Background on Scroll
// ===================================
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.9)';
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// ===================================
// Intersection Observer for Fade-in Animations
// ===================================
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Apply fade-in to module cards
document.querySelectorAll('.module-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    fadeObserver.observe(card);
});

// Apply fade-in to timeline items
document.querySelectorAll('.timeline-item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-30px)';
    item.style.transition = `all 0.6s ease ${index * 0.15}s`;
    fadeObserver.observe(item);
});

// ===================================
// Keyboard Navigation
// ===================================
document.addEventListener('keydown', (e) => {
    // Press 'h' to go to home
    if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
});

// ===================================
// Tooltip System (for future enhancements)
// ===================================
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: var(--dark-card);
                color: var(--text-primary);
                padding: 0.5rem 1rem;
                border-radius: 0.375rem;
                font-size: 0.875rem;
                pointer-events: none;
                z-index: 10000;
                border: 1px solid var(--primary-color);
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
            
            element._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', () => {
            if (element._tooltip) {
                element._tooltip.remove();
                element._tooltip = null;
            }
        });
    });
}

initTooltips();

// ===================================
// Local Storage for Progress Tracking
// ===================================
const PROGRESS_KEY = 'agentdb_learning_progress';

function loadProgress() {
    const saved = localStorage.getItem(PROGRESS_KEY);
    return saved ? JSON.parse(saved) : {
        completedModules: [],
        currentModule: 'module-3',
        skills: {
            'Web Fundamentals': 85,
            'Backend Development': 60,
            'AgentDB & Vector Search': 40,
            'AI Integration': 20
        }
    };
}

function saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

// Load and apply saved progress
const progress = loadProgress();
console.log('Current learning progress:', progress);

// ===================================
// Performance Monitoring
// ===================================
if ('PerformanceObserver' in window) {
    const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
                console.log('LCP:', entry.renderTime || entry.loadTime);
            }
        }
    });
    
    perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
}

// ===================================
// Easter Egg
// ===================================
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        console.log('🎉 Konami Code activated! You found the easter egg!');
        document.body.style.animation = 'rainbow 5s linear infinite';
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            document.body.style.animation = '';
            style.remove();
        }, 5000);
    }
});

// ===================================
// Print Styles Optimization
// ===================================
window.addEventListener('beforeprint', () => {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
});

// ===================================
// Accessibility Enhancements
// ===================================
// Skip to main content link
const skipLink = document.createElement('a');
skipLink.href = '#home';
skipLink.textContent = 'Skip to main content';
skipLink.className = 'skip-link';
skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--primary-color);
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
`;
skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
});
skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
});
document.body.insertBefore(skipLink, document.body.firstChild);

// ===================================
// Console Welcome Message
// ===================================
console.log('%c🚀 AgentDB Learning Portfolio', 'font-size: 20px; color: #6366f1; font-weight: bold;');
console.log('%cWelcome to the AgentDB learning journey!', 'font-size: 14px; color: #8b5cf6;');
console.log('%cThis portfolio is built with vanilla JavaScript, HTML, and CSS.', 'color: #94a3b8;');
console.log('%cInterested in the code? Check out the GitHub repo!', 'color: #94a3b8;');
console.log('%chttps://github.com/mondweep/agentdb-tinkering', 'color: #10b981; font-weight: bold;');

// ===================================
// Initialize Everything
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Portfolio initialized successfully!');
    console.log('📊 Current progress:', progress);
});
