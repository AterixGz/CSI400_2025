import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Basic stats without revenue calculations for now
   const stats = await pool.query(`
  SELECT 
    (SELECT COUNT(*) FROM users WHERE role_id = 1 ) as total_users,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM categories) as total_categories,
    (SELECT COUNT(*) FROM product_sizes WHERE stock <= 0) as out_of_stock_products
`);



    // Monthly activity (products added per month)
   const monthlyActivity = await pool.query(`
  SELECT 
    TO_CHAR(date_trunc('month', created_at), 'Mon') AS month,
    COALESCE(SUM(total_amount), 0) AS total_sales
  FROM orders
  WHERE created_at >= NOW() - INTERVAL '1 year'
  GROUP BY date_trunc('month', created_at), TO_CHAR(date_trunc('month', created_at), 'Mon')
  ORDER BY date_trunc('month', created_at)
`);

   // Category sales distribution (total sales per category in last 1 year)
const categories = await pool.query(`
  SELECT 
    c.name,
    COALESCE(SUM(oi.quantity * oi.price), 0) AS total_sales
  FROM categories c
  LEFT JOIN products p ON p.category_id = c.category_id
  LEFT JOIN order_items oi ON oi.product_id = p.product_id
  LEFT JOIN orders o ON o.order_id = oi.order_id AND o.status = 'paid'
  WHERE o.created_at >= NOW() - INTERVAL '1 year' OR o.order_id IS NULL
  GROUP BY c.category_id, c.name
  ORDER BY total_sales DESC
  LIMIT 7
`);

// ดึงจำนวนสินค้าที่หมดสต็อก (stock = 0)



    // Low stock products (stock < 2)
const lowStockProducts = await pool.query(`
  SELECT 
    p.name AS product_name,
    ps.size_name,
    ps.stock
  FROM product_sizes ps
  JOIN products p ON p.product_id = ps.product_id
  WHERE ps.stock < 3
  ORDER BY ps.stock ASC
  LIMIT 10
`);


    // Most popular products (by stock - assuming lower stock means more sales)
    const topProducts = await pool.query(`
  SELECT 
    p.name,
    SUM(oi.quantity) AS total_sold
  FROM order_items oi
  JOIN products p ON p.product_id = oi.product_id
  GROUP BY p.product_id, p.name
  ORDER BY total_sold DESC
  LIMIT 5
`);

 res.json({
  stats: {
    ...stats.rows[0],
    out_of_stock_sizes: Number(stats.rows[0].out_of_stock_products)
  },
  monthlyActivity: monthlyActivity.rows,
  categories: categories.rows,
  topProducts: topProducts.rows,
  lowStockProducts: lowStockProducts.rows,
});


  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;