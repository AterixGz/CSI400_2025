// backend/db.js
import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

/**
 * Robust DB pool wrapper
 * - Reads DATABASE_URL / NEON_DATABASE_URL / SUPABASE_DB_URL
 * - Configures SSL by default (set PGSSLMODE=disable to turn off)
 * - Does NOT crash process if initial connection fails (pool set to null)
 */

const connectionString =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  null;

let pool = null;

if (connectionString) {
  // default: enable SSL but do not require verified cert (safe for Supabase)
  const ssl =
    process.env.PGSSLMODE === 'disable'
      ? false
      : { rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED === 'true' };

  pool = new Pool({
    connectionString,
    ssl,
    max: parseInt(process.env.DB_MAX_CLIENTS || '10', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_MS || '10000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONN_TIMEOUT_MS || '5000', 10),
  });

  // test connection but don't crash process on failure
  pool
    .connect()
    .then((client) => {
      client.release();
      console.log('✅ DB pool connected');
    })
    .catch((err) => {
      console.error('❌ DB connection error (will continue without DB):', err.message || err);
      pool = null;
    });
} else {
  console.warn('⚠️ No DATABASE_URL / NEON_DATABASE_URL provided — running without DB pool');
}

export async function testDb() {
  if (!pool) throw new Error('DB pool not available');
  const { rows } = await pool.query('SELECT version();');
  return rows[0];
}

export default {
  query: async (...args) => {
    if (!pool) throw new Error('Database connection not available');
    return pool.query(...args);
  },
  getPool: () => pool,
  testDb,
};
