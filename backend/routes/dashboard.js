import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Get stats
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM categories) as total_categories
    `);

    // Get monthly performance 
    const performance = await pool.query(`
      SELECT 
        TO_CHAR(date_trunc('month', created_at), 'Mon') as month,
        COUNT(*) as orders
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '1 year'
      GROUP BY date_trunc('month', created_at), TO_CHAR(date_trunc('month', created_at), 'Mon')
      ORDER BY date_trunc('month', created_at)
    `);

    // Get category distribution - updated to match your schema
    const categories = await pool.query(`
      SELECT 
        c.name,
        COUNT(p.*) as value
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.category_id
      GROUP BY c.category_id, c.name
      ORDER BY value DESC
      LIMIT 7
    `);

    res.json({
      stats: stats.rows[0],
      performance: performance.rows,
      categories: categories.rows
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;