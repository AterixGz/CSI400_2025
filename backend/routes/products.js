/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API สำหรับดึงข้อมูลสินค้าและรายละเอียดสินค้า
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: ดึงสินค้าทั้งหมด
 *     description: ใช้สำหรับดึงรายการสินค้าทั้งหมด พร้อมข้อมูลหมวดหมู่ กลุ่มเป้าหมาย และไซซ์สินค้า สามารถกรองและเรียงลำดับได้
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price-asc, price_asc, price-desc, price_desc]
 *         description: เรียงลำดับราคาสินค้า
 *       - in: query
 *         name: audience
 *         schema:
 *           type: string
 *         description: กรองสินค้าตามกลุ่มเป้าหมาย (เช่น Men, Women, Kids)
 *     responses:
 *       200:
 *         description: รายการสินค้าทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: failed
 */
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: ดึงรายละเอียดสินค้าเดียว
 *     description: ใช้สำหรับดึงรายละเอียดสินค้าแต่ละชิ้น พร้อมข้อมูลไซซ์ หมวดหมู่ และกลุ่มเป้าหมาย
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสสินค้า
 *     responses:
 *       200:
 *         description: ข้อมูลสินค้ารายการเดียว
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Not found
 *       500:
 *         description: failed
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         product_id:
 *           type: integer
 *         product_name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         compare_at:
 *           type: number
 *         stock:
 *           type: integer
 *         image_url:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         category_id:
 *           type: integer
 *         category_name:
 *           type: string
 *         audience_id:
 *           type: integer
 *         audience_name:
 *           type: string
 *         sizes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               size_name:
 *                 type: string
 *               stock:
 *                 type: integer
 */
import express from "express";
import pool from "../db.js";

const router = express.Router();

// ✅ ดึงสินค้าทั้งหมด + ชื่อหมวดหมู่/กลุ่มเป้าหมาย + ไซซ์
router.get("/", async (req, res) => {
  const { sort, audience } = req.query; // เปลี่ยนจาก category_id เป็น audience
  // รองรับทั้ง price-asc, price_asc, price-desc, price_desc
  let orderBy = "p.created_at DESC";
  if (sort === "price-asc" || sort === "price_asc") orderBy = "p.price ASC";
  else if (sort === "price-desc" || sort === "price_desc") orderBy = "p.price DESC";

  try {
    const values = [];
    const where = [];

    // audience filter
    if (audience) {
      const list = audience.split(",");
      const placeholders = list.map((_, i) => `$${i + 1}`).join(", ");
      where.push(`a.name IN (${placeholders})`);
      values.push(...list);
    }

    // filter เฉพาะสินค้าที่ไม่ถูกซ่อน (is_hidden ไม่เป็น true)
    const whereHidden = "p.is_hidden IS NOT TRUE";
    const whereAll = [whereHidden, ...where];
    const sql = `
      SELECT 
        p.product_id, p.name AS product_name, p.description,
        p.price, p.compare_at, p.stock, p.image_url, p.created_at,
        c.category_id, c.name AS category_name,
        a.audience_id, a.name AS audience_name,
        JSON_AGG(JSON_BUILD_OBJECT('size_name', ps.size_name, 'stock', ps.stock) ORDER BY ps.size_id) FILTER (WHERE ps.size_name IS NOT NULL) AS sizes
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN audiences a ON p.audience_id = a.audience_id
      LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
      ${whereAll.length ? `WHERE ${whereAll.join(" AND ")}` : ""}
      GROUP BY p.product_id, c.category_id, a.audience_id
      ORDER BY ${orderBy}
      LIMIT 50
    `;

    const { rows } = await pool.query(sql, values);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed" });
  }
});

// ✅ ดึงรายละเอียดสินค้าเดียว + ไซซ์
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `
      SELECT 
        p.product_id, p.name AS product_name, p.description,
        p.price, p.compare_at, p.stock, p.image_url, p.created_at,
        c.category_id, c.name AS category_name,
        a.audience_id, a.name AS audience_name,
        JSON_AGG(JSON_BUILD_OBJECT('size_name', ps.size_name, 'stock', ps.stock) ORDER BY ps.size_id) FILTER (WHERE ps.size_name IS NOT NULL) AS sizes
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN audiences a ON p.audience_id = a.audience_id
      LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
      WHERE p.product_id = $1
      GROUP BY p.product_id, c.category_id, a.audience_id
      `,
      [id]
    );

    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed" });
  }
});

export default router;
