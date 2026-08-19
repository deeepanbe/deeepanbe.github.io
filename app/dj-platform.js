(function () {
  'use strict';
  const config = window.DJ_CONFIG || {};
  const API = (config.BACKEND_URL || '').replace(/\/$/, '');
  const TOKEN_KEY = 'dj_ai_access_token';

  function token() { return localStorage.getItem(TOKEN_KEY) || ''; }
  function setToken(value) { if (value) localStorage.setItem(TOKEN_KEY, value); else localStorage.removeItem(TOKEN_KEY); }

  async function request(path, options = {}) {
    if (!API) throw new Error('DJ AI backend is not configured');
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    const auth = token(); if (auth) headers.set('Authorization', `Bearer ${auth}`);
    const response = await fetch(`${API}${path}`, { ...options, headers });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
    return body;
  }

  async function register(data) { return request('/auth/register', { method: 'POST', body: JSON.stringify(data) }); }
  async function login(email, password) { const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setToken(result.token); return result; }
  function logout() { setToken(''); location.href = 'index.html'; }
  async function me() { return request('/auth/me'); }
  async function workspaces() { return request('/workspaces'); }
  async function createWorkspace(name) { return request('/workspaces', { method: 'POST', body: JSON.stringify({ name }) }); }
  async function conversations(workspaceId) { return request(`/conversations?workspace_id=${encodeURIComponent(workspaceId)}`); }
  async function createConversation(workspaceId, title) { return request('/conversations', { method: 'POST', body: JSON.stringify({ workspace_id: workspaceId, title }) }); }
  async function messages(conversationId) { return request(`/conversations/${encodeURIComponent(conversationId)}/messages`); }
  async function agent(task) { return request('/agent/run', { method: 'POST', body: JSON.stringify({ task }) }); }
  async function uploadText(workspaceId, name, content, mimeType = 'text/plain') { return request('/documents', { method: 'POST', body: JSON.stringify({ workspace_id: workspaceId, name, content, mime_type: mimeType }) }); }
  async function memory(content, workspaceId, kind = 'fact') { return request('/memory', { method: 'POST', body: JSON.stringify({ content, workspace_id: workspaceId, kind }) }); }
  async function billing(plan) { return request('/billing/checkout', { method: 'POST', body: JSON.stringify({ plan }) }); }

  window.DJPlatform = { request, register, login, logout, me, workspaces, createWorkspace, conversations, createConversation, messages, agent, uploadText, memory, billing, isSignedIn: () => Boolean(token()) };
})();