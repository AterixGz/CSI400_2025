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
        console.log('ลบรูปเก่าใน Cloudinary:', oldPublicId);
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
