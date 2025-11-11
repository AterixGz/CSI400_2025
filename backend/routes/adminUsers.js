import express from "express";
import db from "../db.js";

const router = express.Router();

// GET users ที่เป็น staff หรือ manager
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.profile_image_url,
             u.role_id, r.role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.role_id IN (2,3)
      ORDER BY u.user_id ASC
    `);
    res.json({ success: true, users: result.rows }); // แต่ละ user มี r.role_name
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// PATCH เปลี่ยน role_id และ return role_name ใหม่
router.patch("/:id/role", async (req, res) => {
  const { id } = req.params;
  const { role_id } = req.body;
  if (!role_id) return res.status(400).json({ success: false, message: "role_id required" });

  try {
    await db.query(
      `UPDATE users SET role_id = $1, updated_at = now() WHERE user_id = $2`,
      [role_id, id]
    );

    const userRes = await db.query(`
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.profile_image_url,
             u.role_id, r.role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = $1
    `, [id]);

    res.json({ success: true, user: userRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
});

export default router;
