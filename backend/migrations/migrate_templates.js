const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sampleTemplates = [
  {
    title: 'Promo Flash Sale UMKM',
    description: 'Desain promosi kilat dengan diskon menarik untuk feed Instagram dan postingan media sosial.',
    category: 'Promosi',
    format_ratio: '1:1',
    access_tier: 'free',
    thumbnail_url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&fit=crop',
    canva_url: 'https://www.canva.com/design/DAGTemplatePromoFlashSale/view?mode=preview',
    is_active: true
  },
  {
    title: 'Katalog Menu Kuliner Spesial',
    description: 'Story & Reels visual vertikal estetik untuk daftar menu baru, harga hemat, dan best seller kuliner.',
    category: 'Promosi',
    format_ratio: '9:16',
    access_tier: 'premium',
    thumbnail_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&fit=crop',
    canva_url: 'https://www.canva.com/design/DAGTemplateMenuKuliner/view?mode=preview',
    is_active: true
  },
  {
    title: 'Tips & Trik Mengelola Bisnis',
    description: 'Format feed informatif untuk berbagi tips praktis seputar keuangan, manajemen waktu, dan kepuasan pelanggan.',
    category: 'Edukasi',
    format_ratio: '1:1',
    access_tier: 'free',
    thumbnail_url: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&fit=crop',
    canva_url: 'https://www.canva.com/design/DAGTemplateTipsBisnis/view?mode=preview',
    is_active: true
  },
  {
    title: 'Tutorial Step-by-Step Produk',
    description: 'Desain cerita vertikal langkah mudah penggunaan produk agar calon pembeli semakin yakin checkout.',
    category: 'Edukasi',
    format_ratio: '9:16',
    access_tier: 'premium',
    thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&fit=crop',
    canva_url: 'https://www.canva.com/design/DAGTemplateTutorialProduk/view?mode=preview',
    is_active: true
  },
  {
    title: 'Kuis & Tebak Gambar Interaktif',
    description: 'Postingan permainan interaktif tebak kata/gambar untuk mendongkrak komentar dan share audiens.',
    category: 'Engagement',
    format_ratio: '1:1',
    access_tier: 'free',
    thumbnail_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&fit=crop',
    canva_url: 'https://www.canva.com/design/DAGTemplateKuisInteraktif/view?mode=preview',
    is_active: true
  },
  {
    title: 'Polling & Tanya Jawab Komunitas',
    description: 'Template Story vertikal untuk sesi Q&A mingguan, polling pilihan produk, dan feedback pelanggan.',
    category: 'Engagement',
    format_ratio: '9:16',
    access_tier: 'premium',
    thumbnail_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&fit=crop',
    canva_url: 'https://www.canva.com/design/DAGTemplatePollingStory/view?mode=preview',
    is_active: true
  },
  {
    title: 'Fashion Elegant Lookbook Beige',
    description: 'Format feed portrait elegan 4:5 untuk katalog koleksi pakaian, model OOTD, dan produk fashion.',
    category: 'Promosi',
    format_ratio: '4:5',
    access_tier: 'premium',
    thumbnail_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&fit=crop',
    canva_url: 'https://www.canva.com/design/DAGTemplateFashionLookbook/view?mode=preview',
    is_active: true
  },
  {
    title: 'Inspirasi Visual & Ide Konten Estetik',
    description: 'Template feed portrait 4:5 dengan tipografi bersih untuk berbagi inspirasi visual dan moodboard harian.',
    category: 'Engagement',
    format_ratio: '4:5',
    access_tier: 'free',
    thumbnail_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&fit=crop',
    canva_url: 'https://www.canva.com/design/DAGTemplateVisualInspirasi/view?mode=preview',
    is_active: true
  }
];

