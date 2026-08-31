/* ===== Typing Animation ===== */
const roles = ['Full Stack Developer', 'Frontend Developer', 'Problem Solver', 'Tech Enthusiast', 'Quick Learner'];
let roleIndex = 0, charIndex = 0, isDeleting = false;
const typingEl = document.getElementById('typing-text');

function type() {
    const current = roles[roleIndex];
    typingEl.textContent = isDeleting
        ? current.substring(0, charIndex--)
        : current.substring(0, charIndex++);

    if (!isDeleting && charIndex > current.length) {
        setTimeout(() => { isDeleting = true; type(); }, 2000);
        return;
    }
    if (isDeleting && charIndex < 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
    }
    setTimeout(type, isDeleting ? 40 : 80);
}
type();

/* ===== Navbar Scroll ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

/* ===== Mobile Nav Toggle ===== */
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});
document.querySelectorAll('.nav-link').forEach(link =>
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    })
);

/* ===== Active Nav Link on Scroll ===== */
const sections = document.querySelectorAll('.section');
const navItems = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 200) current = sec.getAttribute('id');
    });
    navItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('href') === '#' + current);
    });
});

/* ===== Scroll Reveal Animations ===== */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ===== Skill Bar Animation ===== */
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-fill').forEach(bar => {
                bar.style.setProperty('--fill-width', bar.dataset.width + '%');
                bar.classList.add('animated');
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });
document.querySelectorAll('.skill-category').forEach(el => skillObserver.observe(el));

/* ===== Stat Counter Animation ===== */
const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-number[data-count]').forEach(num => {
                const target = +num.dataset.count;
                let count = 0;
                const increment = () => {
                    if (count < target) { num.textContent = ++count; requestAnimationFrame(increment); }
                };
                increment();
            });
            countObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('.about-stats').forEach(el => countObserver.observe(el));
