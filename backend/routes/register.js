/**
 * @swagger
 * /register:
 *   post:
 *     summary: สมัครสมาชิก
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: สมัครสมาชิกสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 */
import express from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, lastname, password, number, role, email, birthdate, gender } = req.body;
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
  // Hash password with bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // เพิ่ม user ใหม่ with role_id = 1 (user)
  const insertQuery = `INSERT INTO users (first_name, last_name, password_hash, phone_number, role_id, email, is_verified, created_at, date_of_birth, gender) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
  const values = [username, lastname, hashedPassword, number, 1, email, false, new Date(), birthdate, gender];
  const result = await pool.query(insertQuery, values);
  const newUser = result.rows[0];
  // เพิ่ม field profile_image_url และ profile_image_public_id ถ้ายังไม่มี
  if (!('profile_image_url' in newUser)) newUser.profile_image_url = null;
  if (!('profile_image_public_id' in newUser)) newUser.profile_image_public_id = null;
  res.json({ success: true, message: "สมัครสมาชิกสำเร็จ", user: newUser });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
  }
});

export default router;