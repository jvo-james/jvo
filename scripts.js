document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".page-shell") || document.body;
  const hero = document.querySelector(".hero");
  const heroVisual = document.querySelector(".hero__visual");
  const heroContent = document.querySelector(".hero__content");
  const revealElements = [...document.querySelectorAll(".reveal")];
  const buttons = [...document.querySelectorAll(".btn")];
  const form = document.querySelector(".rsvp-form");
  const nameInput = document.querySelector("#guest-name");
  const radioInputs = [...document.querySelectorAll('input[name="attendance"]')];
  const radioCards = [...document.querySelectorAll(".radio-card")];
  const floatingSvgs = [...document.querySelectorAll(".floating-svg")];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // --- Reveal animations ---
  revealElements.forEach((el, index) => {
    el.style.transitionDelay = `${index * 120}ms`;
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -80px 0px",
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  // --- Make the headline and hero feel alive on load ---
  if (!reduceMotion && heroContent) {
    heroContent.animate(
      [
        { transform: "translateY(18px)", opacity: 0, filter: "blur(2px)" },
        { transform: "translateY(0)", opacity: 1, filter: "blur(0)" },
      ],
      {
        duration: 900,
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "both",
        delay: 80,
      }
    );
  }

  // --- Button ripple effect ---
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);

      ripple.className = "btn-ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      btn.appendChild(ripple);

      window.setTimeout(() => ripple.remove(), 700);
    });
  });

  // --- Smooth scroll for internal links ---
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  // --- Radio cards: one choice only, styled like premium checkboxes ---
  function syncRadioState() {
    radioCards.forEach((card) => card.classList.remove("is-selected"));

    radioInputs.forEach((input) => {
      const card = input.closest(".radio-card");
      if (!card) return;

      if (input.checked) {
        card.classList.add("is-selected");
      }
    });
  }

  radioInputs.forEach((input) => {
    input.addEventListener("change", syncRadioState);
  });

  radioCards.forEach((card) => {
    card.addEventListener("click", () => {
      const input = card.querySelector('input[type="radio"]');
      if (!input) return;
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      syncRadioState();

      if (!reduceMotion) {
        card.animate(
          [
            { transform: "translateY(0) scale(1)" },
            { transform: "translateY(-3px) scale(1.01)" },
            { transform: "translateY(0) scale(1)" },
          ],
          {
            duration: 420,
            easing: "cubic-bezier(.2,.8,.2,1)",
          }
        );
      }
    });
  });

  syncRadioState();

  // --- Decorative floating stars / stickers created in JS ---
  createAmbientDecor();
  createTinyStickerTrail();

  // --- Gentle motion for hero / floating ornaments ---
  if (!reduceMotion && finePointer) {
    let pointerX = 0.5;
    let pointerY = 0.5;
    let rafId = null;

    const onPointerMove = (e) => {
      const rect = page.getBoundingClientRect();
      pointerX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      pointerY = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));

      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;

        const dx = (pointerX - 0.5) * 18;
        const dy = (pointerY - 0.5) * 14;

        if (heroVisual) {
          heroVisual.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        }

        floatingSvgs.forEach((svg, index) => {
          const factor = 1 + index * 0.18;
          const x = dx * factor;
          const y = dy * factor;
          const rotate = (pointerX - 0.5) * (6 + index * 1.2);

          svg.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`;
        });
      });
    };

    const resetMotion = () => {
      if (heroVisual) {
        heroVisual.style.transform = "";
      }
      floatingSvgs.forEach((svg) => {
        svg.style.transform = "";
      });
    };

    page.addEventListener("pointermove", onPointerMove, { passive: true });
    page.addEventListener("pointerleave", resetMotion);
  }

  // --- Soft bob animation on the hero photos (safe on mobile too) ---
  if (!reduceMotion) {
    const heroPhotos = [...document.querySelectorAll(".hero__photo")];
    heroPhotos.forEach((photo, index) => {
      photo.animate(
        [
          { transform: photo.style.transform || "translateY(0) rotate(0deg)" },
          { transform: `translateY(${index % 2 === 0 ? -8 : 8}px) rotate(${index % 2 === 0 ? -0.6 : 0.6}deg)` },
          { transform: photo.style.transform || "translateY(0) rotate(0deg)" },
        ],
        {
          duration: 5200 + index * 700,
          iterations: Infinity,
          easing: "ease-in-out",
          delay: index * 180,
        }
      );
    });
  }

  // --- Form behavior ---
  function showToast(message, type = "success") {
    let toast = document.querySelector(".toast-message");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast-message";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.dataset.type = type;
    toast.classList.add("show");

    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  function burstConfetti(originEl) {
    if (reduceMotion) return;

    const rect = originEl.getBoundingClientRect();
    const colors = ["#d4af37", "#f0d98a", "#ffffff", "#9c7b1f"];

    for (let i = 0; i < 18; i++) {
      const piece = document.createElement("span");
      piece.setAttribute("aria-hidden", "true");

      const size = 6 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 90;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance - 20;

      piece.style.position = "fixed";
      piece.style.left = `${rect.left + rect.width / 2}px`;
      piece.style.top = `${rect.top + rect.height / 2}px`;
      piece.style.width = `${size}px`;
      piece.style.height = `${size}px`;
      piece.style.borderRadius = Math.random() > 0.5 ? "999px" : "2px";
      piece.style.background = colors[i % colors.length];
      piece.style.pointerEvents = "none";
      piece.style.zIndex = "9999";
      piece.style.boxShadow = "0 0 14px rgba(212,175,55,.35)";

      document.body.appendChild(piece);

      piece.animate(
        [
          { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
          { transform: `translate3d(${x}px, ${y}px, 0) scale(0.4)`, opacity: 0 },
        ],
        {
          duration: 1200 + Math.random() * 500,
          easing: "cubic-bezier(.2,.8,.2,1)",
          fill: "forwards",
        }
      );

      window.setTimeout(() => piece.remove(), 1800);
    }
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = nameInput ? nameInput.value.trim() : "";
      const selected = document.querySelector('input[name="attendance"]:checked');

      if (!name) {
        showToast("Please enter your name.", "error");
        nameInput?.focus();
        return;
      }

      if (!selected) {
        showToast("Please choose whether you’re attending.", "error");
        return;
      }

      const message =
        selected.value === "yes"
          ? `Thank you, ${name}. Your RSVP has been received.`
          : `Thank you, ${name}. Your response has been received.`;

      showToast(message, "success");
      burstConfetti(form.querySelector(".btn--primary") || form);

      form.reset();
      syncRadioState();

      const panel = document.querySelector(".rsvp__panel");
      if (panel && !reduceMotion) {
        panel.classList.remove("submit-pulse");
        void panel.offsetWidth;
        panel.classList.add("submit-pulse");
      }
    });
  }

  // --- Decorative creator helpers ---
  function createAmbientDecor() {
    const count = 10;

    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      const size = 6 + Math.random() * 14;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const symbol = Math.random() > 0.5 ? "✦" : "✧";

      star.textContent = symbol;
      star.setAttribute("aria-hidden", "true");
      star.style.position = "fixed";
      star.style.left = `${left}vw`;
      star.style.top = `${top}vh`;
      star.style.fontSize = `${size}px`;
      star.style.lineHeight = "1";
      star.style.color = "rgba(212,175,55,.82)";
      star.style.textShadow = "0 0 18px rgba(212,175,55,.22)";
      star.style.pointerEvents = "none";
      star.style.zIndex = "0";
      star.style.opacity = "0.12";
      star.style.transform = "translate3d(0,0,0)";
      star.style.willChange = "transform, opacity";

      document.body.appendChild(star);

      if (!reduceMotion) {
        star.animate(
          [
            { transform: "translate3d(0, 0, 0) scale(1)", opacity: 0.08 },
            { transform: "translate3d(0, -12px, 0) scale(1.2)", opacity: 0.22 },
            { transform: "translate3d(0, 0, 0) scale(1)", opacity: 0.08 },
          ],
          {
            duration: 3400 + Math.random() * 2600,
            delay: Math.random() * 1500,
            iterations: Infinity,
            easing: "ease-in-out",
          }
        );
      }
    }
  }

  function createTinyStickerTrail() {
    const labels = ["★", "✦", "◆", "✧"];
    const positions = [
      { x: 8, y: 18, s: 34 },
      { x: 88, y: 14, s: 28 },
      { x: 12, y: 84, s: 32 },
      { x: 84, y: 78, s: 26 },
    ];

    positions.forEach((pos, index) => {
      const chip = document.createElement("div");
      chip.textContent = labels[index % labels.length];
      chip.setAttribute("aria-hidden", "true");
      chip.style.position = "absolute";
      chip.style.left = `${pos.x}%`;
      chip.style.top = `${pos.y}%`;
      chip.style.width = `${pos.s}px`;
      chip.style.height = `${pos.s}px`;
      chip.style.display = "grid";
      chip.style.placeItems = "center";
      chip.style.borderRadius = "999px";
      chip.style.border = "1px solid rgba(212,175,55,.24)";
      chip.style.background = "rgba(255,255,255,.03)";
      chip.style.color = "#f0d98a";
      chip.style.boxShadow = "0 12px 26px rgba(0,0,0,.18)";
      chip.style.backdropFilter = "blur(12px)";
      chip.style.pointerEvents = "none";
      chip.style.zIndex = "1";

      if (heroVisual) {
        heroVisual.appendChild(chip);
      }

      if (!reduceMotion) {
        chip.animate(
          [
            { transform: "translateY(0px) rotate(0deg)" },
            { transform: "translateY(-6px) rotate(8deg)" },
            { transform: "translateY(0px) rotate(0deg)" },
          ],
          {
            duration: 2800 + index * 300,
            delay: index * 180,
            iterations: Infinity,
            easing: "ease-in-out",
          }
        );
      }
    });
  }

  // --- Small accessibility polish ---
  if (nameInput) {
    nameInput.addEventListener("input", () => {
      if (nameInput.value.trim()) {
        nameInput.removeAttribute("aria-invalid");
      }
    });
  }

  // Keep radio state correct if browser restores form data
  window.addEventListener("pageshow", syncRadioState);
});
