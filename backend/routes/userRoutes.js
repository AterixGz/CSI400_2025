// backend/routes/userRoutes.js
import express from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Supabase service client for server-side storage operations.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseStorage = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabaseStorage = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
} else {
  console.warn("Supabase service role key not configured. Avatar uploads will be disabled.");
}

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

    let finalProfileImageUrl = profile_image_url;

    // If profile_image_url is a data URL and supabaseStorage is available, upload it to storage
    if (profile_image_url && typeof profile_image_url === 'string' && profile_image_url.startsWith('data:')) {
      if (!supabaseStorage) {
        return res.status(500).json({ error: 'Server storage not configured' });
      }

      // parse data URL
      const matches = profile_image_url.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Invalid image data' });
      }
      const contentType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

  // derive extension from contentType
  const ext = contentType.split('/')[1] || 'png';
  // store files directly under the bucket root (no duplicate "avatars/" prefix)
  const fileName = `${id}-${Date.now()}.${ext}`;
  const filePath = fileName;

      // upload to Supabase Storage (bucket: avatars)
      try {
        const { data: uploadData, error: uploadError } = await supabaseStorage.storage.from('avatars').upload(filePath, buffer, {
          contentType,
          upsert: false,
        });
        if (uploadError) {
          console.error('Supabase upload error', uploadError);
          return res.status(500).json({ error: 'Failed to upload avatar', detail: uploadError.message || uploadError });
        }

        // get public URL from Supabase. If bucket isn't public, getPublicUrl may return null.
        let pub = supabaseStorage.storage.from('avatars').getPublicUrl(filePath);
        let publicUrl = pub?.data?.publicUrl || null;
        // fallback: construct the public URL pattern used by Supabase storage (works when bucket is public)
        if (!publicUrl && SUPABASE_URL) {
          try {
            const base = SUPABASE_URL.replace(/\/$/, '');
            publicUrl = `${base}/storage/v1/object/public/avatars/${encodeURIComponent(filePath)}`;
          } catch (e) {
            console.warn('Could not construct fallback public URL', e);
          }
        }

        // Avatar uploaded (details omitted in logs)
        
        // update user profile image URL
        finalProfileImageUrl = publicUrl;
      } catch (uErr) {
        console.error('Upload exception', uErr);
        return res.status(500).json({ error: 'Failed to upload avatar', detail: String(uErr) });
      }
    }

  const result = await pool.query(
  `UPDATE users SET 
    email=$1, phone_number=$2, first_name=$3, last_name=$4,
    date_of_birth=$5, profile_image_url=$6, role=$7, gender=$8,
    is_verified=$9, updated_at=NOW()
  WHERE user_id=$10 RETURNING *`,
  [email, phone_number, first_name, last_name, date_of_birth, finalProfileImageUrl, role, gender, is_verified, id]
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
