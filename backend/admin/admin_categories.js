import express from "express";
import pool from "../db.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories");
    if (result.rows.length > 0) {
      return res.json(result.rows);
    } else {
      // ถ้า DB ว่าง ให้ใช้ค่า default
      return res.json([
        { category_id: 1, name: "ชาย" },
        { category_id: 2, name: "หญิง" },
        { category_id: 3, name: "เด็ก" },
      ]);
    }
  } catch (e) {
    // ถ้ามี error ก็ใช้ static แทน
    res.json([
      { category_id: 1, name: "ชาย" },
      { category_id: 2, name: "หญิง" },
      { category_id: 3, name: "เด็ก" },
    ]);
  }
});

export default router;
