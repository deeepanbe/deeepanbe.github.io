const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function verifyTurnstile(token, remoteIp, options = {}) {
  const secret = options.secret || process.env.TURNSTILE_SECRET || '';
  if (!secret || !token) return { ok: false, reason: 'missing_credentials' };

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    if (!response.ok) return { ok: false, reason: 'provider_http_error' };
    const payload = await response.json();
    return {
      ok: payload.success === true,
      reason: payload.success === true ? 'verified' : 'provider_rejected',
      hostname: payload.hostname || null,
      action: payload.action || null,
      errorCodes: Array.isArray(payload['error-codes']) ? payload['error-codes'] : []
    };
  } catch (error) {
    return { ok: false, reason: 'provider_unreachable' };
  }
}

module.exports = { verifyTurnstile };
