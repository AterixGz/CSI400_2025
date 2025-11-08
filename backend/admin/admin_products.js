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
  const { name, description, price, category_id } = req.body;
  if (!name || !description || !price || !category_id || !req.file) {
    console.error("❌ ข้อมูลไม่ครบหรือไม่มีไฟล์", { name, description, price, category_id, file: req.file });
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบทุกช่องและอัพโหลดรูปภาพ" });
  }
  try {
    // ตรวจสอบ property ที่ Cloudinary คืนมา
    const image_url = req.file.path || req.file.url || req.file.filename;
    console.log("✅ Cloudinary file:", req.file);
    console.log("✅ image_url ที่จะบันทึก:", image_url);

    const result = await pool.query(
      `INSERT INTO products (name, description, price, image_url, category_id, stock)
       VALUES ($1, $2, $3, $4, $5, 0)
       RETURNING product_id`,
      [name, description, price, image_url, category_id]
    );
    res.json({ success: true, product_id: result.rows[0].product_id, image_url });
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

export default router;