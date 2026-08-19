const crypto = require('crypto');
const express = require('express');
const { query } = require('./db');
const { createUser, authenticate, issueVerificationToken, verifyEmail, signAccessToken, requireUser } = require('./auth');

function hash(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function chunks(text, size = 1800) {
  const clean = String(text || '').replace(/\r/g, '').trim();
  const out = [];
  for (let i = 0; i < clean.length; i += size) out.push(clean.slice(i, i + size));
  return out.length ? out : [''];
}
function vectorLiteral(values) { return `[${values.map(Number).join(',')}]`; }

async function sendVerificationEmail(user, rawToken) {
  const base = process.env.PUBLIC_APP_URL || 'https://deeepanbe.github.io';
  const link = `${base.replace(/\/$/, '')}/verify-email.html?token=${encodeURIComponent(rawToken)}`;
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    if (process.env.NODE_ENV !== 'production') return { delivered: false, verification_url: link };
    throw new Error('Email delivery is not configured');
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [user.email], subject: 'Verify your DJ AI account', html: `<p>Welcome to DJ AI.</p><p><a href="${link}">Verify your email</a></p><p>This link expires in 24 hours.</p>` })
  });
  if (!response.ok) throw new Error(`Email delivery failed: ${response.status}`);
  return { delivered: true };
}

