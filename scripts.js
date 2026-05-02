document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const body = document.body;
  const form = document.querySelector(".rsvp-form");
  const nameInput = document.querySelector("#name");
  const submitBtn = document.querySelector(".submit-btn");
  const attendanceInputs = document.querySelectorAll(
    'input[type="radio"][name="attendance"]'
  );
  const choiceCards = document.querySelectorAll(".choice-card");

  const revealTargets = document.querySelectorAll(
    ".hero__content, .hero__visual, .ticker, .mood, .details, .location, .gallery, .rsvp, .footer"
  );

  const hoverCards = document.querySelectorAll(
    ".section-card, .gallery__card, .portrait, .choice-card, .mood__image, .location__link, .hero__cta, .hero__ghost"
  );

  const decorativeMotionEls = document.querySelectorAll(
    ".ambient, .ornament, .floating-mark, .mini-spark, .hero-orbit, .map-wave"
  );

  const parallaxEls = document.querySelectorAll(
    ".hero__visual .portrait--one, .hero__visual .portrait--two, .glow-card, .mood__image"
  );

  body.classList.add("is-ready");

  const setRevealState = () => {
    revealTargets.forEach((el, index) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(28px)";
      el.style.transition =
        "opacity 900ms ease, transform 900ms ease, filter 900ms ease";
      el.style.transitionDelay = `${index * 70}ms`;
    });
  };

  const runReveal = () => {
    if (prefersReducedMotion) {
      revealTargets.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    revealTargets.forEach((el) => observer.observe(el));
  };

  const updateAttendanceState = () => {
    choiceCards.forEach((card) => {
      const input = card.querySelector('input[type="radio"]');
      card.classList.toggle("is-selected", Boolean(input && input.checked));
    });
  };

  const setupAttendance = () => {
    attendanceInputs.forEach((input) => {
      input.addEventListener("change", updateAttendanceState);
    });

    updateAttendanceState();
  };

  const setupButtonRipples = () => {
    document.querySelectorAll(".hero__cta, .hero__ghost, .submit-btn").forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        ripple.animate(
          [
            { transform: "translate(-50%, -50%) scale(0)", opacity: 0.45 },
            { transform: "translate(-50%, -50%) scale(1.9)", opacity: 0 },
          ],
          {
            duration: 680,
            easing: "ease-out",
          }
        );

        window.setTimeout(() => ripple.remove(), 720);
      });
    });
  };

  const setupSubtleHoverLift = () => {
    hoverCards.forEach((el) => {
      el.addEventListener("pointerenter", () => {
        if (el.classList.contains("choice-card")) return;
        el.style.transform = "translateY(-4px)";
      });

      el.addEventListener("pointerleave", () => {
        if (el.classList.contains("choice-card")) return;
        if (el.classList.contains("gallery__card") || el.classList.contains("portrait")) {
          el.style.transform = "translateY(0)";
        } else {
          el.style.transform = "";
        }
      });
    });
  };

  const setupKeyboardFocusMode = () => {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        body.classList.add("using-keyboard");
      }
    });

    document.addEventListener("mousedown", () => {
      body.classList.remove("using-keyboard");
    });
  };

  const createSparkles = () => {
    if (prefersReducedMotion) return;

    const sparkleCount = 14;
    for (let i = 0; i < sparkleCount; i += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.setAttribute("aria-hidden", "true");

      const size = 2 + Math.random() * 4;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 5000;
      const duration = 5000 + Math.random() * 4000;

      sparkle.style.position = "fixed";
      sparkle.style.left = `${left}vw`;
      sparkle.style.top = `${top}vh`;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.borderRadius = "999px";
      sparkle.style.pointerEvents = "none";
      sparkle.style.opacity = "0";
      sparkle.style.zIndex = "0";
      sparkle.style.mixBlendMode = "screen";

      document.body.appendChild(sparkle);

      sparkle.animate(
        [
          { transform: "translateY(0px) scale(0.85)", opacity: 0 },
          { transform: "translateY(-16px) scale(1)", opacity: 0.8, offset: 0.35 },
          { transform: "translateY(-34px) scale(0.7)", opacity: 0 },
        ],
        {
          duration,
          delay,
          iterations: Infinity,
          easing: "ease-in-out",
        }
      );
    }
  };

  const setupParallax = () => {
    if (prefersReducedMotion) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let running = false;

    const step = () => {
      currentX += (mouseX - currentX) * 0.065;
      currentY += (mouseY - currentY) * 0.065;

      const translateX = currentX * 10;
      const translateY = currentY * 10;

      parallaxEls.forEach((el, index) => {
        const depth = 1 + index * 0.14;
        el.style.transform = `translate3d(${translateX * depth}px, ${translateY * depth}px, 0)`;
      });

      decorativeMotionEls.forEach((el, index) => {
        const strength = 1 + index * 0.08;
        const rotate = currentX * 3.2 * strength;
        const moveX = currentX * 12 * strength;
        const moveY = currentY * 10 * strength;

        if (
          el.classList.contains("hero-orbit") ||
          el.classList.contains("map-wave") ||
          el.classList.contains("ornament")
        ) {
          el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotate(${rotate}deg)`;
        } else {
          el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        }
      });

      const stillMoving =
        Math.abs(mouseX - currentX) > 0.001 || Math.abs(mouseY - currentY) > 0.001;

      if (stillMoving) {
        requestAnimationFrame(step);
      } else {
        running = false;
      }
    };

    window.addEventListener(
      "mousemove",
      (event) => {
        mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (event.clientY / window.innerHeight - 0.5) * 2;

        if (!running) {
          running = true;
          requestAnimationFrame(step);
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "mouseleave",
      () => {
        mouseX = 0;
        mouseY = 0;
        if (!running) {
          running = true;
          requestAnimationFrame(step);
        }
      },
      { passive: true }
    );
  };

  const setupFloatingMotion = () => {
    if (prefersReducedMotion) return;

    const floatingEls = document.querySelectorAll(
      ".ambient, .ornament, .mini-spark, .glow-card, .hero-orbit"
    );

    floatingEls.forEach((el, index) => {
      const duration = 6500 + index * 1100;
      const y = 10 + index * 2;
      const x = 6 + index;

      el.animate(
        [
          { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          {
            transform: `translate3d(${x}px, -${y}px, 0) rotate(${index % 2 === 0 ? 2 : -2}deg)`,
          },
          { transform: "translate3d(0, 0, 0) rotate(0deg)" },
        ],
        {
          duration,
          iterations: Infinity,
          easing: "ease-in-out",
          delay: index * 140,
        }
      );
    });
  };

  const setupSectionObserver = () => {
    if (prefersReducedMotion) {
      revealTargets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
      }
    );

    revealTargets.forEach((el) => observer.observe(el));
  };

  const enhanceForm = () => {
    if (!form) return;

    const feedback = document.createElement("div");
    feedback.className = "form-feedback";
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    form.appendChild(feedback);

    const setFeedback = (message, type = "info") => {
      feedback.textContent = message;
      feedback.dataset.type = type;
      feedback.style.opacity = "1";
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = nameInput ? nameInput.value.trim() : "";
      const selected = document.querySelector(
        'input[name="attendance"]:checked'
      );

      if (!name) {
        setFeedback("Please add your name first.", "error");
        if (nameInput) nameInput.focus();
        return;
      }

      if (!selected) {
        setFeedback("Please choose whether you will attend.", "error");
        return;
      }

      const attending = selected.value === "yes";
      const firstName = name.split(" ")[0] || name;

      form.classList.add("is-submitted");
      form.querySelectorAll("input, button").forEach((el) => {
        el.disabled = true;
      });

      if (submitBtn) {
        submitBtn.innerHTML = attending
          ? `Confirmed <i class="fa-solid fa-check"></i>`
          : `Response sent <i class="fa-solid fa-paper-plane"></i>`;
      }

      setFeedback(
        attending
          ? `Thank you, ${firstName}. Your attendance has been noted.`
          : `Thank you, ${firstName}. Your response has been received.`,
        "success"
      );
    });
  };

  const setupScrollGlow = () => {
    if (prefersReducedMotion) return;

    const sections = document.querySelectorAll(".section-card");
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY || window.pageYOffset;
        sections.forEach((section, index) => {
          const rect = section.getBoundingClientRect();
          const distance = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
          section.style.boxShadow = `0 ${24 + index * 2}px ${72 + index * 6}px rgba(0, 0, 0, ${0.42 + distance * 0.18})`;
        });
      },
      { passive: true }
    );
  };

  setRevealState();
  runReveal();
  setupAttendance();
  setupButtonRipples();
  setupSubtleHoverLift();
  setupKeyboardFocusMode();
  createSparkles();
  setupParallax();
  setupFloatingMotion();
  setupSectionObserver();
  enhanceForm();
  setupScrollGlow();

  window.addEventListener("resize", () => {
    document.querySelectorAll(".sparkle").forEach((sparkle) => {
      if (Math.random() > 0.85) sparkle.remove();
    });
  });
});
