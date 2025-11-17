
import express from 'express';
import db from '../db.js';
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();


// Middleware: require authentication using JWT (same as orderUser.js)
function requireAuth(req, res, next) {
	const auth = req.headers.authorization || req.headers.Authorization;
	if (!auth) {
		return res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" });
	}
	const parts = auth.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return res.status(401).json({ error: "รูปแบบ Token ไม่ถูกต้อง" });
	}
	const token = parts[1];
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "JWT_SECRET_KEY");
		req.user = decoded;
		next();
	} catch (err) {
		if (err.name === "TokenExpiredError") {
			return res.status(401).json({ error: "Token หมดอายุ กรุณาเข้าสู่ระบบใหม่" });
		}
		return res.status(401).json({ error: "Token ไม่ถูกต้อง" });
	}
}

function getUserIdFromReq(req) {
	if (!req.user) return null;
	return req.user.id || req.user.user_id || null;
}

// Create a review
router.post('/', requireAuth, async (req, res) => {
	const { product_id, rating, comment } = req.body;
	const user_id = getUserIdFromReq(req);
	if (!user_id) return res.status(401).json({ error: "Unauthorized" });
	if (!product_id || !rating || !comment) return res.status(400).json({ error: 'Missing fields' });
	if (typeof rating !== 'number' || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
	try {
		// Enforce unique user-product review
		const exists = await db.query('SELECT 1 FROM product_reviews WHERE user_id = $1 AND product_id = $2', [user_id, product_id]);
		if (exists.rows.length > 0) return res.status(409).json({ error: 'You already reviewed this product' });
		const result = await db.query(
			`INSERT INTO product_reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *`,
			[user_id, product_id, rating, comment]
		);
		res.json({ review: result.rows[0] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get reviews for a product
router.get('/:product_id', async (req, res) => {
	const { product_id } = req.params;
	try {
		const result = await db.query(
			`SELECT r.*, (u.first_name || ' ' || COALESCE(u.last_name, '')) as username
			 FROM product_reviews r
			 JOIN users u ON r.user_id = u.user_id
			 WHERE r.product_id = $1
			 ORDER BY r.created_at DESC`,
			[product_id]
		);
		res.json({ reviews: result.rows });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update a review (only by owner)
router.put('/:review_id', requireAuth, async (req, res) => {
	const { review_id } = req.params;
	const { rating, comment } = req.body;
	const user_id = getUserIdFromReq(req);
	if (!user_id) return res.status(401).json({ error: "Unauthorized" });
	if (typeof rating !== 'number' || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
	try {
		// Only allow update by owner
		const review = await db.query('SELECT * FROM product_reviews WHERE review_id = $1', [review_id]);
		if (!review.rows.length || review.rows[0].user_id !== user_id) return res.status(403).json({ error: 'Forbidden' });
		const result = await db.query(
			'UPDATE product_reviews SET rating = $1, comment = $2, updated_at = NOW() WHERE review_id = $3 RETURNING *',
			[rating, comment, review_id]
		);
		res.json({ review: result.rows[0] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
