import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Default fallback plans if API/database is slow or offline
const defaultPlans = [
  {
    id: 1,
    sku: 'CH-FREE',
    name: 'ContentHub Free',
    description: 'Paket awal tanpa biaya untuk UMKM yang baru mulai merencanakan dan menjadwalkan konten media sosial.',
    price: '0.00',
    billing_cycle: 'Free',
    badge: 'Akses Gratis',
    is_hero: false,
    features: [
      'Maksimal 3 Agenda Konten / Minggu',
      'Template Library Basic (Free)',
      '1 Akun Media Sosial',
      'Export Kalender ke Gambar',
      'Komunitas UMKM',
    ],
  },
  {
    id: 2,
    sku: 'CH-PRO-3M',
    name: 'ContentHub Pro',
    description: 'Solusi paling praktis dan terlaris bagi pelaku UMKM yang membutuhkan kalender interaktif drag-and-drop dan puluhan template Canva siap pakai.',
    price: '199000.00',
    billing_cycle: '3 Bulan',
    badge: 'Paling Sesuai untuk UMKM',
    is_hero: true,
    features: [
      'Semua Fitur Paket Trial Free',
      'Kalender Drag & Drop Interaktif Penuh',
      '50+ Library Template Konten Siap Pakai',
      'Direct Integration & Editor Canva Pro',
      'Pengingat Jadwal Posting (Email Alert)',
      'Hingga 5 Akun Media Sosial Terhubung',
      'Customer Support Prioritas via WhatsApp',
    ],
  },
  {
    id: 3,
    sku: 'CH-PLUS-1Y',
    name: 'ContentHub Plus',
    description: 'Paket komprehensif tahunan untuk UMKM berkembang dengan frekuensi konten tinggi, multi-admin, dan analitik jadwal posting.',
    price: '699000.00',
    billing_cycle: '1 Tahun',
    badge: 'Paling Hemat',
    is_hero: false,
    features: [
      'Semua Fitur Starter Bulanan',
      'Akses 200+ Template Premium Canva',
      'Akun Media Sosial Tanpa Batas',
      'Analytics & Estimasi Performa Jadwal',
      'Persiapan Integrasi AI Copywriting Assistant',
      'Dukungan Multi-User Team (Hingga 3 Orang)',
      'Hemat 24% Dibandingkan Bayar Bulanan',
    ],
  },
];

/**
 * Reusable 3-Tier Pricing Component for ContentHub
 * Connected dynamically to Neon PostgreSQL / database subscription_plans table.
 * Supports standard landing page layout and compact modal layout.
 */
