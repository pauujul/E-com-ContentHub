const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Lokasi file persistensi fallback jika server Neon PostgreSQL sedang offline / belum diset
const LOCAL_STORE_PATH = path.join(__dirname, 'local_store.json');

let isPostgresConnected = false;
let pool = null;

// Initial seed data for fallback storage (sesuai init.sql)
const initialSeedData = {
  users: [
    {
      id: 1,
      name: 'Jerry Hernis',
      email: 'jerry.hernis@amigos.id',
      password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // admin123
      role: 'admin',
      phone: '081234567890',
      business_name: 'ContentHub HQ',
      industry: 'Technology SaaS',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      email_verified: true,
      created_at: new Date('2026-10-01T08:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Firman syah',
      email: 'firmansyah.mks2006@gmail.com',
      password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // admin123
      role: 'admin',
      phone: '081234567899',
      business_name: 'ContentHub HQ',
      industry: 'Technology SaaS',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      email_verified: true,
      created_at: new Date('2026-10-05T09:30:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Fauzul Rozaq',
      email: 'fauzul@amigos.id',
      password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // admin123
      role: 'admin',
      phone: '081298765432',
      business_name: 'ContentHub Studio',
      industry: 'Digital Marketing',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      email_verified: true,
      created_at: new Date('2026-10-10T10:15:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'Zico Aryton',
      email: 'zicoaryton@gmail.com',
      password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // admin123
      role: 'customer',
      phone: '081299001122',
      business_name: 'Aryton Creative Studio',
      industry: 'Desain Kreatif & Multimedia',
      avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop',
      email_verified: true,
      created_at: new Date('2026-10-15T11:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  subscription_plans: [
    {
      id: 1,
      sku: 'CH-FREE',
      name: 'Starter Trial (Free)',
      description: 'Paket awal tanpa biaya untuk UMKM yang baru mulai merencanakan dan menjadwalkan konten media sosial.',
      price: '0.00',
      billing_cycle: 'Free',
      features: ['1 Kalender Konten Interaktif', '3 Template Konten Siap Pakai', '1 Akun Media Sosial', 'Export Jadwal ke Format Gambar', 'Akses Komunitas Komersial UMKM'],
      badge: 'Akses Gratis',
      is_hero: false,
      is_active: true,
      created_at: new Date('2026-10-01T08:00:00Z').toISOString(),
    },
    {
      id: 2,
      sku: 'CH-START-M',
      name: 'ContentHub Starter',
      description: 'Solusi paling praktis dan terlaris bagi pelaku UMKM yang membutuhkan kalender interaktif drag-and-drop dan puluhan template Canva siap pakai.',
      price: '98000.00',
      billing_cycle: 'Bulanan',
      features: [
        'Semua Fitur Paket Trial Free',
        'Kalender Drag & Drop Interaktif Penuh',
        '50+ Library Template Konten Siap Pakai',
        'Direct Integration & Editor Canva Pro',
        'Pengingat Jadwal Posting (Email Alert)',
        'Hingga 5 Akun Media Sosial Terhubung',
        'Customer Support Prioritas via WhatsApp',
      ],
      badge: 'Paling Sesuai untuk UMKM',
      is_hero: true,
      is_active: true,
      created_at: new Date('2026-10-01T08:00:00Z').toISOString(),
    },
    {
      id: 3,
      sku: 'CH-PRO-Y',
      name: 'ContentHub Pro',
      description: 'Paket komprehensif tahunan untuk UMKM berkembang dengan frekuensi konten tinggi, multi-admin, dan analitik jadwal posting.',
      price: '898000.00',
      billing_cycle: 'Tahunan',
      features: [
        'Semua Fitur Starter Bulanan',
        'Akses 200+ Template Premium Canva',
        'Akun Media Sosial Tanpa Batas',
        'Analytics & Estimasi Performa Jadwal',
        'Persiapan Integrasi AI Copywriting Assistant',
        'Dukungan Multi-User Team (Hingga 3 Orang)',
        'Hemat 24% Dibandingkan Bayar Bulanan',
      ],
      badge: 'Paling Hemat',
      is_hero: false,
      is_active: true,
      created_at: new Date('2026-10-01T08:00:00Z').toISOString(),
    },
  ],
  orders: [
    {
      id: 1,
      order_number: 'ORD-20261016-0001',
      user_id: 2,
      customer_name: 'Firman syah',
      customer_email: 'firmansyah.mks2006@gmail.com',
      plan_id: 2,
      total_amount: '98000.00',
      status: 'Paid',
      payment_method: 'Virtual Account',
      payment_channel: 'BCA Virtual Account',
      paid_at: new Date('2026-10-16T14:20:00Z').toISOString(),
      created_at: new Date('2026-10-16T14:15:00Z').toISOString(),
    },
    {
      id: 2,
      order_number: 'ORD-20261024-0002',
      user_id: 2,
      customer_name: 'Firman syah',
      customer_email: 'firmansyah.mks2006@gmail.com',
      plan_id: 3,
      total_amount: '898000.00',
      status: 'Pending',
      payment_method: 'E-Wallet',
      payment_channel: 'GoPay QRIS',
      paid_at: null,
      created_at: new Date('2026-10-24T10:00:00Z').toISOString(),
    },
  ],
  order_items: [
    {
      id: 1,
      order_id: 1,
      plan_id: 2,
      item_name: 'ContentHub Starter - 1 Bulan Langganan',
      price: '98000.00',
      quantity: 1,
      subtotal: '98000.00',
      created_at: new Date('2026-10-16T14:15:00Z').toISOString(),
    },
    {
      id: 2,
      order_id: 2,
      plan_id: 3,
      item_name: 'ContentHub Pro - 1 Tahun Langganan Penuh',
      price: '898000.00',
      quantity: 1,
      subtotal: '898000.00',
      created_at: new Date('2026-10-24T10:00:00Z').toISOString(),
    },
  ],
  content_posts: [
    {
      id: 1,
      user_id: 2,
      judul: 'Tips Donat Anti Bantat untuk Pemula',
      caption: '3 rahasia adonan donat mengembang sempurna tanpa pengembang berlebih! Simak resep rahasia dapur kami.',
      platform: 'Instagram',
      category: 'Edukasi',
      color_label: 'bg-blue-100 text-blue-700 border-blue-300',
      scheduled_at: new Date('2026-10-24T10:00:00Z').toISOString(),
      status: 'Scheduled',
      stage: 'scheduled',
      order_position: 0,
      media_url: null,
      thumbnail_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&fit=crop',
      reminder_sent: false,
      created_at: new Date('2026-10-15T08:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      user_id: 2,
      judul: 'TikTok Reel Resep Baru Donat Madu',
      caption: 'Eksperimen pertama bikin donat madu murni khas Sulawesi! Gimana menurut kalian teksturnya?',
      platform: 'TikTok',
      category: 'Video',
      color_label: 'bg-slate-900 text-cyan-300 border-slate-700',
      scheduled_at: new Date('2026-10-24T13:00:00Z').toISOString(),
      status: 'Scheduled',
      stage: 'scheduled',
      order_position: 1,
      media_url: null,
      thumbnail_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&fit=crop',
      reminder_sent: false,
      created_at: new Date('2026-10-15T09:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      user_id: 2,
      judul: 'Diskon Payday Akhir Pekan Beli 1 Gratis 1',
      caption: 'Promo gajian datang lagi! Datang langsung ke outlet atau order lewat WhatsApp sekarang.',
      platform: 'Instagram',
      category: 'Promo',
      color_label: 'bg-amber-100 text-amber-800 border-amber-300',
      scheduled_at: new Date('2026-10-25T18:30:00Z').toISOString(),
      status: 'Draft',
      stage: 'ready',
      order_position: 0,
      media_url: null,
      thumbnail_url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&fit=crop',
      reminder_sent: false,
      created_at: new Date('2026-10-16T10:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      user_id: 2,
      judul: 'Banner Promo Beli 2 Gratis 1',
      caption: 'Desain banner visual promo weekend untuk Instagram Story dan status WhatsApp.',
      platform: 'Instagram',
      category: 'Desain',
      color_label: 'bg-purple-100 text-purple-700 border-purple-300',
      scheduled_at: new Date('2026-10-26T12:00:00Z').toISOString(),
      status: 'Draft',
      stage: 'design',
      order_position: 0,
      media_url: null,
      thumbnail_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&fit=crop',
      reminder_sent: false,
      created_at: new Date('2026-10-17T11:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 5,
      user_id: 2,
      judul: 'Ide Konten: Donat Gluten-Free untuk Diet Sehat',
      caption: 'Rencana riset konten untuk audiens peduli kesehatan dan penderita intoleransi gluten.',
      platform: 'Instagram',
      category: 'Ide',
      color_label: 'bg-blue-100 text-blue-700 border-blue-300',
      scheduled_at: new Date('2026-10-28T09:00:00Z').toISOString(),
      status: 'Draft',
      stage: 'backlog',
      order_position: 0,
      media_url: null,
      thumbnail_url: null,
      reminder_sent: false,
      created_at: new Date('2026-10-18T08:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 6,
      user_id: 2,
      judul: 'Video Reels Unboxing Packaging Baru Ramah Lingkungan',
      caption: 'Dokumentasi transisi ke kemasan ramah lingkungan berbahan singkong.',
      platform: 'TikTok',
      category: 'Branding',
      color_label: 'bg-purple-100 text-purple-700 border-purple-300',
      scheduled_at: new Date('2026-10-29T14:00:00Z').toISOString(),
      status: 'Draft',
      stage: 'backlog',
      order_position: 1,
      media_url: null,
      thumbnail_url: null,
      reminder_sent: false,
      created_at: new Date('2026-10-19T10:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  terms_conditions: [
    {
      id: 1,
      title: 'Syarat dan Ketentuan Layanan ContentHub',
      slug: 'syarat-dan-ketentuan-layanan',
      description: `Selamat datang di ContentHub. Dokumen Syarat & Ketentuan ini mengatur seluruh penggunaan platform SaaS ContentHub, situs web, API, dan layanan terkait yang dioperasikan oleh Amigos Team.

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
- Layanan yang telah dibayar tidak dapat direfund untuk periode yang sedang berjalan, namun hak akses tetap aktif hingga akhir masa siklus yang telah dibayarkan.`,
      image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1000&fit=crop',
      author: 'Legal Amigos Team',
      category: 'Legal & Ketentuan',
      created_at: new Date('2026-10-01T08:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  privacy_policies: [
    {
      id: 1,
      title: 'Kebijakan Privasi Pengguna Platform ContentHub',
      slug: 'kebijakan-privasi-pengguna',
      description: `Privasi dan keamanan data Anda merupakan prioritas utama bagi ContentHub. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Pengguna.

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
- Pembayaran diproses melalui payment gateway berlisensi Bank Indonesia dengan protokol enkripsi PCI-DSS.`,
      image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&fit=crop',
      author: 'Data Protection Officer',
      category: 'Kebijakan Privasi',
      created_at: new Date('2026-10-01T08:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  partnerships: [
    {
      id: 1,
      title: 'Kemitraan Strategis ContentHub & Ekosistem Desain Canva',
      slug: 'integrasi-platform-canva-dan-contenthub',
      description: `ContentHub secara resmi mengintegrasikan teknologi dan alur kerja desain visual Canva ke dalam ekosistem kalender konten editorial UMKM Indonesia. Kemitraan ini dirancang khusus untuk memangkas hambatan teknis desain bagi pelaku usaha mikro, kecil, dan menengah sehingga dapat memproduksi materi promosi berstandar agensi profesional dalam hitungan menit.

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

Tertarik bermitra dengan ContentHub? Hubungi divisi kerja sama resmi kami melalui email: partnership@amigos.id atau WhatsApp Bisnis Resmi.`,
      image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&fit=crop',
      author: 'Head of Strategic Partnership',
      category: 'Canva Integration',
      created_at: new Date('2026-10-01T08:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  articles: [
    {
      id: 1,
      title: '5 Strategi Kalender Konten yang Bikin Penjualan Donat Naik 300%',
      slug: 'strategi-kalender-konten-umkm-kuliner',
      description: `Banyak pemilik bisnis kuliner mengeluh sepi orderan padahal rasa makanan mereka sangat lezat. Masalah utamanya seringkali adalah ketidakkonsistenan hadir di media sosial calon pelanggan.

Dalam studi kasus mitra UMKM Donat Kampoeng Makassar, kami menerapkan metode "3-Pillar Social Content":
1. Hari Senin-Rabu: Fokus pada Konten Edukasi & Behind The Scene (proses pemilihan bahan baku berkualitas dan kebersihan dapur).
2. Hari Kamis-Jumat: Konten Social Proof & Testimoni Pelanggan yang menggugah selera menjelang akhir pekan.
3. Hari Sabtu-Minggu: Promo Bundling Keluarga & Flash Sale Jam Emas (Pukul 16:00 - 19:00 WIB).

Dengan menyusun rencana konten sebulan di muka menggunakan fitur drag-and-drop ContentHub, tim hanya butuh waktu 1 jam per minggu untuk mengunci 28 postingan berkualitas tinggi.`,
      image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1000&fit=crop',
      author: 'Jerry Hernis',
      category: 'Tips Bisnis UMKM',
      created_at: new Date('2026-10-18T10:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Panduan Memilih Jam Emas (Prime Time) Posting Instagram & TikTok 2026',
      slug: 'panduan-jam-emas-posting-sosial-media-2026',
      description: `Membuat konten visual yang cantik akan sia-sia jika diunggah di saat target audiens Anda sedang tertidur lelap atau sibuk bekerja. Berdasarkan analisis lebih dari 100.000 jadwal posting di ContentHub, berikut adalah waktu tayang paling optimal untuk audiens Indonesia:

- Slot Pagi (07:30 - 08:30 WIB): Periode "Commute Time" saat orang mengecek ponsel di perjalanan menuju kantor atau kampus. Cocok untuk quote motivasi, menu sarapan, dan tips singkat.
- Slot Siang (12:00 - 13:00 WIB): Istirahat makan siang. Waktu emas untuk konten kuliner, voucher diskon, dan polling interaktif.
- Slot Malam Emas (19:00 - 21:00 WIB): Waktu santai di rumah. Slot terbaik untuk video TikTok berdurasi panjang, carousel edukasi mendalam, dan pengumuman produk baru.`,
      image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1000&fit=crop',
      author: 'Fauzul Rozaq',
      category: 'Strategi Konten',
      created_at: new Date('2026-10-20T11:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'Mengapa Desain Canva yang Sederhana Lebih Menghasilkan Penjualan?',
      slug: 'desain-canva-sederhana-tingkatkan-konversi',
      description: `Kesalahan terbesar pemula dalam mendesain konten promosi adalah memasukkan terlalu banyak elemen grafis, efek bayangan, dan font rumit yang membuat pesan utama tenggelam.

Konsumen masa kini hanya meluangkan waktu kurang dari 2 detik sebelum memutuskan untuk scroll lanjut atau membaca postingan Anda. Desain yang bersih dengan 1 fokus gambar produk yang tajam, headline promo yang kontras, dan call-to-action (CTA) yang jelas terbukti memiliki tingkat konversi 45% lebih tinggi dibanding desain yang terlalu ramai.`,
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&fit=crop',
      author: 'Tim Kreatif Amigos',
      category: 'Desain Visual & Canva',
      created_at: new Date('2026-10-22T09:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  about_content: [
    {
      id: 1,
      title: 'Tentang ContentHub & Kisah Perjalanan Kami',
      slug: 'tentang-kami-contenthub',
      description: `ContentHub adalah platform Software as a Service (SaaS) manajemen dan perencanaan editorial konten media sosial yang didesain dari nol untuk menjawab kebutuhan riil pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) Indonesia.

VISI KAMI:
Menjadi platform ekosistem konten terpercaya yang mendemokratisasi akses pemasaran digital profesional bagi setiap pelaku usaha lokal di seluruh Nusantara.

MISI KAMI:
1. Menyederhanakan perencanaan konten dari yang semula membingungkan dan memakan waktu menjadi proses menyenangkan yang selesai dalam hitungan menit.
2. Menyediakan jembatan integrasi visual tanpa hambatan bersama platform global seperti Canva.
3. Memberikan kepastian harga langganan yang transparan, terjangkau, dan berdampak langsung pada kenaikan omzet mitra bisnis.

MASALAH NYATA YANG KAMI SELESAIKAN: "THE CONSISTENCY GAP"
Banyak produk lokal memiliki kualitas luar biasa tetapi gagal bersaing karena ketiadaan konsistensi publikasi digital. ContentHub memecahkan kesenjangan konsistensi ini melalui kalender interaktif, rekomendasi jam tayang pintar, dan pustaka template visual terintegrasi.`,
      image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&fit=crop',
      author: 'Amigos Team Leadership',
      category: 'Company Profile',
      created_at: new Date('2026-10-01T08:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  web_settings: {
    general: {
      tagline: 'Solusi Perencanaan & Manajemen Konten Media Sosial UMKM Indonesia',
      description: 'ContentHub membantu ribuan pelaku usaha merencanakan jadwal posting, merancang visual Canva profesional, dan meningkatkan penjualan secara konsisten.',
      logo_url: 'https://cdn-icons-png.flaticon.com/512/919/919851.png',
      favicon_url: 'https://cdn-icons-png.flaticon.com/512/919/919851.png',
      support_email: 'support@contenthub.id',
      support_phone: '+62 812-3456-7890',
      address: 'Gedung Cyber Tech Amigos Lt. 5, Jl. Perintis Kemerdekaan, Makassar, Sulawesi Selatan',
      social_instagram: '@contenthub.id',
      social_tiktok: '@contenthub_official',
    },
    email: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_from: 'no-reply@contenthub.id',
      smtp_user: 'notifikasi.contenthub@gmail.com',
      smtp_pass: '••••••••••••••••',
      smtp_secure: false,
      templates: {
        welcome: {
          subject: 'Selamat Datang di ContentHub, {name}! Akun Anda Siap Digunakan',
          body: 'Halo {name},\n\nTerima kasih telah bergabung dengan ContentHub SaaS. Akun Anda dengan email {email} telah resmi aktif.\n\nMari mulai menjadwalkan konten media sosial bisnis Anda secara teratur dan tingkatkan omzet UMKM Anda sekarang juga!\n\nSalam hangat,\nTim ContentHub',
        },
        invoice: {
          subject: 'Invoice Pembayaran #{order_number} - Paket {plan_name}',
          body: 'Halo {customer_name},\n\nPesanan langganan Anda dengan No. Order #{order_number} sebesar Rp {total_amount} telah berhasil kami proses dengan status: {status}.\n\nTerima kasih atas kepercayaan Anda bermitra dengan ContentHub!\n\nHormat kami,\nTim Keuangan ContentHub',
        },
        reset_password: {
          subject: 'Instruksi Pembaruan Kata Sandi Akun ContentHub Anda',
          body: 'Halo {name},\n\nKami menerima permintaan untuk mengganti kata sandi akun Anda ({email}). Jika ini adalah Anda, silakan ikuti tautan verifikasi berikut untuk mengonfirmasi perubahan.\n\nJika Anda tidak merasa melakukan permintaan ini, segera hubungi customer support kami.\n\nSalam aman,\nTim Keamanan ContentHub',
        },
      },
    },
    payment_gateway: {
      mode: 'sandbox',
      provider: 'Midtrans',
      server_key: 'SB-Mid-server-TEST-KEY-CONTENTHUB-2026',
      client_key: 'SB-Mid-client-TEST-KEY-CONTENTHUB-2026',
      merchant_id: 'M10928374',
      supported_channels: ['BCA Virtual Account', 'Mandiri Virtual Account', 'BRI Virtual Account', 'GoPay QRIS', 'OVO', 'DANA'],
    },
  },
};

// Fungsi memuat atau menginisialisasi penyimpanan lokal
function loadLocalStore() {
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const raw = fs.readFileSync(LOCAL_STORE_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Peringatan: Gagal membaca local_store.json, membuat baru:', err.message);
  }
  saveLocalStore(initialSeedData);
  return JSON.parse(JSON.stringify(initialSeedData));
}

function saveLocalStore(data) {
  try {
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saat menyimpan local_store.json:', err.message);
  }
}

// Inisialisasi pool PostgreSQL
function initPostgres() {
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  } else if (process.env.DB_HOST) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'password123',
      database: process.env.DB_NAME || 'ecommerce_db',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });
  }

  if (pool) {
    // Default to true when pool is configured with DATABASE_URL
    isPostgresConnected = !!process.env.DATABASE_URL;

    pool.connect((err, client, release) => {
      if (err) {
        console.warn('⚠️  PostgreSQL belum dapat dijangkau (' + err.message + '). Mengaktifkan Local Resilient Store.');
        isPostgresConnected = false;
      } else {
        isPostgresConnected = true;
        console.log('✅ Terhubung sukses ke PostgreSQL/Neon Cloud.');
        release();
      }
    });

    pool.on('error', (err) => {
      console.warn('⚠️  Koneksi PostgreSQL terputus:', err.message);
      isPostgresConnected = false;
    });
  }
}

initPostgres();
let localData = loadLocalStore();

// Wrapper query yang mendukung PostgreSQL jika aktif, dan local fallback store jika offline
const db = {
  isPostgres: () => isPostgresConnected,
  // getStore hanya aktif jika PostgreSQL sedang offline / terputus
  getStore: () => (isPostgresConnected ? null : localData),
  saveStore: () => (!isPostgresConnected ? saveLocalStore(localData) : null),

  query: async (text, params = []) => {
    // 1. Jika terhubung ke Neon PostgreSQL, gunakan driver PG murni
    if (pool && isPostgresConnected) {
      try {
        return await pool.query(text, params);
      } catch (err) {
        const isConnError = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', '57P01'].includes(err.code) || err.message?.includes('Connection terminated');
        if (isConnError) {
          console.warn('⚠️  Postgres connection drop, beralih ke local storage:', err.message);
          isPostgresConnected = false;
        } else {
          throw err;
        }
      }
    }

    // 2. Local Fallback Database Engine
    // Meniru interface { rows: [...] } dari pg
    return executeLocalQuery(text, params);
  },

  pool: {
    connect: async () => {
      if (isPostgresConnected && pool) {
        return await pool.connect();
      }
      // Mock client untuk transaksi jika offline
      return {
        query: (t, p) => db.query(t, p),
        release: () => {},
      };
    },
  },
};

// Engine query sederhana untuk local store
function executeLocalQuery(text, params = []) {
  const trimmed = text.trim();
  const upper = trimmed.toUpperCase();

  // NOW() health check
  if (upper.includes('SELECT NOW()')) {
    return { rows: [{ current_time: new Date().toISOString() }] };
  }

  // BEGIN / COMMIT / ROLLBACK
  if (upper.startsWith('BEGIN') || upper.startsWith('COMMIT') || upper.startsWith('ROLLBACK')) {
    return { rows: [] };
  }

  // USERS
  if (upper.includes('FROM USERS')) {
    if (upper.startsWith('SELECT')) {
      if (trimmed.includes('WHERE LOWER(email) = LOWER($1)')) {
        const email = String(params[0] || '').toLowerCase().trim();
        const found = localData.users.filter((u) => u.email.toLowerCase() === email);
        return { rows: found };
      }
      if (trimmed.includes('WHERE id = $1')) {
        const id = parseInt(params[0], 10);
        const found = localData.users.filter((u) => u.id === id);
        return { rows: found };
      }
      return { rows: [...localData.users].sort((a, b) => a.id - b.id) };
    }
  }

  if (upper.startsWith('INSERT INTO USERS')) {
    const newId = localData.users.length ? Math.max(...localData.users.map((u) => u.id)) + 1 : 1;
    const [name, email, password, role, phone, business_name, industry, avatar_url] = params;
    const userObj = {
      id: newId,
      name: name || '',
      email: email || '',
      password: password || '',
      role: role || 'customer',
      phone: phone || null,
      business_name: business_name || 'UMKM Mitra ContentHub',
      industry: industry || 'Kuliner & F&B',
      avatar_url: avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localData.users.push(userObj);
    saveLocalStore(localData);
    return { rows: [userObj] };
  }

  if (upper.startsWith('UPDATE USERS')) {
    // Handling update password, update email, update profile
    const id = parseInt(params[params.length - 1], 10);
    const userIndex = localData.users.findIndex((u) => u.id === id);
    if (userIndex !== -1) {
      localData.users[userIndex].updated_at = new Date().toISOString();
      saveLocalStore(localData);
      return { rows: [localData.users[userIndex]] };
    }
    return { rows: [] };
  }

  // SUBSCRIPTION PLANS
  if (upper.includes('FROM SUBSCRIPTION_PLANS')) {
    if (trimmed.includes('WHERE id = $1')) {
      const id = parseInt(params[0], 10);
      const found = localData.subscription_plans.filter((p) => p.id === id);
      return { rows: found };
    }
    return { rows: [...localData.subscription_plans].sort((a, b) => parseFloat(a.price) - parseFloat(b.price)) };
  }

  // ORDERS
  if (upper.includes('FROM ORDERS')) {
    if (trimmed.includes('WHERE o.id = $1') || trimmed.includes('o.order_number = $1')) {
      const paramVal = params[0];
      const found = localData.orders.filter((o) => o.id === parseInt(paramVal, 10) || o.order_number === paramVal);
      if (found.length) {
        const ord = found[0];
        const user = localData.users.find((u) => u.id === ord.user_id) || {};
        const plan = localData.subscription_plans.find((p) => p.id === ord.plan_id) || {};
        return {
          rows: [
            {
              ...ord,
              customer_name: ord.customer_name || user.name || 'Customer',
              customer_email: ord.customer_email || user.email || '',
              customer_phone: user.phone || '',
              plan_id: plan.id,
              plan_name: plan.name,
              plan_sku: plan.sku,
              plan_price: plan.price,
              billing_cycle: plan.billing_cycle,
              features: plan.features,
            },
          ],
        };
      }
      return { rows: [] };
    }

    if (trimmed.includes('WHERE o.user_id = $1')) {
      const uid = parseInt(params[0], 10);
      const userOrders = localData.orders.filter((o) => o.user_id === uid);
      const mapped = userOrders.map((o) => {
        const user = localData.users.find((u) => u.id === o.user_id) || {};
        const plan = localData.subscription_plans.find((p) => p.id === o.plan_id) || {};
        return {
          ...o,
          customer_name: o.customer_name || user.name,
          customer_email: o.customer_email || user.email,
          plan_name: plan.name,
          billing_cycle: plan.billing_cycle,
        };
      });
      return { rows: mapped };
    }

    // All orders
    const mapped = localData.orders.map((o) => {
      const user = localData.users.find((u) => u.id === o.user_id) || {};
      const plan = localData.subscription_plans.find((p) => p.id === o.plan_id) || {};
      return {
        ...o,
        customer_name: o.customer_name || user.name,
        customer_email: o.customer_email || user.email,
        plan_name: plan.name,
        billing_cycle: plan.billing_cycle,
      };
    });
    return { rows: mapped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) };
  }

  // ORDER ITEMS
  if (upper.includes('FROM ORDER_ITEMS')) {
    if (trimmed.includes('WHERE order_id = $1')) {
      const oid = parseInt(params[0], 10);
      return { rows: localData.order_items.filter((i) => i.order_id === oid) };
    }
    return { rows: localData.order_items };
  }

  // ADMIN STATS
  if (trimmed.includes('SUM(total_amount)')) {
    const paid = localData.orders.filter((o) => o.status === 'Paid');
    const totalRev = paid.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0);
    return { rows: [{ total_revenue: totalRev }] };
  }
  if (trimmed.includes('COUNT(*) AS total_orders')) {
    const total = localData.orders.length;
    const paid = localData.orders.filter((o) => o.status === 'Paid').length;
    const pending = localData.orders.filter((o) => o.status === 'Pending').length;
    return { rows: [{ total_orders: total, paid_orders: paid, pending_orders: pending }] };
  }
  if (trimmed.includes('COUNT(*) AS total_users')) {
    const total = localData.users.length;
    const cust = localData.users.filter((u) => u.role === 'customer').length;
    return { rows: [{ total_users: total, total_customers: cust }] };
  }

  // Default fallback
  return { rows: [] };
}

module.exports = db;
