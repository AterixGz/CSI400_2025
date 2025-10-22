// routes/products.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// ✅ ดึงสินค้าทั้งหมด + ชื่อหมวดหมู่/กลุ่มเป้าหมาย (พร้อมรองรับ sort เบื้องต้น)
router.get("/", async (req, res) => {
  const { sort, category_id } = req.query;
  const orderBy =
    sort === "price_asc" ? "p.price ASC" :
    sort === "price_desc" ? "p.price DESC" :
    "p.created_at DESC";

  try {
    const values = [];
    const where = [];
    if (category_id) { values.push(category_id); where.push(`p.category_id = $${values.length}`); }

    const sql = `
      SELECT 
        p.product_id, p.name AS product_name, p.description,
        p.price, p.compare_at, p.stock, p.image_url, p.created_at,
        c.category_id, c.name AS category_name,
        a.audience_id, a.name AS audience_name
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN audiences a ON p.audience_id = a.audience_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
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


// routes/products.js
// routes/products.js
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `
      SELECT 
        p.product_id, p.name AS product_name, p.description,
        p.price, p.compare_at, p.stock, p.image_url, p.created_at,
        c.category_id, c.name AS category_name,
        a.audience_id, a.name AS audience_name
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN audiences a ON p.audience_id = a.audience_id
      WHERE p.product_id = $1
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
