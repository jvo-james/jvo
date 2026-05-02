// scripts.js
document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const body = document.body;
  const root = document.documentElement;

  const countdownEls = {
    days: document.querySelector("[data-days]"),
    hours: document.querySelector("[data-hours]"),
    minutes: document.querySelector("[data-minutes]"),
    seconds: document.querySelector("[data-seconds]"),
  };

  const rsvpForm = document.querySelector(".rsvp-form");
  const attendanceInput = document.querySelector('input[name="attending"]');
  const attendanceTile = document.querySelector(".attendance-tile");
  const nameInput = document.querySelector('input[name="fullName"]');
  const hero = document.querySelector(".hero");
  const ornaments = document.querySelectorAll(".ornament, .motion-float, .motion-float-slow");
  const revealTargets = document.querySelectorAll(
    ".section, .detail-card, .gallery-card, .story-card, .countdown-card, .location-card, .rsvp-wrap, .hero-copy, .hero-visual"
  );

  // ----------------------------
  // Smooth anchor scrolling
  // ----------------------------
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  });

  // ----------------------------
  // Countdown
  // Saturday, 30 May at 7:00 PM local time
  // If that date has passed this year, it rolls to next year.
  // ----------------------------
  function buildEventDate() {
    const now = new Date();
    let year = now.getFullYear();

    let eventDate = new Date(year, 4, 30, 19, 0, 0, 0); // May = 4
    if (eventDate.getTime() < now.getTime()) {
      eventDate = new Date(year + 1, 4, 30, 19, 0, 0, 0);
    }

    return eventDate;
  }

  const EVENT_DATE = buildEventDate();

  function pad(num) {
    return String(num).padStart(2, "0");
  }

  function animateCountChange(el) {
    if (!el) return;
    el.classList.remove("count-pop");
    void el.offsetWidth;
    el.classList.add("count-pop");
  }

  function updateCountdown() {
    const now = new Date();
    const diff = Math.max(0, EVENT_DATE.getTime() - now.getTime());

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    if (countdownEls.days && countdownEls.days.textContent !== pad(days)) {
      countdownEls.days.textContent = pad(days);
      animateCountChange(countdownEls.days);
    }
    if (countdownEls.hours && countdownEls.hours.textContent !== pad(hours)) {
      countdownEls.hours.textContent = pad(hours);
      animateCountChange(countdownEls.hours);
    }
    if (countdownEls.minutes && countdownEls.minutes.textContent !== pad(minutes)) {
      countdownEls.minutes.textContent = pad(minutes);
      animateCountChange(countdownEls.minutes);
    }
    if (countdownEls.seconds && countdownEls.seconds.textContent !== pad(seconds)) {
      countdownEls.seconds.textContent = pad(seconds);
      animateCountChange(countdownEls.seconds);
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ----------------------------
  // Scroll reveal
  // ----------------------------
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealTargets.forEach((el) => {
      el.classList.add("reveal-ready");
      revealObserver.observe(el);
    });
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  // ----------------------------
  // Attendance checkbox polish
  // ----------------------------
  function syncAttendanceState() {
    if (!attendanceInput || !attendanceTile) return;
    attendanceTile.classList.toggle("is-checked", attendanceInput.checked);
  }

  if (attendanceInput) {
    attendanceInput.addEventListener("change", syncAttendanceState);
    syncAttendanceState();
  }

  // Make the whole tile feel clickable
  if (attendanceTile && attendanceInput) {
    attendanceTile.addEventListener("click", (e) => {
      if (e.target !== attendanceInput) {
        attendanceInput.checked = !attendanceInput.checked;
        attendanceInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  // ----------------------------
  // RSVP handling
  // ----------------------------
  function showToast(message, type = "success") {
    const existing = document.querySelector(".toast-message");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `toast-message toast-${type}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;

    // Minimal inline styles so it works even before CSS is added.
    toast.style.position = "fixed";
    toast.style.left = "50%";
    toast.style.bottom = "24px";
    toast.style.transform = "translateX(-50%) translateY(12px)";
    toast.style.padding = "14px 18px";
    toast.style.borderRadius = "999px";
    toast.style.zIndex = "9999";
    toast.style.maxWidth = "90vw";
    toast.style.textAlign = "center";
    toast.style.pointerEvents = "none";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 300ms ease, transform 300ms ease";
    toast.style.letterSpacing = "0.02em";
    toast.style.backdropFilter = "blur(10px)";
    toast.style.border = "1px solid rgba(212, 175, 55, 0.35)";
    toast.style.background = "rgba(10, 10, 10, 0.92)";
    toast.style.color = "#f4d9a3";
    toast.style.fontFamily = "Inter, sans-serif";
    toast.style.boxShadow = "0 16px 40px rgba(0,0,0,0.35)";

    body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(12px)";
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  function burstConfetti(fromEl) {
    if (!fromEl) return;

    const rect = fromEl.getBoundingClientRect();
    const colors = ["#d4af37", "#f5e6a9", "#b8860b", "#ffffff"];

    for (let i = 0; i < 18; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";

      const size = 6 + Math.random() * 8;
      const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 120;
      const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * 30;
      const tx = (Math.random() - 0.5) * 220;
      const ty = -80 - Math.random() * 180;
      const rot = Math.random() * 360;

      piece.style.position = "fixed";
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      piece.style.width = `${size}px`;
      piece.style.height = `${size}px`;
      piece.style.borderRadius = "50%";
      piece.style.pointerEvents = "none";
      piece.style.zIndex = "9998";
      piece.style.background = colors[i % colors.length];
      piece.style.boxShadow = "0 0 12px rgba(212,175,55,0.5)";
      piece.style.opacity = "1";
      piece.style.transition = "transform 900ms cubic-bezier(.2,.8,.2,1), opacity 900ms ease";

      body.appendChild(piece);

      requestAnimationFrame(() => {
        piece.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(0.7)`;
        piece.style.opacity = "0";
      });

      setTimeout(() => piece.remove(), 1000);
    }
  }

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fullName = nameInput ? nameInput.value.trim() : "";
      const attending = attendanceInput ? attendanceInput.checked : false;

      if (!fullName) {
        showToast("Please enter your name.", "error");
        nameInput?.focus();
        return;
      }

      if (!attending) {
        showToast("Please confirm attendance to continue.", "error");
        attendanceInput?.focus();
        return;
      }

      // Replace this with your backend later.
      burstConfetti(rsvpForm.querySelector(".submit-btn"));
      showToast(`RSVP received. Thank you, ${fullName}.`, "success");

      rsvpForm.reset();
      syncAttendanceState();

      const submitBtn = rsvpForm.querySelector(".submit-btn");
      if (submitBtn) {
        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> RSVP Sent';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
        }, 2200);
      }
    });
  }

  // ----------------------------
  // Parallax motion for the background ornaments
  // ----------------------------
  function handlePointerMove(e) {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    root.style.setProperty("--mouse-x", x.toFixed(3));
    root.style.setProperty("--mouse-y", y.toFixed(3));

    if (!prefersReducedMotion) {
      ornaments.forEach((el, index) => {
        const depth = (index + 1) * 6;
        const offsetX = (x - 0.5) * depth;
        const offsetY = (y - 0.5) * depth;
        el.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      });
    }
  }

  if (!prefersReducedMotion) {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
  }

  // ----------------------------
  // Scroll progress variables
  // ----------------------------
  function handleScroll() {
    const scrolled = window.scrollY || document.documentElement.scrollTop || 0;
    root.style.setProperty("--scroll-y", String(scrolled));
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // ----------------------------
  // Tiny dynamic stars / sparkles
  // ----------------------------
  if (!prefersReducedMotion) {
    const sparkleCount = 22;

    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle-dot";
      sparkle.setAttribute("aria-hidden", "true");

      const size = 2 + Math.random() * 3;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = 7 + Math.random() * 10;
      const delay = Math.random() * 6;

      sparkle.style.position = "fixed";
      sparkle.style.left = `${left}vw`;
      sparkle.style.top = `${top}vh`;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.borderRadius = "50%";
      sparkle.style.pointerEvents = "none";
      sparkle.style.zIndex = "0";
      sparkle.style.background = "rgba(245, 230, 169, 0.7)";
      sparkle.style.boxShadow = "0 0 12px rgba(212,175,55,0.55)";
      sparkle.style.opacity = "0.2";
      sparkle.style.animation = `sparklePulse ${duration}s ease-in-out ${delay}s infinite`;

      body.appendChild(sparkle);
    }
  }

  // ----------------------------
  // Extra nice touch: focus styles on navigation / buttons
  // ----------------------------
  document.querySelectorAll("a, button, input").forEach((el) => {
    el.addEventListener("focus", () => el.classList.add("is-focused"));
    el.addEventListener("blur", () => el.classList.remove("is-focused"));
  });
});
