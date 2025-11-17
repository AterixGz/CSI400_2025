/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login ผู้ใช้
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
 *     responses:
 *       200:
 *         description: Login สำเร็จ
 *       401:
 *         description: Login ไม่สำเร็จ
 */
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();
import jwt from "jsonwebtoken";
import express from "express";
import pool from "../db.js";

const router = express.Router();

// POST /login
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Join users กับ roles เพื่อดึง role_id และ role name
    const query = `
      SELECT u.*, r.role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      WHERE u.email = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const user = result.rows[0];
    // เปรียบเทียบรหัสผ่านด้วย bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
    // สร้าง JWT token
    // Include both `id` and `user_id` claims so different services can read either
    const token = jwt.sign(
      { id: user.user_id, user_id: user.user_id, email: user.email, 
        role_id: user.role_id, 
        role_name: user.role_name 
       },
      process.env.JWT_SECRET || "JWT_SECRET_KEY",
      { expiresIn: "24h" }
    );
    // ส่งข้อมูล user เฉพาะ field ที่จำเป็น
    const userData = {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
      phone_number: user.phone_number,
      profile_image_url: user.profile_image_url || null,
      profile_image_public_id: user.profile_image_public_id || null
    };
    return res.json({ success: true, message: "Login สำเร็จ", user: userData, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
});

export default router;
