import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PricingSection from './PricingSection';

export default function UpgradeModal({ isOpen, onClose, config, setStep }) {
  const navigate = useNavigate();
  const { currentUser, refreshSubscription } = useAuth();
  const { step, reason, templateTitle, currentCount, maxLimit, selectedPlan } = config;

  const [activePlan, setActivePlan] = useState(selectedPlan || null);

  // Form Pembayaran Checkout di dalam Modal
  const [selectedChannel, setSelectedChannel] = useState('midtrans'); // 'midtrans' | 'qris_static' | 'bank_transfer'
  const [selectedBank, setSelectedBank] = useState('BCA'); // 'BCA' | 'BRI'
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
      const channelLabel = selectedChannel === 'midtrans' 
        ? 'Midtrans Payment Gateway' 
        : (selectedChannel === 'qris_static' ? 'QRIS Static ContentHub' : `Transfer Bank ${selectedBank}`);

      const orderPayload = {
        user_id: currentUser?.id || 1,
        plan_id: activePlan.id,
        customer_name: currentUser?.name || 'Pelanggan ContentHub',
        customer_email: currentUser?.email || 'customer@contenthub.id',
        payment_method: selectedChannel,
        payment_channel: channelLabel,
        bank_provider: selectedChannel === 'bank_transfer' ? selectedBank : null,
      };

      // 1. Buat order di database Neon
      const createRes = await api.createOrder(orderPayload);
      if (!createRes.success || !createRes.data) {
        throw new Error(createRes.message || 'Gagal memproses transaksi upgrade.');
      }

      const orderNumber = createRes.data.order?.order_number || createRes.data.order?.id || createRes.data.id;

      // KANAL 2 & 3 (MANUAL): Navigasi ke halaman detail tagihan & upload bukti transfer
      if (selectedChannel === 'qris_static' || selectedChannel === 'bank_transfer') {
        onClose();
        navigate(`/transactions/${orderNumber}`);
        return;
      }

      // 2. Dapatkan token Snap dari Midtrans backend (KANAL 1 OTOMATIS)
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
                onClick={() => {
                  if (reason && reason !== 'upgrade_button') {
                    setStep('limit');
                  } else {
                    onClose();
                  }
                }}
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

            {/* Pilihan 3 Kanal Pembayaran */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Pilih Kanal Pembayaran:
              </span>

              {/* 1. Midtrans Gateway */}
              <div
                onClick={() => setSelectedChannel('midtrans')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedChannel === 'midtrans'
                    ? 'border-primary bg-primary/[0.03] shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">Midtrans Gateway</span>
                        <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                          Otomatis Instan
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">VA, E-Wallet QRIS, &amp; Kartu Kredit via Popup</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedChannel === 'midtrans' ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {selectedChannel === 'midtrans' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                </div>
              </div>

              {/* 2. QRIS Static */}
              <div
                onClick={() => setSelectedChannel('qris_static')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedChannel === 'qris_static'
                    ? 'border-primary bg-primary/[0.03] shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">QRIS Static ContentHub</span>
                        <span className="text-[8px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200">
                          Upload Struk
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Scan dengan m-Banking / E-Wallet &amp; verifikasi</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedChannel === 'qris_static' ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {selectedChannel === 'qris_static' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                </div>
              </div>

              {/* 3. Transfer Manual Bank */}
              <div
                onClick={() => setSelectedChannel('bank_transfer')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedChannel === 'bank_transfer'
                    ? 'border-primary bg-primary/[0.03] shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-base">account_balance</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">Transfer Manual Bank</span>
                        <span className="text-[8px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-full border border-indigo-200">
                          BCA &amp; BRI
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Transfer ke rekening resmi perusahaan</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedChannel === 'bank_transfer' ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {selectedChannel === 'bank_transfer' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                </div>

                {/* Sub-selector bank */}
                {selectedChannel === 'bank_transfer' && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedBank('BCA')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                        selectedBank === 'BCA' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      BCA (8271 9028 11)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBank('BRI')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                        selectedBank === 'BRI' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      BRI (0341 0100 2381 502)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Info Keamanan */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-emerald-50/70 py-2 px-3 rounded-xl border border-emerald-100">
              <span className="material-symbols-outlined text-xs text-emerald-600">verified_user</span>
              <span>
                {selectedChannel === 'midtrans' && 'Transaksi aman & terenkripsi. Paket langsung aktif otomatis.'}
                {selectedChannel === 'qris_static' && 'Scan barcode QRIS dan unggah struk. Paket aktif setelah verifikasi admin.'}
                {selectedChannel === 'bank_transfer' && `Transfer ke rekening resmi ${selectedBank} dan unggah struk.`}
              </span>
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
                    <span>Memproses Transaksi...</span>
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
