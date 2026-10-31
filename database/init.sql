<<<<<<< HEAD
-- ContentHub PostgreSQL Database Initialization Script
-- Proyek: E-Commerce SaaS ContentHub (Amigos Team)
-- Database: ecommerce_db

-- 1. Bersihkan tabel jika sudah ada sebelumnya (idempotent)
=======
-- ============================================================
-- ContentHub PostgreSQL Database Initialization Script (Lengkap)
-- Proyek: E-Commerce SaaS ContentHub (Amigos Team)
-- Database: ecommerce_db
-- ============================================================

-- 1. Bersihkan tabel lama jika ada
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS content_posts CASCADE;
DROP TABLE IF EXISTS content_templates CASCADE;
DROP TABLE IF EXISTS template_categories CASCADE;
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Tabel Users (Data Pengguna & Autentikasi)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'editor')),
    phone VARCHAR(30),
<<<<<<< HEAD
=======
--     nama_bisnis VARCHAR(150),
-- >>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

<<<<<<< HEAD
-- 3. Tabel Subscription Plans / Products (Katalog Paket SaaS)
=======
-- 3. Tabel Subscription Plans (Katalog Paket SaaS ContentHub)
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    billing_cycle VARCHAR(50) NOT NULL CHECK (billing_cycle IN ('Free', 'Bulanan', 'Tahunan')),
    features JSONB NOT NULL DEFAULT '[]',
    badge VARCHAR(50) DEFAULT NULL,
    is_hero BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Orders / Subscriptions (Transaksi Pembelian Langganan)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(60) UNIQUE NOT NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Cancelled')),
    payment_method VARCHAR(50) DEFAULT 'Virtual Account',
    payment_channel VARCHAR(50) DEFAULT 'BCA Virtual Account',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

<<<<<<< HEAD
-- 5. Tabel Order Items (Detail Item Transaksi Pendukung)
=======
-- 5. Tabel Order Items (Detail Item Transaksi)
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    item_name VARCHAR(150) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

<<<<<<< HEAD
-- ============================================================
-- SEED DATA AWAL (Initial Sample Data untuk ContentHub)
-- ============================================================

-- Seed Data Users (Berdasarkan Persona LKM: Jerry Hernis & Muhammad Hasran)
INSERT INTO users (name, email, password, role, phone) VALUES
('Jerry Hernis', 'jerry.hernis@amigos.id', 'admin123_hash', 'admin', '081234567890'),
('Muhammad Hasran', 'hasran.donat@gmail.com', 'hasran123_hash', 'customer', '085299887766'),
('Fauzul Rozaq', 'fauzul@amigos.id', 'fauzul123_hash', 'admin', '081298765432');

-- Seed Data Subscription Plans (Free, Starter Hero Rp98rb, Pro Rp898rb)
=======
-- 6. Tabel Content Posts (Fitur Inti: Content Calendar & Drag-and-Drop)
CREATE TABLE content_posts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    judul VARCHAR(200) NOT NULL,
    caption TEXT,
    platform VARCHAR(50) NOT NULL DEFAULT 'Instagram' CHECK (platform IN ('Instagram', 'TikTok', 'Threads', 'Facebook')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'Published')),
    order_position INT NOT NULL DEFAULT 0,
    media_url VARCHAR(255),
    reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Template Categories & Content Templates (Fitur Template Library)
CREATE TABLE template_categories (
    id SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL,
    deskripsi TEXT
);

