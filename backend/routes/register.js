import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, lastname, password, number, role, email } = req.body;
  try {
    // ตรวจสอบซ้ำ
    const checkQuery = "SELECT user_id FROM users WHERE email = $1 OR phone_number = $2 LIMIT 1";
    const checkResult = await pool.query(checkQuery, [email, number]);
    if (checkResult.rows.length > 0) {
      // ตรวจสอบว่า email หรือ number ซ้ำ
      const emailExists = await pool.query("SELECT user_id FROM users WHERE email = $1", [email]);
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ success: false, message: "อีเมลนี้ถูกใช้แล้ว" });
      }
      const numberExists = await pool.query("SELECT user_id FROM users WHERE phone_number = $1", [number]);
      if (numberExists.rows.length > 0) {
        return res.status(400).json({ success: false, message: "เบอร์โทรนี้ถูกใช้แล้ว" });
      }
    }
    // เพิ่ม user ใหม่
    const insertQuery = `INSERT INTO users (first_name, last_name, password_hash, phone_number, role, email, is_verified, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const values = [username, lastname, password, number, role || "user", email, false, new Date()];
    const result = await pool.query(insertQuery, values);
    const newUser = result.rows[0];
    res.json({ success: true, message: "สมัครสมาชิกสำเร็จ", user: newUser });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
  }
});

export default router;