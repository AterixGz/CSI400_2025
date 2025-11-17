/**
 * @swagger
 * tags:
 *   name: AdminUsers
 *   description: API สำหรับแอดมินจัดการผู้ใช้ที่เป็น staff หรือ manager
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: ดูรายชื่อ staff และ manager
 *     description: ใช้สำหรับดึงรายชื่อผู้ใช้ที่มี role เป็น staff หรือ manager
 *     tags: [AdminUsers]
 *     responses:
 *       200:
 *         description: รายชื่อผู้ใช้
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Failed to fetch users
 */
/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: เปลี่ยน role ของผู้ใช้
 *     description: ใช้สำหรับเปลี่ยน role_id ของผู้ใช้และคืนค่า role_name ใหม่
 *     tags: [AdminUsers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสผู้ใช้
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: เปลี่ยน role สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       400:
 *         description: role_id required
 *       500:
 *         description: Failed to update role
 */
/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: สร้าง staff หรือ manager
 *     description: ใช้สำหรับสร้างผู้ใช้ใหม่ที่มี role เป็น staff หรือ manager
 *     tags: [AdminUsers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: สร้างผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to create user
 */
// backend/routes/adminUsers.js
import express from "express";
import db from "../db.js";
import bcrypt from "bcrypt";

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

// POST /api/admin/users
// สร้าง staff หรือ manager
router.post("/", async (req, res) => {
  const { first_name, last_name, email, password, role_id } = req.body;
  if (!first_name || !last_name || !email || !password || !role_id) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // hash password
    const password_hash = await bcrypt.hash(password, 10);

    // insert user ใหม่
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, now(), now())
       RETURNING user_id, first_name, last_name, email, role_id`,
      [first_name, last_name, email, password_hash, role_id]
    );

    const newUser = result.rows[0];

    // ดึง role_name
    const roleRes = await db.query(
      `SELECT role_name FROM roles WHERE role_id = $1`,
      [role_id]
    );
    newUser.role_name = roleRes.rows[0].role_name;

    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error("Failed to create user:", err);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
});

// DELETE user (เฉพาะ staff)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db.query(`SELECT role_id FROM users WHERE user_id = $1`, [id]);
if (!user.rows[0]) return res.status(404).json({ success: false, message: "User not found" });

// ห้ามลบ Manager
if (user.rows[0].role_id === 3) {
  return res.status(403).json({ success: false, message: "Cannot delete a manager" });
}

// ลบ Staff
await db.query(`DELETE FROM users WHERE user_id = $1`, [id]);
res.json({ success: true, message: "Staff deleted successfully" });
    await db.query(`DELETE FROM users WHERE user_id = $1`, [id]);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Failed to delete user:", err);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});


export default router;

