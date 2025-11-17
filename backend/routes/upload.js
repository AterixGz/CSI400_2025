/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: API สำหรับอัปโหลดรูปโปรไฟล์ผู้ใช้ โดยใช้ Cloudinary เป็น storage
 */

/**
 * @swagger
 * /api/upload/profile:
 *   post:
 *     summary: อัปโหลดรูปโปรไฟล์ผู้ใช้
 *     description: ใช้สำหรับอัปโหลดรูปโปรไฟล์ใหม่ และลบรูปเก่าออกจาก Cloudinary หากมี โดยรับไฟล์ผ่าน multipart/form-data
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์รูปโปรไฟล์ใหม่
 *               old_public_id:
 *                 type: string
 *                 description: public_id ของรูปเก่า (ถ้ามี จะลบรูปเก่าออกจาก Cloudinary)
 *     responses:
 *       200:
 *         description: อัปโหลดสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 *                 public_id:
 *                   type: string
 *       400:
 *         description: ไม่พบไฟล์
 *       500:
 *         description: เกิดข้อผิดพลาดในการอัปโหลด
 */
import pool from "../db.js";
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_images",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

const upload = multer({ storage });


router.post("/profile", upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "ไม่พบไฟล์" });
    }

    // ลบรูปเก่าใน Cloudinary ถ้ามี old_public_id
    const oldPublicId = req.body.old_public_id;
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
        // Old Cloudinary image removed
      } catch (err) {
        console.warn('ลบรูปเก่าไม่สำเร็จ:', oldPublicId, err.message);
      }
    }

    // URL จริงจาก Cloudinary
    const url = req.file.path; 

    // public_id ของไฟล์
    const public_id = req.file.filename; // ใช้เพื่อลบรูปเก่าได้

    return res.json({
      message: "อัปโหลดสำเร็จ",
      url,
      public_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปโหลด" });
  }
});



export default router;
