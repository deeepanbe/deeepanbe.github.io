const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not configured; skipping migrations.');
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', '001_platform.sql'), 'utf8');
    await client.query(sql);
    console.log('DJ AI database migration completed.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`DJ AI migration failed: ${error.message}`);
  process.exit(1);
});
