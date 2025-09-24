import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/", (req, res) => {
  const { username, lastname, password, number, role, email } = req.body;

  // อ่าน users.json
  const usersPath = path.join(__dirname, "../data/users.JSON");
  const usersData = fs.readFileSync(usersPath, "utf-8");
  const users = JSON.parse(usersData);

  // ตรวจสอบซ้ำ
  const emailExists = users.some((u) => u.email === email);
  const numberExists = users.some((u) => u.number === number);

  if (emailExists) {
    return res.status(400).json({ success: false, message: "อีเมลนี้ถูกใช้แล้ว" });
  }
  if (numberExists) {
    return res.status(400).json({ success: false, message: "เบอร์โทรนี้ถูกใช้แล้ว" });
  }

  // เพิ่ม user ใหม่
  const newUser = {
    id: users.length + 1,
    username,
    lastname,
    password,
    number,
    role: role || "user",
    email,
  };
  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf-8");

  res.json({ success: true, message: "สมัครสมาชิกสำเร็จ", user: newUser });
});

export default router;