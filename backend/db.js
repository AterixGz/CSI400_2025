// backend/db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase ต้องการ SSL
});

// ทดสอบ connection
pool.connect()
  .then(client => {
    console.log("✅ Connected to DB successfully");
    client.release();
  })
  .catch(err => {
    console.error("❌ DB connection error:", err);
  });

export default pool;
