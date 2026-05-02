document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".page-shell");
  const revealEls = document.querySelectorAll(".reveal");
  const hero = document.querySelector(".hero");
  const heroVisual = document.querySelector(".hero__visual");
  const floatingSvgs = document.querySelectorAll(".floating-svg");
  const buttons = document.querySelectorAll(".btn");
  const form = document.querySelector(".rsvp-form");
  const nameInput = document.querySelector("#guest-name");
  const attendanceCards = document.querySelectorAll(".attendance-card");
  const attendanceInputs = document.querySelectorAll('.attendance-card input[type="radio"]');

  // Reveal on scroll
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
      threshold: 0.15,
      rootMargin: "0px 0px -80px 0px",
    }
  );

  revealEls.forEach((el, index) => {
    el.style.transitionDelay = `${index * 90}ms`;
    revealObserver.observe(el);
  });

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Button ripple effect
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

      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Attendance: only one choice, but make it feel polished
  function syncAttendanceState() {
    attendanceCards.forEach((card) => card.classList.remove("is-selected"));

    attendanceInputs.forEach((input) => {
      if (input.checked) {
        const card = input.closest(".attendance-card");
        if (card) card.classList.add("is-selected");
      }
    });
  }

  attendanceInputs.forEach((input) => {
    input.addEventListener("change", syncAttendanceState);
  });

  attendanceCards.forEach((card) => {
    card.addEventListener("click", () => {
      const input = card.querySelector('input[type="radio"]');
      if (!input) return;

      input.checked = true;
      syncAttendanceState();
    });
  });

  syncAttendanceState();

  // Floating motion: hero + SVGs
  let pointerX = 0.5;
  let pointerY = 0.5;
  let rafId = null;

  function animateMotion() {
    const dx = (pointerX - 0.5) * 18;
    const dy = (pointerY - 0.5) * 18;

    if (heroVisual) {
      heroVisual.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }

    if (hero) {
      const hx = (pointerX - 0.5) * 6;
      const hy = (pointerY - 0.5) * 6;
      hero.style.setProperty("--hero-x", `${hx}px`);
      hero.style.setProperty("--hero-y", `${hy}px`);
    }

    floatingSvgs.forEach((svg, index) => {
      const depth = 0.4 + index * 0.18;
      const mx = (pointerX - 0.5) * 24 * depth;
      const my = (pointerY - 0.5) * 24 * depth;
      const spin = (pointerX - 0.5) * 10 * (index % 2 === 0 ? 1 : -1);

      svg.style.transform = `translate3d(${mx}px, ${my}px, 0) rotate(${spin}deg)`;
    });

    rafId = requestAnimationFrame(animateMotion);
  }

  if (page) {
    page.addEventListener("pointermove", (e) => {
      const rect = page.getBoundingClientRect();
      pointerX = (e.clientX - rect.left) / rect.width;
      pointerY = (e.clientY - rect.top) / rect.height;
    });

    page.addEventListener(
      "touchmove",
      (e) => {
        const touch = e.touches && e.touches[0];
        if (!touch) return;

        const rect = page.getBoundingClientRect();
        pointerX = (touch.clientX - rect.left) / rect.width;
        pointerY = (touch.clientY - rect.top) / rect.height;
      },
      { passive: true }
    );
  }

  rafId = requestAnimationFrame(animateMotion);

  // Soft hover/tap polish for cards
  const liftTargets = document.querySelectorAll(
    ".detail-card, .photo-stack, .attendance-card, .closing__card, .rsvp__panel"
  );

  liftTargets.forEach((el) => {
    el.addEventListener("pointerenter", () => el.classList.add("is-hovered"));
    el.addEventListener("pointerleave", () => el.classList.remove("is-hovered"));
  });

  // Toast helper
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

    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // Form handling
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = (nameInput?.value || "").trim();
      const selected = form.querySelector('input[name="attendance"]:checked');

      if (!name) {
        showToast("Please enter a name.", "error");
        nameInput?.focus();
        return;
      }

      if (!selected) {
        showToast("Please choose an attendance option.", "error");
        return;
      }

      const attending = selected.value === "yes";
      showToast(
        attending
          ? `Thank you, ${name}. Your RSVP is in.`
          : `Thank you, ${name}. Your response is recorded.`,
        "success"
      );

      form.reset();
      syncAttendanceState();

      const panel = document.querySelector(".rsvp__panel");
      if (panel) {
        panel.classList.remove("submit-pulse");
        void panel.offsetWidth;
        panel.classList.add("submit-pulse");
      }
    });
  }

  // Image load polish
  document.querySelectorAll("img").forEach((img) => {
    const markLoaded = () => img.classList.add("is-loaded");
    if (img.complete) {
      markLoaded();
    } else {
      img.addEventListener("load", markLoaded, { once: true });
      img.addEventListener("error", markLoaded, { once: true });
    }
  });

  // Optional subtle card staggering for anything visible immediately
  const immediateCards = document.querySelectorAll(
    ".hero__content > *, .hero__visual > *, .section-heading, .detail-card, .attendance-card"
  );

  immediateCards.forEach((el, index) => {
    el.style.setProperty("--delay", `${index * 60}ms`);
  });

  // Cleanup if needed
  window.addEventListener("beforeunload", () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
});
