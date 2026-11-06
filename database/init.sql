-- ============================================================
-- ContentHub PostgreSQL Database Initialization Script (Lengkap)
-- Proyek: E-Commerce SaaS ContentHub (Amigos Team)
-- Database: ecommerce_db (Neon Cloud / PostgreSQL 15)
-- ============================================================

-- 1. Bersihkan tabel lama jika ada (idempotent dengan cascading)
DROP TABLE IF EXISTS web_settings CASCADE;
DROP TABLE IF EXISTS about_content CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS partnerships CASCADE;
DROP TABLE IF EXISTS privacy_policies CASCADE;
DROP TABLE IF EXISTS terms_conditions CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS content_posts CASCADE;
DROP TABLE IF EXISTS content_templates CASCADE;
DROP TABLE IF EXISTS template_categories CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- 2. TABEL PENGGUNA (USERS)
-- ============================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'editor')),
    phone VARCHAR(30),
    business_name VARCHAR(150) DEFAULT 'UMKM Mitra ContentHub',
    industry VARCHAR(100) DEFAULT 'Kuliner & F&B',
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. TABEL KATALOG SUBSCRIPTION (SUBSCRIPTION_PLANS)
-- ============================================================
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
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. TABEL TRANSAKSI PESANAN (ORDERS)
-- Relasi Foreign Key ON DELETE CASCADE ke users & RESTRICT ke plans
-- Mencakup customer_name & customer_email eksplisit untuk tracking
-- ============================================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(60) UNIQUE NOT NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(150),
    customer_email VARCHAR(150),
    plan_id INT NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Cancelled')),
    payment_method VARCHAR(50) DEFAULT 'Virtual Account',
    payment_channel VARCHAR(50) DEFAULT 'BCA Virtual Account',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. TABEL DETAIL ITEM TRANSAKSI (ORDER_ITEMS)
-- ============================================================
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
-- 6. TABEL CONTENT POSTS (CALENDAR & DRAG-AND-DROP KANBAN PLANNER)
-- Terhubung ke users dengan ON DELETE CASCADE
-- ============================================================
CREATE TABLE content_posts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    judul VARCHAR(255) NOT NULL,
    caption TEXT,
    platform VARCHAR(50) NOT NULL DEFAULT 'Instagram' CHECK (platform IN ('Instagram', 'TikTok', 'Threads', 'Facebook', 'YouTube', 'LinkedIn')),
    category VARCHAR(100) DEFAULT 'Umum',
    color_label VARCHAR(100) DEFAULT 'bg-blue-100 text-blue-700 border-blue-300',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'Published', 'Ready')),
    stage VARCHAR(50) NOT NULL DEFAULT 'backlog' CHECK (stage IN ('backlog', 'design', 'ready', 'scheduled')),
    order_position INT NOT NULL DEFAULT 0,
    media_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. TABEL TEMPLATES & KATEGORI TEMPLATE
-- ============================================================
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
    thumbnail_url VARCHAR(500),
    canva_link VARCHAR(500),
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 8. TABEL KONTEN STATIS & HALAMAN UNIVERSAL
-- Mengikuti Standar Universal: id, title, slug, description/content,
-- image_url, author, category, created_at, updated_at
-- ============================================================

-- A. Syarat & Ketentuan (Terms & Conditions)
CREATE TABLE terms_conditions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    author VARCHAR(150) DEFAULT 'Legal ContentHub Team',
    category VARCHAR(100) DEFAULT 'Legal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B. Kebijakan & Privasi (Privacy Policy)
CREATE TABLE privacy_policies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    author VARCHAR(150) DEFAULT 'Legal ContentHub Team',
    category VARCHAR(100) DEFAULT 'Privacy',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- C. Kerja Sama & Kemitraan (Partnership - Integrasi Canva)
