import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function UpgradeModal({ isOpen, onClose, config, setStep }) {
  const { currentUser, refreshSubscription } = useAuth();
  const { step, reason, templateTitle, currentCount, maxLimit, selectedPlan } = config;

  const [activePlan, setActivePlan] = useState(selectedPlan || null);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Form Pembayaran Checkout di dalam Modal
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Default fallback plans if API is loading
  const defaultPlans = [
    {
      id: 2,
      sku: 'CH-PRO-3M',
      name: 'ContentHub Pro',
      price: '199000.00',
      billing_cycle: '3 Bulan',
      badge: 'Paket Populer',
      features: [
        'Kalender Konten Tanpa Batas',
        'Akses Penuh Drag & Drop Planner',
        'Akses Seluruh Template (Basic & Premium)',
        'Masa Aktif 3 Bulan Penuh',
        'Integrasi Editor Canva Pro',
        'Prioritas Dukungan Pelanggan',
      ],
    },
    {
      id: 3,
      sku: 'CH-PLUS-1Y',
      name: 'ContentHub Plus',
      price: '699000.00',
      billing_cycle: '1 Tahun',
      badge: 'Fitur Terlengkap (Plus)',
      is_hero: true,
      features: [
        'Semua Fitur Paket Pro',
        'Notifikasi Otomatis via Gmail (Presisi Menit)',
        'Push Notification Langsung di Smartphone',
        'Masa Aktif 1 Tahun Penuh',
        'Akses Update Template Desain Terkini',
        'Dukungan VIP 24/7',
      ],
    },
  ];

  // Fetch plans from API
  useEffect(() => {
    let isMounted = true;
    setLoadingPlans(true);
    api.getProducts()
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data)) {
          const filtered = res.data.filter(
            (p) => p.id !== 1 && !p.sku?.includes('FREE') && !p.name?.toLowerCase().includes('enterprise')
          );
          if (filtered.length >= 2) {
            setPlans(filtered);
          } else {
            setPlans(defaultPlans);
          }
        }
      })
      .catch(() => {
        if (isMounted) setPlans(defaultPlans);
      })
      .finally(() => {
        if (isMounted) setLoadingPlans(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChoosePlan = (plan) => {
    setActivePlan(plan);
    setPaymentError('');
    setStep('checkout', { selectedPlan: plan });
  };

  const handleProcessCheckout = async () => {
    if (!activePlan) return;
    setIsProcessing(true);
    setPaymentError('');

    try {
      const orderPayload = {
        user_id: currentUser?.id || 1,
        plan_id: activePlan.id,
        customer_name: currentUser?.name || 'Pelanggan ContentHub',
        customer_email: currentUser?.email || 'customer@contenthub.id',
        payment_method: 'Midtrans Gateway',
        payment_channel: 'Midtrans Snap',
      };

      // 1. Buat order di database Neon
      const createRes = await api.createOrder(orderPayload);
      if (!createRes.success || !createRes.data) {
        throw new Error(createRes.message || 'Gagal memproses transaksi upgrade.');
      }

      const orderNumber = createRes.data.order?.order_number || createRes.data.order?.id || createRes.data.id;

      // 2. Dapatkan token Snap dari Midtrans backend
      const backendUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
        : 'http://localhost:5000';

      const midtransRes = await fetch(`${backendUrl}/api/payment/midtrans/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderNumber }),
      });

      const midtransData = await midtransRes.json();

      if (!midtransData.success || !midtransData.token) {
        throw new Error(midtransData.message || 'Gagal membuat transaksi Midtrans');
      }

      if (typeof window.snap === 'undefined') {
        throw new Error('Script Midtrans Snap belum termuat. Pastikan koneksi internet aktif dan AdBlocker dinonaktifkan.');
      }

      // 3. Tampilkan popup interaktif resmi Midtrans Snap (Gambar 2)
      window.snap.pay(midtransData.token, {
        onSuccess: async function (res) {
          try {
            await fetch(`${backendUrl}/api/orders/${orderNumber}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'Paid' }),
            });
          } catch (e) {
            console.warn('Gagal update status pesanan manual:', e);
          }

          // Sinkronisasi status langganan di AuthContext secara realtime
          await refreshSubscription(currentUser?.id);

          // Pindah ke modal step 4: Success confirmation
          setStep('success');

          // Jalankan custom callback jika ada
          if (typeof config.onSuccessCallback === 'function') {
            config.onSuccessCallback(activePlan);
          }
        },
        onPending: function (res) {
          setPaymentError('Pembayaran masih dalam status menunggu transfer di Midtrans.');
          setIsProcessing(false);
        },
        onError: function (res) {
          setPaymentError('Pembayaran tidak berhasil diproses oleh Midtrans.');
          setIsProcessing(false);
        },
        onClose: function () {
          setIsProcessing(false);
        },
      });
    } catch (err) {
      console.error('UpgradeModal Checkout Error:', err);
      setPaymentError(err.response?.data?.message || err.message || 'Terjadi kesalahan sistem saat memproses pembayaran.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 transition-all duration-300">
        
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          title="Tutup Modal"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>

        {/* STEP 1: LIMIT / LOCK WARNING MODAL */}
        {step === 'limit' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-3">
              {reason === 'agenda_limit' && (
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-3xl">event_busy</span>
                </div>
              )}
              {reason === 'drag_drop' && (
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-3xl">lock</span>
                </div>
              )}
              {reason === 'premium_template' && (
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                </div>
              )}
              {reason === 'notification' && (
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-3xl">notifications_active</span>
                </div>
              )}

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 inline-block mb-1.5">
                  {reason === 'agenda_limit' && 'Batas Kuota Paket Free Tercapai'}
                  {reason === 'drag_drop' && 'Fitur Eksklusif Pro & Plus'}
                  {reason === 'premium_template' && 'Template Eksklusif Pro & Plus'}
                  {reason === 'notification' && 'Fitur Eksklusif Paket Plus'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {reason === 'agenda_limit' && 'Kuota Agenda Mingguan Habis (3/3)'}
                  {reason === 'drag_drop' && 'Drag & Drop Planner Terkunci'}
                  {reason === 'premium_template' && 'Akses Template Desain Premium'}
                  {reason === 'notification' && 'Pengingat Otomatis via Gmail'}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                {reason === 'agenda_limit' &&
                  'Paket Free hanya dapat menjadwalkan maksimal 3 agenda konten per minggu. Untuk menambah agenda tanpa batas serta membuka Drag & Drop Planner, silakan upgrade paket Anda.'}
                {reason === 'drag_drop' &&
                  'Alur kerja visual Kanban Drag & Drop Planner dirancang khusus untuk mempercepat produksi konten Anda. Fitur ini dapat langsung diakses dengan meng-upgrade ke Paket Pro atau Plus.'}
                {reason === 'premium_template' &&
                  `Template visual "${templateTitle || 'Canva Premium'}" adalah aset kurasi profesional yang eksklusif untuk pelanggan Paket Pro & Plus.`}
                {reason === 'notification' &&
                  'Sistem notifikasi pengingat otomatis tepat waktu ke alamat Gmail Anda dan push notification smartphone eksklusif tersedia pada Paket Plus.'}
              </p>
            </div>

            {/* Perbandingan Fitur Paket */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2.5">
              <div className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">verified</span>
                Keuntungan Upgrade ke Pro / Plus:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span>Jadwal Kalender Tanpa Batas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span>Kanban Drag & Drop Planner Penuh</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span>Semua 200+ Template Basic & Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span>Notifikasi Jadwal via Gmail (Paket Plus)</span>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Tetap di Paket Free
              </button>
              <button
                type="button"
                onClick={() => setStep('pricing')}
                className="flex-2 py-3 bg-gradient-primary text-white rounded-xl font-black text-xs shadow-md shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Upgrade Sekarang</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PRICING PLAN SELECTOR */}
        {step === 'pricing' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Langkah 1 dari 2</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pilih Paket Langganan</h2>
              </div>
              <button
                type="button"
                onClick={() => setStep('limit')}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Kembali
              </button>
            </div>

            {loadingPlans ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-xs font-bold text-slate-400">Memuat paket dari database Neon...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                {(plans.length ? plans : defaultPlans).map((plan) => {
                  const isPlus = plan.id === 3 || plan.sku?.includes('PLUS') || plan.name?.toLowerCase().includes('plus');
                  const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]');
                  const numPrice = parseFloat(plan.price);
                  const priceStr = numPrice === 0 ? 'Gratis' : `Rp ${numPrice.toLocaleString('id-ID')}`;

                  return (
                    <div
                      key={plan.id}
                      className={`relative p-5 rounded-2xl flex flex-col justify-between border-2 transition-all ${
                        isPlus
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                          : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      {isPlus && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                          ⭐ Rekomendasi Terlengkap
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-base text-slate-900">{plan.name}</h3>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {plan.billing_cycle}
                          </span>
                        </div>

                        <div>
                          <div className="text-xl sm:text-2xl font-black text-slate-900">{priceStr}</div>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {isPlus ? 'Periode Aktif 1 Tahun Penuh' : 'Periode Aktif 3 Bulan'}
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                          {features.slice(0, 5).map((f, i) => (
                            <div key={i} className="flex items-start gap-1.5 font-medium leading-snug">
                              <span className="material-symbols-outlined text-xs text-emerald-600 flex-shrink-0 mt-0.5">
                                check_circle
                              </span>
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleChoosePlan(plan)}
                        className={`mt-5 w-full py-2.5 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer ${
                          isPlus
                            ? 'bg-gradient-primary text-white hover:scale-[1.02] active:scale-95'
                            : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                        }`}
                      >
                        Pilih {plan.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: IN-WORKSPACE PAYMENT CHECKOUT MODAL */}
        {step === 'checkout' && activePlan && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Langkah 2 dari 2</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Konfirmasi Pembayaran</h2>
              </div>
              <button
                type="button"
                onClick={() => setStep('pricing')}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Ganti Paket
              </button>
            </div>

            {paymentError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{paymentError}</span>
              </div>
            )}

            {/* Ringkasan Paket Terpilih */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paket Dipilih:</span>
                <div className="font-black text-slate-900 text-base">{activePlan.name}</div>
                <span className="text-xs text-primary font-bold">Masa Aktif: {activePlan.billing_cycle}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tagihan:</span>
                <div className="font-black text-lg text-slate-900">
                  Rp {parseFloat(activePlan.price).toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Kartu Gerbang Pembayaran Resmi Midtrans */}
            <div className="p-5 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Gerbang Pembayaran Resmi
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Verifikasi Otomatis 24/7
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      Midtrans Payment Gateway
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Satu gerbang pembayaran resmi untuk semua metode. Anda dapat memilih metode pembayaran favorit langsung di jendela pembayaran setelah menekan tombol lanjutkan pembayaran.
              </p>

              {/* Supported methods preview */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                  Metode Pembayaran yang Tersedia:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-semibold">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                    <span className="material-symbols-outlined text-base text-primary">account_balance</span>
                    <span>Virtual Account (BCA, Mandiri, BRI, BNI)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                    <span className="material-symbols-outlined text-base text-emerald-600">qr_code_2</span>
                    <span>QRIS & E-Wallet (GoPay, dll.)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                    <span className="material-symbols-outlined text-base text-indigo-600">credit_card</span>
                    <span>Kartu Kredit / Debit</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                    <span className="material-symbols-outlined text-base text-amber-600">storefront</span>
                    <span>Gerai Ritel (Indomaret, Alfamart)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Keamanan */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
              <span className="material-symbols-outlined text-base text-emerald-600">verified_user</span>
              <span>Transaksi aman & terenkripsi. Paket langsung aktif setelah pembayaran berhasil.</span>
            </div>

            {/* Tombol Eksekusi Bayar */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('pricing')}
                disabled={isProcessing}
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessCheckout}
                disabled={isProcessing}
                className="flex-1 py-3 bg-gradient-primary text-white rounded-xl font-black text-xs shadow-md shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Membuka Jendela Pembayaran Midtrans...</span>
                  </>
                ) : (
                  <>
                    <span>Lanjutkan Pembayaran via Midtrans →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION & REAL-TIME ACTIVATION */}
        {step === 'success' && (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in-75 duration-300">
              <span className="material-symbols-outlined text-4xl font-black">check</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                Pembayaran Berhasil Dikonfirmasi
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Selamat! Paket Anda Telah Aktif
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Status akun Anda di database PostgreSQL Neon telah sukses diperbarui ke{' '}
              <strong className="text-primary">{activePlan?.name || 'Paket Baru'}</strong>. Hak akses fitur di dalam
              workspace langsung terbuka secara realtime tanpa perlu refresh manual.
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                Mulai Gunakan Fitur Sekarang
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
