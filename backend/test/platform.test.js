const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate } = require('../agent');
const { createAIProvider, withRetry, isRetryable } = require('../ai/provider');

test('calculator handles operator precedence and parentheses', () => {
  assert.equal(calculate('2 + 3 * 4'), 14);
  assert.equal(calculate('(2 + 3) * 4'), 20);
  assert.equal(calculate('20 / 5 + 7'), 11);
});

test('calculator rejects unsafe expressions', () => {
  assert.throws(() => calculate('process.exit()'));
  assert.throws(() => calculate('2 ** 3'));
});

test('OpenAI provider requires a server-side key', () => {
  assert.throws(() => createAIProvider({ AI_PROVIDER: 'openai', MODEL: 'gpt-5.6-luna' }), /OPENAI_API_KEY/);
});

test('unknown provider fails closed', () => {
  assert.throws(() => createAIProvider({ AI_PROVIDER: 'unknown', OPENAI_API_KEY: 'x' }), /Unsupported/);
});

test('isRetryable treats timeouts and 5xx/429 as transient', () => {
  assert.equal(isRetryable({ name: 'AbortError' }), true);
  assert.equal(isRetryable({ status: 500 }), true);
  assert.equal(isRetryable({ status: 429 }), true);
  assert.equal(isRetryable({ status: 400 }), false);
});

test('withRetry retries transient failures then succeeds', async () => {
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts += 1;
    if (attempts < 2) { const err = new Error('boom'); err.status = 503; throw err; }
    return 'ok';
  });
  assert.equal(result, 'ok');
  assert.equal(attempts, 2);
});

test('withRetry does not retry non-transient failures', async () => {
  let attempts = 0;
  await assert.rejects(withRetry(async () => {
    attempts += 1;
    const err = new Error('bad request'); err.status = 400; throw err;
  }));
  assert.equal(attempts, 1);
});