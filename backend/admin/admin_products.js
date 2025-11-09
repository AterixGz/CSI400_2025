import express from "express";
import pool from "../db.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ตั้งค่า storage สำหรับ multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products", // โฟลเดอร์ใน Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"]
  }
});
const upload = multer({ storage });

// POST /api/admin_products - เพิ่มสินค้าใหม่และอัพโหลดรูปไป Cloudinary
router.post("/", upload.single("image"), async (req, res) => {
  const { name, description, price, audience_id, category_id, sizes } = req.body;
  if (!name || !description || !price || !audience_id || !category_id || !req.file) {
    console.error("❌ ข้อมูลไม่ครบหรือไม่มีไฟล์", { name, description, price, audience_id, category_id, file: req.file });
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบทุกช่องและอัพโหลดรูปภาพ" });
  }
  let sizesArr = [];
  try {
    if (sizes) {
      try {
        sizesArr = JSON.parse(sizes);
      } catch (err) {
        console.error("❌ ข้อมูล sizes ไม่ถูกต้อง", sizes);
        return res.status(400).json({ error: "ข้อมูลไซต์สินค้าไม่ถูกต้อง" });
      }
    }
    // ตรวจสอบ property ที่ Cloudinary คืนมา
    const image_url = req.file.path || req.file.url || req.file.filename;
    console.log("✅ Cloudinary file:", req.file);
    console.log("✅ image_url ที่จะบันทึก:", image_url);

    // เพิ่มสินค้าใหม่
    const result = await pool.query(
      `INSERT INTO products (name, description, price, image_url, audience_id, category_id, stock)
       VALUES ($1, $2, $3, $4, $5, $6, 0)
       RETURNING product_id`,
      [name, description, price, image_url, audience_id, category_id]
    );
    const product_id = result.rows[0].product_id;

    // เพิ่ม size/stock แต่ละ size ลง product_sizes
    if (Array.isArray(sizesArr) && sizesArr.length > 0) {
      for (const sz of sizesArr) {
        // ข้ามถ้า stock ไม่ใช่ตัวเลขหรือว่าง
        if (!sz.size_name || isNaN(Number(sz.stock)) || sz.stock === "") continue;
        await pool.query(
          `INSERT INTO product_sizes (product_id, size_name, stock) VALUES ($1, $2, $3)`,
          [product_id, sz.size_name, Number(sz.stock)]
        );
      }
    }
    res.json({ success: true, product_id, image_url });
  } catch (e) {
    console.error("❌ อัพโหลดหรือบันทึกสินค้า error:", e);
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/products/:product_id/stock - ปรับ stock สินค้า (เพิ่ม/ลด)
router.patch("/products/:product_id/stock", async (req, res) => {
  const { product_id } = req.params;
  const { delta } = req.body;
  if (!product_id || typeof delta !== "number") {
    return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
  }
  try {
    // อัปเดต stock โดยเพิ่มหรือลดตาม delta
    const result = await pool.query(
      `UPDATE products SET stock = stock + $1 WHERE product_id = $2 RETURNING stock`,
      [delta, product_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "ไม่พบสินค้า" });
    }
    res.json({ success: true, stock: result.rows[0].stock });
  } catch (e) {
    console.error("❌ ปรับ stock ผิดพลาด:", e);
    res.status(500).json({ error: e.message });
  }
});


// DELETE /api/admin_products/:product_id - ลบสินค้าออกจากระบบ (DB จริง)
router.delete('/:product_id', async (req, res) => {
  const { product_id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE product_id = $1', [product_id]);
    res.json({ success: true });
  } catch (e) {
    console.error('❌ ลบสินค้า error:', e);
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/admin_products/:product_id/hide - ซ่อนสินค้า (is_hidden=true)
router.patch('/:product_id/hide', async (req, res) => {
  const { product_id } = req.params;
  const { is_hidden } = req.body;
  try {
    await pool.query('UPDATE products SET is_hidden = $1 WHERE product_id = $2', [!!is_hidden, product_id]);
    res.json({ success: true });
  } catch (e) {
    console.error('❌ ซ่อนสินค้า error:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin_products/all - ดึงสินค้าทุกตัว (รวมที่ซ่อนอยู่)
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.product_id, p.name AS product_name, p.description,
        p.price, p.compare_at, p.stock, p.image_url, p.created_at,
        p.is_hidden,
        c.category_id, c.name AS category_name,
        a.audience_id, a.name AS audience_name,
        ARRAY_AGG(ps.size_name ORDER BY ps.size_id) AS sizes
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN audiences a ON p.audience_id = a.audience_id
      LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
      GROUP BY p.product_id, c.category_id, a.audience_id
      ORDER BY p.created_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed" });
  }
});

export default router;