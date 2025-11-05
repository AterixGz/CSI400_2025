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
