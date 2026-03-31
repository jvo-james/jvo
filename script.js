document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
  const revealElements = document.querySelectorAll('[data-reveal]');
  const sections = document.querySelectorAll('main section[id]');
  const heroVisual = document.querySelector('.hero-visual');
  const ambientOne = document.querySelector('.ambient-one');
  const ambientTwo = document.querySelector('.ambient-two');
  const currentYear = document.querySelector('[data-current-year]');

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  const closeMenu = () => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  };

  const openMenu = () => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.add('is-open');
    navToggle.classList.add('is-active');
    navToggle.setAttribute('aria-expanded', 'true');
    body.classList.add('menu-open');
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    document.addEventListener('click', (event) => {
      const clickedInsideNav = navMenu.contains(event.target);
      const clickedToggle = navToggle.contains(event.target);

      if (!clickedInsideNav && !clickedToggle && navMenu.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  const applyHeaderState = () => {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  applyHeaderState();
  window.addEventListener('scroll', applyHeaderState, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const headerOffset = header ? header.offsetHeight + 12 : 90;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    });
  });

  if (sections.length && navLinks.length) {
    const setActiveLink = () => {
      let currentId = '';
      const scrollPosition = window.scrollY + (header ? header.offsetHeight + 140 : 140);

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentId = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('is-current');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('is-current');
        }
      });
    };

    setActiveLink();
    window.addEventListener('scroll', setActiveLink, { passive: true });
    window.addEventListener('resize', setActiveLink);
  }

  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    revealElements.forEach((element, index) => {
      element.style.setProperty('--reveal-delay', `${index * 0.05}s`);
      revealObserver.observe(element);
    });
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && heroVisual) {
    let rafId = null;

    const handlePointerMove = (event) => {
      const { innerWidth, innerHeight } = window;
      const x = (event.clientX / innerWidth - 0.5) * 16;
      const y = (event.clientY / innerHeight - 0.5) * 16;

      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        heroVisual.style.setProperty('--mx', `${x.toFixed(2)}px`);
        heroVisual.style.setProperty('--my', `${y.toFixed(2)}px`);

        if (ambientOne) {
          ambientOne.style.transform = `translate3d(${(x * 0.8).toFixed(2)}px, ${(y * 0.8).toFixed(2)}px, 0)`;
        }

        if (ambientTwo) {
          ambientTwo.style.transform = `translate3d(${(-x * 0.6).toFixed(2)}px, ${(-y * 0.6).toFixed(2)}px, 0)`;
        }
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
  }

  const parallaxItems = document.querySelectorAll('.floating-card, .showcase-main, .hero-orbit');

  if (!prefersReducedMotion && parallaxItems.length) {
    const applyParallax = () => {
      const scrollY = window.scrollY;

      parallaxItems.forEach((item, index) => {
        const speed = (index + 1) * 0.015;
        const translateY = scrollY * speed;
        item.style.setProperty('--parallax-y', `${translateY.toFixed(2)}px`);
      });
    };

    applyParallax();
    window.addEventListener('scroll', applyParallax, { passive: true });
  }

  const magneticButtons = document.querySelectorAll('.btn');

  if (!prefersReducedMotion && magneticButtons.length) {
    magneticButtons.forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        button.style.setProperty('--btn-x', `${(x * 0.14).toFixed(2)}px`);
        button.style.setProperty('--btn-y', `${(y * 0.14).toFixed(2)}px`);
      });

      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--btn-x', '0px');
        button.style.setProperty('--btn-y', '0px');
      });
    });
  }

  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const feedback = contactForm.querySelector('.form-feedback');

      if (submitButton) {
        submitButton.classList.add('is-sent');
        submitButton.disabled = true;
      }

      if (feedback) {
        feedback.textContent = 'Thanks — your message is ready to be connected to your preferred form backend.';
        feedback.classList.add('is-visible');
      }
    });
  }

  const tiltCards = document.querySelectorAll('.service-group, .project-card, .testimonial-card, .process-card');

  if (!prefersReducedMotion && tiltCards.length) {
    tiltCards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        if (window.innerWidth < 992) return;

        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 6;
        const rotateX = (0.5 - (y / rect.height)) * 6;

        card.style.setProperty('--rotate-x', `${rotateX.toFixed(2)}deg`);
        card.style.setProperty('--rotate-y', `${rotateY.toFixed(2)}deg`);
      });

      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rotate-x', '0deg');
        card.style.setProperty('--rotate-y', '0deg');
      });
    });
  }

  const marqueeTrack = document.querySelector('.stack-tags');
  if (marqueeTrack && marqueeTrack.children.length && !prefersReducedMotion) {
    marqueeTrack.setAttribute('data-animated', 'true');
  }
});