async function runMigration() {
  console.log('🔄 Memulai migrasi database Neon PostgreSQL untuk Modul Template...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Selaraskan tabel template_categories
    console.log('📌 Memeriksa dan memperbarui tabel template_categories...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS template_categories (
        id SERIAL PRIMARY KEY,
        nama_kategori VARCHAR(100),
        deskripsi TEXT
      );
    `);

    await client.query(`
      ALTER TABLE template_categories ADD COLUMN IF NOT EXISTS name VARCHAR(100);
      ALTER TABLE template_categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
      ALTER TABLE template_categories ADD COLUMN IF NOT EXISTS description TEXT;
    `);

    await client.query(`
      UPDATE template_categories SET name = nama_kategori WHERE name IS NULL AND nama_kategori IS NOT NULL;
      UPDATE template_categories SET description = deskripsi WHERE description IS NULL AND deskripsi IS NOT NULL;
    `);

    // 2. Buat tabel content_templates jika belum ada
    console.log('📌 Memastikan tabel content_templates ada...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_templates (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL DEFAULT 'Promosi',
        format_ratio VARCHAR(50) NOT NULL DEFAULT '1:1',
        access_tier VARCHAR(50) NOT NULL DEFAULT 'free',
        thumbnail_url TEXT NOT NULL,
        canva_url TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Tambahkan kolom yang dibutuhkan jika tabel sudah ada sebelumnya
    console.log('📌 Memperbarui kolom content_templates...');
    await client.query(`
      ALTER TABLE content_templates ADD COLUMN IF NOT EXISTS title VARCHAR(255);
      ALTER TABLE content_templates ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE content_templates ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Promosi';
      ALTER TABLE content_templates ADD COLUMN IF NOT EXISTS format_ratio VARCHAR(50) DEFAULT '1:1';
      ALTER TABLE content_templates ADD COLUMN IF NOT EXISTS access_tier VARCHAR(50) DEFAULT 'free';
      ALTER TABLE content_templates ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
      ALTER TABLE content_templates ADD COLUMN IF NOT EXISTS canva_url TEXT;
      ALTER TABLE content_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      ALTER TABLE content_templates ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE content_templates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Ubah tipe canva_link ke TEXT dan hapus batasan NOT NULL pada kolom lama
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_templates' AND column_name = 'category_id') THEN
          ALTER TABLE content_templates ALTER COLUMN category_id DROP NOT NULL;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_templates' AND column_name = 'copywriting_idea') THEN
          ALTER TABLE content_templates ALTER COLUMN copywriting_idea DROP NOT NULL;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_templates' AND column_name = 'canva_link') THEN
          ALTER TABLE content_templates ALTER COLUMN canva_link TYPE TEXT;
          ALTER TABLE content_templates ALTER COLUMN canva_link DROP NOT NULL;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_templates' AND column_name = 'is_premium') THEN
          ALTER TABLE content_templates ALTER COLUMN is_premium DROP NOT NULL;
        END IF;
      END $$;
    `);

    // Sinkronisasi data lama jika ada
    console.log('📌 Menyelaraskan data lama...');
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_templates' AND column_name = 'copywriting_idea') THEN
          UPDATE content_templates SET description = copywriting_idea WHERE description IS NULL;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_templates' AND column_name = 'canva_link') THEN
          UPDATE content_templates SET canva_url = canva_link WHERE canva_url IS NULL;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_templates' AND column_name = 'is_premium') THEN
          UPDATE content_templates SET access_tier = CASE WHEN is_premium = true THEN 'premium' ELSE 'free' END WHERE access_tier IS NULL;
        END IF;
      END $$;
    `);

    await client.query(`
      UPDATE content_templates SET category = 'Promosi' WHERE category IS NULL;
      UPDATE content_templates SET format_ratio = '1:1' WHERE format_ratio IS NULL;
      UPDATE content_templates SET is_active = TRUE WHERE is_active IS NULL;
      UPDATE content_templates SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;
    `);

    // 4. Seed sample data
    for (const t of sampleTemplates) {
      const exists = await client.query('SELECT id FROM content_templates WHERE title = $1 LIMIT 1;', [t.title]);
      const isPremiumBool = t.access_tier === 'premium';
      if (exists.rows.length === 0) {
        await client.query(`
          INSERT INTO content_templates (
            title, description, category, format_ratio, access_tier, thumbnail_url, canva_url, is_active, created_at, updated_at,
            copywriting_idea, canva_link, is_premium
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9, $10, $11);
        `, [t.title, t.description, t.category, t.format_ratio, t.access_tier, t.thumbnail_url, t.canva_url, t.is_active, t.description, t.canva_url, isPremiumBool]);
        console.log(` ✨ Berhasil memasukkan template: ${t.title}`);
      } else {
        await client.query(`
          UPDATE content_templates 
          SET description = $2, category = $3, format_ratio = $4, access_tier = $5, thumbnail_url = $6, canva_url = $7, is_active = $8, updated_at = NOW(),
              copywriting_idea = $9, canva_link = $10, is_premium = $11
          WHERE id = $1;
        `, [exists.rows[0].id, t.description, t.category, t.format_ratio, t.access_tier, t.thumbnail_url, t.canva_url, t.is_active, t.description, t.canva_url, isPremiumBool]);
        console.log(` 🔄 Berhasil memperbarui template: ${t.title}`);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Migrasi dan seeding tabel content_templates BERHASIL!');

    // Tampilkan kolom tabel saat ini
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'content_templates'
      ORDER BY ordinal_position;
    `);
    console.log('📋 Kolom Tabel content_templates Saat Ini:');
    cols.rows.forEach(c => {
      console.log(` - ${c.column_name} (${c.data_type}) [nullable: ${c.is_nullable}, default: ${c.column_default}]`);
    });

    const finalTemplates = await client.query('SELECT id, title, category, format_ratio, access_tier, is_active FROM content_templates ORDER BY id ASC;');
    console.log('📋 Daftar Template di Database:');
    console.table(finalTemplates.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Gagal menjalankan migrasi:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().then(() => process.exit(0)).catch(() => process.exit(1));
