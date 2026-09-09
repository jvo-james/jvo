const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const menuPanel = document.querySelector('.menu-panel');
const menuLinks = document.querySelectorAll('.menu-panel a');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function toggleMenu(forceState) {
  const open = typeof forceState === 'boolean' ? forceState : !menuPanel.classList.contains('is-open');
  menuPanel.classList.toggle('is-open', open);
  body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuPanel.setAttribute('aria-hidden', String(!open));
  menuPanel.toggleAttribute('inert', !open);

  if (open) {
    const firstLink = menuPanel.querySelector('a');
    window.setTimeout(() => firstLink?.focus(), reduceMotion.matches ? 0 : 180);
  } else if (document.activeElement && menuPanel.contains(document.activeElement)) {
    menuToggle.focus();
  }
}

menuToggle?.addEventListener('click', () => toggleMenu());
menuLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuPanel?.classList.contains('is-open')) toggleMenu(false);
});

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.reveal').forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 60}ms`;
    observer.observe(element);
  });
} else {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
}

const parallaxCard = document.querySelector('.parallax-card img');
let scrollTicking = false;
function updateParallax() {
  if (parallaxCard && !reduceMotion.matches) {
    const y = Math.min(window.scrollY * 0.06, 70);
    parallaxCard.style.transform = `scale(1.08) translateY(${y}px)`;
  }
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(updateParallax);
    scrollTicking = true;
  }
}, { passive: true });
