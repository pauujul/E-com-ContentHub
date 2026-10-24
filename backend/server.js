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
    version: '1.1.0',
    tim: 'Amigos Team',
    endpoints: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/users',
      'GET /api/auth/me',
      'GET /api/products',
      'GET /api/orders',
      'GET /api/orders/:id',
      'POST /api/orders',
      'PATCH /api/orders/:id/status',
      'GET /api/admin/stats',
    ],
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await db.query('SELECT NOW() AS current_time');
    res.json({
      status: 'healthy',
      database: 'connected',
      db_time: dbTest.rows[0].current_time,
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// ==========================================
// 1. ENDPOINT AUTENTIKASI: LOGIN & REGISTER
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
    }

    const query = `
      SELECT id, name, email, password, role, phone 
      FROM users 
      WHERE LOWER(email) = LOWER($1)
    `;
    const result = await db.query(query, [email.trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Akun dengan email tersebut tidak ditemukan.',
      });
    }

    const user = result.rows[0];

    const isPasswordValid = user.password === password || user.password === `${password}_hash` || user.password.replace('_hash', '') === password;

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password yang Anda masukkan salah.',
      });
    }

    await db.query('UPDATE users SET updated_at = NOW() WHERE id = $1', [user.id]);

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      issuedAt: Date.now(),
    };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    res.json({
      success: true,
      message: `Login berhasil! Selamat datang, ${user.name}.`,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat proses autentikasi.',
      error: error.message,
    });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone = '', role = 'customer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap, email, dan kata sandi wajib diisi.',
      });
    }

    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau login.',
      });
    }

    const validRoles = ['customer', 'admin', 'editor'];
    const assignedRole = validRoles.includes(role) ? role : 'customer';

    const insertResult = await db.query(
      `INSERT INTO users (name, email, password, role, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, name, email, role, phone, created_at`,
      [name.trim(), email.trim().toLowerCase(), password, assignedRole, phone.trim()],
    );

    const newUser = insertResult.rows[0];

    const tokenPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      issuedAt: Date.now(),
    };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    res.status(201).json({
      success: true,
      message: `Pendaftaran berhasil! Selamat datang di ContentHub, ${newUser.name}.`,
      data: {
        user: newUser,
        token,
      },
    });
  } catch (error) {
    console.error('Error saat registrasi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses pendaftaran pengguna.',
      error: error.message,
    });
  }
});

// GET /api/auth/users
app.get('/api/auth/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, phone, created_at FROM users ORDER BY id ASC');
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar pengguna',
      error: error.message,
    });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = req.query.id;

    let targetId = userId;
    if (!targetId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = JSON.parse(Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii'));
        targetId = decoded.id;
      } catch (e) {
        // fallback
      }
    }

    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'Parameter id atau token authorization diperlukan.',
      });
    }

    const result = await db.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1', [targetId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error checking user session:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memeriksa data pengguna',
      error: error.message,
    });
  }
});

// ==========================================
// 2. ENDPOINT: KATALOG PAKET PRODUK (GET /api/products)
// ==========================================
app.get('/api/products', async (req, res) => {
  try {
    const result = await db.query('SELECT id, sku, name, description, price, billing_cycle, features, badge, is_hero FROM subscription_plans ORDER BY price ASC');
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil katalog produk dari database',
      error: error.message,
    });
  }
});

