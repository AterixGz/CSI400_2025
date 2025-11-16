
import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import db from '../db.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const displayName = profile.displayName;
    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let dbUser = null;
    if (userCheck.rows.length === 0) {
      // Insert new user with Google info
      try {
        await db.query(
          `INSERT INTO users (first_name, email, password_hash, role, is_verified, created_at) VALUES ($1, $2, $3, $4, $5, $6)`,
          [displayName, email, 'google', 'user', true, new Date()]
        );
        // Fetch the newly inserted user
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        dbUser = result.rows[0] || null;
      } catch (insertErr) {
        return done(insertErr, null);
      }
    } else {
      dbUser = userCheck.rows[0];
    }
    // ✅ ดึง role_name จากตาราง roles
        const roleQuery = `
          SELECT role_name FROM roles WHERE role_id = $1
        `;
        const roleResult = await db.query(roleQuery, [dbUser.role_id]);
        const role_name = roleResult.rows[0]?.role_name || 'user';

        dbUser.role_name = role_name;
  // Pass dbUser to req.user
  return done(null, dbUser);
  } catch (err) {
    console.error('❌ GoogleStrategy error:', err.message || err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    // req.user is now dbUser from done() above
    const dbUser = req.user;
    // สร้าง JWT token แบบเดียวกับ login ปกติ
    let token = '';
    if (dbUser) {
      token = jwt.sign(
        { user_id: dbUser.user_id, email: dbUser.email, role: dbUser.role ,role_name: dbUser.role_name,},
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    }
    // ส่งข้อมูล user + token ไป frontend
    const googleUser = encodeURIComponent(JSON.stringify(dbUser || {}));
    res.redirect(`http://localhost:5173/login?googleUser=${googleUser}&token=${token}`);
  }
);
export default router;