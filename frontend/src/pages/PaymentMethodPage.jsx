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

  // 3 Kanal Pembayaran: 'midtrans' | 'qris_static' | 'bank_transfer'
  const [selectedChannel, setSelectedChannel] = useState('midtrans');
  // Bank Pendamping untuk Transfer Manual: 'BCA' | 'BRI'
  const [selectedBank, setSelectedBank] = useState('BCA');

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
      const channelLabel = selectedChannel === 'midtrans' 
        ? 'Midtrans Payment Gateway' 
        : (selectedChannel === 'qris_static' ? 'QRIS Static ContentHub' : `Transfer Bank ${selectedBank}`);

      const orderPayload = {
        user_id: currentUser?.id || 1,
        customer_name: currentUser?.name || 'Pelanggan ContentHub',
        customer_email: currentUser?.email || 'customer@contenthub.id',
        plan_id: plan.id,
        payment_method: selectedChannel,
        payment_channel: channelLabel,
        bank_provider: selectedChannel === 'bank_transfer' ? selectedBank : null
      };

      const result = await api.createOrder(orderPayload);
      
      if (result.success && result.data?.order) {
        const orderNumber = result.data.order.order_number;
        
        if (parseFloat(plan.price) === 0) {
          navigate(`/payment-confirmation/${orderNumber}`);
          return;
        }

        // KANAL 2 & 3 (MANUAL): Langsung navigasi ke halaman instruksi & upload bukti transfer
        if (selectedChannel === 'qris_static' || selectedChannel === 'bank_transfer') {
          navigate(`/transactions/${orderNumber}`);
          return;
        }

        // KANAL 1 (OTOMATIS): Buka Midtrans Snap Popup
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
              title="Batalkan & Kembali ke Workspace"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              <span className="hidden sm:inline">Batalkan</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Checkout */}
      <main className="max-w-7xl mx-auto px-6 md:px-16 py-8 md:py-12">
        {/* Step Indicator & Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              to={currentUser ? "/pricing?mode=workspace" : "/pricing"}
              className="p-2.5 rounded-2xl border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-all shadow-xs"
              title="Kembali ke Pilihan Paket"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
                Konfirmasi & Pembayaran
              </h1>
              <p className="text-xs md:text-sm text-on-surface-variant">
                Pilih metode pembayaran yang paling nyaman untuk Anda selesaikan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Langkah 2 dari 2: Checkout
            </span>
            <div className="w-24 h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
              <div className="w-full h-full bg-primary rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Layout 2 Kolom: Kiri (3 Kanal Pembayaran) & Kanan (Ringkasan Tagihan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sisi Kiri: 3 Kanal Pembayaran */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* ======================================================== */}
            {/* KANAL 1: MIDTRANS PAYMENT GATEWAY (OTOMATIS & INSTAN)    */}
            {/* ======================================================== */}
            <div
              onClick={() => setSelectedChannel('midtrans')}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative ${
                selectedChannel === 'midtrans'
                  ? 'border-primary bg-primary/[0.02] shadow-md shadow-primary/5 ring-4 ring-primary/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    selectedChannel === 'midtrans' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Verifikasi Otomatis 24/7
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Instan Tanpa Struk</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      Midtrans Payment Gateway
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Satu gerbang resmi otomatis. Bayar via Virtual Account, QRIS GoPay/ShopeePay, atau Kartu Kredit di jendela pop-up.
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedChannel === 'midtrans' ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {selectedChannel === 'midtrans' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                </div>
              </div>

              {/* Badges / Logos Metode di dalam Midtrans */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Metode:</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">BCA, Mandiri, BRI, BNI VA</span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold">GoPay &amp; ShopeePay QRIS</span>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-bold">Kartu Kredit / Debit</span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold">Indomaret / Alfamart</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* KANAL 2: QRIS STATIC CONTENTHUB (VERIFIKASI MANUAL)       */}
            {/* ======================================================== */}
            <div
              onClick={() => setSelectedChannel('qris_static')}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative ${
                selectedChannel === 'qris_static'
                  ? 'border-primary bg-primary/[0.02] shadow-md shadow-primary/5 ring-4 ring-primary/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    selectedChannel === 'qris_static' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full inline-block">
                        QRIS Resmi ContentHub
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Verifikasi Manual</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      QRIS Static ContentHub
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Pindai (scan) kode QRIS resmi dengan m-Banking atau e-Wallet apa saja, lalu unggah struk transfer pada halaman pesanan.
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedChannel === 'qris_static' ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {selectedChannel === 'qris_static' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                </div>
              </div>

              {/* Supported apps */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Didukung:</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">Semua Aplikasi M-Banking</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">GoPay</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">OVO</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">DANA</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">ShopeePay</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">LinkAja</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* KANAL 3: TRANSFER MANUAL BANK BCA & BRI (VERIFIKASI MANUAL) */}
            {/* ======================================================== */}
            <div
              onClick={() => setSelectedChannel('bank_transfer')}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative ${
                selectedChannel === 'bank_transfer'
                  ? 'border-primary bg-primary/[0.02] shadow-md shadow-primary/5 ring-4 ring-primary/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    selectedChannel === 'bank_transfer' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">account_balance</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full inline-block">
                        Rekening Resmi Perusahaan
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Verifikasi Manual</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      Transfer Manual Bank (BCA &amp; BRI)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Kirim langsung ke rekening bank resmi ContentHub melalui ATM atau Mobile Banking, lalu unggah struk transfer.
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedChannel === 'bank_transfer' ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {selectedChannel === 'bank_transfer' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                </div>
              </div>

              {/* Sub-Pilihan Bank BRI atau BCA jika Bank Transfer dipilih */}
              {selectedChannel === 'bank_transfer' && (
                <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-3" onClick={e => e.stopPropagation()}>
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    Pilih Bank Tujuan Transfer:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Bank BCA */}
                    <div
                      onClick={() => setSelectedBank('BCA')}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        selectedBank === 'BCA'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                          BCA
                        </div>
                        <div>
                          <span className="text-xs font-bold block">Bank Central Asia</span>
                          <span className="text-[11px] font-mono text-slate-500">8271 9028 11</span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedBank === 'BCA' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {selectedBank === 'BCA' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </div>

                    {/* Bank BRI */}
                    <div
                      onClick={() => setSelectedBank('BRI')}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        selectedBank === 'BRI'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-700 text-white font-black text-xs flex items-center justify-center">
                          BRI
                        </div>
                        <div>
                          <span className="text-xs font-bold block">Bank BRI (BritAmaX)</span>
                          <span className="text-[11px] font-mono text-slate-500">7077 0100 3149 506</span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedBank === 'BRI' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {selectedBank === 'BRI' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </div>

                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    {selectedBank === 'BRI' ? 'a.n. FIRMAN SYAH' : 'a.n. PT ContentHub Media Indonesia'}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Sisi Kanan: Ringkasan Pemesanan & Tombol Checkout */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/15 shadow-sm space-y-6">
              <h3 className="text-lg font-extrabold text-on-surface">Ringkasan Pemesanan</h3>

              <div className="flex items-start gap-3.5 p-4 bg-white rounded-2xl border border-outline-variant/15">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">auto_awesome</span>
                </div>
                <div className="flex-1">
                  <span className="block font-bold text-sm text-on-surface">{plan?.name}</span>
                  <span className="text-xs text-on-surface-variant">Siklus: {plan?.billing_cycle}</span>
                </div>
                <Link to={currentUser ? "/pricing?mode=workspace" : "/pricing"} className="text-xs font-bold text-primary hover:underline">
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
                  <span>Biaya Layanan / Admin</span>
                  <span className="font-semibold text-emerald-600">Gratis (Rp 0)</span>
                </div>

                <div className="pt-3 border-t border-outline-variant/15 flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-outline block">
                      TOTAL TAGIHAN:
                    </span>
                    <span className="text-xl md:text-2xl font-black text-primary">
                      Rp {planPriceNum.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    /{plan?.billing_cycle}
                  </span>
                </div>
              </div>

              {/* Info Box Dinamis Sesuai Kanal */}
              <div className="p-3.5 rounded-2xl bg-primary-fixed/30 border border-primary/20 text-xs text-primary leading-relaxed flex items-start gap-2.5">
                <span className="material-symbols-outlined text-base mt-0.5">verified_user</span>
                <span>
                  {selectedChannel === 'midtrans' && 'Transaksi aman & terenkripsi. Paket langsung aktif otomatis setelah pembayaran berhasil.'}
                  {selectedChannel === 'qris_static' && 'Scan barcode QRIS dan unggah bukti transfer. Paket aktif setelah verifikasi admin.'}
                  {selectedChannel === 'bank_transfer' && `Transfer ke rekening resmi ${selectedBank} dan unggah struk. Paket aktif setelah verifikasi admin.`}
                </span>
              </div>

              {/* Tombol CTA Checkout */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full py-4 bg-gradient-primary text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {selectedChannel === 'midtrans' && 'Lanjutkan Pembayaran via Midtrans →'}
                      {selectedChannel === 'qris_static' && 'Lanjutkan Pembayaran via QRIS →'}
                      {selectedChannel === 'bank_transfer' && `Lanjutkan Transfer Bank (${selectedBank}) →`}
                    </span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-400">
                Dengan melanjutkan, Anda menyetujui Syarat &amp; Ketentuan serta Kebijakan Privasi ContentHub.
              </p>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
