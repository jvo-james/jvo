const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const menuPanel = document.querySelector('.menu-panel');
const menuLinks = document.querySelectorAll('.menu-panel a');

function toggleMenu(forceState) {
  const open = typeof forceState === 'boolean' ? forceState : !menuPanel.classList.contains('is-open');
  menuPanel.classList.toggle('is-open', open);
  body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuPanel.setAttribute('aria-hidden', String(!open));
}

menuToggle.addEventListener('click', () => toggleMenu());
menuLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  observer.observe(element);
});

const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

if (matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  const renderCursor = () => {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  };
  renderCursor();

  document.querySelectorAll('a, button, .project__image').forEach((item) => {
    item.addEventListener('mouseenter', () => cursorRing.classList.add('is-active'));
    item.addEventListener('mouseleave', () => cursorRing.classList.remove('is-active'));
  });
}

const parallaxCard = document.querySelector('.parallax-card img');
window.addEventListener('scroll', () => {
  if (!parallaxCard || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const y = Math.min(window.scrollY * 0.06, 70);
  parallaxCard.style.transform = `scale(1.08) translateY(${y}px)`;
});

// Slight magnetic movement on the contact link.
const contactLink = document.querySelector('.contact__content a');
if (contactLink && matchMedia('(pointer: fine)').matches) {
  contactLink.addEventListener('mousemove', (event) => {
    const rect = contactLink.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.025;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.025;
    contactLink.style.transform = `translate(${x}px, ${y}px)`;
  });
  contactLink.addEventListener('mouseleave', () => {
    contactLink.style.transform = 'translate(0, 0)';
  });
}
