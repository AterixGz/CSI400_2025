
// routes/admin.js
import express from "express";
import pool from "../db.js";
const router = express.Router();
// routes/admin.js
router.post("/products", async (req, res) => {
  const { name, description, price, category_id, audience_id, image_url, sizes } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️⃣ เพิ่มสินค้าลง table products
    const insertProduct = `
      INSERT INTO products (name, description, price, category_id, audience_id, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING product_id;
    `;
    const { rows } = await client.query(insertProduct, [
      name,
      description,
      price,
      category_id,
      audience_id,
      image_url,
    ]);
    const productId = rows[0].product_id;

    // 2️⃣ เพิ่มไซซ์ (เช่น ["S", "M", "L", "FreeSize"])
    if (sizes && sizes.length > 0) {
      const insertSizes = `
        INSERT INTO product_sizes (product_id, size_name, stock)
        VALUES ${sizes.map((_, i) => `($1, $${i + 2}, 5)`).join(", ")};
      `;
      await client.query(insertSizes, [productId, ...sizes]);
    }

    await client.query("COMMIT");
    res.status(201).json({ success: true, product_id: productId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to add product" });
  } finally {
    client.release();
  }
});



/**
 * ✅ เพิ่มไซซ์ให้สินค้าที่มีอยู่แล้ว
 * ตัวอย่าง POST /api/admin/products/2/sizes
 * body: { "size_name": "L", "stock": 5 }
 */
router.post("/products/:id/sizes", async (req, res) => {
  const { id } = req.params;
  const { size_name, stock } = req.body;

  if (!size_name) {
    return res.status(400).json({ error: "size_name is required" });
  }

  try {
    const sql = `
      INSERT INTO product_sizes (product_id, size_name, stock)
      VALUES ($1, $2, COALESCE($3, 5))
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(sql, [id, size_name, stock]);

    res.status(201).json({
      success: true,
      message: `เพิ่มไซซ์ ${size_name} ให้สินค้ารหัส ${id} แล้ว`,
    });
  } catch (err) {
    console.error("❌ Add size error:", err);
    res.status(500).json({ error: "Failed to add size" });
  }
});

export default router;
