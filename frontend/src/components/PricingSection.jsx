import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable 3-Tier Pricing Component for ContentHub
 * Connected dynamically to Neon PostgreSQL / database subscription_plans table.
 */
export default function PricingSection({
  showHeader = true,
  badgeText = 'Katalog Paket Langganan ContentHub SaaS',
  title = 'Investasi Cerdas untuk Konten Berkualitas Tinggi',
  subtitle = 'Pilih paket langganan yang transparan sesuai skala usaha Anda. Dilengkapi integrasi penuh kalender editorial interaktif dan ratusan template visual Canva siap pakai.',
  showSupportBanner = false,
  className = '',
  id = 'pricing',
  onSelectPlan = null,
}) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchPlans = () => {
    setLoading(true);
    setError(null);
    api.getProducts()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          // Filter out Enterprise and inactive plans to maintain the 3-Tier layout (Free, Pro, Plus)
          const filtered = res.data.filter(
            (p) => p.sku !== 'CH-ENT-Y' && !p.name?.toLowerCase().includes('enterprise') && p.is_active !== false
          );
          // Sort by price ascending: Free (Rp 0), Pro (Rp 199.000), Plus (Rp 699.000)
          filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          setPlans(filtered);
        } else {
          setError('Format data paket langganan tidak sesuai.');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch pricing products:', err);
        setError('Gagal memuat katalog paket langganan dari database PostgreSQL/Neon.');
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
    if (!currentUser) {
      navigate(`/login?redirect=${encodeURIComponent(`/checkout/${plan.id}`)}`);
      return;
    }
    navigate(`/checkout/${plan.id}`);
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
    <section id={id} className={`py-20 px-6 md:px-12 w-full ${className}`}>
      <div className="max-w-7xl mx-auto">
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
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-on-surface-variant text-sm font-semibold">
              Memuat data paket langganan dari database PostgreSQL/Neon...
            </p>
          </div>
        )}

        {/* Error State with Retry Button */}
        {error && !loading && (
          <div className="text-center py-10 px-6 bg-red-50 text-red-700 rounded-2xl max-w-xl mx-auto border border-red-200">
            <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
            <p className="font-bold text-sm mb-1">{error}</p>
            <p className="text-xs text-red-600 mb-4">Pastikan koneksi database aktif.</p>
            <button
              onClick={fetchPlans}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Coba Muat Ulang
            </button>
          </div>
        )}

        {/* 3-Tier Pricing Cards Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-16 max-w-5xl mx-auto justify-center">
            {plans.map((plan) => {
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
                  className={`relative p-8 rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                    isHero
                      ? 'bg-white shadow-[0_20px_45px_-6px_rgba(0,93,167,0.22)] border-2 border-primary z-10 md:scale-105'
                      : 'bg-white border border-outline-variant/20 shadow-sm hover:shadow-lg hover:border-outline-variant/40'
                  }`}
                >
                  {/* Floating Top Badge for Pro Hero Card */}
                  {isHero && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-container text-white px-4 py-1 rounded-full text-[11px] font-extrabold tracking-wide shadow-md uppercase whitespace-nowrap">
                      {plan.badge || 'Paling Sesuai untuk UMKM'}
                    </div>
                  )}

                  <div>
                    {/* Plan Header */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-1 gap-2">
                        <h3 className="text-xl font-extrabold text-on-surface">{plan.name}</h3>
                        {plan.badge && !isHero ? (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                            {plan.badge}
                          </span>
                        ) : !isHero && plan.sku ? (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-outline bg-surface-container-high px-2 py-0.5 rounded">
                            {plan.sku}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-on-surface-variant text-xs min-h-[44px] leading-relaxed mt-2">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price & Billing Cycle Box */}
                    <div className="mb-6 p-4 rounded-2xl bg-surface-container-low flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-on-surface">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-xs font-semibold text-outline">
                        {formatBillingCycle(plan.billing_cycle, plan.price)}
                      </span>
                    </div>

                    {/* Feature Checklist */}
                    <div className="space-y-3 mb-8">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-outline block">
                        Fitur Termasuk:
                      </span>
                      <ul className="space-y-2.5 text-xs">
                        {features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-on-surface-variant">
                            <span className="material-symbols-outlined text-primary text-base flex-shrink-0">
                              check_circle
                            </span>
                            <span className="leading-tight">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isHero
                          ? 'bg-gradient-to-r from-primary to-primary-container text-white shadow-md shadow-primary/25 hover:scale-[1.02] active:scale-95'
                          : 'bg-primary text-white hover:bg-primary/90 hover:scale-[1.01] active:scale-95'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">bolt</span>
                      {parseFloat(plan.price) === 0
                        ? 'Aktivasi Gratis'
                        : `Pilih Paket ${plan.name.replace(/ContentHub\s*/i, '')}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Customer Care & Assistance Banner (Optional) */}
        {showSupportBanner && (
          <div className="p-8 bg-surface-container-low rounded-3xl border border-outline-variant/15 flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto shadow-xs">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-base font-extrabold text-on-surface">
                Butuh Bantuan Memilih Paket atau Konsultasi Penggunaan?
              </h4>
              <p className="text-xs text-on-surface-variant">
                Tim Customer Care ContentHub siap mendampingi Anda memaksimalkan perencanaan konten usaha.
              </p>
            </div>
            <Link
              to="/help"
              className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shadow-xs"
            >
              Buka Pusat Bantuan
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
