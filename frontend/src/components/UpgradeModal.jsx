import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PricingSection from './PricingSection';

export default function UpgradeModal({ isOpen, onClose, config, setStep }) {
  const { currentUser, refreshSubscription } = useAuth();
  const { step, reason, templateTitle, currentCount, maxLimit, selectedPlan } = config;

  const [activePlan, setActivePlan] = useState(selectedPlan || null);

  // Form Pembayaran Checkout di dalam Modal
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handleChoosePlan = (plan) => {
    if (parseFloat(plan.price) === 0) {
      alert('Anda saat ini sudah aktif pada Paket Free.');
      return;
    }
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

      // 3. Tampilkan popup interaktif resmi Midtrans Snap
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full ${
          step === 'pricing' ? 'max-w-5xl' : 'max-w-xl'
        } bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 transition-all duration-300 max-h-[92vh] flex flex-col`}
      >
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
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
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Tetap di Paket Free
              </button>
              <button
                type="button"
                onClick={() => setStep('pricing')}
                className="flex-2 py-3 bg-gradient-primary text-white rounded-xl font-black text-xs shadow-md shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Upgrade</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PRICING PLAN SELECTOR (3-Tier Layout Reusable Component) */}
        {step === 'pricing' && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Langkah 1 dari 2</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pilih Paket Langganan</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Katalog resmi tersinkronisasi langsung dari database PostgreSQL/Neon Cloud.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('limit')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Kembali
              </button>
            </div>

            {/* Reusable 3-Tier Pricing Component */}
            <PricingSection
              compact={true}
              showHeader={false}
              showSupportBanner={false}
              onSelectPlan={handleChoosePlan}
            />
          </div>
        )}

        {/* STEP 3: IN-WORKSPACE PAYMENT CHECKOUT MODAL */}
        {step === 'checkout' && activePlan && (
          <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary">Langkah 2 dari 2</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Konfirmasi Pembayaran</h2>
              </div>
              <button
                type="button"
                onClick={() => setStep('pricing')}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Ganti Paket
              </button>
            </div>

            {paymentError && (
              <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{paymentError}</span>
              </div>
            )}

            {/* Ringkasan Paket Terpilih */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Paket Dipilih:</span>
                <div className="font-black text-slate-900 text-sm">{activePlan.name}</div>
                <span className="text-[11px] text-primary font-bold">Masa Aktif: {activePlan.billing_cycle}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Tagihan:</span>
                <div className="font-black text-base text-slate-900">
                  Rp {parseFloat(activePlan.price).toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Kartu Gerbang Pembayaran Resmi Midtrans */}
            <div className="p-3.5 rounded-xl border border-primary/20 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                      Midtrans Payment Gateway
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Gerbang Pembayaran Resmi</p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Verifikasi Otomatis 24/7
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pilih metode pembayaran (QRIS, VA BCA/Mandiri/BRI/BNI, GoPay, Kartu Kredit) langsung di jendela pembayaran aman Midtrans.
              </p>

              {/* Supported methods preview */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Metode Pembayaran yang Tersedia:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 font-semibold">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
                    <span className="material-symbols-outlined text-xs text-primary">account_balance</span>
                    <span className="truncate">Virtual Account (BCA, Mandiri, BRI, BNI)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
                    <span className="material-symbols-outlined text-xs text-emerald-600">qr_code_2</span>
                    <span className="truncate">QRIS & E-Wallet (GoPay, dll.)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
                    <span className="material-symbols-outlined text-xs text-indigo-600">credit_card</span>
                    <span className="truncate">Kartu Kredit / Debit</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
                    <span className="material-symbols-outlined text-xs text-amber-600">storefront</span>
                    <span className="truncate">Gerai Ritel (Indomaret, Alfamart)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Keamanan */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-emerald-50/70 py-2 px-3 rounded-xl border border-emerald-100">
              <span className="material-symbols-outlined text-xs text-emerald-600">verified_user</span>
              <span>Transaksi aman & terenkripsi. Paket langsung aktif setelah pembayaran berhasil.</span>
            </div>

            {/* Tombol Eksekusi Bayar */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setStep('pricing')}
                disabled={isProcessing}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessCheckout}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-gradient-primary text-white rounded-xl font-black text-xs shadow-md shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Membuka Jendela Midtrans...</span>
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
