// server.js
import express from 'express';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import loginRouter from './routes/login.js';
import registerRouter from "./routes/register.js";
import userRoutes from "./routes/userRoutes.js";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// **import DB pool**
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Session middleware (จำเป็นสำหรับ Passport)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware สำหรับแปลง body เป็น JSON
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


// Passport Google OAuth2 Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // สามารถบันทึก profile ลง database ได้ที่นี่
  // ตัวอย่างการใช้ pool query:
  // pool.query('INSERT INTO users(name, email) VALUES($1, $2) ON CONFLICT DO NOTHING', [profile.displayName, profile.emails[0].value]);
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Route สำหรับเริ่ม Login ด้วย Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route หลังจาก Google Auth
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const googleUser = encodeURIComponent(JSON.stringify({
      displayName: req.user.displayName,
      email: req.user.emails?.[0]?.value
    }));
    res.redirect(`http://localhost:5173/login?googleUser=${googleUser}`);
  }
);


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// เพิ่ม API สำหรับ Login
app.use("/login", loginRouter);

// เพิ่ม API สำหรับ Register
app.use("/register", registerRouter);

// เพิ่ม API สำหรับ User routes
app.use("/api/users", userRoutes);

// ตัวอย่าง test query จาก DB
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