CREATE TABLE partnerships (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    author VARCHAR(150) DEFAULT 'Partnership Director',
    category VARCHAR(100) DEFAULT 'Canva Integration',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- D. Blog & Artikel Edukasi
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    author VARCHAR(150) DEFAULT 'Editorial Amigos',
    category VARCHAR(100) DEFAULT 'Social Media Marketing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- E. Halaman About (Profil Perusahaan, Visi, Misi, Tim)
CREATE TABLE about_content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    author VARCHAR(150) DEFAULT 'ContentHub Leadership',
    category VARCHAR(100) DEFAULT 'Company Profile',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 9. TABEL PENGATURAN WEB (WEB_SETTINGS)
-- Menyimpan General Settings, Email SMTP, dan Payment Gateway
-- ============================================================
CREATE TABLE web_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 10. TABEL SUPPORT TICKETS
-- ============================================================
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
-- SEED DATA AWAL (INITIAL COMPREHENSIVE DATA)
-- ============================================================

-- 1. Pengguna Awal (Password default di-hash SHA-256)
-- admin123 -> a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
INSERT INTO users (name, email, password, role, phone, business_name, industry, avatar_url) VALUES
('Jerry Hernis', 'jerry.hernis@amigos.id', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'admin', '081234567890', 'ContentHub HQ', 'Technology SaaS', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'),
('Firman syah', 'firmansyah.mks2006@gmail.com', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'admin', '081234567899', 'ContentHub HQ', 'Technology SaaS', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'),
('Fauzul Rozaq', 'fauzul@amigos.id', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'admin', '081298765432', 'ContentHub Studio', 'Digital Marketing', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'),
('Zico Aryton', 'zicoaryton@gmail.com', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'customer', '081299001122', 'Aryton Creative Studio', 'Desain Kreatif & Multimedia', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop');

-- 2. Katalog Paket Subscription (Free, Starter Hero Rp98rb, Pro Rp898rb, Enterprise Rp2.499rb)
INSERT INTO subscription_plans (sku, name, description, price, billing_cycle, features, badge, is_hero, is_active) VALUES
(
    'CH-FREE',
    'Starter Trial (Free)',
    'Paket awal tanpa biaya untuk UMKM yang baru mulai merencanakan dan menjadwalkan konten media sosial.',
    0.00,
    'Free',
    '["1 Kalender Konten Interaktif", "3 Template Konten Siap Pakai", "1 Akun Media Sosial", "Export Jadwal ke Format Gambar", "Akses Komunitas Komersial UMKM"]'::jsonb,
    'Akses Gratis',
    FALSE,
    TRUE
),
(
    'CH-START-M',
    'ContentHub Starter',
    'Solusi paling praktis dan terlaris bagi pelaku UMKM yang membutuhkan kalender interaktif drag-and-drop dan puluhan template Canva siap pakai.',
    98000.00,
    'Bulanan',
    '["Semua Fitur Paket Trial Free", "Kalender Drag & Drop Interaktif Penuh", "50+ Library Template Konten Siap Pakai", "Direct Integration & Editor Canva Pro", "Pengingat Jadwal Posting (Email Alert)", "Hingga 5 Akun Media Sosial Terhubung", "Customer Support Prioritas via WhatsApp"]'::jsonb,
    'Paling Sesuai untuk UMKM',
    TRUE,
    TRUE
),
(
    'CH-PRO-Y',
    'ContentHub Pro',
    'Paket komprehensif tahunan untuk UMKM berkembang dengan frekuensi konten tinggi, multi-admin, dan analitik jadwal posting.',
    898000.00,
    'Tahunan',
    '["Semua Fitur Starter Bulanan", "Akses 200+ Template Premium Canva", "Akun Media Sosial Tanpa Batas", "Analytics & Estimasi Performa Jadwal", "Persiapan Integrasi AI Copywriting Assistant", "Dukungan Multi-User Team (Hingga 3 Orang)", "Hemat 24% Dibandingkan Bayar Bulanan"]'::jsonb,
    'Paling Hemat',
    FALSE,
    TRUE
),
(
    'CH-ENT-Y',
    'ContentHub Enterprise',
    'Solusi korporasi dan multi-cabang UMKM dengan kebutuhan kustomisasi aset, tim kreatif terdedikasi, dan SLA dukungan 24/7.',
    2499000.00,
    'Tahunan',
    '["Semua Fitur Paket Pro Tahunan", "Integrasi White-Label Brand Perusahaan", "Dedicated Account Manager & Creative Strategist", "Custom Template Design Khusus Brand Anda", "API Access untuk Export & Penjadwalan Otomatis", "SLA Dukungan 24/7 & Pelatihan Tim Privat"]'::jsonb,
    'Solusi Skala Besar',
    FALSE,
    TRUE
);

-- 3. Transaksi Contoh (Orders & Order Items)
INSERT INTO orders (order_number, user_id, customer_name, customer_email, plan_id, total_amount, status, payment_method, payment_channel, paid_at) VALUES
('ORD-20261016-0001', 2, 'Firman syah', 'firmansyah.mks2006@gmail.com', 2, 98000.00, 'Paid', 'Virtual Account', 'BCA Virtual Account', NOW() - INTERVAL '2 days'),
('ORD-20261024-0002', 2, 'Firman syah', 'firmansyah.mks2006@gmail.com', 3, 898000.00, 'Pending', 'E-Wallet', 'GoPay QRIS', NULL);

INSERT INTO order_items (order_id, plan_id, item_name, price, quantity, subtotal) VALUES
(1, 2, 'ContentHub Starter - 1 Bulan Langganan', 98000.00, 1, 98000.00),
(2, 3, 'ContentHub Pro - 1 Tahun Langganan Penuh', 898000.00, 1, 898000.00);

-- 4. Kategori & Template Konten
INSERT INTO template_categories (nama_kategori, deskripsi) VALUES
('Kuliner & F&B', 'Ide promosi dan visual makanan & minuman UMKM'),
('Promo & Diskon', 'Template penawaran diskon tanggal kembar dan flash sale'),
('Edukasi & Tips', 'Konten tips praktis dan infografis informatif'),
('Testimoni & Review', 'Format social proof untuk meningkatkan kepercayaan pelanggan');

INSERT INTO content_templates (category_id, title, copywriting_idea, thumbnail_url, canva_link, is_premium) VALUES
(1, 'Behind The Scene Masak Donat', 'Pernah penasaran gak gimana serunya tim kami bangun jam 4 subuh memastikan donat yang kalian santap selalu hangat dan fresh? Simak videonya sampai habis!', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&fit=crop', 'https://www.canva.com/design/play', FALSE),
(1, 'Menu Rekomendasi Hari Ini', 'Bingung mau camilan apa sore ini di Makassar? Cobain 3 varian donat favorit pelanggan minggu ini!', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&fit=crop', 'https://www.canva.com/design/play', FALSE),
(2, 'Flash Sale Gajian UMKM Diskon 30%', 'Promo Spesial Gajian! Dapatkan diskon 30% untuk pembelian 1 lusin donat aneka rasa khusus hari ini!', 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&fit=crop', 'https://www.canva.com/design/play', TRUE),
(3, '3 Cara Simpan Donat Tetap Lembut', 'Jangan simpan donat di kulkas tanpa wadah kedap udara! Simak 3 trik sederhana ini agar teksturnya tetap selembut kapas.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&fit=crop', 'https://www.canva.com/design/play', FALSE);

-- 5. Data Postingan Kalender & Drag & Drop Kanban (Firman syah - User 2)
INSERT INTO content_posts (user_id, judul, caption, platform, category, color_label, scheduled_at, status, stage, order_position, media_url, thumbnail_url) VALUES
(2, 'Tips Donat Anti Bantat untuk Pemula', '3 rahasia adonan donat mengembang sempurna tanpa pengembang berlebih! Simak resep rahasia dapur kami.', 'Instagram', 'Edukasi', 'bg-blue-100 text-blue-700 border-blue-300', NOW() + INTERVAL '1 day', 'Scheduled', 'scheduled', 0, NULL, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&fit=crop'),
(2, 'TikTok Reel Resep Baru Donat Madu', 'Eksperimen pertama bikin donat madu murni khas Sulawesi! Gimana menurut kalian teksturnya?', 'TikTok', 'Video', 'bg-slate-900 text-cyan-300 border-slate-700', NOW() + INTERVAL '2 day', 'Scheduled', 'scheduled', 1, NULL, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&fit=crop'),
(2, 'Diskon Payday Akhir Pekan Beli 1 Gratis 1', 'Promo gajian datang lagi! Datang langsung ke outlet atau order lewat WhatsApp sekarang.', 'Instagram', 'Promo', 'bg-amber-100 text-amber-800 border-amber-300', NOW() + INTERVAL '3 day', 'Draft', 'ready', 0, NULL, 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&fit=crop'),
(2, 'Banner Promo Beli 2 Gratis 1', 'Desain banner visual promo weekend untuk Instagram Story dan status WhatsApp.', 'Instagram', 'Desain', 'bg-purple-100 text-purple-700 border-purple-300', NOW() + INTERVAL '4 day', 'Draft', 'design', 0, NULL, 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&fit=crop'),
(2, 'Ide Konten: Donat Gluten-Free untuk Diet Sehat', 'Rencana riset konten untuk audiens peduli kesehatan dan penderita intoleransi gluten.', 'Instagram', 'Ide', 'bg-blue-100 text-blue-700 border-blue-300', NOW() + INTERVAL '5 day', 'Draft', 'backlog', 0, NULL, NULL),
(2, 'Video Reels Unboxing Packaging Baru Ramah Lingkungan', 'Dokumentasi transisi ke kemasan ramah lingkungan berbahan singkong.', 'TikTok', 'Branding', 'bg-purple-100 text-purple-700 border-purple-300', NOW() + INTERVAL '6 day', 'Draft', 'backlog', 1, NULL, NULL);

-- 6. Tabel Syarat & Ketentuan (Terms & Conditions)
INSERT INTO terms_conditions (title, slug, description, image_url, author, category) VALUES
(
    'Syarat dan Ketentuan Layanan ContentHub',
    'syarat-dan-ketentuan-layanan',
    'Selamat datang di ContentHub. Dokumen Syarat & Ketentuan ini mengatur seluruh penggunaan platform SaaS ContentHub, situs web, API, dan layanan terkait yang dioperasikan oleh Amigos Team.

1. PENERIMAAN KETENTUAN
Dengan mendaftar, mengakses, atau menggunakan layanan ContentHub, Anda ("Pengguna" atau "Pelaku UMKM") menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh seluruh Syarat & Ketentuan ini.

2. PENDAFTARAN AKUN DAN KEAMANAN
- Pengguna wajib memberikan data yang akurat, lengkap, dan terkini saat registrasi.
- Anda bertanggung jawab penuh menjaga kerahasiaan kata sandi dan seluruh aktivitas akun Anda.
- ContentHub tidak bertanggung jawab atas kerugian akibat kelalaian Pengguna menjaga keamanan kredensial akun.

3. KEPEMILIKAN HAK CIPTA DAN KONTEN
- Seluruh hak cipta atas teks, gambar, video, dan materi yang diunggah oleh Pengguna tetap menjadi milik Pengguna.
- Template visual yang disediakan oleh ContentHub dan integrasi Canva dapat digunakan untuk keperluan promosi komersial brand Pengguna selama masa aktif langganan.
- Pengguna dilarang mendistribusikan ulang atau memperjualbelikan template bawaan ContentHub sebagai produk terpisah tanpa izin tertulis.

4. SISTEM LANGGANAN DAN PEMBAYARAN
- Layanan berbayar ContentHub (Paket Starter, Pro, Enterprise) ditagihkan sesuai siklus penagihan yang dipilih (bulanan atau tahunan).
- Seluruh pembayaran diproses melalui saluran gateway resmi (Virtual Account, QRIS, E-Wallet).
- Akses fitur premium aktif seketika setelah sistem kami menerima konfirmasi pembayaran berhasil (Status: Paid).

5. PEMBATALAN DAN PENGEMBALIAN DANA (REFUND)
- Pengguna dapat membatalkan langganan kapan saja melalui panel pengaturan.
- Layanan yang telah dibayar tidak dapat direfund untuk periode yang sedang berjalan, namun hak akses tetap aktif hingga akhir masa siklus yang telah dibayarkan.',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1000&fit=crop',
    'Legal Amigos Team',
    'Legal & Ketentuan'
);

-- 7. Tabel Kebijakan & Privasi (Privacy Policy)
INSERT INTO privacy_policies (title, slug, description, image_url, author, category) VALUES
(
    'Kebijakan Privasi Pengguna Platform ContentHub',
    'kebijakan-privasi-pengguna',
    'Privasi dan keamanan data Anda merupakan prioritas utama bagi ContentHub. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Pengguna.

1. INFORMASI YANG KAMI KUMPULKAN
- Informasi Akun: Nama lengkap, alamat email, nomor telepon WhatsApp, nama bisnis/UMKM, dan kategori industri usaha Anda.
- Informasi Konten: Judul postingan, caption, jadwal tayang, aset visual, dan preferensi template kalender.
- Data Teknis: Alamat IP, jenis peramban (browser), log aktivitas, dan data transaksi pembayaran (tanpa menyimpan nomor kartu kredit/PIN).

2. PENGGUNAAN INFORMASI
Kami menggunakan informasi yang dikumpulkan untuk:
- Mengoperasikan, memelihara, dan menyediakan fitur kalender editorial dan integrasi Canva.
- Memproses transaksi langganan dan mengirimkan invoice tanda terima otomatis via email.
- Mengirimkan pengingat jadwal posting (reminder) dan notifikasi penting terkait keamanan akun.
- Menganalisis pola penggunaan guna meningkatkan performa sistem dan kecerdasan rekomendasi jam emas postingan.

3. PERLINDUNGAN DAN KEAMANAN DATA
- Kata sandi Pengguna dienkripsi menggunakan protokol hashing SHA-256 yang aman.
- Komunikasi data antara peramban Pengguna dan server kami dilindungi dengan enkripsi SSL/TLS 256-bit standar industri.
- Kami tidak pernah menjual, menyewakan, atau memberikan data pribadi Pengguna kepada pihak ketiga untuk tujuan pemasaran tanpa persetujuan eksplisit Anda.

4. INTEGRASI LAYANAN PIHAK KETIGA
- Ketika menggunakan integrasi Canva, Pengguna tunduk pada standar privasi dan otorisasi Canva untuk pertukaran aset desain visual.
- Pembayaran diproses melalui payment gateway berlisensi Bank Indonesia dengan protokol enkripsi PCI-DSS.',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&fit=crop',
    'Data Protection Officer',
    'Kebijakan Privasi'
);

-- 8. Tabel Kerja Sama (Partnership & Integrasi Canva Komprehensif)
INSERT INTO partnerships (title, slug, description, image_url, author, category) VALUES
(
    'Kemitraan Strategis ContentHub & Ekosistem Desain Canva',
    'integrasi-platform-canva-dan-contenthub',
    'ContentHub secara resmi mengintegrasikan teknologi dan alur kerja desain visual Canva ke dalam ekosistem kalender konten editorial UMKM Indonesia. Kemitraan ini dirancang khusus untuk memangkas hambatan teknis desain bagi pelaku usaha mikro, kecil, dan menengah sehingga dapat memproduksi materi promosi berstandar agensi profesional dalam hitungan menit.

FITUR-FITUR UNGGULAN INTEGRASI CANVA DI CONTENTHUB:

1. Seamless One-Click Canva Transition
Pelaku UMKM tidak perlu lagi berpindah aplikasi secara manual atau mengekspor-impor file berulang kali. Dari dashboard kalender jadwal ContentHub, Anda cukup memilih template yang diminati dan mengklik tombol "Buka di Canva". Workspace desain Canva akan terbuka secara langsung dengan kanvas siap edit.

2. Otomasi Ekspor & Sinkronisasi Kalender
Begitu proses penyuntingan visual di Canva selesai, aset visual (Feed Instagram, TikTok Cover, Story Banner) langsung tersinkronisasi kembali ke slot kalender ContentHub lengkap dengan metadata tanggal dan jam posting emas yang telah Anda jadwalkan sebelumnya.

3. Ratusan Template Desain Khusus Persona UMKM Indonesia
Bersama para kreator visual terkurasi, kami menyediakan lebih dari 200+ template desain siap pakai yang disesuaikan dengan ceruk pasar lokal: Kuliner & F&B (Bakery, Kopi, Rice Bowl), Fashion & Hijab, Jasa Laundry, Barbershop, serta Produk Herbal & Skincare.

4. Konsistensi Brand Kit & Font Usaha
Integrasi ini mendukung pengelolaan warna tema brand, logo bisnis dengan latar transparan, serta tipografi konsisten agar seluruh postingan media sosial Anda memiliki identitas visual yang solid dan mudah dikenali konsumen.

5. Peluang Kerja Sama Bisnis & Komunitas
ContentHub juga membuka peluang kemitraan bagi:
- Asosiasi & Komunitas UMKM Daerah untuk program pelatihan konten digital.
- Desainer Visual & Canva Creator untuk menerbitkan template karya mereka ke dalam ContentHub Marketplace.
- Platform Pembayaran & Logistik yang ingin bersinergi memperkuat ekosistem e-commerce lokal.

Tertarik bermitra dengan ContentHub? Hubungi divisi kerja sama resmi kami melalui email: partnership@amigos.id atau WhatsApp Bisnis Resmi.',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&fit=crop',
    'Head of Strategic Partnership',
    'Kemitraan & Integrasi Canva'
);

-- 9. Tabel Artikel Blog (Articles)
INSERT INTO articles (title, slug, description, image_url, author, category) VALUES
(
    '5 Strategi Kalender Konten yang Bikin Penjualan Donat Naik 300%',
    'strategi-kalender-konten-umkm-kuliner',
    'Banyak pemilik bisnis kuliner mengeluh sepi orderan padahal rasa makanan mereka sangat lezat. Masalah utamanya seringkali adalah ketidakkonsistenan hadir di media sosial calon pelanggan.

Dalam studi kasus mitra UMKM Donat Kampoeng Makassar, kami menerapkan metode "3-Pillar Social Content":
1. Hari Senin-Rabu: Fokus pada Konten Edukasi & Behind The Scene (proses pemilihan bahan baku berkualitas dan kebersihan dapur).
2. Hari Kamis-Jumat: Konten Social Proof & Testimoni Pelanggan yang menggugah selera menjelang akhir pekan.
3. Hari Sabtu-Minggu: Promo Bundling Keluarga & Flash Sale Jam Emas (Pukul 16:00 - 19:00 WIB).

Dengan menyusun rencana konten sebulan di muka menggunakan fitur drag-and-drop ContentHub, tim hanya butuh waktu 1 jam per minggu untuk mengunci 28 postingan berkualitas tinggi.',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1000&fit=crop',
    'Jerry Hernis',
    'Tips Bisnis UMKM'
),
(
    'Panduan Memilih Jam Emas (Prime Time) Posting Instagram & TikTok 2026',
    'panduan-jam-emas-posting-sosial-media-2026',
    'Membuat konten visual yang cantik akan sia-sia jika diunggah di saat target audiens Anda sedang tertidur lelap atau sibuk bekerja. Berdasarkan analisis lebih dari 100.000 jadwal posting di ContentHub, berikut adalah waktu tayang paling optimal untuk audiens Indonesia:

- Slot Pagi (07:30 - 08:30 WIB): Periode "Commute Time" saat orang mengecek ponsel di perjalanan menuju kantor atau kampus. Cocok untuk quote motivasi, menu sarapan, dan tips singkat.
- Slot Siang (12:00 - 13:00 WIB): Istirahat makan siang. Waktu emas untuk konten kuliner, voucher diskon, dan polling interaktif.
- Slot Malam Emas (19:00 - 21:00 WIB): Waktu santai di rumah. Slot terbaik untuk video TikTok berdurasi panjang, carousel edukasi mendalam, dan pengumuman produk baru.',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1000&fit=crop',
    'Fauzul Rozaq',
    'Strategi Konten'
),
(
    'Mengapa Desain Canva yang Sederhana Lebih Menghasilkan Penjualan?',
    'desain-canva-sederhana-tingkatkan-konversi',
    'Kesalahan terbesar pemula dalam mendesain konten promosi adalah memasukkan terlalu banyak elemen grafis, efek bayangan, dan font rumit yang membuat pesan utama tenggelam.

Konsumen masa kini hanya meluangkan waktu kurang dari 2 detik sebelum memutuskan untuk scroll lanjut atau membaca postingan Anda. Desain yang bersih dengan 1 fokus gambar produk yang tajam, headline promo yang kontras, dan call-to-action (CTA) yang jelas terbukti memiliki tingkat konversi 45% lebih tinggi dibanding desain yang terlalu ramai.',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&fit=crop',
    'Tim Kreatif Amigos',
    'Desain Visual & Canva'
);

-- 10. Tabel About (Profil Perusahaan & Tim Amigos)
INSERT INTO about_content (title, slug, description, image_url, author, category) VALUES
(
    'Tentang ContentHub & Kisah Perjalanan Kami',
    'tentang-kami-contenthub',
    'ContentHub adalah platform Software as a Service (SaaS) manajemen dan perencanaan editorial konten media sosial yang didesain dari nol untuk menjawab kebutuhan riil pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) Indonesia.

VISI KAMI:
Menjadi platform ekosistem konten terpercaya yang mendemokratisasi akses pemasaran digital profesional bagi setiap pelaku usaha lokal di seluruh Nusantara.

MISI KAMI:
1. Menyederhanakan perencanaan konten dari yang semula membingungkan dan memakan waktu menjadi proses menyenangkan yang selesai dalam hitungan menit.
2. Menyediakan jembatan integrasi visual tanpa hambatan bersama platform global seperti Canva.
3. Memberikan kepastian harga langganan yang transparan, terjangkau, dan berdampak langsung pada kenaikan omzet mitra bisnis.

MASALAH NYATA YANG KAMI SELESAIKAN: "THE CONSISTENCY GAP"
Banyak produk lokal memiliki kualitas luar biasa tetapi gagal bersaing karena ketiadaan konsistensi publikasi digital. ContentHub memecahkan kesenjangan konsistensi ini melalui kalender interaktif, rekomendasi jam tayang pintar, dan pustaka template visual terintegrasi.',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&fit=crop',
    'Amigos Team Leadership',
    'Profil Perusahaan'
);

-- 11. Pengaturan Default Web (Web Settings)
INSERT INTO web_settings (key, value) VALUES
(
    'general',
    '{
        "tagline": "Solusi Perencanaan & Manajemen Konten Media Sosial UMKM Indonesia",
        "description": "ContentHub membantu ribuan pelaku usaha merencanakan jadwal posting, merancang visual Canva profesional, dan meningkatkan penjualan secara konsisten.",
        "logo_url": "https://cdn-icons-png.flaticon.com/512/919/919851.png",
        "favicon_url": "https://cdn-icons-png.flaticon.com/512/919/919851.png",
        "support_email": "support@contenthub.id",
        "support_phone": "+62 812-3456-7890",
        "address": "Gedung Cyber Tech Amigos Lt. 5, Jl. Perintis Kemerdekaan, Makassar, Sulawesi Selatan",
        "social_instagram": "@contenthub.id",
        "social_tiktok": "@contenthub_official"
    }'::jsonb
),
(
    'email',
    '{
        "smtp_host": "smtp.gmail.com",
        "smtp_port": 587,
        "smtp_from": "no-reply@contenthub.id",
        "smtp_user": "notifikasi.contenthub@gmail.com",
        "smtp_pass": "••••••••••••••••",
        "smtp_secure": false,
        "templates": {
            "welcome": {
                "subject": "Selamat Datang di ContentHub, {name}! Akun Anda Siap Digunakan",
                "body": "Halo {name},\n\nTerima kasih telah bergabung dengan ContentHub SaaS. Akun Anda dengan email {email} telah resmi aktif.\n\nMari mulai menjadwalkan konten media sosial bisnis Anda secara teratur dan tingkatkan omzet UMKM Anda sekarang juga!\n\nSalam hangat,\nTim ContentHub"
            },
            "invoice": {
                "subject": "Invoice Pembayaran #{order_number} - Paket {plan_name}",
                "body": "Halo {customer_name},\n\nPesanan langganan Anda dengan No. Order #{order_number} sebesar Rp {total_amount} telah berhasil kami proses dengan status: {status}.\n\nTerima kasih atas kepercayaan Anda bermitra dengan ContentHub!\n\nHormat kami,\nTim Keuangan ContentHub"
            },
            "reset_password": {
                "subject": "Instruksi Pembaruan Kata Sandi Akun ContentHub Anda",
                "body": "Halo {name},\n\nKami menerima permintaan untuk mengganti kata sandi akun Anda ({email}). Jika ini adalah Anda, silakan ikuti tautan verifikasi berikut untuk mengonfirmasi perubahan.\n\nJika Anda tidak merasa melakukan permintaan ini, segera hubungi customer support kami.\n\nSalam aman,\nTim Keamanan ContentHub"
            }
        }
    }'::jsonb
),
(
    'payment_gateway',
    '{
        "mode": "sandbox",
        "provider": "Midtrans",
        "server_key": "SB-Mid-server-TEST-KEY-CONTENTHUB-2026",
        "client_key": "SB-Mid-client-TEST-KEY-CONTENTHUB-2026",
        "merchant_id": "M10928374",
        "supported_channels": ["BCA Virtual Account", "Mandiri Virtual Account", "BRI Virtual Account", "GoPay QRIS", "OVO", "DANA"]
    }'::jsonb
);
