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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "JWT_SECRET_KEY");
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

// POST /orders - Create new order after payment
router.post("/", verifyToken, async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!pool) return res.status(503).json({ error: "DB not available" });

  const { items, address, total_amount, shipping_fee, payment_intent_id } = req.body;

  try {
    // Start transaction
    await pool.query('BEGIN');

    // 1. Create order record
    // Insert order and rely on DB default for `status` (usually 'pending') to avoid enum mismatches
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, total_amount, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING order_id`,
      [userId, total_amount]
    );
    const orderId = orderResult.rows[0].order_id;

    // 2. Create order items
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, size)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.product_id, item.qty, item.price, item.size]
      );

      // 3. Update product stock (if needed)
      // Prefer decrementing size-level stock if size information exists
      const qty = Number(item.qty || 1);
      let updated = 0;
      try {
        if (item.size) {
          // If size looks like an id (numeric), try to decrement by size_id
          if (Number.isInteger(item.size) || (typeof item.size === 'string' && /^\d+$/.test(item.size))) {
            const sizeId = Number(item.size);
            const res = await pool.query(
              `UPDATE product_sizes SET stock = stock - $1 WHERE size_id = $2 AND stock IS NOT NULL`,
              [qty, sizeId]
            );
            updated = res.rowCount || 0;
          } else {
            // Otherwise try to match by product_id + size_name
            const res = await pool.query(
              `UPDATE product_sizes SET stock = stock - $1 WHERE product_id = $2 AND size_name = $3 AND stock IS NOT NULL`,
              [qty, item.product_id, String(item.size)]
            );
            updated = res.rowCount || 0;
          }
        }
      } catch (sizeErr) {
        console.warn('Failed to update product_sizes stock, falling back to products:', sizeErr);
        updated = 0;
      }

      // If we didn't update a size row, fall back to the product-level stock column
      if (!updated) {
        await pool.query(
          `UPDATE products SET stock = stock - $1 WHERE product_id = $2 AND stock IS NOT NULL`,
          [qty, item.product_id]
        );
      }
    }

    // 4. Create order address (match DB schema: include user_id and Thai address fields)
    if (address) {
      await pool.query(
        `INSERT INTO order_addresses (
          order_id, user_id, full_name, phone_number, address_line1,
          address_line2, subdistrict, district, province, postal_code, country, note, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
        [
          orderId,
          userId,
          address.full_name,
          address.phone_number,
          address.address_line1,
          address.address_line2 || '',
          address.subdistrict || address.sub_district || '',
          address.district || '',
          address.province || '',
          address.postal_code || '',
          address.country || 'Thailand',
          address.note || ''
        ]
      );
    }

    // 5. Create payment record
    await pool.query(
      `INSERT INTO order_payments (
        order_id, user_id, payment_intent_id, amount, status, 
        payment_method, created_at
      ) VALUES ($1, $2, $3, $4, 'succeeded', 'stripe', NOW())`,
      [orderId, userId, payment_intent_id, total_amount]
    );

    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({
      success: true,
      order: {
        order_id: orderId,
        total_amount,
        shipping_fee,
        status: 'completed',
        created_at: new Date().toISOString()
      }
    });

  } catch (err) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error("🛍️ Create order error:", err);
    res.status(500).json({ error: "ไม่สามารถสร้างคำสั่งซื้อได้" });
  }
});

// GET /orders - Get user's orders with product details
router.get("/", verifyToken, async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!pool) return res.status(503).json({ error: "DB not available" });

  try {
    const sql = `
      SELECT o.order_id, o.total_amount, o.status, o.created_at,
             oa.order_address_id, oa.full_name, oa.phone_number, oa.address_line1,
             oa.address_line2, oa.subdistrict, oa.district, oa.province, oa.postal_code, oa.country, oa.note,
             op.payment_intent_id, op.payment_method,
             json_agg(json_build_object(
               'product_id', oi.product_id,
               'quantity', oi.quantity,
               'price', oi.price,
               'size', oi.size,
               'color', oi.color,
               'name', p.name,
               'image', p.image_url
             )) FILTER (WHERE oi.order_item_id IS NOT NULL) as items
      FROM orders o
      LEFT JOIN order_addresses oa ON o.order_id = oa.order_id
      LEFT JOIN order_payments op ON o.order_id = op.order_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE o.user_id = $1
      GROUP BY o.order_id, oa.order_address_id, op.payment_id
      ORDER BY o.created_at DESC
    `;

    const { rows } = await pool.query(sql, [userId]);
    res.json({ orders: rows });

  } catch (err) {
    console.error("🛍️ Get orders error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลคำสั่งซื้อได้" });
  }
});

// GET /orders/:order_id - Get order details
router.get("/:order_id", verifyToken, async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!pool) return res.status(503).json({ error: "DB not available" });

  const { order_id } = req.params;

  try {
    const sql = `
      SELECT o.order_id, o.total_amount, o.status, o.created_at,
             oa.full_name, oa.phone_number, oa.address_line1, 
             oa.address_line2, oa.city, oa.state, oa.postal_code,
             op.payment_intent_id, op.payment_method,
             json_agg(json_build_object(
               'product_id', oi.product_id,
               'quantity', oi.quantity,
               'price', oi.price,
               'size', oi.size,
               'name', p.name,
               'image', p.image_url
             )) as items
      FROM orders o
      LEFT JOIN order_addresses oa ON o.order_id = oa.order_id
      LEFT JOIN order_payments op ON o.order_id = op.order_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE o.order_id = $1 AND o.user_id = $2
      GROUP BY o.order_id, oa.address_id, op.payment_id
    `;

    const { rows } = await pool.query(sql, [order_id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });
    }

    res.json({ order: rows[0] });

  } catch (err) {
    console.error("🛍️ Get order details error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลคำสั่งซื้อได้" });
  }
});

export default router;