CREATE TABLE content_templates (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES template_categories(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    copywriting_idea TEXT NOT NULL,
    thumbnail_url VARCHAR(255),
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabel Support Tickets (Fitur Customer Support & Konsultasi Konten)
CREATE TABLE support_tickets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subjek VARCHAR(200) NOT NULL,
    pesan TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    prioritas VARCHAR(30) NOT NULL DEFAULT 'Medium' CHECK (prioritas IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA AWAL (Sample Data)
-- ============================================================

-- Data Pengguna Tim & UMKM
INSERT INTO users (name, email, password, role, phone, nama_bisnis) VALUES
('Jerry Hernis', 'jerry.hernis@amigos.id', 'admin123_hash', 'admin', '081234567890', 'ContentHub HQ'),
('Muhammad Hasran', 'hasran.donat@gmail.com', 'hasran123_hash', 'customer', '085299887766', 'Donat Kampoeng Makassar'),
('Fauzul Rozaq', 'fauzul@amigos.id', 'fauzul123_hash', 'admin', '081298765432', 'ContentHub HQ');

-- 3 Paket ContentHub (Free, Starter Rp98rb, Pro Rp898rb)
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
INSERT INTO subscription_plans (sku, name, description, price, billing_cycle, features, badge, is_hero) VALUES
(
    'CH-FREE',
    'ContentHub Free',
    'Paket awal tanpa biaya untuk UMKM yang baru mulai merencanakan dan menjadwalkan konten media sosial.',
    0.00,
    'Free',
    '["1 Kalender Konten Interaktif", "3 Template Konten Gratis", "1 Akun Media Sosial", "Akses Komunitas UMKM"]'::jsonb,
    'Mulai Gratis',
    FALSE
),
(
    'CH-START-M',
    'ContentHub Starter',
    'Solusi paling praktis bagi pelaku UMKM yang butuh kalender interaktif drag-and-drop dan puluhan template siap pakai.',
    98000.00,
    'Bulanan',
    '["Semua Fitur Free", "Kalender Drag & Drop Interaktif", "50+ Library Template Konten UMKM", "Reminder & Pengingat Jadwal Posting", "Hingga 5 Akun Media Sosial", "Customer Support Prioritas"]'::jsonb,
    'Paling Sesuai untuk UMKM',
    TRUE
),
(
    'CH-PRO-Y',
    'ContentHub Pro',
    'Paket komprehensif tahunan untuk UMKM berkembang dengan frekuensi konten tinggi dan kebutuhan fitur terlengkap.',
    898000.00,
    'Tahunan',
    '["Semua Fitur Starter", "Akses 200+ Template Premium Lengkap", "Akun Media Sosial Tanpa Batas", "Analytics & Performa Jadwal Konten", "Persiapan Integrasi AI Content Generator", "Hemat 24% Dibandingkan Bulanan"]'::jsonb,
    'Paling Hemat',
    FALSE
);

<<<<<<< HEAD
-- Seed Contoh Order Awal
=======
-- Transaksi Contoh
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
INSERT INTO orders (order_number, user_id, plan_id, total_amount, status, payment_method, payment_channel, paid_at) VALUES
('ORD-20261016-0001', 2, 2, 98000.00, 'Paid', 'Virtual Account', 'BCA Virtual Account', NOW());

INSERT INTO order_items (order_id, plan_id, item_name, price, quantity, subtotal) VALUES
(1, 2, 'ContentHub Starter - 1 Bulan Langganan', 98000.00, 1, 98000.00);
<<<<<<< HEAD
=======

-- Data Kategori & Template Konten
INSERT INTO template_categories (nama_kategori, deskripsi) VALUES
('Kuliner & F&B', 'Ide promosi dan visual makanan & minuman UMKM'),
('Promo & Diskon', 'Template penawaran diskon tanggal kembar dan flash sale');

INSERT INTO content_templates (category_id, title, copywriting_idea, is_premium) VALUES
(1, 'Behind The Scene Masak', 'Pernah penasaran gak gimana proses di balik lezatnya hidangan kami? Simak videonya sampai habis!', FALSE),
(1, 'Menu Rekomendasi Hari Ini', 'Bingung mau makan siang apa di Makassar? Nih mimin kasih 3 menu wajib coba hari ini!', FALSE),
(2, 'Flash Sale Gajian UMKM', 'Promo Spesial Gajian! Diskon hingga 30% khusus pembelian hari ini sampai jam 9 malam. Jangan sampai kehabisan!', TRUE);

-- Data Jadwal Konten Kalender UMKM (Hasran)
INSERT INTO content_posts (user_id, judul, caption, platform, scheduled_at, status, order_position) VALUES
(2, 'Reels Donat Coklat Lumer', 'Camilan sore paling pas bareng keluarga! Ready stock hari ini.', 'Instagram', NOW() + INTERVAL '1 day', 'Scheduled', 0),
(2, 'Promo Bundling 1 Lusin', 'Beli 1 lusin donat gratis 2 minuman kopi susu. Khusus hari Jumat!', 'TikTok', NOW() + INTERVAL '2 day', 'Draft', 1);
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
