// script.js
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const form = document.getElementById("rsvpForm");
  const fullName = document.getElementById("fullName");
  const attendance = document.getElementById("attendance");
  const contact = document.getElementById("contact");
  const message = document.getElementById("message");
  const heroDetails = document.querySelector(".hero__details");
  const heroSubtitle = document.querySelector(".hero__subtitle");
  const submitBtn = form?.querySelector('button[type="submit"]');

  const STORAGE_KEY = "joes_surprise_rsvp";

  // Smooth scrolling for anchor links
  document.documentElement.style.scrollBehavior = "smooth";

  // -----------------------------
  // Countdown (30 May, 7:00 PM)
  // -----------------------------
  function getEventDate() {
    const now = new Date();
    const year = now.getFullYear();

    // Event date: Saturday 30 May at 7:00 PM
    let eventDate = new Date(year, 4, 30, 19, 0, 0); // Month is 0-based; 4 = May

    // If that date has passed in the current year, use next year
    if (eventDate.getTime() < now.getTime()) {
      eventDate = new Date(year + 1, 4, 30, 19, 0, 0);
    }

    return eventDate;
  }

  function formatCountdown(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  let countdownValueEl = null;

  function ensureCountdownPill() {
    if (!heroDetails || countdownValueEl) return;

    const pill = document.createElement("div");
    pill.className = "detail-pill detail-pill--countdown";
    pill.innerHTML = `
      <span class="detail-pill__label">Countdown</span>
      <span class="detail-pill__value" id="countdownValue">Loading...</span>
    `;

    heroDetails.appendChild(pill);
    countdownValueEl = document.getElementById("countdownValue");
  }

  function updateCountdown() {
    ensureCountdownPill();

    if (!countdownValueEl) return;

    const now = new Date();
    const eventDate = getEventDate();
    const diff = eventDate.getTime() - now.getTime();

    if (diff <= 0) {
      countdownValueEl.textContent = "Tonight";
      if (heroSubtitle) {
        heroSubtitle.textContent = "It is time to celebrate Joe.";
      }
      return;
    }

    countdownValueEl.textContent = formatCountdown(diff);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // -----------------------------
  // RSVP form behavior
  // -----------------------------
  function createFeedbackBox(type, text) {
    let box = document.querySelector(".rsvp-feedback");

    if (!box) {
      box = document.createElement("div");
      box.className = "rsvp-feedback";
      form.appendChild(box);
    }

    box.textContent = text;
    box.dataset.type = type;
    return box;
  }

  function loadSavedRSVP() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const data = JSON.parse(saved);

      if (data.fullName) fullName.value = data.fullName;
      if (data.attendance) attendance.value = data.attendance;
      if (data.contact) contact.value = data.contact;
      if (data.message) message.value = data.message;

      createFeedbackBox("success", "Your RSVP details are already saved on this device.");
    } catch (error) {
      // Silently fail if storage is unavailable or corrupted
      console.warn("Could not load saved RSVP:", error);
    }
  }

  loadSavedRSVP();

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameValue = fullName.value.trim();
    const attendanceValue = attendance.value;
    const contactValue = contact.value.trim();
    const messageValue = message.value.trim();

    if (!nameValue) {
      createFeedbackBox("error", "Please enter your name.");
      fullName.focus();
      return;
    }

    if (!attendanceValue) {
      createFeedbackBox("error", "Please choose whether you will attend.");
      attendance.focus();
      return;
    }

    const rsvpData = {
      fullName: nameValue,
      attendance: attendanceValue,
      contact: contactValue,
      message: messageValue,
      submittedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rsvpData));
    } catch (error) {
      console.warn("Could not save RSVP to localStorage:", error);
    }

    const attendanceText =
      attendanceValue === "yes"
        ? "accepted the invitation"
        : attendanceValue === "no"
        ? "declined the invitation"
        : "marked maybe";

    createFeedbackBox(
      "success",
      `Thank you, ${nameValue}. Your RSVP has been recorded. You have ${attendanceText} for Joe’s dinner.`
    );

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "RSVP Submitted";
    }

    // Optional: slightly soften the form after submission
    form.classList.add("is-submitted");
  });

  // -----------------------------
  // Small quality-of-life touches
  // -----------------------------
  const inputs = form ? form.querySelectorAll("input, select, textarea") : [];
  inputs.forEach((field) => {
    field.addEventListener("focus", () => {
      field.parentElement?.classList.add("is-focused");
    });

    field.addEventListener("blur", () => {
      field.parentElement?.classList.remove("is-focused");
    });
  });
});