function buildRoutes({ provider }) {
  const router = express.Router();

  router.post('/auth/register', async (req, res) => {
    try {
      const user = await createUser(req.body || {});
      const token = await issueVerificationToken(user.id);
      const delivery = await sendVerificationEmail(user, token);
      return res.status(201).json({ ok: true, user: { id: user.id, email: user.email, display_name: user.display_name, plan: user.plan }, ...delivery });
    } catch (error) {
      const duplicate = /duplicate key|unique/i.test(error.message);
      return res.status(duplicate ? 409 : 400).json({ error: duplicate ? 'An account with this email already exists' : error.message });
    }
  });

  router.get('/auth/verify', async (req, res) => {
    const ok = await verifyEmail(req.query.token || '');
    return res.status(ok ? 200 : 400).json({ ok, message: ok ? 'Email verified' : 'Invalid or expired verification token' });
  });

  router.post('/auth/login', async (req, res) => {
    try {
      const user = await authenticate(req.body?.email, req.body?.password);
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });
      if (!user.email_verified_at) return res.status(403).json({ error: 'Email verification required' });
      return res.json({ ok: true, token: signAccessToken(user), user: { id: user.id, email: user.email, display_name: user.display_name, plan: user.plan } });
    } catch (error) { return res.status(503).json({ error: 'Authentication service unavailable' }); }
  });

  router.get('/auth/me', requireUser, (req, res) => res.json({ user: req.user }));

  router.get('/workspaces', requireUser, async (req, res) => {
    const result = await query(`SELECT w.id,w.name,w.created_at,wm.role FROM workspaces w JOIN workspace_members wm ON wm.workspace_id=w.id WHERE wm.user_id=$1 ORDER BY w.created_at`, [req.user.id]);
    return res.json({ workspaces: result.rows });
  });

  router.post('/workspaces', requireUser, async (req, res) => {
    const name = String(req.body?.name || 'Workspace').trim().slice(0, 120);
    const result = await query('INSERT INTO workspaces(owner_user_id,name) VALUES($1,$2) RETURNING *', [req.user.id, name]);
    await query('INSERT INTO workspace_members(workspace_id,user_id,role) VALUES($1,$2,\'owner\')', [result.rows[0].id, req.user.id]);
    return res.status(201).json({ workspace: result.rows[0] });
  });

  async function assertWorkspace(workspaceId, userId) {
    const result = await query('SELECT w.id,w.name,wm.role FROM workspaces w JOIN workspace_members wm ON wm.workspace_id=w.id WHERE w.id=$1 AND wm.user_id=$2', [workspaceId, userId]);
    return result.rows[0] || null;
  }

  router.get('/conversations', requireUser, async (req, res) => {
    const workspaceId = String(req.query.workspace_id || '');
    if (!await assertWorkspace(workspaceId, req.user.id)) return res.status(403).json({ error: 'Workspace access denied' });
    const result = await query('SELECT id,title,provider,model,created_at,updated_at FROM conversations WHERE workspace_id=$1 AND user_id=$2 ORDER BY updated_at DESC LIMIT 100', [workspaceId, req.user.id]);
    return res.json({ conversations: result.rows });
  });

  router.post('/conversations', requireUser, async (req, res) => {
    const workspaceId = String(req.body?.workspace_id || '');
    if (!await assertWorkspace(workspaceId, req.user.id)) return res.status(403).json({ error: 'Workspace access denied' });
    const title = String(req.body?.title || 'New conversation').trim().slice(0, 160);
    const result = await query('INSERT INTO conversations(workspace_id,user_id,title,provider,model) VALUES($1,$2,$3,$4,$5) RETURNING *', [workspaceId, req.user.id, title, provider?.name || 'openai', provider?.model || process.env.MODEL || 'gpt-5.6-luna']);
    return res.status(201).json({ conversation: result.rows[0] });
  });

  router.get('/conversations/:id/messages', requireUser, async (req, res) => {
    const result = await query('SELECT m.id,m.role,m.content,m.metadata,m.created_at FROM messages m JOIN conversations c ON c.id=m.conversation_id WHERE c.id=$1 AND c.user_id=$2 ORDER BY m.created_at', [req.params.id, req.user.id]);
    return res.json({ messages: result.rows });
  });

  router.post('/memory', requireUser, async (req, res) => {
    const content = String(req.body?.content || '').trim().slice(0, 4000);
    const kind = String(req.body?.kind || 'fact').slice(0, 40);
    const workspaceId = req.body?.workspace_id || null;
    if (!content) return res.status(400).json({ error: 'Memory content is required' });
    let embedding = null;
    if (provider?.embed) embedding = vectorLiteral(await provider.embed(content));
    const result = await query('INSERT INTO memories(user_id,workspace_id,kind,content,embedding) VALUES($1,$2,$3,$4,$5) RETURNING id,kind,content,created_at', [req.user.id, workspaceId, kind, content, embedding]);
    return res.status(201).json({ memory: result.rows[0] });
  });

  router.get('/memory/search', requireUser, async (req, res) => {
    const text = String(req.query.q || '').trim();
    if (!text || !provider?.embed) return res.json({ memories: [] });
    const embedding = vectorLiteral(await provider.embed(text));
    const result = await query('SELECT id,kind,content,1-(embedding<=>$1::vector) AS similarity FROM memories WHERE user_id=$2 AND embedding IS NOT NULL ORDER BY embedding<=>$1::vector LIMIT 8', [embedding, req.user.id]);
    return res.json({ memories: result.rows });
  });

  router.post('/documents', requireUser, async (req, res) => {
    const workspaceId = String(req.body?.workspace_id || '');
    if (!await assertWorkspace(workspaceId, req.user.id)) return res.status(403).json({ error: 'Workspace access denied' });
    const name = String(req.body?.name || 'document.txt').trim().slice(0, 200);
    const mime = String(req.body?.mime_type || 'text/plain').slice(0, 100);
    const content = String(req.body?.content || '');
    if (!content || content.length > 2_000_000) return res.status(400).json({ error: 'Document content must be between 1 and 2,000,000 characters' });
    const doc = await query('INSERT INTO documents(workspace_id,uploaded_by,name,mime_type,status) VALUES($1,$2,$3,$4,\'processing\') RETURNING *', [workspaceId, req.user.id, name, mime]);
    try {
      const parts = chunks(content);
      for (let i = 0; i < parts.length; i++) {
        const embedding = provider?.embed ? vectorLiteral(await provider.embed(parts[i])) : null;
        await query('INSERT INTO document_chunks(document_id,workspace_id,content,embedding,chunk_index) VALUES($1,$2,$3,$4,$5)', [doc.rows[0].id, workspaceId, parts[i], embedding, i]);
      }
      await query('UPDATE documents SET status=\'ready\' WHERE id=$1', [doc.rows[0].id]);
    } catch (error) {
      await query('UPDATE documents SET status=\'failed\' WHERE id=$1', [doc.rows[0].id]);
      throw error;
    }
    return res.status(201).json({ document_id: doc.rows[0].id, status: 'ready' });
  });

  router.get('/rag/search', requireUser, async (req, res) => {
    const workspaceId = String(req.query.workspace_id || '');
    const text = String(req.query.q || '').trim();
    if (!await assertWorkspace(workspaceId, req.user.id)) return res.status(403).json({ error: 'Workspace access denied' });
    if (!text || !provider?.embed) return res.json({ chunks: [] });
    const embedding = vectorLiteral(await provider.embed(text));
    const result = await query('SELECT dc.id,dc.document_id,dc.content,1-(dc.embedding<=>$1::vector) AS similarity FROM document_chunks dc WHERE dc.workspace_id=$2 AND dc.embedding IS NOT NULL ORDER BY dc.embedding<=>$1::vector LIMIT 8', [embedding, workspaceId]);
    return res.json({ chunks: result.rows });
  });

  router.get('/usage', requireUser, async (req, res) => {
    const result = await query(`SELECT date_trunc('day',created_at) day,COUNT(*) events,COALESCE(SUM(input_tokens),0) input_tokens,COALESCE(SUM(output_tokens),0) output_tokens,COALESCE(SUM(cost_usd),0) cost_usd FROM usage_events WHERE user_id=$1 AND created_at>=now()-interval '30 days' GROUP BY 1 ORDER BY 1`, [req.user.id]);
    return res.json({ usage: result.rows });
  });

  return router;
}

module.exports = { buildRoutes };