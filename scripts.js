// script.js
document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Smooth scroll for in-page links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      const target = targetId ? document.querySelector(targetId) : null;
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  // Reveal on scroll
  const revealElements = document.querySelectorAll(".reveal");
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
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  // Subtle floating motion for ornaments
  const ornaments = document.querySelectorAll(".floating-ornament");
  let startTime = performance.now();

  function animateOrnaments(now) {
    const elapsed = (now - startTime) / 1000;

    ornaments.forEach((ornament, index) => {
      if (ornament.dataset.dragging === "true") return;

      const ampX = 6 + index * 1.5;
      const ampY = 8 + index * 2;
      const speed = 0.6 + index * 0.12;

      const x = Math.sin(elapsed * speed + index) * ampX;
      const y = Math.cos(elapsed * speed * 1.15 + index) * ampY;

      ornament.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    if (!prefersReducedMotion) {
      requestAnimationFrame(animateOrnaments);
    }
  }

  if (!prefersReducedMotion && ornaments.length) {
    requestAnimationFrame(animateOrnaments);
  }

  // Pointer parallax for hero area
  const hero = document.querySelector(".hero");
  const visual = document.querySelector(".hero__visual");
  const sigil = document.querySelector(".hero__sigil");

  function setParallax(x, y) {
    if (!hero || prefersReducedMotion) return;

    const rect = hero.getBoundingClientRect();
    const px = (x - rect.left) / rect.width - 0.5;
    const py = (y - rect.top) / rect.height - 0.5;

    if (visual) {
      visual.style.transform = `translate3d(${px * 14}px, ${py * 10}px, 0)`;
    }

    if (sigil) {
      sigil.style.transform = `translate3d(${px * -10}px, ${py * -12}px, 0) rotate(${px * 6}deg)`;
    }
  }

  if (hero && !prefersReducedMotion) {
    hero.addEventListener("pointermove", (e) => setParallax(e.clientX, e.clientY));
    hero.addEventListener("pointerleave", () => {
      if (visual) visual.style.transform = "";
      if (sigil) sigil.style.transform = "";
    });
  }

  // Draggable floating ornaments
  const draggableItems = document.querySelectorAll("[data-draggable='true']");
  let activeDrag = null;

  draggableItems.forEach((item) => {
    item.style.touchAction = "none";
    item.style.cursor = "grab";

    item.addEventListener("pointerdown", (e) => {
      activeDrag = {
        el: item,
        startX: e.clientX,
        startY: e.clientY,
        originX: 0,
        originY: 0,
      };

      item.dataset.dragging = "true";
      item.style.cursor = "grabbing";
      item.setPointerCapture(e.pointerId);
    });

    item.addEventListener("pointermove", (e) => {
      if (!activeDrag || activeDrag.el !== item) return;

      const dx = e.clientX - activeDrag.startX;
      const dy = e.clientY - activeDrag.startY;

      item.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });

    item.addEventListener("pointerup", () => {
      if (!activeDrag || activeDrag.el !== item) return;

      item.dataset.dragging = "false";
      item.style.cursor = "grab";
      activeDrag = null;
    });

    item.addEventListener("pointercancel", () => {
      item.dataset.dragging = "false";
      item.style.cursor = "grab";
      activeDrag = null;
    });
  });

  // RSVP form handling
  const form = document.getElementById("rsvpForm");
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');

    const status = document.createElement("p");
    status.className = "rsvp-status";
    status.setAttribute("aria-live", "polite");
    status.style.marginTop = "16px";
    status.style.opacity = "0";
    status.style.transform = "translateY(8px)";
    status.style.transition = "opacity 0.35s ease, transform 0.35s ease";

    if (submitBtn) {
      submitBtn.insertAdjacentElement("afterend", status);
    } else {
      form.appendChild(status);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name")?.value.trim() || "";
      const email = document.getElementById("email")?.value.trim() || "";
      const attendance = document.getElementById("attendance")?.value || "";
      const message = document.getElementById("message")?.value.trim() || "";

      if (!name || !email || !attendance) {
        showStatus("Please complete the RSVP fields before sending.", "error");
        return;
      }

      const payload = {
        name,
        email,
        attendance,
        message,
        submittedAt: new Date().toISOString(),
      };

      // Temporary local save for now. Replace with your backend later.
      const saved = JSON.parse(localStorage.getItem("joe_rsvp_submissions") || "[]");
      saved.push(payload);
      localStorage.setItem("joe_rsvp_submissions", JSON.stringify(saved));

      form.reset();

      if (attendance === "yes") {
        showStatus("Your RSVP has been received. We look forward to seeing you there.", "success");
      } else {
        showStatus("Your response has been received. Thank you for letting us know.", "success");
      }
    });

    function showStatus(text, type) {
      if (!status) return;

      status.textContent = text;
      status.dataset.state = type;
      status.style.opacity = "1";
      status.style.transform = "translateY(0)";

      clearTimeout(showStatus._timer);
      showStatus._timer = setTimeout(() => {
        status.style.opacity = "0";
        status.style.transform = "translateY(8px)";
      }, 4500);
    }
  }

  // Tiny focus polish for inputs
  document.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("focus", () => field.closest(".input-wrap")?.classList.add("is-focused"));
    field.addEventListener("blur", () => field.closest(".input-wrap")?.classList.remove("is-focused"));
  });
});
