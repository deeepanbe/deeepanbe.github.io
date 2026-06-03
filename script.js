(function () {
  "use strict";

  function openDJ() {
    window.open("dj/dj.html", "_blank", "noopener");
  }

  function djExplain(projectName) {
    const prompt = encodeURIComponent(`Explain ${projectName}`);
    window.open(`dj/dj.html?prompt=${prompt}`, "_blank", "noopener");
  }

  function showNotification(message, type = "info") {
    const note = document.createElement("div");
    note.className = `notification notification-${type}`;
    note.textContent = message;
    Object.assign(note.style, {
      position: "fixed",
      top: "18px",
      right: "18px",
      zIndex: "1000",
      maxWidth: "320px",
      padding: "13px 15px",
      borderRadius: "8px",
      border: "1px solid #dce6f2",
      color: type === "error" ? "#9a3412" : "#0756d8",
      background: "#ffffff",
      boxShadow: "0 18px 50px rgba(16, 32, 51, 0.14)",
      font: "700 14px Inter, system-ui, sans-serif"
    });
    document.body.appendChild(note);
    window.setTimeout(() => note.remove(), 3200);
  }

  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = form.querySelector("[name='email']")?.value || "";
      const subject = encodeURIComponent(form.querySelector("[name='subject']")?.value || "Portfolio inquiry");
      const body = encodeURIComponent(form.querySelector("[name='message']")?.value || "");
      window.location.href = `mailto:deepanraj.a@outlook.com?subject=${subject}&body=${body}%0A%0AFrom:%20${encodeURIComponent(email)}`;
      showNotification("Opening your email app with the message ready.", "success");
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll("a[href^='#']").forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const target = document.querySelector(anchor.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function initReveal() {
    const items = document.querySelectorAll(".section, .card, .timeline-item, .chart-card, .dashboard-card");
    if (!items.length || !("IntersectionObserver" in window)) return;

    items.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(14px)";
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.transition = "opacity 420ms ease, transform 420ms ease";
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    items.forEach((item) => observer.observe(item));
  }

  function initLazyIframes() {
    document.querySelectorAll("iframe[src]").forEach((frame) => {
      if (frame.loading) return;
      frame.loading = "lazy";
    });
  }

  window.openDJ = window.openDJ || openDJ;
  window.djExplain = window.djExplain || djExplain;
  window.showNotification = window.showNotification || showNotification;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initContactForm();
      initSmoothScroll();
      initReveal();
      initLazyIframes();
    }, { once: true });
  } else {
    initContactForm();
    initSmoothScroll();
    initReveal();
    initLazyIframes();
  }
})();
