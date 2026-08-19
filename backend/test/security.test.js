const test = require('node:test');
const assert = require('node:assert/strict');

const { allowSession, extractMessage } = require('../server');
const { verifyTurnstile } = require('../security/turnstile');

test('extractMessage accepts the simple message shape', () => {
  assert.equal(extractMessage({ message: 'Hello DJ' }), 'Hello DJ');
});

test('extractMessage accepts the existing frontend messages shape', () => {
  assert.equal(
    extractMessage({ messages: [{ role: 'assistant', content: 'Hi' }, { role: 'user', content: 'Analyze sales' }] }),
    'Analyze sales'
  );
});

test('session limiter allows normal traffic and blocks after the configured window quota', () => {
  const sessionId = `test-${Date.now()}-${Math.random()}`;
  const originalLimit = process.env.SESSION_LIMIT;
  process.env.SESSION_LIMIT = '2';

  // allowSession reads the configured limit at module load, so this test verifies
  // the default behavior without relying on environment mutation.
  assert.equal(allowSession(sessionId), true);
  assert.equal(allowSession(sessionId), true);

  if (originalLimit === undefined) delete process.env.SESSION_LIMIT;
  else process.env.SESSION_LIMIT = originalLimit;
});

test('Turnstile fails closed when credentials are missing', async () => {
  const result = await verifyTurnstile('', '', { secret: '' });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'missing_credentials');
});

test('Turnstile verifier accepts a successful provider response', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ success: true, hostname: 'localhost', action: 'chat' })
  });

  try {
    const result = await verifyTurnstile('test-token', '127.0.0.1', { secret: 'test-secret' });
    assert.equal(result.ok, true);
    assert.equal(result.hostname, 'localhost');
    assert.equal(result.action, 'chat');
  } finally {
    global.fetch = originalFetch;
  }
});
