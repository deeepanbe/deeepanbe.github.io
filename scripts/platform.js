(function () {
  "use strict";

  const selectors = {
    navToggle: "[data-nav-toggle]",
    navMenu: "[data-nav-menu]",
    navLink: "[data-nav-link]",
    header: "[data-site-header]",
    section: ".section-anchor",
    typing: "[data-typing]",
    counter: ".counter",
    prev: "[data-prev-section]",
    next: "[data-next-section]",
    top: "[data-back-top]",
    privateOpen: "[data-private-open]",
    privateModal: "[data-private-modal]",
    privateClose: "[data-private-close]",
    privateForm: "[data-private-form]",
    privatePassword: "[data-private-password]",
    privateError: "[data-private-error]",
    privateLogin: "[data-private-login]",
    privateContent: "[data-private-content]",
    privateLock: "[data-private-lock]",
    aiPrompt: "[data-ai-prompt]"
  };

  const expectedPasswordHash = "af0c3d6e2e0f894f61eed9e7f196832836c24841c3387f2540a902d28f8276d8";
  const privateSessionKey = "deepanraj.private.access.expires";
  const privateSessionMs = 20 * 60 * 1000;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const navToggle = $(selectors.navToggle);
  const navMenu = $(selectors.navMenu);
  const navLinks = $$(selectors.navLink);
  const sections = $$(selectors.section);

  function closeMobileNav() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function initNavigation() {
    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });

    const activeObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const id = visible.target.id;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    }, { rootMargin: "-22% 0px -62% 0px", threshold: [0.16, 0.35, 0.6] });

    sections.forEach((section) => activeObserver.observe(section));
  }

  function sectionIndex() {
    const y = window.scrollY + window.innerHeight * 0.32;
    let current = 0;
    sections.forEach((section, index) => {
      if (section.offsetTop <= y) current = index;
    });
    return current;
  }

  function scrollToSection(index) {
    const target = sections[Math.max(0, Math.min(sections.length - 1, index))];
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function initFloatingNavigation() {
    $(selectors.prev)?.addEventListener("click", () => scrollToSection(sectionIndex() - 1));
    $(selectors.next)?.addEventListener("click", () => scrollToSection(sectionIndex() + 1));
    $(selectors.top)?.addEventListener("click", () => scrollToSection(0));

    document.addEventListener("keydown", (event) => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable;
      if (isTyping) return;

      if (event.altKey && event.key === "ArrowDown") {
        event.preventDefault();
        scrollToSection(sectionIndex() + 1);
      }

      if (event.altKey && event.key === "ArrowUp") {
        event.preventDefault();
        scrollToSection(sectionIndex() - 1);
      }

      if (event.key === "Escape") {
        closeMobileNav();
        closePrivateModal();
      }
    });
  }

  function initTypingEffect() {
    const target = $(selectors.typing);
    if (!target) return;

    const phrases = [
      "Power BI dashboards",
      "SQL analytics",
      "Python automation",
      "AI analyst copilots",
      "executive KPI storytelling"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const phrase = phrases[phraseIndex];
      target.textContent = phrase.slice(0, charIndex);

      if (!deleting && charIndex < phrase.length) {
        charIndex += 1;
        window.setTimeout(tick, 58);
        return;
      }

      if (!deleting && charIndex === phrase.length) {
        deleting = true;
        window.setTimeout(tick, 1200);
        return;
      }

      if (deleting && charIndex > 0) {
        charIndex -= 1;
        window.setTimeout(tick, 28);
        return;
      }

      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      window.setTimeout(tick, 260);
    }

    tick();
  }

  function animateCounter(el) {
    if (el.dataset.done === "true") return;
    el.dataset.done = "true";

    const target = Number(el.dataset.count || 0);
    const duration = 1100;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  function initCountersAndReveal() {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    $$(selectors.counter).forEach((counter) => counterObserver.observe(counter));

    const revealItems = $$(".service-card, .project-card, .trust-grid article, .cert-grid article, .cert-strip, .timeline-item, .skill-meter, .github-proof, .resume-panel, .copilot-demo");
    revealItems.forEach((item) => item.classList.add("reveal-ready"));

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  async function sha256(value) {
    const data = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function hasPrivateSession() {
    const expiry = Number(sessionStorage.getItem(privateSessionKey) || 0);
    if (!expiry || Date.now() > expiry) {
      sessionStorage.removeItem(privateSessionKey);
      return false;
    }
    return true;
  }

  function syncPrivateState() {
    const modal = $(selectors.privateModal);
    if (!modal) return;

    const login = $(selectors.privateLogin, modal);
    const content = $(selectors.privateContent, modal);
    const unlocked = hasPrivateSession();

    if (login) login.hidden = unlocked;
    if (content) content.hidden = !unlocked;
  }

  function openPrivateModal() {
    const modal = $(selectors.privateModal);
    if (!modal) return;
    syncPrivateState();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");

    const focusTarget = hasPrivateSession() ? $(selectors.privateLock, modal) : $(selectors.privatePassword, modal);
    window.setTimeout(() => focusTarget?.focus(), 40);
  }

  function closePrivateModal() {
    const modal = $(selectors.privateModal);
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
  }

  function initPrivateAccess() {
    const modal = $(selectors.privateModal);
    if (!modal) return;

    $$(selectors.privateOpen).forEach((button) => button.addEventListener("click", openPrivateModal));
    $(selectors.privateClose, modal)?.addEventListener("click", closePrivateModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closePrivateModal();
    });

    $(selectors.privateForm, modal)?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = $(selectors.privatePassword, modal);
      const error = $(selectors.privateError, modal);
      if (!input) return;

      try {
        const hash = await sha256(input.value);
        if (hash === expectedPasswordHash) {
          sessionStorage.setItem(privateSessionKey, String(Date.now() + privateSessionMs));
          input.value = "";
          if (error) error.textContent = "";
          syncPrivateState();
          $(selectors.privateLock, modal)?.focus();
          return;
        }
      } catch (err) {
        if (error) error.textContent = "Browser crypto is unavailable. Try a modern browser.";
        return;
      }

      if (error) error.textContent = "Invalid password. Please check the authorized access code.";
      input.select();
    });

    $(selectors.privateLock, modal)?.addEventListener("click", () => {
      sessionStorage.removeItem(privateSessionKey);
      syncPrivateState();
      $(selectors.privatePassword, modal)?.focus();
    });

    window.setInterval(syncPrivateState, 30 * 1000);
  }

  function init() {
    initNavigation();
    initFloatingNavigation();
    initTypingEffect();
    initCountersAndReveal();
    initPrivateAccess();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
