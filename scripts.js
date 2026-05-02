document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const form = document.getElementById("rsvpForm");
  const formStatus = document.getElementById("formStatus");

  // ---------- Smooth entrance ----------
  body.classList.add("is-ready");

  // ---------- Scroll reveal ----------
  const revealTargets = document.querySelectorAll(
    ".hero__copy, .hero__visual, .detail-item, .story__text, .rsvp__intro, .rsvp-form, .gallery-strip__image, .footer"
  );

  revealTargets.forEach((el) => el.classList.add("reveal"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal--visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));

  // ---------- Subtle parallax ----------
  const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));

  let mouseX = 0;
  let mouseY = 0;
  let ticking = false;

  const setMotion = () => {
    const winW = window.innerWidth || 1;
    const winH = window.innerHeight || 1;

    const nx = (mouseX / winW - 0.5) * 2;
    const ny = (mouseY / winH - 0.5) * 2;

    parallaxItems.forEach((el) => {
      const depth = Number(el.dataset.parallax || 10);
      const x = nx * depth * 0.8;
      const y = ny * depth * 0.8;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    ticking = false;
  };

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!ticking) {
      requestAnimationFrame(setMotion);
      ticking = true;
    }
  });

  window.addEventListener("touchmove", (e) => {
    if (!e.touches || !e.touches[0]) return;
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;

    if (!ticking) {
      requestAnimationFrame(setMotion);
      ticking = true;
    }
  }, { passive: true });

  // ---------- Gentle floating movement ----------
  const floaters = document.querySelectorAll(
    ".floating-note, .ambient, .line-art, .drift-ornament"
  );

  const initialOffsets = new Map();
  floaters.forEach((el) => {
    initialOffsets.set(el, {
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
      speed: 0.35 + Math.random() * 0.65,
      amp: 2 + Math.random() * 4,
    });
  });

  function animateFloaters(time) {
    floaters.forEach((el) => {
      const meta = initialOffsets.get(el);
      if (!meta) return;

      const dx = Math.sin(time * 0.001 * meta.speed) * meta.amp + meta.x;
      const dy = Math.cos(time * 0.0011 * meta.speed) * meta.amp + meta.y;

      // Preserve any parallax transform by layering translate values in CSS variables if present.
      // Since inline transform may be used by parallax, we append a small drift.
      const base = el.style.transform && el.style.transform !== "none"
        ? el.style.transform
        : "translate3d(0, 0, 0)";

      el.style.setProperty("--float-x", `${dx}px`);
      el.style.setProperty("--float-y", `${dy}px`);

      // Only directly set transform for elements without live parallax updates on the same frame.
      if (!el.hasAttribute("data-parallax")) {
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      } else {
        // Add CSS variables for your stylesheet to optionally use:
        // transform: translate3d(var(--parallax-x, 0), var(--parallax-y, 0), 0) translate3d(var(--float-x, 0), var(--float-y, 0), 0);
        el.style.setProperty("--float-base", base);
      }
    });

    requestAnimationFrame(animateFloaters);
  }

  requestAnimationFrame(animateFloaters);

  // ---------- Hero text polish ----------
  const title = document.querySelector(".title");
  if (title) {
    const letters = title.textContent.split("");
    title.textContent = "";

    letters.forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.display = "inline-block";
      span.style.transitionDelay = `${index * 18}ms`;
      span.classList.add("title-letter");
      title.appendChild(span);
    });

    requestAnimationFrame(() => {
      title.classList.add("title--visible");
    });
  }

  // ---------- RSVP form ----------
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const showStatus = (message, type = "success") => {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.dataset.state = type;
    formStatus.classList.add("form-status--visible");
  };

  const clearErrors = () => {
    form?.querySelectorAll(".input-error").forEach((el) => {
      el.classList.remove("input-error");
    });
  };

  const markError = (field) => {
    if (field) field.classList.add("input-error");
  };

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();

      const name = document.getElementById("name");
      const email = document.getElementById("email");
      const attendance = document.getElementById("attendance");
      const message = document.getElementById("message");
      const notes = document.getElementById("notes");

      const nameValue = name.value.trim();
      const emailValue = email.value.trim();
      const attendanceValue = attendance.value;
      const messageValue = message.value.trim();
      const notesValue = notes.value.trim();

      let valid = true;

      if (!nameValue) {
        valid = false;
        markError(name);
      }

      if (!emailValue || !validateEmail(emailValue)) {
        valid = false;
        markError(email);
      }

      if (!attendanceValue) {
        valid = false;
        markError(attendance);
      }

      if (!valid) {
        showStatus("Please complete the required fields before sending.", "error");
        return;
      }

      const rsvpData = {
        name: nameValue,
        email: emailValue,
        attendance: attendanceValue,
        message: messageValue,
        notes: notesValue,
        submittedAt: new Date().toISOString(),
      };

      // Save locally as a simple fallback until backend is wired in.
      try {
        localStorage.setItem("joe-birthday-rsvp", JSON.stringify(rsvpData));
      } catch (err) {
        // Storage may be unavailable; ignore silently.
      }

      const attendingText =
        attendanceValue === "yes"
          ? "Wonderful — your RSVP has been sent."
          : "Thanks for letting us know.";

      showStatus(`${attendingText} We have noted your response for Joe’s dinner.`, "success");

      form.reset();

      // Gentle success pulse
      form.classList.add("form--submitted");
      setTimeout(() => form.classList.remove("form--submitted"), 900);
    });
  }

  // ---------- Load saved RSVP draft ----------
  try {
    const saved = localStorage.getItem("joe-birthday-rsvp");
    if (saved && form) {
      const data = JSON.parse(saved);
      const name = document.getElementById("name");
      const email = document.getElementById("email");
      const attendance = document.getElementById("attendance");
      const message = document.getElementById("message");
      const notes = document.getElementById("notes");

      if (data?.name) name.value = data.name;
      if (data?.email) email.value = data.email;
      if (data?.attendance) attendance.value = data.attendance;
      if (data?.message) message.value = data.message;
      if (data?.notes) notes.value = data.notes;
    }
  } catch (err) {
    // Ignore storage parse failures.
  }

  // ---------- Active section hint ----------
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});
