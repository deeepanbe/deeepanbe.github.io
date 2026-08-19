const api = document.getElementById('api'); const q = document.getElementById('q'); const out = document.getElementById('out');
chrome.storage.local.get(['backendUrl'], value => { api.value = value.backendUrl || ''; });
api.addEventListener('change', () => chrome.storage.local.set({ backendUrl: api.value.trim().replace(/\/$/, '') }));
document.getElementById('ask').addEventListener('click', async () => {
  try {
    const backend = api.value.trim().replace(/\/$/, ''); if (!backend) throw new Error('Set the backend URL in the extension options');
    out.textContent = 'The public extension requires Turnstile or an authenticated session. Use the web app for interactive verification.';
    await chrome.storage.local.set({ backendUrl: backend });
  } catch (e) { out.textContent = e.message; }
});