/*
 * DJ AI secure browser bridge.
 *
 * This file never contains a backend secret or OpenAI key.
 * It obtains a short-lived Cloudflare Turnstile token and injects it into
 * existing POST /chat requests, allowing the current DJ AI UI to keep its
 * local fallback while the backend enforces human verification.
 */
(function () {
  'use strict';

  const config = window.DJ_CONFIG || {};
  const siteKey = config.TURNSTILE_SITE_KEY || '';
  const backendUrl = (config.BACKEND_URL || '').replace(/\/$/, '');

  if (!siteKey || !backendUrl || window.__DJ_SECURE_BRIDGE__) return;
  window.__DJ_SECURE_BRIDGE__ = true;

  let widgetId = null;
  let readyPromise = null;
  const originalFetch = window.fetch.bind(window);

  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve();
    if (readyPromise) return readyPromise;

    readyPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-dj-turnstile]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', () => reject(new Error('Turnstile failed to load')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.dataset.djTurnstile = 'true';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Turnstile failed to load'));
      document.head.appendChild(script);
    });

    return readyPromise;
  }

  async function getToken() {
    await loadTurnstile();
    if (!window.turnstile) throw new Error('Turnstile is unavailable');

    if (widgetId === null) {
      const host = document.createElement('div');
      host.hidden = true;
      host.setAttribute('aria-hidden', 'true');
      document.body.appendChild(host);
      widgetId = window.turnstile.render(host, {
        sitekey: siteKey,
        size: 'invisible'
      });
    }

    return window.turnstile.execute(widgetId);
  }

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input && input.url;
    const method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    const isChat = method === 'POST' && typeof url === 'string' && `${url}`.startsWith(`${backendUrl}/chat`);

    if (!isChat) return originalFetch(input, init);

    const token = await getToken();
    const requestInit = { ...(init || {}) };
    const headers = new Headers(requestInit.headers || (input && input.headers) || {});
    headers.set('Content-Type', 'application/json');

    let payload = requestInit.body;
    if (typeof payload === 'string') {
      payload = JSON.parse(payload);
    } else if (payload instanceof URLSearchParams) {
      payload = Object.fromEntries(payload.entries());
    } else if (!payload) {
      payload = {};
    }

    payload.turnstileToken = token;
    requestInit.body = JSON.stringify(payload);
    requestInit.headers = headers;

    return originalFetch(input, requestInit);
  };
})();
