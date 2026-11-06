const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  console.log('--- ContentHub Neon Cloud Database Migrator ---');
  if (!connectionString) {
    console.log('⚠️  DATABASE_URL tidak ditemukan di .env. Menggunakan konfigurasi default.');
  } else {
    console.log('📡 Menghubungkan ke Neon PostgreSQL Cloud...');
  }

  const pool = connectionString
    ? new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      })
    : new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        user: process.env.DB_USER || 'admin',
        password: process.env.DB_PASSWORD || 'password123',
        database: process.env.DB_NAME || 'ecommerce_db',
        connectionTimeoutMillis: 5000,
      });

  try {
    const client = await pool.connect();
    console.log('✅ Berhasil terhubung ke database PostgreSQL/Neon.');

    const sqlPath = path.join(__dirname, '../database/init.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`File init.sql tidak ditemukan pada lokasi: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('⏳ Menjalankan inisialisasi skema tabel & seed data awal...');

    await client.query(sql);

    console.log('🎉 Migrasi skema database berhasil dieksekusi secara lengkap!');
    console.log('📊 Tabel yang diinisialisasi:');
    console.log('   - users (Role Admin & Customer, profile lengkap)');
    console.log('   - subscription_plans (Free, Starter, Pro, Enterprise)');
    console.log('   - orders (Relasi user_id ON DELETE CASCADE, nama/email eksplisit)');
    console.log('   - order_items');
    console.log('   - content_posts (Calendar & Drag & Drop Kanban stage)');
    console.log('   - template_categories & content_templates');
    console.log('   - terms_conditions (Syarat & Ketentuan)');
    console.log('   - privacy_policies (Kebijakan & Privasi)');
    console.log('   - partnerships (Kerja Sama & Integrasi Canva)');
    console.log('   - articles (Blog & Edukasi)');
    console.log('   - about_content (Profil Perusahaan & Tim)');
    console.log('   - web_settings (General, Email SMTP, Payment Gateway)');
    console.log('   - support_tickets');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Gagal menjalankan migrasi database:', err.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
