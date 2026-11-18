const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('🔄 Memulai migrasi database Neon PostgreSQL untuk Fase 2...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Tambah kolom bank_provider jika belum ada
    console.log('📌 Menambahkan kolom bank_provider...');
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS bank_provider VARCHAR(50);
    `);

    // 2. Tambah kolom payment_proof_url jika belum ada
    console.log('📌 Menambahkan kolom payment_proof_url...');
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
    `);

    // 3. Tambah kolom tracking_status jika belum ada
    console.log('📌 Menambahkan kolom tracking_status...');
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS tracking_status VARCHAR(50) DEFAULT 'menunggu_pembayaran';
    `);

    // 4. Sinkronisasi data lama agar konsisten
    console.log('📌 Sinkronisasi data orders lama...');
    await client.query(`
      UPDATE orders 
      SET tracking_status = 'lunas' 
      WHERE (status = 'Paid' OR paid_at IS NOT NULL) AND (tracking_status IS NULL OR tracking_status = 'menunggu_pembayaran');
    `);

    await client.query(`
      UPDATE orders 
      SET tracking_status = 'ditolak' 
      WHERE status = 'Cancelled' AND (tracking_status IS NULL OR tracking_status = 'menunggu_pembayaran');
    `);

    await client.query('COMMIT');
    console.log('✅ Migrasi Fase 2 Neon PostgreSQL BERHASIL!');

    // Cek kolom tabel orders sekarang
    const colRes = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      ORDER BY ordinal_position;
    `);
    console.log('📋 Kolom Tabel orders Sekarang:');
    colRes.rows.forEach(r => {
      console.log(` - ${r.column_name} (${r.data_type}) [Default: ${r.column_default}]`);
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Gagal menjalankan migrasi:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
