/**
 * @swagger
 * /api/users/{id}/avatar:
 *   patch:
 *     summary: อัปเดตรูปโปรไฟล์ผู้ใช้
 *     tags:
 *       - Users
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
 *               profile_image_url:
 *                 type: string
 *               profile_image_public_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดตรูปโปรไฟล์เรียบร้อย
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile_image_url:
 *                   type: string
 *                 profile_image_public_id:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: user id ไม่ถูกต้อง
 *       500:
 *         description: อัปเดตรูปไม่สำเร็จ
 */
import express from "express";
import db from "../db.js";
const router = express.Router();

// อัปเดตรูปโปรไฟล์
router.patch("/:id/avatar", async (req, res) => {
  const { id } = req.params;
  const { profile_image_url, profile_image_public_id } = req.body;
  if (!id || id === 'undefined' || isNaN(Number(id))) {
    return res.status(400).json({ error: 'user id ไม่ถูกต้อง' });
  }

  try {
    await db.query(
  "UPDATE users SET profile_image_url = $1, profile_image_public_id = $2 WHERE user_id = $3",
  [profile_image_url, profile_image_public_id, id]
);

    // ดึงข้อมูล user กลับมาเพื่อ sync frontend
    const userRes = await db.query("SELECT * FROM users WHERE user_id = $1", [id]);
    const user = userRes.rows[0];
    res.json({
      message: "อัปเดตรูปโปรไฟล์เรียบร้อย",
      profile_image_url: user.profile_image_url,
      profile_image_public_id: user.profile_image_public_id,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "อัปเดตรูปไม่สำเร็จ" });
  }
});

export default router;
