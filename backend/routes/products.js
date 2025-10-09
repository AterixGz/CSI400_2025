import express from "express";
import pool from "../db.js";

const router = express.Router();

// ✅ ดึงสินค้าทั้งหมด พร้อมชื่อหมวดหมู่
router.get("/", async (req, res) => {
  try {
   const result = await pool.query(`
  SELECT 
    p.product_id,
    p.name AS product_name,
    p.description,
    p.price,
    p.stock,
    p.image_url,
    p.created_at,
    c.category_id,
    c.name AS category_name,
    a.audience_id,
    a.name AS audience_name
  FROM products p
  JOIN categories c ON p.category_id = c.category_id
  LEFT JOIN audiences a ON p.audience_id = a.audience_id
  ORDER BY p.created_at DESC
`);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า" });
  }
});

export default router;
