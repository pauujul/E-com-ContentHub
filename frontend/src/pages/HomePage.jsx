import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 px-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
                AI-Powered Content Management
              </div>

              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-on-background leading-[1.1]">
                Buat Konten <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Konsisten</span> Tanpa Stres
              </h1>

              <p className="text-xl text-on-surface-variant leading-relaxed max-w-xl">
                Ubah cara Anda mengelola media sosial. Dari ide, perancangan kalender interaktif, hingga template siap pakai Canva—kelola semuanya dalam satu platform terpadu.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/pricing"
                  className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-center"
                >
                  Mulai Dari Rp98.000 / bln
                </Link>
                <Link
                  to="/calendar"
                  className="px-8 py-4 bg-surface-container-highest text-primary rounded-2xl font-bold hover:bg-surface-container-high transition-all flex items-center gap-2 justify-center"
                >
                  <span className="material-symbols-outlined">calendar_month</span>
                  Coba Kalender Demo
                </Link>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant pt-2">
                <span className="flex items-center gap-1 text-green-600">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Akses Instan
                </span>
                <span className="flex items-center gap-1 text-green-600">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  BCA VA & E-Wallet
                </span>
                <span className="flex items-center gap-1 text-green-600">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Support Prioritas UMKM
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] blur-3xl"></div>
              <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl p-4 transform lg:rotate-2 border border-outline-variant/15">
                <img
                  alt="ContentHub Dashboard Preview"
                  className="rounded-xl w-full h-auto object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfoPAIgrso-NHEurkslE8-Op6KOwjQNK9T8qX-bFyGghhi2re3u8gsYyaqTZ7-Sq6ZPAJa2rOHSFHKDFiDj4ETYiaex6GPSVPJ9f1hibtDf_YGfrciy7D6DObnB5QdZHBf8VS_wZtv3fXb1Yp9ktjVuGWRYuRmQqwQ_gBnWNXB7NHIEmKCMtJqRvzovJHP-Ej7t9UQp8b1B4XIKODUJP2RVfgzJ-wcSDDaPpgMAkQI4N0Ulef1FxKgVOckBGIDwzPW5AyAX2yW8w"
                />
                <div className="absolute -bottom-6 -left-6 bg-secondary text-white p-6 rounded-2xl shadow-xl max-w-[200px]">
                  <p className="text-3xl font-extrabold">10x</p>
                  <p className="text-xs opacity-90 font-medium">Lebih cepat merencanakan jadwal konten bulanan</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bento Section */}
        <section className="py-20 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-2 border border-outline-variant/10">
                <p className="text-4xl font-extrabold text-primary">5,000+</p>
                <p className="text-on-surface-variant font-medium">UMKM Digital Terbantu</p>
                <p className="text-xs text-outline">Meningkatkan konsistensi posting harian</p>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-2 border border-outline-variant/10">
                <p className="text-4xl font-extrabold text-secondary">1M+</p>
                <p className="text-on-surface-variant font-medium">Konten Terjadwal & Terpublikasi</p>
                <p className="text-xs text-outline">Instagram, TikTok, YouTube & Facebook</p>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-2 border border-outline-variant/10">
                <p className="text-4xl font-extrabold text-primary">4.9 / 5</p>
                <p className="text-on-surface-variant font-medium">Rating Kepuasan Pengguna</p>
                <p className="text-xs text-outline">Berdasarkan ulasan pemilik bisnis lokal</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-28 px-8">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-4xl font-bold tracking-tight text-on-background">
                Fitur Cerdas untuk Kreativitas Tanpa Batas
              </h2>
              <p className="text-on-surface-variant text-lg">
                Solusi lengkap yang dirancang khusus memahami kebutuhan para pemilik UMKM dan digital creator Indonesia.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Feature 1: Kalender Interaktif */}
              <div className="lg:col-span-7 bg-surface-container-high rounded-2xl overflow-hidden p-10 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">calendar_month</span>
                  <h3 className="text-3xl font-bold text-on-surface">Content Calendar Interaktif</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    Lihat roadmap konten mingguan dan bulanan dengan visualisasi label channel. Tidak ada lagi konten mendadak atau lupa jadwal posting.
                  </p>
                </div>
                <div className="pt-8">
                  <Link
                    to="/calendar"
                    className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                  >
                    Buka Kalender Konten <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Feature 2: Drag and Drop */}
              <div className="lg:col-span-5 bg-primary-container text-on-primary-container rounded-2xl p-10 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-white">drag_indicator</span>
                  <h3 className="text-2xl font-bold">Drag & Drop Planner</h3>
                  <p className="opacity-90 leading-relaxed text-sm">
                    Pindahkan ide konten antar tanggal dan status secepat kilat dengan antarmuka kanban yang sangat intuitif.
                  </p>
                </div>
                <div className="pt-8">
                  <Link
                    to="/calendar/drag-drop"
                    className="bg-white text-primary px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-100 transition-all inline-block"
                  >
                    Coba Planner
                  </Link>
                </div>
              </div>

              {/* Feature 3: Template Library */}
              <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl">auto_awesome_motion</span>
                </div>
                <h4 className="text-xl font-bold text-on-surface">50+ Library Template</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Pilihan desain siap pakai untuk bisnis Kuliner, Fashion, Jasa, Promo Diskon, hingga Edukasi Carousel.
                </p>
                <Link to="/templates" className="text-xs font-bold text-secondary inline-block hover:underline">
                  Jelajahi Template &rarr;
                </Link>
              </div>

              {/* Feature 4: Canva Transition */}
              <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">edit_note</span>
                </div>
                <h4 className="text-xl font-bold text-on-surface">Integrasi Desain Canva</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Buka dan edit langsung template pilihan Anda di Canva dengan satu klik tanpa perlu download manual.
                </p>
                <Link to="/templates/canva-transition" className="text-xs font-bold text-primary inline-block hover:underline">
                  Simulasi Buka Canva &rarr;
                </Link>
              </div>

              {/* Feature 5: Multi-Role & Secure Auth */}
              <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
                </div>
                <h4 className="text-xl font-bold text-on-surface">Multi-Role & Autentikasi</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Dukungan role Customer (UMKM) dan Admin Console dengan database PostgreSQL untuk pemantauan pesanan & data analitik.
                </p>
                <Link to="/login" className="text-xs font-bold text-tertiary inline-block hover:underline">
                  Login & Switch Role &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Teaser Section */}
        <section className="py-24 px-8 bg-surface-container-low">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary-fixed px-3 py-1 rounded-full">
              Paling Populer untuk UMKM
            </span>
            <h2 className="text-4xl font-extrabold text-on-surface">
              Paket Starter Hero — Hanya Rp 98.000 / bulan
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              Dapatkan kalender konten interaktif tanpa batas, 50+ template premium Canva, dan reminder jadwal posting instan.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/checkout/2"
                className="px-8 py-4 bg-gradient-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
              >
                Langganan Sekarang (Rp 98.000)
              </Link>
              <Link
                to="/pricing"
                className="px-6 py-4 bg-surface-container-highest text-on-surface font-semibold rounded-xl hover:bg-surface-dim transition-all"
              >
                Lihat Semua Paket
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
