/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API สำหรับจัดการตะกร้าสินค้าของผู้ใช้ (ต้องใช้ JWT)
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: ดูรายการสินค้าในตะกร้าของผู้ใช้
 *     description: ใช้สำหรับดึงรายการสินค้าในตะกร้าของผู้ใช้ที่เข้าสู่ระบบ
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการสินค้าในตะกร้า
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: ไม่สามารถดึงข้อมูลตะกร้าได้
 */
/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: เพิ่มสินค้าเข้าตะกร้า
 *     description: ใช้สำหรับเพิ่มสินค้าใหม่เข้าตะกร้าของผู้ใช้
 *     tags: [Cart]
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
 *               quantity:
 *                 type: integer
 *               size:
 *                 type: string
 *     responses:
 *       201:
 *         description: เพิ่มสินค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 item:
 *                   type: object
 *       400:
 *         description: โปรดระบุสินค้า หรือ สินค้าเหลือในสต็อกไม่เพียงพอ
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: ไม่สามารถเพิ่มสินค้าลงตะกร้าได้
 */
/**
 * @swagger
 * /cart/items/{cart_id}:
 *   patch:
 *     summary: แก้ไขจำนวนสินค้าในตะกร้า
 *     description: ใช้สำหรับแก้ไขจำนวนสินค้าในรายการตะกร้า
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cart_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการในตะกร้า
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: แก้ไขจำนวนสินค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 item:
 *                   type: object
 *       400:
 *         description: จำนวนต้องเป็นจำนวนเต็มบวก หรือ จำนวนสินค้ามากกว่าสต็อกที่มี
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ไม่พบรายการในตะกร้า
 *       500:
 *         description: ไม่สามารถแก้ไขจำนวนสินค้าได้
 */
/**
 * @swagger
 * /cart/items/{cart_id}/select:
 *   patch:
 *     summary: อัปเดตสถานะการเลือกสินค้าในตะกร้า
 *     description: ใช้สำหรับเลือกหรือยกเลิกการเลือกสินค้าในตะกร้า
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cart_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการในตะกร้า
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selected:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: อัปเดตสถานะการเลือกสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 item:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ไม่พบรายการในตะกร้า
 *       500:
 *         description: ไม่สามารถอัปเดตสถานะการเลือกได้
 */
/**
 * @swagger
 * /cart/items/{cart_id}:
 *   delete:
 *     summary: ลบสินค้าออกจากตะกร้า
 *     description: ใช้สำหรับลบสินค้าออกจากตะกร้าของผู้ใช้
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cart_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสรายการในตะกร้า
 *     responses:
 *       200:
 *         description: ลบสินค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ไม่พบรายการในตะกร้า
 *       500:
 *         description: ไม่สามารถลบสินค้าออกจากตะกร้าได้
 */
/**
 * @swagger
 * /cart/selected:
 *   delete:
 *     summary: ลบสินค้าที่เลือกออกจากตะกร้าหลังชำระเงิน
 *     description: ใช้สำหรับลบสินค้าที่เลือกออกจากตะกร้าหลังชำระเงิน
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ลบสินค้าที่เลือกสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedIds:
 *                   type: array
 *                   items:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ไม่พบรายการที่เลือกในตะกร้า
 *       500:
 *         description: ไม่สามารถลบสินค้าที่เลือกออกจากตะกร้าได้
 */
import express from "express";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) {
    return res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" });
  }

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "รูปแบบ Token ไม่ถูกต้อง" });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme");
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token หมดอายุ กรุณาเข้าสู่ระบบใหม่" });
    }
    return res.status(401).json({ error: "Token ไม่ถูกต้อง" });
  }
};

function getUserIdFromReq(req) {
  if (!req.user) return null;
  return req.user.id || req.user.user_id || null;
}

