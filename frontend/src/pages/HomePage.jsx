import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PricingSection from '../components/PricingSection';
import HeroCarousel from '../components/HeroCarousel';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />

      <main className="pt-16">
        {/* Dynamic Hero Carousel CMS Section */}
        <HeroCarousel />

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
                <h3 className="text-xl font-bold text-on-surface">50+ Library Template</h3>
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
                <h3 className="text-xl font-bold text-on-surface">Integrasi Desain Canva</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Buka dan sesuaikan template desain langsung melalui{' '}
                  <a
                    href="https://www.canva.com/id_id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline"
                  >
                    Canva
                  </a>{' '}
                  dengan satu klik tanpa perlu download manual.
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
                <h3 className="text-xl font-bold text-on-surface">Multi-Role & Autentikasi</h3>
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

        {/* 3-Tier Subscription Pricing Section (Posisi tepat sebelum Footer) */}
        <PricingSection
          id="pricing"
          className="bg-surface-container-low/40"
        />
      </main>

      <Footer />
    </div>
  );
}
