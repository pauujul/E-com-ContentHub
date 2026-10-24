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
      .then(res => {
        if (res.success && res.data) {
          setPlans(res.data);
        }
      })
      .catch(err => {
        console.error('Failed to fetch pricing products:', err);
        setError('Gagal memuat katalog paket langganan.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPlan = (plan) => {
    navigate(`/checkout/${plan.id}`);
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (num === 0) return 'Rp 0';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />

      <main className="pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <header className="text-center mb-16 space-y-4">
          <span className="text-primary font-bold tracking-widest text-xs uppercase bg-primary-fixed px-3 py-1 rounded-full">
            Rencana Berlangganan SaaS UMKM
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-background">
            Pilih Paket yang Tepat untuk Bisnis Kamu
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
            Investasi terjangkau untuk perencanaan visual konten berkualitas tinggi yang meningkatkan penjualan dan engagement brand Anda.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-on-surface-variant text-sm font-semibold">Memuat paket langganan dari database...</p>
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
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
            {plans.map((plan) => {
              const isHero = plan.is_hero || plan.price === '98000.00';
              const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]');

              return (
                <div
                  key={plan.id}
                  className={`relative p-8 rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                    isHero
                      ? 'bg-surface-container-lowest shadow-[0_16px_40px_-6px_rgba(0,93,167,0.15)] border-2 border-primary transform md:scale-105 z-10'
                      : 'bg-surface-container-lowest border border-outline-variant/15 shadow-sm hover:shadow-md'
                  }`}
                >
                  {isHero && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-container text-white px-5 py-1 rounded-full text-xs font-bold tracking-wide shadow-md">
                      {plan.badge || 'PRODUK HERO TERLARIS'}
                    </div>
                  )}

                  <div>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-2xl font-bold text-on-surface">{plan.name}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-outline bg-surface-container-high px-2 py-0.5 rounded">
                          {plan.sku}
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-xs min-h-[36px] leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-8 p-4 bg-surface-container-low rounded-2xl">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-on-surface">{formatPrice(plan.price)}</span>
                        <span className="text-on-surface-variant text-sm font-semibold">
                          /{plan.billing_cycle.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-outline mt-1 font-medium">
                        {parseFloat(plan.price) === 0 ? 'Tanpa kartu kredit' : 'BCA Virtual Account, GoPay, QRIS'}
                      </p>
                    </div>

                    <div className="space-y-3 mb-8">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-outline block">
                        Fitur yang Anda dapatkan:
                      </span>
                      <ul className="space-y-3">
                        {features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm">
                            <span className="material-symbols-outlined text-green-600 text-lg flex-shrink-0">
                              check_circle
                            </span>
                            <span className={isHero ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all ${
                        isHero
                          ? 'bg-gradient-primary text-white shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95'
                          : 'bg-surface-container-highest text-on-surface hover:bg-surface-dim'
                      }`}
                    >
                      {parseFloat(plan.price) === 0 ? 'Mulai Gratis Sekarang' : `Pilih ${plan.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Feature Comparison Table */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-10 text-on-surface">Bandingkan Seluruh Fitur</h2>
          <div className="overflow-x-auto rounded-3xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/15">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/15">
                  <th className="py-5 px-4 text-sm font-bold text-on-surface-variant">Fitur Utama Platform</th>
                  <th className="py-5 px-4 text-sm font-bold text-center">Free (Rp 0)</th>
                  <th className="py-5 px-4 text-sm font-bold text-center text-primary font-extrabold">
                    Starter Hero (Rp 98rb)
                  </th>
                  <th className="py-5 px-4 text-sm font-bold text-center">Pro Tahunan (Rp 898rb)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                <tr>
                  <td className="py-4 px-4 font-semibold text-on-surface">Kalender Konten Interaktif</td>
                  <td className="py-4 px-4 text-center">1 Kalender</td>
                  <td className="py-4 px-4 text-center font-bold text-primary">Drag & Drop Lengkap</td>
                  <td className="py-4 px-4 text-center font-bold">Multi-Workspace</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-on-surface">Akses Library Template</td>
                  <td className="py-4 px-4 text-center">3 Template</td>
                  <td className="py-4 px-4 text-center font-bold text-primary">50+ Template UMKM</td>
                  <td className="py-4 px-4 text-center font-bold">200+ Template Premium</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-on-surface">Integrasi Editor Canva</td>
                  <td className="py-4 px-4 text-center">Terbatas</td>
                  <td className="py-4 px-4 text-center font-bold text-primary">1-Click Direct Transition</td>
                  <td className="py-4 px-4 text-center font-bold">Prioritas High-Res Sync</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-on-surface">Akun Media Sosial</td>
                  <td className="py-4 px-4 text-center">1 Akun</td>
                  <td className="py-4 px-4 text-center font-bold text-primary">Hingga 5 Akun</td>
                  <td className="py-4 px-4 text-center font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-on-surface">Reminder & Notifikasi Jadwal</td>
                  <td className="py-4 px-4 text-center text-slate-400">—</td>
                  <td className="py-4 px-4 text-center font-bold text-primary">Aktif 24 Jam</td>
                  <td className="py-4 px-4 text-center font-bold">Aktif + Analitik</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-on-surface">Customer Support</td>
                  <td className="py-4 px-4 text-center">Komunitas</td>
                  <td className="py-4 px-4 text-center font-bold text-primary">Prioritas WA / CS</td>
                  <td className="py-4 px-4 text-center font-bold">24/7 Dedicated Manager</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
