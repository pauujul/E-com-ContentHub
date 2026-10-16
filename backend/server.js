const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root & Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'ContentHub Backend API berjalan aktif!',
    version: '1.0.0',
    tim: 'Amigos Team',
    endpoints: [
      'GET /api/health',
      'GET /api/products',
      'GET /api/orders',
      'POST /api/orders'
    ]
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await db.query('SELECT NOW() AS current_time');
    res.json({
      status: 'healthy',
      database: 'connected',
      db_time: dbTest.rows[0].current_time
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ==========================================
// 1. ENDPOINT: KATALOG PAKET PRODUK (GET /api/products)
// ==========================================
app.get('/api/products', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, sku, name, description, price, billing_cycle, features, badge, is_hero FROM subscription_plans ORDER BY price ASC'
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil katalog produk dari database',
      error: error.message
    });
  }
});

// ==========================================
// 2. ENDPOINT: SIMULASI PEMBUATAN ORDER (POST /api/orders)
// ==========================================
app.post('/api/orders', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      user_id = 2, // Default: Muhammad Hasran (Customer Persona UMKM)
      plan_id,
      payment_method = 'Virtual Account',
      payment_channel = 'BCA Virtual Account'
    } = req.body;

    if (!plan_id) {
      return res.status(400).json({
        success: false,
        message: 'Parameter plan_id wajib disertakan.'
      });
    }

    // 1. Ambil data paket langganan
    const planResult = await client.query(
      'SELECT id, name, price, billing_cycle FROM subscription_plans WHERE id = $1',
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paket langganan tidak ditemukan.'
      });
    }

    const plan = planResult.rows[0];
    const totalAmount = parseFloat(plan.price);
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Paket Free langsung 'Paid', sedangkan paket berbayar default 'Pending'
    const initialStatus = totalAmount === 0 ? 'Paid' : 'Pending';
    const paidAt = totalAmount === 0 ? new Date() : null;

    // Memulai Transaksi SQL ACID
    await client.query('BEGIN');

    // 2. Insert ke tabel orders
    const insertOrderQuery = `
      INSERT INTO orders (order_number, user_id, plan_id, total_amount, status, payment_method, payment_channel, paid_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, order_number, user_id, plan_id, total_amount, status, payment_method, payment_channel, created_at;
    `;
    const orderResult = await client.query(insertOrderQuery, [
      orderNumber,
      user_id,
      plan.id,
      totalAmount,
      initialStatus,
      payment_method,
      payment_channel,
      paidAt
    ]);

    const createdOrder = orderResult.rows[0];

    // 3. Insert ke tabel order_items
    const insertItemQuery = `
      INSERT INTO order_items (order_id, plan_id, item_name, price, quantity, subtotal)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, item_name, price, quantity, subtotal;
    `;
    const itemResult = await client.query(insertItemQuery, [
      createdOrder.id,
      plan.id,
      `${plan.name} (${plan.billing_cycle})`,
      totalAmount,
      1,
      totalAmount
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: totalAmount === 0
        ? 'Aktivasi paket Free ContentHub berhasil!'
        : 'Pesanan langganan berhasil dibuat. Silakan selesaikan pembayaran.',
      data: {
        order: createdOrder,
        items: itemResult.rows,
        payment_instructions: totalAmount === 0 ? null : {
          method: payment_method,
          channel: payment_channel,
          virtual_account_number: '8801' + Math.floor(1000000000 + Math.random() * 9000000000),
          expired_in: '24 Jam'
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses transaksi pembuatan order',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// ==========================================
// 3. ENDPOINT TAMBAHAN: RIWAYAT ORDER (GET /api/orders)
// ==========================================
app.get('/api/orders', async (req, res) => {
  try {
    const query = `
      SELECT 
        o.id, 
        o.order_number, 
        u.name AS customer_name, 
        u.email AS customer_email,
        sp.name AS plan_name, 
        sp.billing_cycle,
        o.total_amount, 
        o.status, 
        o.payment_method, 
        o.payment_channel,
        o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN subscription_plans sp ON o.plan_id = sp.id
      ORDER BY o.created_at DESC;
    `;
    const result = await db.query(query);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat pesanan',
      error: error.message
    });
  }
});

// Menjalankan Server Node.js Express
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ContentHub Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