// GET /cart - get current user's cart
router.get("/", verifyToken, async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!pool) return res.status(503).json({ error: "DB not available" });

    try {
    const sql = `
      SELECT c.cart_id, c.product_id, c.quantity, c.added_at,
             c.size, c.selected,
             p.name AS product_name, p.price, p.stock, p.image_url, p.description,
             -- try to read size-level stock if a matching product_sizes row exists
             (
               SELECT ps.stock FROM product_sizes ps
               WHERE ps.product_id = p.product_id
                 AND (
                   (ps.size_id IS NOT NULL AND ps.size_id::text = c.size)
                   OR (ps.size_name IS NOT NULL AND ps.size_name = c.size)
                 )
               LIMIT 1
             ) AS size_stock
      FROM cart c
      JOIN products p ON p.product_id = c.product_id
      WHERE c.user_id = $1
      ORDER BY c.added_at DESC
    `;
    const { rows } = await pool.query(sql, [userId]);
    const items = rows.map((r) => ({
      id: r.cart_id,
      product_id: r.product_id,
      qty: r.quantity,
      size: r.size || null,
      price: r.price ?? 0,
      name: r.product_name || "สินค้า",
      image: r.image_url || "",
      description: r.description,
      added_at: r.added_at,
      stock: r.stock ?? null,
      size_stock: r.size_stock ?? null,
      selected: r.selected ?? false
    }));
    res.json({ items });
  } catch (err) {
    console.error("🛒 GET /cart error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลตะกร้าได้" });
  }
});

// POST /cart/items { product_id, quantity, size }
router.post("/items", verifyToken, async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!pool) return res.status(503).json({ error: "DB not available" });
  const { product_id, quantity = 1, size = null } = req.body;
  if (!product_id) return res.status(400).json({ error: "โปรดระบุสินค้า" });
  const qty = Math.max(1, parseInt(quantity, 10));
  try {
      // Check size-level stock first (if size provided), otherwise product stock
      let stock = null;
      if (size) {
        // try match by size_id numeric or by size_name
        if (Number.isInteger(size) || (typeof size === 'string' && /^\d+$/.test(size))) {
          const sizeId = Number(size);
          const res = await pool.query(
            "SELECT stock FROM product_sizes WHERE size_id = $1 AND product_id = $2",
            [sizeId, product_id]
          );
          if (res.rows[0]) stock = res.rows[0].stock;
        }
        if (stock == null) {
          const res2 = await pool.query(
            "SELECT stock FROM product_sizes WHERE product_id = $1 AND size_name = $2 LIMIT 1",
            [product_id, String(size)]
          );
          if (res2.rows[0]) stock = res2.rows[0].stock;
        }
      }

      if (stock == null) {
        const product = await pool.query(
          "SELECT stock FROM products WHERE product_id = $1",
          [product_id]
        );
        if (!product.rows[0]) return res.status(404).json({ error: "ไม่พบสินค้า" });
        stock = product.rows[0].stock;
      }

      if (stock != null && stock < qty) {
        return res.status(400).json({ error: "สินค้าเหลือในสต็อกไม่เพียงพอ", available: stock });
      }
    // consider size as part of uniqueness: same product with different sizes are separate cart lines
    const existing = await pool.query(
      "SELECT cart_id, quantity FROM cart WHERE user_id = $1 AND product_id = $2 AND (size IS NOT DISTINCT FROM $3)",
      [userId, product_id, size]
    );
    let result;
    if (existing.rows[0]) {
      const newQty = existing.rows[0].quantity + qty;
      if (stock != null && newQty > stock) {
        return res.status(400).json({ error: "จำนวนรวมในตะกร้าเกินสต็อก", current: existing.rows[0].quantity, available: stock });
      }
      result = await pool.query(
        "UPDATE cart SET quantity = quantity + $1 WHERE cart_id = $2 RETURNING cart_id, quantity, size",
        [qty, existing.rows[0].cart_id]
      );
    } else {
      // try to insert size if the column exists in DB; if not, this will fail and be caught
      result = await pool.query(
        "INSERT INTO cart (user_id, product_id, quantity, size, added_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING cart_id, quantity, size",
        [userId, product_id, qty, size]
      );
    }
    res.status(201).json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("🛒 POST cart error:", err);
    // If error indicates missing column 'size', instruct to migrate DB
    if (err && /column "size"/.test(err.message || "")) {
      return res.status(500).json({ error: "DB schema missing 'size' column. Run: ALTER TABLE cart ADD COLUMN size TEXT;" });
    }
    res.status(500).json({ error: "ไม่สามารถเพิ่มสินค้าลงตะกร้าได้" });
  }
});

