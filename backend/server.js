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
import productsRouter from "./routes/products.js";
import cors from 'cors';
import dotenv from 'dotenv';
import googleAuthRouter from './routes/googleAuth.js';
import cartRouter from './routes/cart.js';
import stripeRouter from './routes/stripe.js';
import clearCartRouter from './routes/clearCart.js';
import addressRouter from './routes/address.js';

dotenv.config();

// **import DB pool**
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Session middleware (จำเป็นสำหรับ Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({ origin: true }));
// Middleware สำหรับแปลง body เป็น JSON
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));



passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});


// เพิ่ม API สำหรับ Login
app.use("/login", loginRouter);

// เพิ่ม API สำหรับ Register
app.use("/register", registerRouter);

// เพิ่ม API สำหรับ User routes
app.use("/api/users", userRoutes);

// ใช้งาน route /api/products
app.use("/api/products", productsRouter);

// ใช้งาน Google Auth routes
app.use(googleAuthRouter);

// ใช้งาน Cart routes
app.use('/cart', cartRouter);

// ใช้งาน Clear Cart routes
app.use('/api/clear-cart', clearCartRouter);

// ใช้งาน Stripe routes
app.use('/api/stripe', stripeRouter);

// ใช้งาน Address routes
app.use('/api/addresses', addressRouter);

// ตัวอย่าง test query จาก DB
app.get('/test-db', async (req, res) => {
  try {
    // use wrapper's query (will throw if pool not available)
    const result = await db.query('SELECT NOW()');
    res.json({ time: result.rows[0] });
  } catch (err) {
    console.error('test-db error:', err.message || err);
    res.status(503).json({ error: 'DB not available', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
