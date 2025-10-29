import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, items } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (satang)
      currency: 'thb',
      metadata: {
        order_items: JSON.stringify(items)
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add after payment intent succeeds
async function createOrder(userId, paymentIntentId, items, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, total_amount)
       VALUES ($1, 'completed', $2)
       RETURNING order_id`,
      [userId, amount]
    );
    const orderId = orderResult.rows[0].order_id;

    // Add order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.qty, item.price]
      );

      // Update product stock (optional)
      await client.query(
        `UPDATE products 
         SET stock = stock - $1
         WHERE product_id = $2`,
        [item.qty, item.product_id]
      );
    }

    // Clear user's cart
    await client.query(
      `DELETE FROM cart WHERE user_id = $1`,
      [userId]
    );

    await client.query('COMMIT');
    return orderId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Modify the webhook handler
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      try {
        // Get metadata from payment intent
        const { user_id, items } = paymentIntent.metadata;
        if (user_id && items) {
          const cartItems = JSON.parse(items);
          const orderId = await createOrder(
            user_id,
            paymentIntent.id,
            cartItems,
            paymentIntent.amount / 100
          );
          console.log('Order created:', orderId);
        }
      } catch (error) {
        console.error('Error creating order:', error);
      }
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      console.log('Payment failed:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;