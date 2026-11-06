import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getProducts()
      .then((res) => {
        if (res.success && res.data) {
          // Filter out Enterprise and inactive plans
          const filtered = res.data.filter(
            (p) => p.sku !== 'CH-ENT-Y' && !p.name?.toLowerCase().includes('enterprise') && p.is_active !== false
          );
          setPlans(filtered);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch pricing products:', err);
        setError('Gagal memuat katalog paket langganan dari database.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPlan = (plan) => {
    navigate(`/checkout/${plan.id}`);
  };

  const handleAddToCart = (plan) => {
    addToCart(plan);
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (num === 0) return 'Rp 0';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between">
      <Navbar />

      <main className="pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex-1 w-full">
        <header className="text-center mb-16 space-y-4">
          <span className="text-primary font-bold tracking-widest text-xs uppercase bg-primary-fixed px-3 py-1 rounded-full">
            Katalog Paket Langganan ContentHub SaaS
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-background">
            Investasi Cerdas untuk Konten Berkualitas Tinggi
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-sm md:text-base">
            Pilih paket langganan yang transparan sesuai skala usaha Anda. Dilengkapi integrasi penuh kalender editorial interaktif dan ratusan template visual Canva siap pakai.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-on-surface-variant text-sm font-semibold">Memuat paket langganan dari database PostgreSQL/Neon...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 text-red-700 rounded-2xl max-w-xl mx-auto border border-red-200">
            <p className="font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-20 max-w-5xl mx-auto justify-center">
            {plans.map((plan) => {
              const isHero = plan.is_hero || plan.sku === 'CH-START-M';
              const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]');

              return (
                <div
                  key={plan.id}
                  className={`relative p-7 rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                    isHero
                      ? 'bg-white shadow-[0_16px_40px_-6px_rgba(0,93,167,0.2)] border-2 border-primary z-10'
                      : 'bg-white border border-outline-variant/20 shadow-sm hover:shadow-lg'
                  }`}
                >
                  {isHero && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-container text-white px-4 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide shadow-md uppercase">
                      {plan.badge || 'PRODUK HERO TERLARIS'}
                    </div>
                  )}

                  <div>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-xl font-extrabold text-on-surface">{plan.name}</h3>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-outline bg-surface-container-high px-2 py-0.5 rounded">
                          {plan.sku}
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-xs min-h-[48px] leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-6 p-4 rounded-2xl bg-surface-container-low flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-on-surface">{formatPrice(plan.price)}</span>
                      <span className="text-xs font-semibold text-outline">
                        {plan.price === '0.00' ? '' : `/${plan.billing_cycle.toLowerCase()}`}
                      </span>
                    </div>

                    <div className="space-y-3 mb-8">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-outline block">
                        Fitur Termasuk:
                      </span>
                      <ul className="space-y-2 text-xs">
                        {features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-primary text-base flex-shrink-0">check_circle</span>
                            <span className="leading-tight">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isHero
                          ? 'bg-gradient-primary text-white shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95'
                          : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">bolt</span>
                      {plan.price === '0.00' ? 'Aktivasi Gratis' : 'Checkout Sekarang'}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Customer Care & Assistance Banner */}
        <div className="p-8 bg-surface-container-low rounded-3xl border border-outline-variant/15 flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto shadow-xs">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-extrabold text-on-surface">Butuh Bantuan Memilih Paket atau Konsultasi Penggunaan?</h4>
            <p className="text-xs text-on-surface-variant">Tim Customer Care ContentHub siap mendampingi Anda memaksimalkan perencanaan konten usaha.</p>
          </div>
          <Link
            to="/help"
            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shadow-xs"
          >
            Buka Pusat Bantuan
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
