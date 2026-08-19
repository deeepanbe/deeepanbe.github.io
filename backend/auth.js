const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || '';
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '7d';

function hashToken(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function requireJwtSecret() { if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters'); }
function signAccessToken(user) { requireJwtSecret(); return jwt.sign({ sub: user.id, email: user.email, plan: user.plan }, JWT_SECRET, { expiresIn: ACCESS_TTL, issuer: 'dj-ai' }); }
function verifyAccessToken(token) { requireJwtSecret(); return jwt.verify(token, JWT_SECRET, { issuer: 'dj-ai' }); }

async function createUser({ email, password, displayName }) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalized)) throw new Error('Invalid email');
  if (typeof password !== 'string' || password.length < 10) throw new Error('Password must be at least 10 characters');
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await query('INSERT INTO users(email,password_hash,display_name) VALUES($1,$2,$3) RETURNING id,email,display_name,plan,email_verified_at,created_at', [normalized, passwordHash, String(displayName || '').trim().slice(0, 120)]);
  const user = result.rows[0];
  const workspace = await query('INSERT INTO workspaces(owner_user_id,name) VALUES($1,$2) RETURNING id', [user.id, 'Personal']);
  await query('INSERT INTO workspace_members(workspace_id,user_id,role) VALUES($1,$2,\'owner\')', [workspace.rows[0].id, user.id]);
  return user;
}

async function authenticate(email, password) {
  const result = await query('SELECT * FROM users WHERE email=$1', [String(email || '').trim().toLowerCase()]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password || '', user.password_hash))) return null;
  return user;
}

async function issueVerificationToken(userId) {
  const raw = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(raw);
  await query('INSERT INTO verification_tokens(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval \'24 hours\')', [userId, tokenHash]);
  return raw;
}

async function verifyEmail(rawToken) {
  const tokenHash = hashToken(rawToken || '');
  const result = await query(`UPDATE verification_tokens SET used_at=now() WHERE token_hash=$1 AND used_at IS NULL AND expires_at>now() RETURNING user_id`, [tokenHash]);
  if (!result.rows[0]) return false;
  await query('UPDATE users SET email_verified_at=now(),updated_at=now() WHERE id=$1', [result.rows[0].user_id]);
  return true;
}

async function currentUserFromRequest(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  let claims;
  try { claims = verifyAccessToken(token); } catch { return null; }
  const result = await query('SELECT id,email,display_name,plan,email_verified_at,created_at FROM users WHERE id=$1', [claims.sub]);
  return result.rows[0] || null;
}

async function requireUser(req, res, next) {
  try {
    const user = await currentUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    if (!user.email_verified_at) return res.status(403).json({ error: 'Email verification required' });
    req.user = user;
    return next();
  } catch { return res.status(503).json({ error: 'Authentication service unavailable' }); }
}

module.exports = { createUser, authenticate, issueVerificationToken, verifyEmail, signAccessToken, currentUserFromRequest, requireUser, hashToken };