import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PaymentMethodPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.getProducts()
      .then(res => {
        if (res.success && res.data) {
          const targetId = planId ? parseInt(planId, 10) : 2;
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
        user_id: currentUser?.id || 1,
        customer_name: currentUser?.name || 'Pelanggan ContentHub',
        customer_email: currentUser?.email || 'customer@contenthub.id',
        plan_id: plan.id,
        payment_method: 'Midtrans Gateway',
        payment_channel: 'Midtrans Snap'
      };

      const result = await api.createOrder(orderPayload);
      
      if (result.success && result.data?.order) {
        const orderNumber = result.data.order.order_number;
        
        if (parseFloat(plan.price) === 0) {
          navigate(`/payment-confirmation/${orderNumber}`);
          return;
        }

        try {
          const backendUrl = import.meta.env.VITE_API_URL 
            ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
            : 'http://localhost:5000';

          const midtransRes = await fetch(`${backendUrl}/api/payment/midtrans/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderNumber })
          });
          
          const midtransData = await midtransRes.json();

          if (midtransData.success) {
            if (typeof window.snap === 'undefined') {
              throw new Error("Script Midtrans tidak termuat (window.snap is undefined). Pastikan tidak ada AdBlocker aktif di browser Anda.");
            }

            window.snap.pay(midtransData.token, {
              onSuccess: async function(res) {
                try {
                  await fetch(`${backendUrl}/api/orders/${orderNumber}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Paid' })
                  });
                } catch (e) {
                  console.warn('Gagal update status manual:', e);
                }
                navigate(`/payment-confirmation/${orderNumber}`);
              },
              onPending: function(res) {
                navigate(`/transactions/${orderNumber}`);
              },
              onError: function(res) {
                setErrorMsg('Pembayaran tidak berhasil diproses oleh Midtrans.');
                setSubmitting(false);
              },
              onClose: function() {
                setSubmitting(false);
              }
            });
            return;
          } else {
            throw new Error(midtransData.message || 'Gagal mendapatkan token pembayaran dari server.');
          }
        } catch (midtransErr) {
          console.error("Midtrans Error:", midtransErr);
          setErrorMsg("Gagal memuat Midtrans: " + midtransErr.message);
          setSubmitting(false);
          return; 
        }
      } else {
        throw new Error(result.message || 'Gagal membuat pesanan.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses pesanan.');
      setSubmitting(false); 
    } 
  };

  const planPriceNum = plan ? parseFloat(plan.price) : 98000;
  const isFree = planPriceNum === 0;

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Header Fokus Checkout Resmi */}
      <header className="sticky top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto h-full px-6 md:px-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-lg">layers</span>
              </div>
              <span className="text-base font-black tracking-tight text-primary">ContentHub</span>
            </Link>
            <span className="text-slate-300 font-light">|</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-emerald-600">verified_user</span>
              Checkout Pembayaran Resmi
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <span className="material-symbols-outlined text-xs text-emerald-600">lock</span>
              Enkripsi 256-Bit SSL
            </div>

            <Link
              to="/dashboard"
              className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              <span className="hidden sm:inline">Batalkan</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="py-8 pb-20 px-6 md:px-16 max-w-7xl mx-auto">
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
            {/* Sisi Kiri: Kartu Gerbang Pembayaran Resmi Midtrans Snap */}
            <div className="flex-1 space-y-6">
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2.5 border border-red-200 shadow-xs animate-in fade-in duration-200">
                  <span className="material-symbols-outlined text-base text-red-600">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Kartu Utama Payment Gateway */}
              <div className="bg-white rounded-3xl border-2 border-primary/30 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl border-b border-l border-primary/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Otomatis 24/7 Terverifikasi
                </div>

                <div className="flex items-start gap-4 pt-1">
                  <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
                      Gerbang Pembayaran Resmi
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                      Midtrans Payment Gateway
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Satu gerbang pembayaran untuk semua metode. Anda dapat memilih metode pembayaran favorit langsung di jendela popup interaktif setelah menekan tombol bayar.
                    </p>
                  </div>
                </div>

                {/* Grid Metode yang Didukung */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Metode Pembayaran Yang Didukung di Popup:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Channel 1: Virtual Account */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <span className="material-symbols-outlined text-base">account_balance</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">Virtual Account</span>
                        <span className="text-[10px] text-slate-500 truncate block">BCA, Mandiri, BRI, BNI, Permata</span>
                      </div>
                    </div>

                    {/* Channel 2: QRIS & E-Wallet */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">QRIS & E-Wallet</span>
                        <span className="text-[10px] text-slate-500 truncate block">GoPay, ShopeePay & Semua M-Banking</span>
                      </div>
                    </div>

                    {/* Channel 3: Kartu Kredit & Debit */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <span className="material-symbols-outlined text-base">credit_card</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">Kartu Kredit / Debit</span>
                        <span className="text-[10px] text-slate-500 truncate block">Visa, Mastercard, JCB</span>
                      </div>
                    </div>

                    {/* Channel 4: Gerai Tunai */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <span className="material-symbols-outlined text-base">storefront</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">Gerai Ritel</span>
                        <span className="text-[10px] text-slate-500 truncate block">Indomaret & Alfamart</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jaminan Kenyamanan */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-2">
                  <div className="font-extrabold flex items-center gap-1.5 text-blue-800">
                    <span className="material-symbols-outlined text-sm">security</span>
                    Keuntungan Pembayaran Terintegrasi Midtrans:
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-blue-800/80">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                      <span><strong>Verifikasi Otomatis:</strong> Tidak perlu upload struk transfer atau konfirmasi manual via WhatsApp.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                      <span><strong>Aktivasi Seketika:</strong> Paket langganan Anda langsung aktif begitu pembayaran terdeteksi.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                      <span><strong>Aman & Resmi:</strong> Terenkripsi penuh oleh standar keamanan Bank Indonesia.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Ringkasan Pemesanan & Tombol Checkout */}
            <aside className="w-full lg:w-[380px]">
              <div className="sticky top-28 bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/15 shadow-sm space-y-6">
                <h3 className="text-lg font-extrabold text-on-surface">Ringkasan Pemesanan</h3>

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
                    className="w-full py-4 bg-gradient-primary text-white font-bold rounded-2xl text-sm shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Menyiapkan Pembayaran...</span>
                      </>
                    ) : (
                      <>
                        <span>{isFree ? 'Aktivasi Paket Gratis' : 'Lanjutkan Pembayaran via Midtrans'}</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-outline">
                    Dengan menekan tombol di atas, jendela aman Midtrans akan terbuka untuk menyelesaikan transaksi.
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
