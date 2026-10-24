import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PaymentMethodPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [selectedMethod, setSelectedMethod] = useState('Virtual Account');
  const [selectedChannel, setSelectedChannel] = useState('BCA Virtual Account');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.getProducts()
      .then(res => {
        if (res.success && res.data) {
          const targetId = planId ? parseInt(planId, 10) : 2; // Default hero product Rp98k (id 2)
          const matched = res.data.find(p => p.id === targetId) || res.data[1] || res.data[0];
          setPlan(matched);
        }
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setErrorMsg('Gagal memuat detail paket langganan.');
      })
      .finally(() => setLoading(false));
  }, [planId]);

  const handleCheckout = async () => {
    if (!plan) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        user_id: currentUser?.id || 2,
        plan_id: plan.id,
        payment_method: selectedMethod,
        payment_channel: selectedChannel
      };

      const result = await api.createOrder(orderPayload);
      if (result.success && result.data?.order) {
        const orderNumber = result.data.order.order_number;
        // Jika paket berbayar, arahkan ke halaman detail transaksi & invoice
        if (parseFloat(plan.price) === 0) {
          navigate(`/payment-confirmation/${orderNumber}`);
        } else {
          navigate(`/transactions/${orderNumber}`);
        }
      } else {
        throw new Error(result.message || 'Gagal membuat pesanan.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  const planPriceNum = plan ? parseFloat(plan.price) : 98000;
  const isFree = planPriceNum === 0;

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />

      <main className="pt-24 pb-20 px-6 md:px-16 max-w-7xl mx-auto">
        {/* Progress Step Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
          <div className="flex items-center gap-4">
            <Link
              to="/pricing"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">Pilih Metode Pembayaran</h1>
              <p className="text-xs text-on-surface-variant mt-0.5">Selesaikan langganan untuk mengaktifkan fitur otomatis.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-outline">Langkah 2 dari 2: Checkout</span>
            <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="w-full h-full bg-primary"></div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            <p className="mt-3 text-xs font-semibold text-outline">Menyiapkan invoice pemesanan...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Area: Payment Selection */}
            <div className="flex-1 space-y-10">
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-200">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errorMsg}
                </div>
              )}

              {/* Virtual Account Group */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-outline">
                    Virtual Account (Otomatis Terverifikasi)
                  </h3>
                  <span className="h-px flex-1 bg-outline-variant/20 ml-4"></span>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'BCA Virtual Account', channel: 'BCA Virtual Account', icon: 'account_balance' },
                    { name: 'Mandiri Virtual Account', channel: 'Mandiri Virtual Account', icon: 'account_balance' },
                    { name: 'BRI Virtual Account', channel: 'BRI Virtual Account', icon: 'account_balance' }
                  ].map(va => (
                    <label
                      key={va.channel}
                      className={`flex items-center p-4 bg-surface-container-lowest rounded-2xl border cursor-pointer transition-all hover:bg-surface-container-low ${
                        selectedChannel === va.channel && selectedMethod === 'Virtual Account'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-outline-variant/15'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={selectedChannel === va.channel && selectedMethod === 'Virtual Account'}
                        onChange={() => {
                          setSelectedMethod('Virtual Account');
                          setSelectedChannel(va.channel);
                        }}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center mr-4 text-primary">
                        <span className="material-symbols-outlined text-xl">{va.icon}</span>
                      </div>
                      <div className="flex-1">
                        <span className="block font-bold text-sm text-on-surface">{va.name}</span>
                        <span className="text-xs text-on-surface-variant">Konfirmasi otomatis tanpa upload struk</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedChannel === va.channel ? 'border-primary' : 'border-outline-variant'
                      }`}>
                        {selectedChannel === va.channel && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* E-Wallets */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-outline">
                    E-Wallet & QRIS Instan
                  </h3>
                  <span className="h-px flex-1 bg-outline-variant/20 ml-4"></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'GoPay QRIS', channel: 'GoPay', method: 'E-Wallet', desc: 'Scan via aplikasi Gojek' },
                    { name: 'OVO', channel: 'OVO', method: 'E-Wallet', desc: 'Notifikasi ponsel OVO' },
                    { name: 'DANA', channel: 'DANA', method: 'E-Wallet', desc: 'Konfirmasi via DANA' }
                  ].map(ew => (
                    <label
                      key={ew.channel}
                      className={`p-4 bg-surface-container-lowest rounded-2xl border cursor-pointer transition-all ${
                        selectedChannel === ew.channel
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-outline-variant/15 hover:bg-surface-container-low'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={selectedChannel === ew.channel}
                        onChange={() => {
                          setSelectedMethod(ew.method);
                          setSelectedChannel(ew.channel);
                        }}
                        className="hidden"
                      />
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold uppercase text-primary">{ew.name}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedChannel === ew.channel ? 'border-primary' : 'border-outline-variant'
                        }`}>
                          {selectedChannel === ew.channel && (
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-tight">{ew.desc}</p>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Sidebar: Ringkasan Langganan & CTA */}
            <aside className="w-full lg:w-[380px]">
              <div className="sticky top-28 bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/15 shadow-sm space-y-6">
                <h3 className="text-lg font-extrabold text-on-surface">Ringkasan Pemesanan</h3>

                {/* Plan Card */}
                <div className="flex items-start gap-3.5 p-4 bg-white rounded-2xl border border-outline-variant/15">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                  </div>
                  <div className="flex-1">
                    <span className="block font-bold text-sm text-on-surface">{plan?.name}</span>
                    <span className="text-xs text-on-surface-variant">Siklus: {plan?.billing_cycle}</span>
                  </div>
                  <Link to="/pricing" className="text-xs font-bold text-primary hover:underline">
                    Ubah
                  </Link>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Harga Paket</span>
                    <span className="font-semibold text-on-surface">
                      Rp {planPriceNum.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Biaya Layanan Payment Gateway</span>
                    <span className="font-semibold text-green-600">Gratis (Rp 0)</span>
                  </div>
                  <div className="h-px bg-outline-variant/30 my-2"></div>
                  <div className="flex justify-between items-end pt-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">Total Tagihan:</span>
                      <span className="text-2xl font-extrabold text-primary">
                        Rp {planPriceNum.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <span className="text-xs text-outline font-semibold">/{plan?.billing_cycle.toLowerCase()}</span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <div className="space-y-3">
                  <div className="flex gap-2.5 p-3.5 bg-primary/5 rounded-xl border border-primary/10 text-xs text-on-primary-fixed-variant">
                    <span className="material-symbols-outlined text-primary text-base flex-shrink-0">verified_user</span>
                    <p className="leading-relaxed">
                      Transaksi terhubung langsung ke database PostgreSQL ContentHub.
                    </p>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-primary text-white font-bold rounded-2xl text-sm shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Membuat Pesanan...</span>
                      </>
                    ) : (
                      <>
                        <span>{isFree ? 'Aktivasi Paket Gratis' : 'Pilih & Lanjutkan Bayar'}</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-outline">
                    Dengan menekan tombol di atas, Anda menyetujui Syarat & Ketentuan ContentHub.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
