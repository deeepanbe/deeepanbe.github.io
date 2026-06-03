// Shared legacy helpers for older portfolio experiments.
// The production site uses scripts/platform.js and stays light-theme only.

function initFadeUp() {
  const els = document.querySelectorAll(".fade-up");
  if (!els.length || !("IntersectionObserver" in window)) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  els.forEach((el) => obs.observe(el));
}

function toggleExp(header) {
  const body = header.nextElementSibling;
  const icon = header.querySelector(".toggle-icon");
  const isOpen = body?.classList.toggle("open");
  if (icon) {
    icon.classList.toggle("open", Boolean(isOpen));
    icon.textContent = isOpen ? "-" : "+";
  }
}

function initTyping(elId, roles) {
  const el = document.getElementById(elId);
  if (!el || !roles?.length) return;

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function type() {
    const role = roles[roleIndex];
    if (!deleting) {
      charIndex += 1;
      el.textContent = role.slice(0, charIndex);
      if (charIndex === role.length) {
        deleting = true;
        window.setTimeout(type, 1600);
        return;
      }
    } else {
      charIndex -= 1;
      el.textContent = role.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }
    window.setTimeout(type, deleting ? 45 : 80);
  }

  type();
}

document.addEventListener("DOMContentLoaded", () => {
  initFadeUp();
  initTyping("typingText", [
    "Data Analyst / SQL / Power BI",
    "BI Developer / DAX / Power Query",
    "Data Visualization Engineer",
    "Azure and Cloud Data Specialist",
    "Python / Pandas / EDA"
  ]);
});
