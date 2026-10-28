const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('./config');

let pool = null;

function getPool() {
  if (!pool) {
    if (!config.databaseUrl) throw new Error('DATABASE_URL is not set');
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

const query = (text, params) => getPool().query(text, params);

async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function initSchema() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
  await query(sql);
}

async function closePool() {
  if (pool) await pool.end();
  pool = null;
}

module.exports = { query, withTransaction, initSchema, closePool, getPool };