// PATCH /cart/items/:cart_id { quantity }
router.patch("/items/:cart_id", verifyToken, async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!pool) return res.status(503).json({ error: "DB not available" });
  const { cart_id } = req.params;
  const quantity = parseInt(req.body.quantity, 10);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: "จำนวนต้องเป็นจำนวนเต็มบวก" });
  }
  try {
    // Before updating, check available stock for this cart item (size-level first)
    const cartRow = await pool.query("SELECT product_id, size FROM cart WHERE cart_id = $1 AND user_id = $2", [cart_id, userId]);
    if (!cartRow.rows[0]) return res.status(404).json({ error: "ไม่พบรายการในตะกร้า" });
    const { product_id: pid, size: csize } = cartRow.rows[0];
    let stock = null;
    if (csize) {
      if (Number.isInteger(csize) || (typeof csize === 'string' && /^\d+$/.test(csize))) {
        const sizeId = Number(csize);
        const r = await pool.query("SELECT stock FROM product_sizes WHERE size_id = $1 AND product_id = $2", [sizeId, pid]);
        if (r.rows[0]) stock = r.rows[0].stock;
      }
      if (stock == null) {
        const r2 = await pool.query("SELECT stock FROM product_sizes WHERE product_id = $1 AND size_name = $2 LIMIT 1", [pid, String(csize)]);
        if (r2.rows[0]) stock = r2.rows[0].stock;
      }
    }
    if (stock == null) {
      const pr = await pool.query("SELECT stock FROM products WHERE product_id = $1", [pid]);
      stock = pr.rows[0] ? pr.rows[0].stock : null;
    }
    if (stock != null && quantity > stock) {
      return res.status(400).json({ error: 'จำนวนสินค้ามากกว่าสต็อกที่มี', available: stock });
    }

    const result = await pool.query(
      "UPDATE cart SET quantity = $1 WHERE cart_id = $2 AND user_id = $3 RETURNING cart_id, quantity",
      [quantity, cart_id, userId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "ไม่พบรายการในตะกร้า" });
    }
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("🛒 PATCH cart error:", err);
    res.status(500).json({ error: "ไม่สามารถแก้ไขจำนวนสินค้าได้" });
  }
});

// DELETE /cart/items/:cart_id
// PATCH /cart/items/:cart_id/select { selected }
router.patch("/items/:cart_id/select", verifyToken, async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!pool) return res.status(503).json({ error: "DB not available" });
  const { cart_id } = req.params;
  const { selected } = req.body;

  try {
    const result = await pool.query(
      "UPDATE cart SET selected = $1 WHERE cart_id = $2 AND user_id = $3 RETURNING cart_id, selected",
      [selected, cart_id, userId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "ไม่พบรายการในตะกร้า" });
    }
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("🛒 PATCH cart/select error:", err);
    res.status(500).json({ error: "ไม่สามารถอัปเดตสถานะการเลือกได้" });
  }
});

// DELETE single item from cart
router.delete("/items/:cart_id", verifyToken, async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!pool) return res.status(503).json({ error: "DB not available" });
  const { cart_id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM cart WHERE cart_id = $1 AND user_id = $2 RETURNING cart_id",
      [cart_id, userId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "ไม่พบรายการในตะกร้า" });
    }
    res.json({ success: true, message: "ลบสินค้าออกจากตะกร้าแล้ว" });
  } catch (err) {
    console.error("🛒 DELETE cart error:", err);
    res.status(500).json({ error: "ไม่สามารถลบสินค้าออกจากตะกร้าได้" });
  }
});

// DELETE selected items after payment
router.delete("/selected", verifyToken, async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!pool) return res.status(503).json({ error: "DB not available" });

  try {
    const result = await pool.query(
      "DELETE FROM cart WHERE user_id = $1 AND selected = true RETURNING cart_id",
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบรายการที่เลือกในตะกร้า" });
    }

    res.json({ 
      success: true, 
      message: `ลบสินค้าที่ชำระเงินแล้ว ${result.rows.length} รายการ`,
      deletedIds: result.rows.map(row => row.cart_id)
    });
  } catch (err) {
    console.error("🛒 DELETE selected cart items error:", err);
    res.status(500).json({ error: "ไม่สามารถลบสินค้าที่เลือกออกจากตะกร้าได้" });
  }
});

export default router;
