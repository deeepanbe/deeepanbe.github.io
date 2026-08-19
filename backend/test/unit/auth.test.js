const { createUser, authenticate, issueVerificationToken, verifyEmail, signAccessToken, verifyAccessToken, hashToken } = require('../../auth');

// Mock database
jest.mock('../../db', () => ({
  query: jest.fn()
}));

const { query } = require('../../db');

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-must-be-at-least-32-characters-long-yes';
  });

  describe('createUser', () => {
    it('should hash password and create user', async () => {
      const mockUser = { id: '123', email: 'test@example.com', display_name: 'Test', plan: 'free' };
      query.mockResolvedValueOnce({ rows: [mockUser] });
      query.mockResolvedValueOnce({ rows: [{ id: 'ws-123' }] });
      query.mockResolvedValueOnce({ rows: [] });

      const result = await createUser({ email: 'test@example.com', password: 'ValidPassword123!', displayName: 'Test' });
      expect(result.email).toBe('test@example.com');
      expect(query).toHaveBeenCalledTimes(3);
    });

    it('should reject short passwords', async () => {
      await expect(createUser({ email: 'test@example.com', password: 'short' })).rejects.toThrow('at least 10 characters');
    });

    it('should reject invalid emails', async () => {
      await expect(createUser({ email: 'not-an-email', password: 'ValidPassword123!' })).rejects.toThrow('Invalid email');
    });
  });

  describe('authenticate', () => {
    it('should return null for invalid credentials', async () => {
      query.mockResolvedValueOnce({ rows: [] });
      const result = await authenticate('unknown@example.com', 'password');
      expect(result).toBeNull();
    });
  });

  describe('JWT tokens', () => {
    it('should sign and verify access tokens', () => {
      const user = { id: 'user-123', email: 'test@example.com', plan: 'pro' };
      const token = signAccessToken(user);
      const claims = verifyAccessToken(token);
      expect(claims.sub).toBe('user-123');
      expect(claims.email).toBe('test@example.com');
      expect(claims.iss).toBe('dj-ai');
    });

    it('should throw without JWT_SECRET', () => {
      delete process.env.JWT_SECRET;
      expect(() => signAccessToken({ id: 'user-1', email: 'test@example.com' })).toThrow();
    });
  });

  describe('email verification', () => {
    it('should issue verification tokens', async () => {
      query.mockResolvedValueOnce({ rows: [] });
      const token = await issueVerificationToken('user-123');
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should hash tokens consistently', () => {
      const token = 'test-token-value';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(token);
    });
  });
});
