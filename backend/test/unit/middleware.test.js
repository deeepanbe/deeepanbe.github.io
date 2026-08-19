const { validateConfig, requestIdMiddleware } = require('../../middleware');

describe('Configuration Validation', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should pass with all required vars set', async () => {
    process.env.JWT_SECRET = 'test-secret-must-be-at-least-32-characters-long';
    process.env.DATABASE_URL = 'postgresql://localhost/db';
    process.env.TURNSTILE_SECRET = 'test-turnstile-secret';
    process.env.NODE_ENV = 'development';
    process.env.OPENAI_API_KEY = 'sk-test';
    process.env.AI_PROVIDER = 'openai';

    // Should not throw
    await expect(validateConfig()).resolves.not.toThrow();
  });

  it('should fail without JWT_SECRET', async () => {
    delete process.env.JWT_SECRET;
    process.env.DATABASE_URL = 'postgresql://localhost/db';
    process.env.TURNSTILE_SECRET = 'test-turnstile';

    await expect(validateConfig()).rejects.toThrow('JWT_SECRET');
  });

  it('should fail with short JWT_SECRET', async () => {
    process.env.JWT_SECRET = 'short';
    process.env.DATABASE_URL = 'postgresql://localhost/db';
    process.env.TURNSTILE_SECRET = 'test-turnstile';

    await expect(validateConfig()).rejects.toThrow('at least 32 characters');
  });

  it('should fail without DATABASE_URL', async () => {
    process.env.JWT_SECRET = 'test-secret-must-be-at-least-32-characters-long';
    delete process.env.DATABASE_URL;
    process.env.TURNSTILE_SECRET = 'test-turnstile';

    await expect(validateConfig()).rejects.toThrow('DATABASE_URL');
  });
});

describe('Request ID Middleware', () => {
  it('should assign unique request ID to each request', () => {
    const req = { headers: {}, path: '/test', method: 'GET', ip: '127.0.0.1' };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    requestIdMiddleware(req, res, next);

    expect(req.id).toBeTruthy();
    expect(typeof req.id).toBe('string');
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.id);
    expect(next).toHaveBeenCalled();
  });

  it('should assign different IDs to different requests', () => {
    const req1 = { headers: {}, path: '/test', method: 'GET', ip: '127.0.0.1' };
    const req2 = { headers: {}, path: '/test', method: 'GET', ip: '127.0.0.1' };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    requestIdMiddleware(req1, res, next);
    requestIdMiddleware(req2, res, next);

    expect(req1.id).not.toBe(req2.id);
  });
});
