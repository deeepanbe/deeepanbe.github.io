(function () {
  "use strict";

  const SCRIPT_ID = "cf-turnstile-api";
  const CONTAINER_ID = "dj-turnstile-container";

  function loadScript() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (window.__djTurnstileScriptPromise) return window.__djTurnstileScriptPromise;

    window.__djTurnstileScriptPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById(SCRIPT_ID);
      if (existing) {
        existing.addEventListener("load", () => resolve(window.turnstile), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile failed to load"));
      script.onerror = () => reject(new Error("Turnstile failed to load"));
      document.head.appendChild(script);
    });

    return window.__djTurnstileScriptPromise;
  }

  function siteKey() {
    return window.DJ_TURNSTILE_SITE_KEY ||
      (window.DJ_CONFIG && window.DJ_CONFIG.TURNSTILE_SITE_KEY) ||
      "";
  }

  async function getToken() {
    const key = siteKey();
    if (!key) throw new Error("DJ AI human verification is not configured yet");

    const turnstile = await loadScript();
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
      container = document.createElement("div");
      container.id = CONTAINER_ID;
      container.setAttribute("aria-hidden", "true");
      container.style.cssText = "position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;overflow:hidden";
      document.body.appendChild(container);
    }

    if (container.dataset.widgetId && turnstile.reset) {
      try { turnstile.reset(container.dataset.widgetId); } catch {}
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        fn(value);
      };

      const widgetId = turnstile.render(container, {
        sitekey: key,
        size: "invisible",
        callback: (token) => finish(resolve, token),
        "error-callback": () => finish(reject, new Error("Human verification failed")),
        "expired-callback": () => finish(reject, new Error("Human verification expired"))
      });
      container.dataset.widgetId = widgetId;
    });
  }

  window.DJTurnstile = { getToken };
})();