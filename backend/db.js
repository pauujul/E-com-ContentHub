const { Pool } = require('pg');
require('dotenv').config();

// Konfigurasi koneksi PostgreSQL dari environment variable Docker/Lokal
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-db',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'ecommerce_db',
  max: 20, // Maksimal 20 client koneksi
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Event listener status koneksi
pool.on('connect', () => {
  console.log('✅ Terhubung sukses ke Database PostgreSQL (ecommerce_db)');
});

pool.on('error', (err) => {
  console.error('❌ Terjadi kendala tidak terduga pada client database:', err.message);
});

// Helper fungsi query dengan logging terpusat
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