// ==========================================
// 3. ENDPOINT: PEMBUATAN ORDER (POST /api/orders)
// ==========================================
app.post('/api/orders', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { user_id = 2, plan_id, payment_method = 'Virtual Account', payment_channel = 'BCA Virtual Account' } = req.body;

    if (!plan_id) {
      return res.status(400).json({
        success: false,
        message: 'Parameter plan_id wajib disertakan.',
      });
    }

    const planResult = await client.query('SELECT id, name, price, billing_cycle FROM subscription_plans WHERE id = $1', [plan_id]);

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paket langganan tidak ditemukan.',
      });
    }

    const plan = planResult.rows[0];
    const totalAmount = parseFloat(plan.price);
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialStatus = totalAmount === 0 ? 'Paid' : 'Pending';
    const paidAt = totalAmount === 0 ? new Date() : null;

    await client.query('BEGIN');

    const insertOrderQuery = `
      INSERT INTO orders (order_number, user_id, plan_id, total_amount, status, payment_method, payment_channel, paid_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, order_number, user_id, plan_id, total_amount, status, payment_method, payment_channel, created_at;
    `;
    const orderResult = await client.query(insertOrderQuery, [orderNumber, user_id, plan.id, totalAmount, initialStatus, payment_method, payment_channel, paidAt]);

    const createdOrder = orderResult.rows[0];

    const insertItemQuery = `
      INSERT INTO order_items (order_id, plan_id, item_name, price, quantity, subtotal)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, item_name, price, quantity, subtotal;
    `;
    const itemResult = await client.query(insertItemQuery, [createdOrder.id, plan.id, `${plan.name} (${plan.billing_cycle})`, totalAmount, 1, totalAmount]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: totalAmount === 0 ? 'Aktivasi paket Free ContentHub berhasil!' : 'Pesanan langganan berhasil dibuat. Silakan selesaikan pembayaran.',
      data: {
        order: createdOrder,
        items: itemResult.rows,
        payment_instructions:
          totalAmount === 0
            ? null
            : {
                method: payment_method,
                channel: payment_channel,
                virtual_account_number: '8801' + Math.floor(1000000000 + Math.random() * 9000000000),
                expired_in: '24 Jam',
              },
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses transaksi pembuatan order',
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// ==========================================
// 4. ENDPOINT: RIWAYAT ORDER (GET /api/orders)
// ==========================================
app.get('/api/orders', async (req, res) => {
  try {
    const { user_id } = req.query;

    let query = `
      SELECT 
        o.id, 
        o.order_number, 
        o.user_id,
        u.name AS customer_name, 
        u.email AS customer_email,
        sp.name AS plan_name, 
        sp.billing_cycle,
        o.total_amount, 
        o.status, 
        o.payment_method, 
        o.payment_channel,
        o.paid_at,
        o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN subscription_plans sp ON o.plan_id = sp.id
    `;

    const params = [];
    if (user_id) {
      query += ` WHERE o.user_id = $1`;
      params.push(user_id);
    }

    query += ` ORDER BY o.created_at DESC;`;

    const result = await db.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat pesanan',
      error: error.message,
    });
  }
});

// GET /api/orders/:id
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);

    const query = `
      SELECT 
        o.id, 
        o.order_number, 
        o.user_id,
        u.name AS customer_name, 
        u.email AS customer_email,
        u.phone AS customer_phone,
        sp.id AS plan_id,
        sp.name AS plan_name, 
        sp.sku AS plan_sku,
        sp.price AS plan_price,
        sp.billing_cycle,
        sp.features,
        o.total_amount, 
        o.status, 
        o.payment_method, 
        o.payment_channel,
        o.paid_at,
        o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN subscription_plans sp ON o.plan_id = sp.id
      WHERE ${isNumeric ? 'o.id = $1 OR o.order_number = $1' : 'o.order_number = $1'}
    `;

    const orderRes = await db.query(query, [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan',
      });
    }

    const order = orderRes.rows[0];

    const itemsRes = await db.query('SELECT id, item_name, price, quantity, subtotal FROM order_items WHERE order_id = $1', [order.id]);

    res.json({
      success: true,
      data: {
        ...order,
        items: itemsRes.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail pesanan',
      error: error.message,
    });
  }
});

// ==========================================
// 5. ENDPOINT ADMIN: UPDATE STATUS ORDER
// ==========================================
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Paid', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Harus salah satu dari: ${validStatuses.join(', ')}`,
      });
    }

    const paidAt = status === 'Paid' ? new Date() : null;

    const query = `
      UPDATE orders 
      SET status = $1, paid_at = $2
      WHERE id = $3
      RETURNING id, order_number, user_id, status, paid_at;
    `;

    const result = await db.query(query, [status, paidAt, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan',
      });
    }

    res.json({
      success: true,
      message: `Status pesanan #${result.rows[0].order_number} berhasil diubah menjadi ${status}.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah status pesanan',
      error: error.message,
    });
  }
});

// ==========================================
// 6. ENDPOINT ADMIN: STATISTIK DASHBOARD
// ==========================================
app.get('/api/admin/stats', async (req, res) => {
  try {
    const revenueQuery = `SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE status = 'Paid';`;
    const ordersCountQuery = `SELECT COUNT(*) AS total_orders, COUNT(CASE WHEN status = 'Paid' THEN 1 END) AS paid_orders, COUNT(CASE WHEN status = 'Pending' THEN 1 END) AS pending_orders FROM orders;`;
    const usersCountQuery = `SELECT COUNT(*) AS total_users, COUNT(CASE WHEN role = 'customer' THEN 1 END) AS total_customers FROM users;`;

    const [revenueRes, ordersRes, usersRes] = await Promise.all([db.query(revenueQuery), db.query(ordersCountQuery), db.query(usersCountQuery)]);

    res.json({
      success: true,
      data: {
        total_revenue: parseFloat(revenueRes.rows[0].total_revenue),
        total_orders: parseInt(ordersRes.rows[0].total_orders, 10),
        paid_orders: parseInt(ordersRes.rows[0].paid_orders, 10),
        pending_orders: parseInt(ordersRes.rows[0].pending_orders, 10),
        total_users: parseInt(usersRes.rows[0].total_users, 10),
        total_customers: parseInt(usersRes.rows[0].total_customers, 10),
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data statistik admin',
      error: error.message,
    });
  }
});

// Jalankan Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ContentHub Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
