/**
 * @swagger
 * tags:
 *   name: ClearCart
 *   description: API สำหรับลบสินค้าทั้งหมดในตะกร้าของผู้ใช้ (ต้องใช้ JWT)
 */

/**
 * @swagger
 * /api/clear-cart:
 *   delete:
 *     summary: ลบสินค้าทั้งหมดในตะกร้าของผู้ใช้
 *     description: ใช้สำหรับลบสินค้าทั้งหมดในตะกร้าของผู้ใช้ที่เข้าสู่ระบบ ต้องส่ง JWT Token
 *     tags: [ClearCart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: No token or Invalid token
 *       500:
 *         description: DB error
 */
import express from "express";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

// Middleware: Auth check
function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// DELETE /api/clear-cart - clear user's cart
router.delete("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query("DELETE FROM cart WHERE user_id = $1", [userId]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
