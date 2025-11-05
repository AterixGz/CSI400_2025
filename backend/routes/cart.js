import express from "express";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

function getUserIdFromReq(req) {
  // Try session user (passport) first
  if (req.user && req.user.id) return req.user.id;
  if (req.user && req.user.user_id) return req.user.user_id;
  // Try Authorization Bearer JWT
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length !== 2) return null;
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "changeme");
    // payload should contain id or user_id
    return payload.id || payload.user_id || null;
  } catch (e) {
    return null;
  }
}

// GET /cart - get current user's cart
router.get("/", async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!pool) return res.status(503).json({ error: "DB not available" });

  try {
    const sql = `
      SELECT c.cart_id, c.product_id, c.quantity, c.added_at,
             c.size,
             p.name AS product_name, p.price, p.stock, p.image_url, p.description
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
    }));
    res.json({ items });
  } catch (err) {
    console.error("🛒 GET /cart error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลตะกร้าได้" });
  }
});

// POST /cart/items { product_id, quantity, size }
router.post("/items", async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!pool) return res.status(503).json({ error: "DB not available" });
  const { product_id, quantity = 1, size = null } = req.body;
  if (!product_id) return res.status(400).json({ error: "โปรดระบุสินค้า" });
  const qty = Math.max(1, parseInt(quantity, 10));
  try {
    const product = await pool.query(
      "SELECT stock FROM products WHERE product_id = $1",
      [product_id]
    );
    if (!product.rows[0]) {
      return res.status(404).json({ error: "ไม่พบสินค้า" });
    }
    const stock = product.rows[0].stock;
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
router.patch("/items/:cart_id", async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!pool) return res.status(503).json({ error: "DB not available" });
  const { cart_id } = req.params;
  const quantity = parseInt(req.body.quantity, 10);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: "จำนวนต้องเป็นจำนวนเต็มบวก" });
  }
  try {
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
router.delete("/items/:cart_id", async (req, res) => {
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

export default router;
