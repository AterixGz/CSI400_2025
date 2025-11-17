/**
 * @swagger
 * tags:
 *   name: Favorite
 *   description: API สำหรับจัดการสินค้าที่ผู้ใช้กด Favorite (ต้องใช้ JWT)
 */

/**
 * @swagger
 * /api/favorite:
 *   post:
 *     summary: เพิ่มสินค้าเข้า Favorite
 *     description: ใช้สำหรับเพิ่มสินค้าลงในรายการ Favorite ของผู้ใช้ ต้องส่ง JWT Token
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: เพิ่มสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Missing user_id or product_id
 *       500:
 *         description: error
 */
/**
 * @swagger
 * /api/favorite/{product_id}:
 *   delete:
 *     summary: ลบสินค้าออกจาก Favorite
 *     description: ใช้สำหรับลบสินค้าจากรายการ Favorite ของผู้ใช้ ต้องส่ง JWT Token
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสสินค้า
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
 *       400:
 *         description: Missing user_id
 *       500:
 *         description: error
 */
/**
 * @swagger
 * /api/favorite:
 *   get:
 *     summary: ดูรายการสินค้า Favorite ของผู้ใช้
 *     description: ใช้สำหรับดึงรายการสินค้าที่ผู้ใช้กด Favorite ต้องส่ง JWT Token
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการสินค้า Favorite
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Missing user_id
 *       500:
 *         description: error
 */
import express from 'express';
import db from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ✅ Middleware: ตรวจสอบ token
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = auth.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ✅ Helper: ดึง user_id จาก token ไม่ว่าชื่อจะเป็น id หรือ user_id
function getUserId(req) {
  return req.user?.user_id || req.user?.id; // รองรับทั้งสองแบบ
}

// ✅ POST /api/favorite - เพิ่ม favorite
router.post('/', requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const { product_id } = req.body;

  if (!userId) return res.status(400).json({ error: 'Missing user_id in token' });
  if (!product_id) return res.status(400).json({ error: 'Missing product_id' });

  try {
    await db.query(
      'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, product_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE /api/favorite/:product_id - ลบ favorite
router.delete('/:product_id', requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const { product_id } = req.params;

  if (!userId) return res.status(400).json({ error: 'Missing user_id in token' });

  try {
    await db.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET /api/favorite - ดูรายการ favorite
router.get('/', requireAuth, async (req, res) => {
  const userId = getUserId(req);

  if (!userId) return res.status(400).json({ error: 'Missing user_id in token' });

  try {
    const result = await db.query(
      `SELECT p.* 
       FROM favorites f 
       JOIN products p ON f.product_id = p.product_id 
       WHERE f.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
