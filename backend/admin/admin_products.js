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
// PATCH /api/admin_products/products/:product_id/stock - ปรับ stock เฉพาะ size ใน product_sizes
router.patch("/products/:product_id/stock", async (req, res) => {
  const { product_id } = req.params;
  const { size_name, delta } = req.body;
  if (!product_id || !size_name || typeof delta !== "number") {
    return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
  }
  try {
    // อัปเดต stock เฉพาะ size ที่ระบุ
    const result = await pool.query(
      `UPDATE product_sizes SET stock = stock + $1 WHERE product_id = $2 AND size_name = $3 RETURNING stock`,
      [delta, product_id, size_name]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "ไม่พบ size หรือสินค้า" });
    }
    res.json({ success: true, stock: result.rows[0].stock });
  } catch (e) {
    console.error("❌ ปรับ stock size ผิดพลาด:", e);
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

// PATCH /api/admin_products/:product_id - แก้ไขข้อมูลสินค้า (รวมรูป, รายละเอียด, size)
router.patch("/:product_id", upload.single("image"), async (req, res) => {
  const { product_id } = req.params;
  const { name, description, price, audience_id, category_id, sizes } = req.body;

  try {
    // ดึงข้อมูลสินค้าเดิมก่อน
    const check = await pool.query("SELECT * FROM products WHERE product_id = $1", [product_id]);
    if (check.rowCount === 0) {
      return res.status(404).json({ error: "ไม่พบสินค้า" });
    }
    const old = check.rows[0];

    // ใช้ค่าจาก form ถ้ามี ไม่งั้นใช้ค่าจาก DB เดิม
    const updated = {
      name: name ?? old.name,
      description: description ?? old.description,
      price: price ?? old.price,
      image_url: old.image_url,
      audience_id:
        audience_id && audience_id !== "" ? Number(audience_id) : old.audience_id,
      category_id:
        category_id && category_id !== "" ? Number(category_id) : old.category_id,
    };

    // ถ้ามีรูปใหม่ → ใช้ของใหม่แทน และลบรูปเก่าออกจาก Cloudinary
    if (req.file) {
      // ลบรูปเก่าออกจาก Cloudinary
      try {
        // ดึง public_id จาก URL เดิม (image_url)
        // รูปแบบ URL: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<ext>
        // ต้องดึง <folder>/<public_id> จาก path โดยข้าม /v123456/
        const url = old.image_url;
        // ตัด query string ออก (ถ้ามี)
        const cleanUrl = url.split('?')[0];
        // หา /upload/ แล้วตัดส่วนหลัง
        const uploadIdx = cleanUrl.indexOf('/upload/');
        let publicId = null;
        if (uploadIdx !== -1) {
          let afterUpload = cleanUrl.substring(uploadIdx + '/upload/'.length);
          // ถ้ามี /v123456/ ให้ตัดออก
          afterUpload = afterUpload.replace(/^v[0-9]+\//, '');
          // ตัดนามสกุลไฟล์ออก
          publicId = afterUpload.replace(/\.[^/.]+$/, '');
        }
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) {
        console.error("❌ ลบรูปเก่าออกจาก Cloudinary ไม่สำเร็จ:", err);
      }
      updated.image_url = req.file.path || req.file.url || req.file.filename;
    }

    // อัปเดตข้อมูลในตาราง products
    await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, image_url = $4, audience_id = $5, category_id = $6
       WHERE product_id = $7`,
      [
        updated.name,
        updated.description,
        updated.price,
        updated.image_url,
        updated.audience_id,
        updated.category_id,
        product_id,
      ]
    );

    // อัปเดต sizes ถ้าส่งมาด้วย
    if (sizes) {
      let sizesArr;
      try {
        sizesArr = JSON.parse(sizes);
      } catch (err) {
        return res.status(400).json({ error: "ข้อมูลไซต์สินค้าไม่ถูกต้อง" });
      }

      // ลบของเดิมก่อน
      await pool.query("DELETE FROM product_sizes WHERE product_id = $1", [product_id]);

      // เพิ่มใหม่
      for (const sz of sizesArr) {
        if (!sz.size_name || isNaN(Number(sz.stock)) || sz.stock === "") continue;
        await pool.query(
          `INSERT INTO product_sizes (product_id, size_name, stock) VALUES ($1, $2, $3)`,
          [product_id, sz.size_name, Number(sz.stock)]
        );
      }
    }

    res.json({ success: true, image_url: updated.image_url });
  } catch (e) {
    console.error("❌ แก้ไขสินค้า error:", e);
    res.status(500).json({ error: e.message });
  }
});



// GET /api/admin_products/all - ดึงสินค้าทุกตัว (รวมที่ซ่อนอยู่)
router.get("/all", async (req, res) => {
  try {
    // ดึงสินค้าทั้งหมด
    const productsRes = await pool.query(`
      SELECT 
        p.product_id, p.name AS product_name, p.description,
        p.price, p.compare_at, p.stock, p.image_url, p.created_at,
        p.is_hidden,
        c.category_id, c.name AS category_name,
        a.audience_id, a.name AS audience_name
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN audiences a ON p.audience_id = a.audience_id
      ORDER BY p.created_at DESC
      LIMIT 100
    `);

    // ดึงไซส์และ stock ของสินค้าทั้งหมด
    const sizesRes = await pool.query(`
      SELECT product_id, size_name, stock FROM product_sizes
    `);

    // สร้าง map สำหรับ product_id -> [{ size_name, stock }]
    const sizesMap = {};
    for (const row of sizesRes.rows) {
      if (!sizesMap[row.product_id]) sizesMap[row.product_id] = [];
      sizesMap[row.product_id].push({ size_name: row.size_name, stock: row.stock });
    }

    // รวมข้อมูล
    const products = productsRes.rows.map((p) => ({
      ...p,
      sizes: sizesMap[p.product_id] || [],
    }));

    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed" });
  }
});

export default router;