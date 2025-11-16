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