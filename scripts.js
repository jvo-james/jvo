document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const body = document.body;
  const hero = document.querySelector(".hero");
  const heroVisual = document.querySelector(".hero__visual");
  const title = document.querySelector(".title");
  const subtitle = document.querySelector(".subtitle");
  const ctas = document.querySelectorAll(".hero__cta, .submit-btn");
  const cards = document.querySelectorAll(".section-card, .gallery__card, .portrait, .choice-card");
  const ornaments = document.querySelectorAll(".ornament, .floating-mark, .ambient");
  const radioInputs = document.querySelectorAll('input[type="radio"][name="attendance"]');
  const choiceCards = document.querySelectorAll(".choice-card");
  const form = document.querySelector(".rsvp-form");
  const nameInput = document.querySelector("#name");
  const submitBtn = document.querySelector(".submit-btn");

  body.classList.add("is-ready");

  const setInitialState = () => {
    if (hero) {
      hero.style.opacity = "1";
      hero.style.transform = "none";
    }

    [title, subtitle, heroVisual].forEach((el, index) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity 900ms ease, transform 900ms ease";
      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 120 + index * 140);
    });

    ctas.forEach((el, index) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transition = "opacity 800ms ease, transform 800ms ease";
      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 500 + index * 120);
    });

    cards.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(28px) scale(0.985)";
      el.style.transition =
        "opacity 800ms ease, transform 800ms ease, box-shadow 800ms ease";
    });
  };

  const revealOnScroll = () => {
    if (prefersReducedMotion) {
      cards.forEach((card) => {
        card.style.opacity = "1";
        card.style.transform = "none";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          el.style.opacity = "1";
          el.style.transform = "translateY(0) scale(1)";
          observer.unobserve(el);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px",
      }
    );

    cards.forEach((card) => observer.observe(card));
  };

  const updateSelectedAttendance = () => {
    choiceCards.forEach((card) => {
      const input = card.querySelector('input[type="radio"]');
      const active = input && input.checked;
      card.classList.toggle("is-selected", active);
    });
  };

  const setupAttendanceCards = () => {
    radioInputs.forEach((input) => {
      input.addEventListener("change", updateSelectedAttendance);
    });
    updateSelectedAttendance();
  };

  const setupButtonRipple = () => {
    document.querySelectorAll(".hero__cta, .submit-btn").forEach((button) => {
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
            { transform: "translate(-50%, -50%) scale(0)", opacity: 0.5 },
            { transform: "translate(-50%, -50%) scale(1.8)", opacity: 0 },
          ],
          {
            duration: 650,
            easing: "ease-out",
          }
        );

        setTimeout(() => ripple.remove(), 700);
      });
    });
  };

  const setupParallax = () => {
    if (prefersReducedMotion) return;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let ticking = false;

    const animate = () => {
      targetX += (mouseX - targetX) * 0.06;
      targetY += (mouseY - targetY) * 0.06;

      ornaments.forEach((el, index) => {
        const strength = 6 + index * 2;
        const direction = index % 2 === 0 ? 1 : -1;
        el.style.transform = `translate3d(${targetX * strength * direction}px, ${targetY * strength}px, 0)`;
      });

      if (heroVisual) {
        heroVisual.style.transform = `translate3d(${targetX * 10}px, ${targetY * 10}px, 0)`;
      }

      ticking = Math.abs(mouseX - targetX) > 0.001 || Math.abs(mouseY - targetY) > 0.001;
      if (ticking) requestAnimationFrame(animate);
    };

    window.addEventListener(
      "mousemove",
      (event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        mouseX = x;
        mouseY = y;

        if (!ticking) {
          ticking = true;
          requestAnimationFrame(animate);
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "mouseleave",
      () => {
        mouseX = 0;
        mouseY = 0;
      },
      { passive: true }
    );
  };

  const setupFloatingMotion = () => {
    if (prefersReducedMotion) return;

    const floatingEls = document.querySelectorAll(
      ".ambient, .ornament, .floating-mark, .glow-card"
    );

    floatingEls.forEach((el, index) => {
      const duration = 7000 + index * 900;
      const distance = 12 + index * 2;

      el.animate(
        [
          { transform: "translateY(0px) translateX(0px)" },
          { transform: `translateY(-${distance}px) translateX(${distance / 2}px)` },
          { transform: "translateY(0px) translateX(0px)" },
        ],
        {
          duration,
          iterations: Infinity,
          easing: "ease-in-out",
          delay: index * 180,
        }
      );
    });
  };

  const setupStaggerHover = () => {
    document.querySelectorAll(".section-card, .gallery__card, .portrait").forEach((el) => {
      el.addEventListener("pointerenter", () => {
        el.style.transform = "translateY(-6px)";
      });

      el.addEventListener("pointerleave", () => {
        if (!el.classList.contains("is-visible")) {
          el.style.transform = "translateY(28px) scale(0.985)";
        } else {
          el.style.transform = "translateY(0) scale(1)";
        }
      });
    });
  };

  const createSubtleSparkles = () => {
    if (prefersReducedMotion) return;

    const sparkleCount = 10;
    for (let i = 0; i < sparkleCount; i += 1) {
      const sparkle = document.createElement("span");
      sparkle.setAttribute("aria-hidden", "true");
      sparkle.className = "sparkle";

      const size = 2 + Math.random() * 4;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 5000;
      const duration = 4500 + Math.random() * 3500;

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
          { transform: "translateY(0px) scale(0.8)", opacity: 0 },
          { transform: "translateY(-18px) scale(1)", opacity: 0.8, offset: 0.35 },
          { transform: "translateY(-36px) scale(0.7)", opacity: 0 },
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
      const firstName = name.split(" ")[0];

      form.classList.add("is-submitted");
      form.querySelectorAll("input, button").forEach((el) => {
        el.disabled = true;
      });

      if (submitBtn) {
        submitBtn.innerHTML = attending
          ? `Confirmed for Joe <i class="fa-solid fa-check"></i>`
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

  const setupSectionRevealClasses = () => {
    const targets = document.querySelectorAll(".details, .gallery, .rsvp, .footer");
    if (!targets.length) return;

    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));
  };

  const setupKeyboardGlow = () => {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        body.classList.add("using-keyboard");
      }
    });

    document.addEventListener("mousedown", () => {
      body.classList.remove("using-keyboard");
    });
  };

  setInitialState();
  revealOnScroll();
  setupAttendanceCards();
  setupButtonRipple();
  setupParallax();
  setupFloatingMotion();
  setupStaggerHover();
  createSubtleSparkles();
  enhanceForm();
  setupSectionRevealClasses();
  setupKeyboardGlow();

  window.addEventListener("resize", () => {
    document.querySelectorAll(".sparkle").forEach((sparkle) => {
      if (Math.random() > 0.85) sparkle.remove();
    });
  });
});
