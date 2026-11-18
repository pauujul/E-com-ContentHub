const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function migrateHeroSlides() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL tidak ditemukan di .env!');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log('📡 Terhubung ke Neon PostgreSQL Cloud...');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS hero_slides (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        image_url TEXT NOT NULL,
        cta_text VARCHAR(100),
        cta_link VARCHAR(255),
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('⏳ Membuat tabel hero_slides jika belum ada...');
    await client.query(createTableQuery);
    console.log('✅ Tabel hero_slides siap.');

    // Cek apakah sudah ada data di hero_slides
    const countRes = await client.query('SELECT COUNT(*)::int AS count FROM hero_slides');
    if (countRes.rows[0].count === 0) {
      console.log('⏳ Mengisi seed data awal hero_slides...');
      const seedQuery = `
        INSERT INTO hero_slides (title, subtitle, image_url, cta_text, cta_link, order_index, is_active) VALUES
        (
          'Buat Konten Konsisten Tanpa Stres',
          'Ubah cara Anda mengelola media sosial. Dari ide, perancangan kalender interaktif, hingga template siap pakai Canva untuk mengelola semuanya dalam satu platform terpadu.',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
          'Pilih Paket Langganan',
          '#pricing',
          1,
          TRUE
        ),
        (
          'Rancang Strategi Visual Bersama Canva',
          'Integrasi langsung ke ekosistem Canva Pro dengan 200+ template terkurasi khusus persona UMKM Indonesia. Desain cepat, rapi, dan langsung tersinkron ke kalender.',
          'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
          'Jelajahi Template',
          '/templates',
          2,
          TRUE
        ),
        (
          'Otomasi Jadwal & Notifikasi Jam Emas',
          'Maksimalkan jangkauan audiens dengan penjadwalan tepat waktu. Notifikasi email otomatis mengingatkan jadwal posting Instagram & TikTok Anda.',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
          'Coba Kalender Demo',
          '/calendar',
          3,
          TRUE
        );
      `;
      await client.query(seedQuery);
      console.log('✅ Seed data hero_slides berhasil dimasukkan.');
    } else {
      console.log(`ℹ️ Tabel hero_slides sudah memiliki ${countRes.rows[0].count} slide, lewati seeding.`);
    }

    const checkRes = await client.query('SELECT * FROM hero_slides ORDER BY order_index ASC');
    console.log('📋 Data hero_slides saat ini:', checkRes.rows);

    client.release();
    await pool.end();
    console.log('🎉 Migrasi hero_slides selesai dengan sukses!');
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat migrasi:', err);
    await pool.end();
    process.exit(1);
  }
}

migrateHeroSlides();
