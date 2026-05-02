document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const hero = document.querySelector(".hero");
  const heroMedia = document.querySelector(".hero__media");
  const heroCopy = document.querySelector(".hero__copy");
  const rsvpCard = document.querySelector(".rsvp-card");
  const form = document.querySelector(".rsvp-form");
  const nameInput = document.querySelector("#name");
  const attendingInput = document.querySelector("#attending");
  const submitBtn = document.querySelector(".submit-btn");
  const photoFrames = document.querySelectorAll(".photo-frame");
  const doodles = document.querySelectorAll(".doodle");
  const eventCard = document.querySelector(".event-card");

  body.classList.add("js-ready");

  // Entrance reveal
  const revealTargets = [heroMedia, heroCopy, rsvpCard, eventCard, ...photoFrames, ...doodles].filter(Boolean);

  revealTargets.forEach((el, index) => {
    el.classList.add("reveal-item");
    el.style.transitionDelay = `${index * 90}ms`;
  });

  requestAnimationFrame(() => {
    body.classList.add("page-animated");
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  });

  // Subtle hero parallax
  if (hero && heroMedia) {
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const updateParallax = () => {
      targetX += (mouseX - targetX) * 0.06;
      targetY += (mouseY - targetY) * 0.06;

      heroMedia.style.setProperty("--mx", `${targetX}px`);
      heroMedia.style.setProperty("--my", `${targetY}px`);

      photoFrames.forEach((frame, index) => {
        const depth = index === 0 ? 0.35 : 0.18;
        frame.style.transform = `translate3d(${targetX * depth}px, ${targetY * depth}px, 0)`;
      });

      doodles.forEach((doodle, index) => {
        const depth = 0.12 + index * 0.03;
        doodle.style.transform = `translate3d(${targetX * depth}px, ${targetY * depth}px, 0) rotate(${targetX * 0.01}deg)`;
      });

      requestAnimationFrame(updateParallax);
    };

    hero.addEventListener("pointermove", (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = x / 18;
      mouseY = y / 18;
    });

    hero.addEventListener("pointerleave", () => {
      mouseX = 0;
      mouseY = 0;
    });

    requestAnimationFrame(updateParallax);
  }

  // Soft scroll reveal
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealTargets.forEach((el) => observer.observe(el));

  // Fancy checkbox behavior
  if (attendingInput) {
    const checkCard = attendingInput.closest(".check-card");

    const syncCheckState = () => {
      if (!checkCard) return;
      checkCard.classList.toggle("is-checked", attendingInput.checked);
      body.classList.toggle("is-attending", attendingInput.checked);
    };

    attendingInput.addEventListener("change", syncCheckState);
    syncCheckState();

    if (checkCard) {
      checkCard.addEventListener("click", () => {
        setTimeout(syncCheckState, 0);
      });
    }
  }

  // RSVP submit handling
  if (form) {
    const feedback = document.createElement("div");
    feedback.className = "rsvp-feedback";
    feedback.setAttribute("aria-live", "polite");
    form.appendChild(feedback);

    const showFeedback = (message, type = "success") => {
      feedback.textContent = message;
      feedback.dataset.state = type;
      feedback.classList.add("is-showing");

      clearTimeout(showFeedback._timer);
      showFeedback._timer = setTimeout(() => {
        feedback.classList.remove("is-showing");
      }, 3500);
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = nameInput ? nameInput.value.trim() : "";
      const attending = attendingInput ? attendingInput.checked : false;

      if (!name) {
        showFeedback("Please enter your name.", "error");
        nameInput?.focus();
        return;
      }

      if (!attending) {
        showFeedback("Please confirm attendance.", "error");
        attendingInput?.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.classList.add("is-sending");
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> RSVP Sent';

      showFeedback(`Thank you, ${name}. Your RSVP has been received.`, "success");
      form.classList.add("is-submitted");

      const inputs = form.querySelectorAll("input");
      inputs.forEach((input) => {
        input.disabled = true;
      });
    });
  }

  // Tiny floating accent for the page
  const createSpark = () => {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.setAttribute("aria-hidden", "true");

    const size = 4 + Math.random() * 8;
    const left = Math.random() * 100;
    const duration = 6 + Math.random() * 8;
    const delay = Math.random() * 2;

    spark.style.setProperty("--spark-size", `${size}px`);
    spark.style.setProperty("--spark-left", `${left}%`);
    spark.style.setProperty("--spark-duration", `${duration}s`);
    spark.style.setProperty("--spark-delay", `${delay}s`);

    hero?.appendChild(spark);

    setTimeout(() => {
      spark.remove();
    }, (duration + delay) * 1000);
  };

  for (let i = 0; i < 7; i += 1) {
    setTimeout(createSpark, i * 700);
  }
});
