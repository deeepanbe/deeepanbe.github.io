export function createRateLimiter({ limit = 60, windowMs = 60_000 } = {}) {
  const timestamps = [];

  return function checkLimit() {
    const now = Date.now();
    while (timestamps.length && now - timestamps[0] > windowMs) {
      timestamps.shift();
    }

    if (timestamps.length >= limit) {
      return {
        allowed: false,
        retryAfterMs: windowMs - (now - timestamps[0])
      };
    }

    timestamps.push(now);
    return { allowed: true, retryAfterMs: 0 };
  };
}
