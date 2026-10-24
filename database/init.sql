-- ContentHub PostgreSQL Database Initialization Script
-- Proyek: E-Commerce SaaS ContentHub (Amigos Team)
-- Database: ecommerce_db

-- 1. Bersihkan tabel jika sudah ada sebelumnya (idempotent)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Subscription Plans / Products (Katalog Paket SaaS)
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

-- 5. Tabel Order Items (Detail Item Transaksi Pendukung)
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

-- ============================================================
-- SEED DATA AWAL (Initial Sample Data untuk ContentHub)
-- ============================================================

-- Seed Data Users (Berdasarkan Persona LKM: Jerry Hernis & Muhammad Hasran)
INSERT INTO users (name, email, password, role, phone) VALUES
('Jerry Hernis', 'jerry.hernis@amigos.id', 'admin123_hash', 'admin', '081234567890'),
('Muhammad Hasran', 'hasran.donat@gmail.com', 'hasran123_hash', 'customer', '085299887766'),
('Fauzul Rozaq', 'fauzul@amigos.id', 'fauzul123_hash', 'admin', '081298765432');

-- Seed Data Subscription Plans (Free, Starter Hero Rp98rb, Pro Rp898rb)
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

-- Seed Contoh Order Awal
INSERT INTO orders (order_number, user_id, plan_id, total_amount, status, payment_method, payment_channel, paid_at) VALUES
('ORD-20261016-0001', 2, 2, 98000.00, 'Paid', 'Virtual Account', 'BCA Virtual Account', NOW());

INSERT INTO order_items (order_id, plan_id, item_name, price, quantity, subtotal) VALUES
(1, 2, 'ContentHub Starter - 1 Bulan Langganan', 98000.00, 1, 98000.00);
