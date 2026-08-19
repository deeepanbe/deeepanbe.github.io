const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate } = require('../agent');
const { createAIProvider } = require('../ai/provider');

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