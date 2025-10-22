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
    // ค้นหา user จาก Supabase
    const query = "SELECT * FROM users WHERE email = $1 LIMIT 1";
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
    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "changeme",
      { expiresIn: "24h" }
    );
    // ส่งข้อมูล user เฉพาะ field ที่จำเป็น
    const userData = {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      phone_number: user.phone_number
    };
    return res.json({ success: true, message: "Login สำเร็จ", user: userData, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
});

export default router;
