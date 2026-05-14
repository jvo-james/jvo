document.addEventListener("DOMContentLoaded", () => {
  // Current year
  const yearEl = document.querySelector("[data-current-year]");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Mobile nav toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    const closeMenu = () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }
});

const contactForm = document.querySelector("#contactForm");
const formMessage = document.querySelector("#formMessage");

if (contactForm && formMessage) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    formMessage.textContent = "Sending...";
    formMessage.className = "form-message";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        formMessage.textContent =
          "Message sent successfully. I’ll get back to you soon.";

        formMessage.classList.add("success");

        contactForm.reset();
      } else {
        formMessage.textContent =
          "Something went wrong. Please try again.";

        formMessage.classList.add("error");
      }
    } catch (error) {
      formMessage.textContent =
        "Network error. Please try again.";

      formMessage.classList.add("error");
    }
  });
}
