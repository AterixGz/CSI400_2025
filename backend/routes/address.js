import express from 'express';
import db from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  // console.log('Received token:', token);
  
  try {
    // Verify token and get user_id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Accept common token claim names: id, user_id, userId
    const userId = decoded.id || decoded.user_id || decoded.userId;
    if (!userId) {
      console.log('Decoded token missing user id claim:', decoded);
      return res.status(401).json({ error: 'Invalid token format: no user id' });
    }
    // console.log('Decoded token:', decoded);
    req.userId = userId;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Invalid token', details: err.message });
  }
};

// Get all addresses for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching addresses:', err);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Add a new address
router.post('/', verifyToken, async (req, res) => {
  // Read fields and provide safe defaults for optional ones
  const full_name = req.body.full_name;
  const phone_number = req.body.phone_number;
  const address_line1 = req.body.address_line1;
  const address_line2 = req.body.address_line2 || '';
  const subdistrict = req.body.subdistrict || '';
  const district = req.body.district;
  const province = req.body.province;
  const postal_code = req.body.postal_code;
  const is_default = req.body.is_default || false;

  // Validate required fields
  const missing = [];
  if (!full_name) missing.push('full_name');
  if (!phone_number) missing.push('phone_number');
  if (!address_line1) missing.push('address_line1');
  if (!subdistrict) missing.push('subdistrict');
  if (!district) missing.push('district');
  if (!province) missing.push('province');
  if (!postal_code) missing.push('postal_code');
  if (missing.length) {
    return res.status(400).json({ error: 'Missing required fields', missing });
  }

  try {
    // Start transaction
    await db.query('BEGIN');

    // If this is the default address, unset any existing default
    if (is_default) {
      await db.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [req.userId]
      );
    }

    // Insert new address
    const result = await db.query(
      `INSERT INTO addresses (
        user_id, full_name, phone_number, address_line1, address_line2,
        subdistrict, district, province, postal_code, is_default,
        country
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.userId, full_name, phone_number, address_line1, address_line2,
        subdistrict, district, province, postal_code, is_default,
        'Thailand' // default country
      ]
    );

    await db.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error adding address:', err);
    res.status(500).json({ 
      error: 'Failed to add address',
      details: err.message,
      code: err.code 
    });
  }
});

// Set an address as default
router.post('/:id/set-default', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Start transaction
    await db.query('BEGIN');

    // Verify address belongs to user
    const existing = await db.query(
      'SELECT * FROM addresses WHERE address_id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Address not found' });
    }

    // Unset any existing default
    await db.query(
      'UPDATE addresses SET is_default = false WHERE user_id = $1',
      [req.userId]
    );

    // Set new default
    const result = await db.query(
      'UPDATE addresses SET is_default = true WHERE address_id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    await db.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error setting default address:', err);
    res.status(500).json({ error: 'Failed to set default address' });
  }
});

// Delete an address
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Verify address belongs to user and delete it
    const result = await db.query(
      'DELETE FROM addresses WHERE address_id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    console.error('Error deleting address:', err);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

export default router;
