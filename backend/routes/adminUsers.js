import express from "express";
import db from "../db.js";
// import { authAdmin } from "../middleware/authAdmin.js"; // ยังไม่ใช้

const router = express.Router();

// ดึงรายชื่อ user ที่เป็น staff หรือ manager
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT user_id, first_name, last_name, email, role, profile_image_url, role_id, is_verified
       FROM users
       WHERE role_id IN (2, 3)
       ORDER BY user_id ASC`
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// อัปเดต role/permissions ของ user
router.patch("/:id/role", async (req, res) => {
  const { id } = req.params;
  const { role_id } = req.body;
  if (!role_id) return res.status(400).json({ success: false, message: "role_id required" });

  try {
    const result = await db.query(
      `UPDATE users SET role_id = $1, updated_at = now() WHERE user_id = $2 RETURNING *`,
      [role_id, id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
});

export default router;
