/**
 * @swagger
 * tags:
 *   name: AdminOrders
 *   description: API สำหรับแอดมินดูและจัดการคำสั่งซื้อทั้งหมด
 */

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: ดูรายการคำสั่งซื้อทั้งหมด
 *     description: ใช้สำหรับดึงรายการคำสั่งซื้อทั้งหมดในระบบ พร้อมข้อมูลผู้ใช้และสถานะ
 *     tags: [AdminOrders]
 *     responses:
 *       200:
 *         description: รายการคำสั่งซื้อทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: ไม่สามารถดึงข้อมูลคำสั่งซื้อได้
 */
/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     summary: อัพเดทสถานะการจัดส่งของคำสั่งซื้อ
 *     description: ใช้สำหรับอัพเดทสถานะการจัดส่งของคำสั่งซื้อ เช่น shipped, delivered
 *     tags: [AdminOrders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสคำสั่งซื้อ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัพเดทสถานะสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: ไม่สามารถอัพเดทสถานะคำสั่งซื้อได้
 */
/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: ดูรายละเอียดคำสั่งซื้อ
 *     description: ใช้สำหรับดึงรายละเอียดคำสั่งซื้อ เช่น รายการสินค้าและที่อยู่จัดส่ง
 *     tags: [AdminOrders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสคำสั่งซื้อ
 *     responses:
 *       200:
 *         description: ข้อมูลรายละเอียดคำสั่งซื้อ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                 address:
 *                   type: object
 *       500:
 *         description: ไม่สามารถดึงข้อมูลรายละเอียดคำสั่งซื้อได้
 */
import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /api/admin/orders - Get all orders with user details
router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT 
        o.order_id,
        o.user_id,
        o.total_amount,
        o.status as shipping_status,
        o.created_at,
        u.first_name,
        u.last_name,
        u.email,
        op.status as payment_status,
        op.payment_intent_id,
        CONCAT('VYNE-', TO_CHAR(o.created_at, 'YYYY'), '-', LPAD(o.order_id::text, 4, '0')) as order_code
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_payments op ON o.order_id = op.order_id
      ORDER BY o.created_at DESC
    `;

    const { rows } = await pool.query(sql);
    
    // Transform data to match frontend format
    const orders = rows.map(order => ({
      id: order.order_id,
      code: order.order_code,
      customerName: `${order.first_name} ${order.last_name}`,
      customerEmail: order.email,
      total: parseFloat(order.total_amount) || 0,
      paymentStatus: order.payment_status || 'Pending',
      shippingStatus: order.shipping_status || 'Pending',
      tracking: '',  // เอาออกก่อนเพราะยังไม่มีตาราง tracking
      createdAt: new Date(order.created_at).toLocaleString('th-TH')
    }));

    res.json({ orders });
  } catch (err) {
    console.error("Get admin orders error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลคำสั่งซื้อได้" });
  }
});

// PUT /api/admin/orders/:id/status - Update order shipping status
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2`,
      [status, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ error: "ไม่สามารถอัพเดทสถานะคำสั่งซื้อได้" });
  }
});

// GET /api/admin/orders/:id - Get order details including items and address
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get order items with product details
    const itemsSql = `
      SELECT 
        oi.order_item_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        oi.size,
        p.name,
        p.image_url as image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
    `;

    // Get shipping address
    const addressSql = `
      SELECT 
        order_address_id,
        full_name,
        phone_number,
        address_line1,
        address_line2,
        subdistrict,
        district,
        province,
        postal_code,
        country,
        note
      FROM order_addresses
      WHERE order_id = $1
    `;

    // Run both queries in parallel
    const [itemsResult, addressResult] = await Promise.all([
      pool.query(itemsSql, [id]),
      pool.query(addressSql, [id])
    ]);

    res.json({
      items: itemsResult.rows,
      address: addressResult.rows[0] || null
    });

  } catch (err) {
    console.error("Get order details error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลรายละเอียดคำสั่งซื้อได้" });
  }
});

export default router;
