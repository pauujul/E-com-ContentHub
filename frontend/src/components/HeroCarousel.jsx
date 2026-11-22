import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    title: 'Buat Konten Konsisten Tanpa Stres',
    subtitle: 'Ubah cara Anda mengelola media sosial. Dari ide, perancangan kalender interaktif, hingga template siap pakai Canva untuk mengelola semuanya dalam satu platform terpadu.',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    cta_text: 'Pilih Paket Langganan',
    cta_link: '#pricing',
    order_index: 1,
    is_active: true,
  },
  {
    id: 2,
    title: 'Rancang Strategi Visual Bersama Canva',
    subtitle: 'Integrasi langsung ke ekosistem Canva Pro dengan 200+ template terkurasi khusus persona UMKM Indonesia. Desain cepat, rapi, dan langsung tersinkron ke kalender.',
    image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
    cta_text: 'Jelajahi Template',
    cta_link: '/templates',
    order_index: 2,
    is_active: true,
  },
  {
    id: 3,
    title: 'Otomasi Jadwal & Notifikasi Jam Emas',
    subtitle: 'Maksimalkan jangkauan audiens dengan penjadwalan tepat waktu. Notifikasi email otomatis mengingatkan jadwal posting Instagram & TikTok Anda.',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    cta_text: 'Coba Kalender Demo',
    cta_link: '/calendar',
    order_index: 3,
    is_active: true,
  },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState(DEFAULT_HERO_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Fetch active hero slides from API (di background agar render awal instan tanpa delay 1 detik)
  useEffect(() => {
    let isMounted = true;
    const fetchSlides = async () => {
      try {
        const res = await api.getHeroSlides();
        if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setSlides(res.data);
        }
      } catch (err) {
        console.warn('Hero slides API fallback ke slide default:', err.message);
      }
    };

    fetchSlides();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-slide effect (interval 5 detik)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused, currentIndex]);

  const handlePrev = () => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  // Helper untuk rendering tombol CTA
  const renderCtaButton = (text, link) => {
    if (!text || !link) {
      return (
        <a
          href="#pricing"
          className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-center inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Pilih Paket Langganan</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
      );
    }

    const isHash = link.startsWith('#');
    const isExternal = link.startsWith('http://') || link.startsWith('https://');
    const btnClasses =
      'px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-center inline-flex items-center gap-2 cursor-pointer';

    if (isHash) {
      return (
        <a href={link} className={btnClasses}>
          <span>{text}</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
      );
    }

    if (isExternal) {
      return (
        <a href={link} target="_blank" rel="noopener noreferrer" className={btnClasses}>
          <span>{text}</span>
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      );
    }

    return (
      <Link to={link} className={btnClasses}>
        <span>{text}</span>
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </Link>
    );
  };

  // ==========================================
  // FALLBACK VIEW (Jika slide kosong / loading / dinonaktifkan semua)
  // ==========================================
  if (!loading && slides.length === 0) {
    return (
      <section className="relative overflow-hidden pt-20 pb-32 px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              Platform Manajemen Konten Terpadu
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-on-background leading-[1.1]">
              Buat Konten <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Konsisten</span> Tanpa Stres
            </h1>

            <p className="text-xl text-on-surface-variant leading-relaxed max-w-xl">
              Ubah cara Anda mengelola media sosial. Dari ide, perancangan kalender interaktif, hingga template siap pakai Canva untuk mengelola semuanya dalam satu platform terpadu.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="#pricing"
                className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-center"
              >
                Pilih Paket Langganan
              </a>
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
                className="rounded-xl w-full h-[400px] object-cover"
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
              />
              <div className="absolute -bottom-6 -left-6 bg-secondary text-white p-6 rounded-2xl shadow-xl max-w-[200px]">
                <p className="text-3xl font-extrabold">10x</p>
                <p className="text-xs opacity-90 font-medium">Lebih cepat merencanakan jadwal konten bulanan</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // DYNAMIC HERO CAROUSEL VIEW
  // ==========================================
  const currentSlide = slides[currentIndex] || slides[0] || {};

  return (
    <section
      className="relative overflow-hidden pt-16 pb-28 px-4 sm:px-8 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center min-h-[480px]">
          {/* Kolom Teks & CTA (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">stars</span>
              <span>ContentHub Highlight</span>
              {slides.length > 1 && (
                <span className="text-[11px] font-mono bg-white/80 px-2 py-0.5 rounded-full text-primary border border-primary/20">
                  {currentIndex + 1} / {slides.length}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-background leading-[1.15] sm:leading-[1.1]">
              {currentSlide.title || 'Platform Manajemen Konten Terpadu'}
            </h1>

            {currentSlide.subtitle && (
              <p className="text-lg sm:text-xl text-on-surface-variant leading-relaxed max-w-xl">
                {currentSlide.subtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              {renderCtaButton(currentSlide.cta_text, currentSlide.cta_link)}

              <Link
                to="/calendar"
                className="px-8 py-4 bg-surface-container-highest text-primary rounded-2xl font-bold hover:bg-surface-container-high transition-all flex items-center gap-2 justify-center cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined">calendar_month</span>
                <span>Coba Kalender Demo</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-on-surface-variant pt-2">
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Akses Instan
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                BCA VA & E-Wallet
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Support Prioritas UMKM
              </span>
            </div>
          </div>

          {/* Kolom Visual Banner Slide (Right 5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-4 bg-primary/15 rounded-[2.5rem] blur-2xl"></div>

            <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl p-3 border border-outline-variant/20 overflow-hidden transform lg:hover:scale-[1.02] transition-transform duration-500">
              <div className="relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden bg-slate-100">
                <img
                  key={currentSlide.id || currentIndex}
                  src={
                    currentSlide.image_url ||
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
                  }
                  alt={currentSlide.title || 'ContentHub Hero'}
                  className="w-full h-full object-cover object-center transition-all duration-700 ease-out animate-in fade-in zoom-in-95"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Info Overlay di atas gambar */}
                <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
                  <p className="text-xs font-bold truncate">{currentSlide.title}</p>
                  <p className="text-[10px] text-white/80 truncate">
                    {currentSlide.cta_text ? `Aksi: ${currentSlide.cta_text}` : 'Promo & Penawaran ContentHub'}
                  </p>
                </div>
              </div>

              {/* Stat floating box */}
              <div className="absolute -bottom-4 -left-4 bg-secondary text-white p-4 sm:p-5 rounded-2xl shadow-xl max-w-[190px] border border-white/10">
                <p className="text-2xl sm:text-3xl font-extrabold">10x</p>
                <p className="text-[11px] opacity-90 font-medium">Lebih cepat merencanakan jadwal konten UMKM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Bottom Controls & Indicators */}
        {slides.length > 1 && (
          <div className="flex items-center justify-between pt-12 sm:pt-16">
            {/* Tombol Panah Kiri */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Slide sebelumnya"
              className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-primary shadow-md hover:shadow-lg border border-slate-200/80 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">navigate_before</span>
            </button>

            {/* Indikator Titik (Pagination Dots) */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-slate-200/60 shadow-xs">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => handleDotClick(idx)}
                  aria-label={`Buka slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx
                      ? 'w-8 bg-primary shadow-xs'
                      : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            {/* Tombol Panah Kanan */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Slide berikutnya"
              className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-primary shadow-md hover:shadow-lg border border-slate-200/80 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">navigate_next</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
