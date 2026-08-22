/* DJ AI runtime configuration — safe to commit.
 *
 * Keep real secrets out of this file. The browser may contain only public
 * values such as the backend URL and Turnstile site key.
 *
 * The backend has not been hard-coded here because the hosting provider's
 * final public URL must be verified after deployment. An empty URL keeps the
 * portfolio safe and allows DJ AI's documented local/graceful fallback until
 * the real backend is connected.
 *
 * After deployment, replace the two empty strings with the verified public
 * backend URL and Turnstile site key, then commit and push.
 */
window.DJ_BACKEND_URL = '';
window.DJ_TURNSTILE_SITE_KEY = '';
