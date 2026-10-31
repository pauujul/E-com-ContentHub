const { Pool } = require('pg');
require('dotenv').config();

// Gunakan Neon Cloud (DATABASE_URL) jika ada, jika tidak fallback ke lokal Docker
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  : new Pool({
      host: process.env.DB_HOST || 'postgres-db',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'password123',
      database: process.env.DB_NAME || 'ecommerce_db',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

// Event listener status koneksi
pool.on('connect', () => {
  if (process.env.DATABASE_URL) {
    console.log('✅ Terhubung sukses ke Neon Cloud PostgreSQL');
  } else {
    console.log('✅ Terhubung sukses ke Local PostgreSQL (Docker)');
  }
});

pool.on('error', (err) => {
  console.error('❌ Terjadi kendala tidak terduga pada client database:', err.message);
});

// Helper fungsi query dengan logging terpusat
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
