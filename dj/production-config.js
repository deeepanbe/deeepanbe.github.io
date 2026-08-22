/* DJ AI runtime configuration — safe to commit.
 * These are PUBLIC values only (a URL and a Turnstile *site* key, which is
 * meant to be public by design). Never put an API key, JWT secret, or
 * Turnstile *secret* key in this file — those belong only in your hosting
 * provider's environment variables (e.g. Render's dashboard).
 *
 * Once your backend is deployed, replace the two placeholder values below,
 * commit, and push. GitHub Pages will pick it up automatically — no build
 * step required.
 */
window.DJ_BACKEND_URL = 'https://YOUR-BACKEND-DOMAIN.example.com';
window.DJ_TURNSTILE_SITE_KEY = 'YOUR_PUBLIC_TURNSTILE_SITE_KEY';
