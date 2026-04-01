const menuToggle = document.getElementById("menu-toggle");
const siteNav = document.getElementById("site-nav");
const navLinks = siteNav ? siteNav.querySelectorAll("a") : [];
const filterButtons = document.querySelectorAll(".filter-btn");
const serviceCards = document.querySelectorAll(".service-card");
const revealItems = document.querySelectorAll(".reveal");
const metricValues = document.querySelectorAll(".metric-value");
const allocationBars = document.querySelectorAll(".allocation-bar span");
const faqItems = document.querySelectorAll(".faq-item");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const timelineSteps = document.querySelectorAll(".timeline-step");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const currentFilter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    serviceCards.forEach((card) => {
      const matches = currentFilter === "all" || card.dataset.category === currentFilter;
      card.classList.toggle("hidden", !matches);
    });
  });
});

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  if (!question) return;

  question.addEventListener("click", () => {
    const isOpen = item.classList.toggle("open");
    question.setAttribute("aria-expanded", String(isOpen));
  });
});

const animateCounter = (element) => {
  const target = Number(element.dataset.target || 0);
  const suffix = target <= 100 ? "%" : "";
  const duration = 1400;
  const startTime = performance.now();

  const updateValue = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);

    element.textContent = `${current}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateValue);
    }
  };

  requestAnimationFrame(updateValue);
};

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");

      if (entry.target.classList.contains("metric-value") && !entry.target.dataset.animated) {
        entry.target.dataset.animated = "true";
        animateCounter(entry.target);
      }

      if (entry.target.classList.contains("allocation-card")) {
        allocationBars.forEach((bar) => {
          const barSize = bar.style.getPropertyValue("--bar-size");
          if (barSize) {
            bar.style.width = barSize;
          }
        });
      }

      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.2
  }
);

revealItems.forEach((item) => revealObserver.observe(item));
metricValues.forEach((metric) => revealObserver.observe(metric));

const allocationCard = document.querySelector(".allocation-card");
if (allocationCard) {
  revealObserver.observe(allocationCard);
}

const timelineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      timelineSteps.forEach((step) => step.classList.remove("active"));
      entry.target.classList.add("active");
    });
  },
  {
    threshold: 0.55
  }
);

timelineSteps.forEach((step) => timelineObserver.observe(step));

const validators = {
  name: (value) => value.trim().length >= 3 || "Escribe tu nombre completo.",
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Ingresa un correo válido.",
  phone: (value) => /^[\d\s()+-]{8,}$/.test(value.trim()) || "Ingresa un teléfono válido.",
  service: (value) => value.trim() !== "" || "Selecciona un servicio.",
  message: (value) => value.trim().length >= 12 || "Cuéntanos un poco más sobre tu necesidad."
};

const showFieldState = (field, message = "") => {
  const group = field.closest(".field-group");
  const error = group ? group.querySelector(".field-error") : null;

  if (!group || !error) return;

  const hasError = Boolean(message);
  group.classList.toggle("has-error", hasError);
  error.textContent = message;
};

const validateField = (field) => {
  const rule = validators[field.name];
  if (!rule) return true;

  const result = rule(field.value);
  const isValid = result === true;
  showFieldState(field, isValid ? "" : result);
  return isValid;
};

if (contactForm) {
  const fields = [...contactForm.querySelectorAll("input, select, textarea")];

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".field-group")?.classList.contains("has-error")) {
        validateField(field);
      }
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const isFormValid = fields.every((field) => validateField(field));

    if (!isFormValid) {
      formStatus.textContent = "Revisa los campos marcados para continuar.";
      formStatus.style.color = "var(--danger)";
      return;
    }

    formStatus.textContent = "Enviando solicitud...";
    formStatus.style.color = "var(--accent-soft)";

    window.setTimeout(() => {
      contactForm.reset();
      fields.forEach((field) => showFieldState(field));
      formStatus.textContent = "Solicitud enviada con éxito. Te contactaremos pronto.";
      formStatus.style.color = "var(--success)";
    }, 900);
  });
}