export default function PricingSection({
  showHeader = true,
  badgeText = 'Katalog Paket Langganan ContentHub SaaS',
  title = 'Investasi Cerdas untuk Konten Berkualitas Tinggi',
  subtitle = 'Pilih paket langganan yang transparan sesuai skala usaha Anda. Dilengkapi integrasi penuh kalender editorial interaktif dan ratusan template visual Canva siap pakai.',
  showSupportBanner = false,
  compact = false,
  className = '',
  id = 'pricing',
  onSelectPlan = null,
}) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Safe navigation hook in case router context is missing
  let navigate = null;
  try {
    navigate = useNavigate();
  } catch (e) {
    navigate = null;
  }

  const fetchPlans = () => {
    setLoading(true);
    setError(null);
    api.getProducts()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Filter out Enterprise and inactive plans to maintain the 3-Tier layout (Free, Pro, Plus)
          const filtered = res.data.filter(
            (p) => p.sku !== 'CH-ENT-Y' && !p.name?.toLowerCase().includes('enterprise') && p.is_active !== false
          );
          // Sort by price ascending: Free (Rp 0), Pro (Rp 199.000), Plus (Rp 699.000)
          filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          if (filtered.length > 0) {
            setPlans(filtered);
          } else {
            setPlans(defaultPlans);
          }
        } else {
          setPlans(defaultPlans);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch pricing products:', err);
        // Fallback to default plans so user never sees empty screen
        setPlans(defaultPlans);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    if (typeof onSelectPlan === 'function') {
      onSelectPlan(plan);
      return;
    }
    const targetUrl = !currentUser
      ? `/login?redirect=${encodeURIComponent(`/checkout/${plan.id}`)}`
      : `/checkout/${plan.id}`;

    if (navigate) {
      navigate(targetUrl);
    } else {
      window.location.href = targetUrl;
    }
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (isNaN(num) || num === 0) return 'Rp 0';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  const formatBillingCycle = (cycle, price) => {
    const num = parseFloat(price);
    if (isNaN(num) || num === 0) return '';
    if (!cycle) return '';
    const clean = cycle.trim().toLowerCase();
    if (clean.startsWith('/')) return ` ${clean}`;
    return ` / ${clean}`;
  };

  return (
    <section id={id} className={`w-full ${compact ? 'py-2 px-1' : 'py-20 px-6 md:px-12'} ${className}`}>
      <div className={compact ? 'w-full' : 'max-w-7xl mx-auto'}>
        {/* Header Section */}
        {showHeader && (
          <header className="text-center mb-16 space-y-4">
            <span className="text-primary font-bold tracking-widest text-xs uppercase bg-primary-fixed px-3.5 py-1.5 rounded-full inline-block">
              {badgeText}
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-background">
              {title}
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              {subtitle}
            </p>
          </header>
        )}

        {/* Loading State */}
        {loading && (
          <div className={`text-center ${compact ? 'py-12' : 'py-20'}`}>
            <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-primary border-t-transparent"></div>
            <p className="mt-3 text-on-surface-variant text-xs sm:text-sm font-semibold">
              Memuat data paket langganan dari database PostgreSQL/Neon...
            </p>
          </div>
        )}

        {/* Error State with Retry Button */}
        {error && !loading && (
          <div className="text-center py-8 px-6 bg-red-50 text-red-700 rounded-2xl max-w-xl mx-auto border border-red-200">
            <span className="material-symbols-outlined text-3xl text-red-500 mb-1">error</span>
            <p className="font-bold text-xs sm:text-sm mb-1">{error}</p>
            <p className="text-xs text-red-600 mb-3">Pastikan koneksi database aktif.</p>
            <button
              type="button"
              onClick={fetchPlans}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Coba Muat Ulang
            </button>
          </div>
        )}

        {/* 3-Tier Pricing Cards Grid */}
        {!loading && (
          <div
            className={`items-stretch justify-center ${
              compact
                ? 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 w-full'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto'
            }`}
          >
            {(plans.length > 0 ? plans : defaultPlans).map((plan) => {
              // Highlight Pro card in the center with distinctive blue border and elevated elevation
              const isHero = Boolean(
                plan.is_hero ||
                plan.sku === 'CH-PRO-3M' ||
                plan.sku === 'CH-START-M' ||
                plan.name?.toLowerCase().includes('pro')
              );

              // Parse features safely
              const features = Array.isArray(plan.features)
                ? plan.features
                : typeof plan.features === 'string'
                ? (() => {
                    try {
                      return JSON.parse(plan.features);
                    } catch (e) {
                      return [plan.features];
                    }
                  })()
                : [];

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between transition-all duration-300 ${
                    compact ? 'p-5 rounded-2xl' : 'p-8 rounded-3xl'
                  } ${
                    isHero
                      ? compact
                        ? 'bg-white shadow-lg shadow-primary/15 border-2 border-primary z-10'
                        : 'bg-white shadow-[0_20px_45px_-6px_rgba(0,93,167,0.22)] border-2 border-primary z-10 md:scale-105'
                      : 'bg-white border border-outline-variant/20 shadow-sm hover:shadow-lg hover:border-outline-variant/40'
                  }`}
                >
                  {/* Floating Top Badge for Pro Hero Card */}
                  {isHero && (
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-extrabold tracking-wide shadow-md uppercase whitespace-nowrap ${
                        compact ? '-top-3 px-3 py-0.5 text-[9px]' : '-top-3.5 px-4 py-1 text-[11px]'
                      }`}
                    >
                      {plan.badge || 'Paling Sesuai untuk UMKM'}
                    </div>
                  )}

                  <div>
                    {/* Plan Header */}
                    <div className={compact ? 'mb-3' : 'mb-6'}>
                      <div className="flex justify-between items-center mb-1 gap-2">
                        <h3 className={`${compact ? 'text-base' : 'text-xl'} font-extrabold text-on-surface`}>
                          {plan.name}
                        </h3>
                        {plan.badge && !isHero ? (
                          <span
                            className={`${
                              compact ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-0.5'
                            } font-extrabold uppercase tracking-wider text-primary bg-primary/10 rounded-full`}
                          >
                            {plan.badge}
                          </span>
                        ) : !isHero && plan.sku ? (
                          <span
                            className={`${
                              compact ? 'text-[8px] px-1.5 py-0.5' : 'text-[9px] px-2 py-0.5'
                            } font-extrabold uppercase tracking-wider text-outline bg-surface-container-high rounded`}
                          >
                            {plan.sku}
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={`text-on-surface-variant text-xs ${
                          compact ? 'min-h-[36px] line-clamp-2 mt-1' : 'min-h-[44px] mt-2'
                        } leading-relaxed`}
                      >
                        {plan.description}
                      </p>
                    </div>

                    {/* Price & Billing Cycle Box */}
                    <div
                      className={`${
                        compact ? 'mb-3 p-3' : 'mb-6 p-4'
                      } rounded-2xl bg-surface-container-low flex items-baseline gap-1`}
                    >
                      <span className={`${compact ? 'text-xl sm:text-2xl' : 'text-3xl'} font-extrabold text-on-surface`}>
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-xs font-semibold text-outline">
                        {formatBillingCycle(plan.billing_cycle, plan.price)}
                      </span>
                    </div>

                    {/* Feature Checklist */}
                    <div className={compact ? 'space-y-2 mb-4' : 'space-y-3 mb-8'}>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-outline block">
                        Fitur Termasuk:
                      </span>
                      <ul className={compact ? 'space-y-1.5 text-[11px]' : 'space-y-2.5 text-xs'}>
                        {(compact ? features.slice(0, 5) : features).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-primary text-sm flex-shrink-0 mt-0.5">
                              check_circle
                            </span>
                            <span className="leading-tight">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className={`${compact ? 'pt-2.5' : 'pt-4'} border-t border-slate-100 mt-auto`}>
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full ${
                        compact ? 'py-2.5 text-xs' : 'py-3.5 text-sm'
                      } rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isHero
                          ? 'bg-gradient-to-r from-primary to-primary-container text-white shadow-md shadow-primary/25 hover:scale-[1.02] active:scale-95'
                          : 'bg-primary text-white hover:bg-primary/90 hover:scale-[1.01] active:scale-95'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">bolt</span>
                      {parseFloat(plan.price) === 0
                        ? (compact ? 'Paket Free (Aktif)' : 'Aktivasi Gratis')
                        : `Pilih Paket ${plan.name.replace(/ContentHub\s*/i, '')}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Customer Care & Assistance Banner (Optional) */}
        {showSupportBanner && !compact && (
          <div className="p-8 bg-surface-container-low rounded-3xl border border-outline-variant/15 flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto shadow-xs">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-base font-extrabold text-on-surface">
                Butuh Bantuan Memilih Paket atau Konsultasi Penggunaan?
              </h4>
              <p className="text-xs text-on-surface-variant">
                Tim Customer Care ContentHub siap mendampingi Anda memaksimalkan perencanaan konten usaha.
              </p>
            </div>
            {navigate ? (
              <Link
                to="/help"
                className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shadow-xs"
              >
                Buka Pusat Bantuan
              </Link>
            ) : (
              <a
                href="/help"
                className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shadow-xs"
              >
                Buka Pusat Bantuan
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
