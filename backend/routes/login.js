import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// กำหนด __dirname เอง (เพราะ ESM ไม่มี __dirname ให้)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// POST /login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // อ่านข้อมูล users จากไฟล์ JSON
  const usersPath = path.join(__dirname, "../data/users.JSON");
  const usersData = fs.readFileSync(usersPath, "utf-8");
  const users = JSON.parse(usersData);

  // ตรวจสอบ user
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // สร้าง JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "changeme",
      { expiresIn: "2h" }
    );
    return res.json({ success: true, message: "Login สำเร็จ", user, token });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
  }
});

export default router;
