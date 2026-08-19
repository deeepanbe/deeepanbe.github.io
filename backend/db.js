const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) return null;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
  });
  return pool;
}

async function query(text, params = []) {
  const db = getPool();
  if (!db) throw new Error('DATABASE_URL is not configured');
  return db.query(text, params);
}

async function health() {
  if (!getPool()) return { configured: false, ok: false };
  await query('SELECT 1');
  return { configured: true, ok: true };
}

module.exports = { getPool, query, health };