// backend/routes/userRoutes.js
import express from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// ✅ Get all users
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY user_id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get user by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create user

router.post("/", async (req, res) => {
  try {
    const {
      email,
      phone_number,
      first_name,
      last_name,
      date_of_birth,
      profile_image_url,
      role = "user",
      gender,
      password, // รับ password แบบ plain text
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users 
        (email, phone_number, first_name, last_name, date_of_birth, profile_image_url, role, gender, password_hash, created_at, updated_at, is_verified) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW(), NOW(), $10) 
       RETURNING *`,
      [
        email,
        phone_number || null,
        first_name || null,
        last_name || null,
        date_of_birth || null,
        profile_image_url || null,
        role,
        gender || null,
        password_hash,
        false // is_verified
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Update user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      phone_number,
      first_name,
      last_name,
      date_of_birth,
      profile_image_url,
      role,
      gender,
      is_verified,
    } = req.body;

   const result = await pool.query(
  `UPDATE users SET 
      email=$1, phone_number=$2, first_name=$3, last_name=$4,
      date_of_birth=$5, profile_image_url=$6, role=$7, gender=$8,
      is_verified=$9, updated_at=NOW()
   WHERE user_id=$11 RETURNING *`,
  [email, phone_number, first_name, last_name, date_of_birth, profile_image_url, role, gender, is_verified, id]
);


    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM users WHERE user_id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
