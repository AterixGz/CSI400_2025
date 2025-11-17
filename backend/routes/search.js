/**
 * @swagger
 * tags:
 *   name: Search
 *   description: API สำหรับค้นหาสินค้าด้วย keyword
 */

/**
 * @swagger
 * /api/search/products:
 *   get:
 *     summary: ค้นหาสินค้าด้วย keyword
 *     description: ใช้สำหรับค้นหาสินค้าจากชื่อหรือคำอธิบาย โดยส่ง keyword ผ่าน query string (q)
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: คำค้นหาสินค้า
 *     responses:
 *       200:
 *         description: รายการสินค้าที่ค้นพบ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product_id:
 *                     type: integer
 *                   product_name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   compare_at:
 *                     type: number
 *                   stock:
 *                     type: integer
 *                   image_url:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   category_id:
 *                     type: integer
 *                   category_name:
 *                     type: string
 *                   audience_id:
 *                     type: integer
 *                   audience_name:
 *                     type: string
 *       500:
 *         description: failed to search products
 */
// routes/search.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/products", async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.json([]);
  }

  try {
    const query = `
      SELECT 
        p.product_id, p.name AS product_name, p.description,
        p.price, p.compare_at, p.stock, p.image_url, p.created_at,
        c.category_id, c.name AS category_name,
        a.audience_id, a.name AS audience_name
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN audiences a ON p.audience_id = a.audience_id
      WHERE 
        p.name ILIKE $1 OR
        p.description ILIKE $1
      ORDER BY 
        CASE WHEN p.name ILIKE $1 THEN 0 ELSE 1 END,
        p.created_at DESC
      LIMIT 10
    `;
    
    const { rows } = await pool.query(query, [`%${q}%`]);
    
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to search products" });
  }
});

export default router;