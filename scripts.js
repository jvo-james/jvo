document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const pageShell = document.querySelector(".page-shell");
  const hero = document.querySelector(".hero");
  const frameStack = document.querySelector(".frame-stack");
  const form = document.querySelector(".rsvp-form");
  const nameInput = document.querySelector("#name");
  const submitBtn = document.querySelector(".submit-btn");
  const attendanceInputs = document.querySelectorAll(
    'input[type="radio"][name="attendance"]'
  );
  const choiceCards = document.querySelectorAll(".choice-card");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  body.classList.add("js-ready");

  // ---------- Reveal ----------
  const revealTargets = document.querySelectorAll(
    ".hero__badge, .hero__copy, .hero__visual, .ticker, .section-card, .footer"
  );

  revealTargets.forEach((el) => el.classList.add("reveal-item"));

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));

  // ---------- Attendance ----------
  const updateAttendanceState = () => {
    choiceCards.forEach((card) => {
      const input = card.querySelector('input[type="radio"]');
      card.classList.toggle("is-selected", Boolean(input && input.checked));
    });
  };

  attendanceInputs.forEach((input) => {
    input.addEventListener("change", updateAttendanceState);
  });

  updateAttendanceState();

  // ---------- Keyboard focus mode ----------
  let keyboardMode = false;

  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab" && !keyboardMode) {
      keyboardMode = true;
      body.classList.add("using-keyboard");
    }
  });

  document.addEventListener("mousedown", () => {
    if (!keyboardMode) return;
    keyboardMode = false;
    body.classList.remove("using-keyboard");
  });

  // ---------- Button / link ripples ----------
  const rippleTargets = document.querySelectorAll(
    ".button, .submit-btn, .location__map-link, .location__card"
  );

  rippleTargets.forEach((target) => {
    target.addEventListener("pointerdown", (event) => {
      if (prefersReducedMotion) return;

      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      target.appendChild(ripple);

      ripple.animate(
        [
          { transform: "translate(-50%, -50%) scale(0)", opacity: 0.35 },
          { transform: "translate(-50%, -50%) scale(2)", opacity: 0 },
        ],
        {
          duration: 650,
          easing: "ease-out",
        }
      );

      window.setTimeout(() => ripple.remove(), 700);
    });
  });

  // ---------- Subtle pointer parallax ----------
  if (!prefersReducedMotion && hero && frameStack && pageShell) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      const heroX = `${currentX * 10}px`;
      const heroY = `${currentY * 10}px`;
      const shellX = `${currentX * 22}px`;
      const shellY = `${currentY * 18}px`;

      hero.style.setProperty("--mx", heroX);
      hero.style.setProperty("--my", heroY);
      frameStack.style.setProperty("--mx", `${currentX * 12}px`);
      frameStack.style.setProperty("--my", `${currentY * 12}px`);

      pageShell.style.setProperty("--parallax-x", shellX);
      pageShell.style.setProperty("--parallax-y", shellY);

      const stillMoving =
        Math.abs(targetX - currentX) > 0.001 ||
        Math.abs(targetY - currentY) > 0.001;

      if (stillMoving) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    const startAnimation = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener(
      "pointermove",
      (event) => {
        const x = event.clientX / window.innerWidth;
        const y = event.clientY / window.innerHeight;

        targetX = (x - 0.5) * 2;
        targetY = (y - 0.5) * 2;

        startAnimation();
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      () => {
        targetX = 0;
        targetY = 0;
        startAnimation();
      },
      { passive: true }
    );
  }

  // ---------- Floating sparkles ----------
  const createSparkles = () => {
    if (prefersReducedMotion || !pageShell) return;

    const sparkleCount = 10;

    for (let i = 0; i < sparkleCount; i += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.setAttribute("aria-hidden", "true");

      const size = 2 + Math.random() * 4;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = 7000 + Math.random() * 5000;
      const delay = Math.random() * 4500;

      sparkle.style.setProperty("--spark-left", `${left}vw`);
      sparkle.style.setProperty("--spark-top", `${top}vh`);
      sparkle.style.setProperty("--spark-size", `${size}px`);
      sparkle.style.setProperty("--spark-duration", `${duration}ms`);
      sparkle.style.setProperty("--spark-delay", `${delay}ms`);

      pageShell.appendChild(sparkle);
    }
  };

  createSparkles();

  // ---------- Form feedback ----------
  const buildFeedback = () => {
    if (!form) return null;

    let feedback = form.querySelector(".form-feedback");
    if (feedback) return feedback;

    feedback = document.createElement("div");
    feedback.className = "form-feedback";
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    form.appendChild(feedback);
    return feedback;
  };

  const feedback = buildFeedback();

  const setFeedback = (message, type = "info") => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.dataset.type = type;
    feedback.classList.add("is-visible");

    window.clearTimeout(setFeedback._timer);
    setFeedback._timer = window.setTimeout(() => {
      feedback.classList.remove("is-visible");
    }, 4200);
  };

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = nameInput ? nameInput.value.trim() : "";
      const selected = document.querySelector(
        'input[name="attendance"]:checked'
      );

      if (!name) {
        setFeedback("Please enter your name first.", "error");
        nameInput?.focus();
        return;
      }

      if (!selected) {
        setFeedback("Please choose whether you will attend.", "error");
        return;
      }

      const firstName = name.split(" ")[0] || name;
      const attending = selected.value === "yes";

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
  }

  // ---------- Tiny polish on resize ----------
  window.addEventListener("resize", () => {
    const sparkles = document.querySelectorAll(".sparkle");
    if (sparkles.length > 10) {
      sparkles.forEach((sparkle, index) => {
        if (index % 3 === 0) sparkle.remove();
      });
    }
  });
});
