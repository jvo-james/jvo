document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".page-shell");
  const revealElements = document.querySelectorAll(".reveal");
  const radioInputs = document.querySelectorAll('.rsvp-form input[type="radio"]');
  const radioCards = document.querySelectorAll(".radio-card");
  const form = document.querySelector(".rsvp-form");
  const heroVisual = document.querySelector(".hero__visual");
  const floatingSvgs = document.querySelectorAll(".floating-svg");
  const buttons = document.querySelectorAll(".btn");

  // Add initial reveal delay classes
  revealElements.forEach((el, index) => {
    el.style.transitionDelay = `${index * 120}ms`;
  });

  // Intersection observer for smooth entrance animations
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
      threshold: 0.16,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // Radio card active states
  function syncRadioState() {
    radioCards.forEach((card) => card.classList.remove("is-selected"));
    radioInputs.forEach((input) => {
      if (input.checked) {
        const card = input.closest(".radio-card");
        if (card) card.classList.add("is-selected");
      }
    });
  }

  radioInputs.forEach((input) => {
    input.addEventListener("change", syncRadioState);
  });

  syncRadioState();

  // Button ripple effect
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      ripple.className = "btn-ripple";

      btn.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 700);
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  // Subtle parallax / motion for hero visuals and floating SVGs
  let mouseX = 0;
  let mouseY = 0;

  function applyMotion() {
    const maxMove = 14;

    if (heroVisual) {
      const xMove = (mouseX - 0.5) * maxMove;
      const yMove = (mouseY - 0.5) * maxMove;

      heroVisual.style.transform = `translate3d(${xMove}px, ${yMove}px, 0)`;
    }

    floatingSvgs.forEach((svg, index) => {
      const depth = (index + 1) * 0.6;
      const xMove = (mouseX - 0.5) * maxMove * depth;
      const yMove = (mouseY - 0.5) * maxMove * depth;
      svg.style.transform = `translate3d(${xMove}px, ${yMove}px, 0) rotate(${(mouseX - 0.5) * 12}deg)`;
    });

    requestAnimationFrame(applyMotion);
  }

  if (page) {
    page.addEventListener("mousemove", (e) => {
      const rect = page.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    });

    page.addEventListener("touchmove", (e) => {
      if (!e.touches || !e.touches[0]) return;
      const touch = e.touches[0];
      const rect = page.getBoundingClientRect();
      mouseX = (touch.clientX - rect.left) / rect.width;
      mouseY = (touch.clientY - rect.top) / rect.height;
    }, { passive: true });
  }

  requestAnimationFrame(applyMotion);

  // Soft floating animation drift for decorative SVGs
  floatingSvgs.forEach((svg, index) => {
    const ampX = 10 + index * 3;
    const ampY = 8 + index * 2;
    const speed = 0.0015 + index * 0.0006;

    let start = null;

    function drift(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;

      const x = Math.sin(elapsed * speed) * ampX;
      const y = Math.cos(elapsed * speed * 0.9) * ampY;

      const currentRotate = (index % 2 === 0 ? 1 : -1) * Math.sin(elapsed * speed * 0.8) * 6;
      svg.style.setProperty("--drift-x", `${x}px`);
      svg.style.setProperty("--drift-y", `${y}px`);
      svg.style.setProperty("--drift-rotate", `${currentRotate}deg`);

      // Combine with mouse/parallax transform if CSS doesn't handle it
      const baseTransform = svg.style.transform || "translate3d(0px, 0px, 0)";
      if (!baseTransform.includes("translate3d")) {
        svg.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${currentRotate}deg)`;
      }

      requestAnimationFrame(drift);
    }

    requestAnimationFrame(drift);
  });

  // Form behavior
  function showMessage(text, type = "success") {
    let toast = document.querySelector(".toast-message");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast-message";
      document.body.appendChild(toast);
    }

    toast.textContent = text;
    toast.dataset.type = type;
    toast.classList.add("show");

    clearTimeout(showMessage._timer);
    showMessage._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = form.querySelector("#guest-name");
      const selectedAttendance = form.querySelector('input[name="attendance"]:checked');

      const name = nameInput ? nameInput.value.trim() : "";
      if (!name) {
        showMessage("Please enter your name.", "error");
        nameInput?.focus();
        return;
      }

      if (!selectedAttendance) {
        showMessage("Please confirm attendance.", "error");
        return;
      }

      const attendance = selectedAttendance.value;
      const message =
        attendance === "yes"
          ? `Thank you, ${name}. Your RSVP has been recorded.`
          : `Thank you, ${name}. Your response has been recorded.`;

      showMessage(message, "success");

      form.reset();
      syncRadioState();

      // Optional: add a little celebratory pulse to the form panel
      const panel = document.querySelector(".rsvp__panel");
      if (panel) {
        panel.classList.remove("submit-pulse");
        void panel.offsetWidth;
        panel.classList.add("submit-pulse");
      }
    });
  }

  // Keep selected radio card visually active on click
  radioCards.forEach((card) => {
    card.addEventListener("click", () => {
      const input = card.querySelector('input[type="radio"]');
      if (input) {
        input.checked = true;
        syncRadioState();
      }
    });
  });

  // Lightweight image loading polish
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("load", () => {
      img.classList.add("is-loaded");
    });

    if (img.complete) {
      img.classList.add("is-loaded");
    }
  });
});
