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
import searchRouter from "./routes/search.js";
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/Admin.js';
import googleAuthRouter from './routes/googleAuth.js';
import cartRouter from './routes/cart.js';
import stripeRouter from './routes/stripe.js';
import clearCartRouter from './routes/clearCart.js';
import addressRouter from './routes/address.js';
import favoriteRouter from './routes/favorite.js';
import productAdminRouter from "./admin/admin_products.js";
import categoriesAdminRouter from "./admin/admin_categories.js";
import orderUserRouter from './routes/orderUser.js';
import dashboardRouter from './routes/dashboard.js';
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

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// เพิ่ม API สำหรับ Login
app.use("/login", loginRouter);

// เพิ่ม API สำหรับ Register
app.use("/register", registerRouter);

// เพิ่ม API สำหรับ User routes
app.use("/api/users", userRoutes);

// ใช้งาน route /api/products
app.use("/api/products", productsRouter);

// ใช้งาน Search routes
app.use("/api/search", searchRouter);

// ใช้งาน Google Auth routes
app.use(googleAuthRouter);

// ใช้งาน Cart routes
app.use('/cart', cartRouter);

// ใช้งาน Clear Cart routes
app.use('/api/clear-cart', clearCartRouter);

// ใช้งาน Favorite routes
app.use('/api/favorite', favoriteRouter);

// ใช้งาน Stripe routes
app.use('/api/stripe', stripeRouter);

// ใช้งาน Address routes
app.use('/api/addresses', addressRouter);

// ใช้งาน Order User routes
app.use('/api/orders/user', orderUserRouter);

// ใช้งาน Admin routes
app.use("/api/admin", adminRoutes);


// ============ admin ============
// ใช้งาน Product Admin routes
app.use("/api/admin_products", productAdminRouter);

// ใช้งาน Categories Admin routes
app.use("/api/admin_categories", categoriesAdminRouter);

// ใช้งาน Admin Dashboard routes
app.use('/api/dashboard', dashboardRouter);
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
