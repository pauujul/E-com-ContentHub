import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InvoiceReceiptModal from '../components/InvoiceReceiptModal';

export default function TransactionDetailPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { refreshSubscription, currentUser } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // State Upload Bukti Transfer
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // State Modal Preview Gambar Bukti & Struk
  const [showImageModal, setShowImageModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const fetchOrderData = () => {
    if (!orderNumber) return;
    api.getOrderById(orderNumber)
      .then(res => {
        if (res.success && res.data) {
          setOrder(res.data);
          if (res.data.status === 'Paid' || res.data.tracking_status === 'lunas') {
            try {
              refreshSubscription();
            } catch (e) {}
          }
        }
      })
      .catch(err => {
        console.warn('Could not fetch single order:', err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderNumber]);

  // Polling status otomatis setiap 8 detik jika status masih 'menunggu_verifikasi'
  useEffect(() => {
    if (order?.tracking_status === 'menunggu_verifikasi') {
      const interval = setInterval(() => {
        fetchOrderData();
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [order?.tracking_status]);

  // Handle pilih file foto struk
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 5MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  // Handle upload bukti transfer
  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Silakan pilih file foto bukti transfer terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const res = await api.uploadPaymentProof(order?.order_number || orderNumber, selectedFile);
      if (res.success && res.data) {
        setOrder(res.data);
        setUploadSuccess(true);
        setSelectedFile(null);
        setTimeout(() => setUploadSuccess(false), 4000);
      } else {
        throw new Error(res.message || 'Gagal mengunggah bukti pembayaran.');
      }
    } catch (err) {
      console.error('Upload proof error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengunggah bukti.');
    } finally {
      setIsUploading(false);
    }
  };

  // Salin ke clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const amountNum = order ? parseFloat(order.total_amount) : 98000;
  const trackingStatus = order?.tracking_status || (order?.status === 'Paid' ? 'lunas' : 'menunggu_pembayaran');
  const isMidtrans = order?.payment_method === 'midtrans' || order?.payment_method === 'Midtrans Gateway';
  const isQrisStatic = order?.payment_method === 'qris_static';
  const isBankTransfer = order?.payment_method === 'bank_transfer';
  const bankProvider = order?.bank_provider || (order?.payment_channel?.includes('BRI') ? 'BRI' : 'BCA');
  const bankAccountNo = bankProvider === 'BRI' ? '7077 0100 3149 506' : '8271 9028 11';
  const bankAccountHolder = bankProvider === 'BRI' ? 'FIRMAN SYAH' : 'PT ContentHub Media Indonesia';

  // Base backend URL untuk menampilkan gambar bukti transfer
  const backendBaseUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
    : 'http://localhost:5000';
  const proofImageUrl = order?.payment_proof_url ? `${backendBaseUrl}${order.payment_proof_url}` : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Fokus Pembayaran */}
      <header className="sticky top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto h-full px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-lg">layers</span>
              </div>
              <span className="text-base font-black tracking-tight text-primary">ContentHub</span>
            </Link>
            <span className="text-slate-300 font-light">|</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-emerald-600">receipt_long</span>
              Detail Transaksi &amp; Pelacakan
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              <span>{trackingStatus === 'lunas' ? 'Lihat Struk Lunas' : 'Lihat Struk Tagihan'}</span>
            </button>
            <Link
              to="/dashboard"
              className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              <span>Buka Workspace</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="py-8 pb-20 px-6 md:px-12 max-w-5xl mx-auto space-y-6">
        
        {/* ======================================================== */}
        {/* TIMELINE STATUS TRACKING REAL-TIME                       */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary block">
                Tracking Pesanan Real-Time
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                No. Pesanan: #{order?.order_number || orderNumber}
              </h1>
            </div>

            {/* Badge Status Terkini */}
            <div>
              {trackingStatus === 'menunggu_pembayaran' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  Menunggu Pembayaran
                </span>
              )}
              {trackingStatus === 'menunggu_verifikasi' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Menunggu Verifikasi Admin
                </span>
              )}
              {trackingStatus === 'lunas' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Lunas &amp; Paket Aktif
                </span>
              )}
              {trackingStatus === 'ditolak' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-50 text-red-700 border border-red-200">
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  Pembayaran Ditolak
                </span>
              )}
            </div>
          </div>

          {/* Stepper Indikator 4 Langkah */}
          <div className="pt-2">
            <div className="grid grid-cols-4 gap-2 text-center relative">
              {/* Garis Horizontal Timeline */}
              <div className="absolute top-4 left-[12%] right-[12%] h-1 bg-slate-100 -z-0">
                <div 
                  className={`h-full bg-primary transition-all duration-500 ${
                    trackingStatus === 'menunggu_pembayaran' ? 'w-1/3' : 
                    trackingStatus === 'menunggu_verifikasi' ? 'w-2/3' : 
                    trackingStatus === 'lunas' ? 'w-full' : 'w-2/3 bg-red-500'
                  }`}
                ></div>
              </div>

              {/* Step 1: Pesanan Dibuat */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">Pesanan Dibuat</span>
                <span className="text-[10px] text-slate-400">Tersimpan Otomatis</span>
              </div>

              {/* Step 2: Menunggu Pembayaran */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                  trackingStatus !== 'menunggu_pembayaran'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-primary text-white ring-4 ring-primary/20'
                }`}>
                  {trackingStatus !== 'menunggu_pembayaran' ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">payments</span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">Bayar Tagihan</span>
                <span className="text-[10px] text-slate-400">Transfer / QRIS</span>
              </div>

              {/* Step 3: Verifikasi Admin */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                  trackingStatus === 'lunas'
                    ? 'bg-emerald-600 text-white'
                    : trackingStatus === 'menunggu_verifikasi'
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                    : trackingStatus === 'ditolak'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {trackingStatus === 'lunas' ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : trackingStatus === 'ditolak' ? (
                    <span className="material-symbols-outlined text-sm">close</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">hourglass_top</span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">Verifikasi Admin</span>
                <span className="text-[10px] text-slate-400">
                  {trackingStatus === 'menunggu_verifikasi' ? 'Sedang Dicek' : 'Validasi Struk'}
                </span>
              </div>

              {/* Step 4: Lunas & Paket Aktif */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                  trackingStatus === 'lunas'
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  <span className="material-symbols-outlined text-sm">verified</span>
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">Lunas &amp; Aktif</span>
                <span className="text-[10px] text-slate-400">Fitur Terbuka</span>
              </div>

            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
            <span>Bukti transfer berhasil dikirim! Tim Admin ContentHub akan segera memvalidasi pesanan Anda.</span>
          </div>
        )}

        {/* Layout 2 Kolom: Kiri (Instruksi Rekening/QRIS) & Kanan (Upload Bukti & Ringkasan) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Kolom Kiri: Instruksi Pembayaran */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Kartu Metode Pembayaran */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              
              {/* Header Box */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-xl">
                      {isQrisStatic ? 'qr_code_scanner' : isBankTransfer ? 'account_balance' : 'account_balance_wallet'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Metode Pembayaran
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900">
                      {order?.payment_channel || 'Instruksi Pembayaran'}
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tagihan</span>
                  <span className="text-lg font-black text-primary">
                    Rp {amountNum.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* 1. KONTEN KHUSUS QRIS STATIC */}
              {isQrisStatic && (
                <div className="text-center space-y-4">
                  {/* Kartu Frame Barcode QRIS Bersih */}
                  <div className="inline-block p-4 sm:p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-xl max-w-xs mx-auto text-center">
                    <div className="border-b border-slate-100 pb-2.5 mb-3">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <span className="font-black text-sm tracking-wider text-slate-900">QRIS</span>
                        <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded">GPN</span>
                      </div>
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                        QR Standar Pembayaran Nasional
                      </p>
                      <h4 className="text-xs font-black text-slate-800 mt-1">FIRMAN SYAH</h4>
                      <p className="text-[10px] font-mono text-slate-400">NMID: ID1020261198301</p>
                    </div>

                    <div className="p-2 bg-white rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center">
                      <img 
                        src="/qris-bri-firman.jpg" 
                        alt="Barcode QRIS BRImo Firman Syah" 
                        className="w-56 h-auto mx-auto rounded-lg object-contain"
                      />
                    </div>

                    <div className="pt-3 border-t border-slate-100 mt-3 text-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Total Tagihan
                      </span>
                      <span className="text-lg font-black text-primary">
                        Rp {amountNum.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 max-w-sm mx-auto">
                    <p className="text-xs font-bold text-slate-700">
                      Pindai barcode di atas menggunakan aplikasi:
                    </p>
                    <p className="text-[11px] text-slate-500">
                      BRImo, BCA Mobile, Livin' Mandiri, BNI Mobile, GoPay, OVO, DANA, ShopeePay, atau LinkAja.
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-center gap-3">
                    <a
                      href="/qris-bri-firman.jpg"
                      download="Barcode-QRIS-FirmanSyah.jpg"
                      className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold inline-flex items-center gap-2 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Unduh Barcode QRIS
                    </a>
                  </div>
                </div>
              )}

              {/* 2. KONTEN KHUSUS TRANSFER BANK MANUAL */}
              {isBankTransfer && (
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase">
                          Bank {bankProvider}
                        </span>
                        <span className="text-xs font-bold text-slate-700">Rekening Resmi ContentHub</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {order?.order_number}</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                          Nomor Rekening Tujuan:
                        </span>
                        <span className="text-xl sm:text-2xl font-mono font-black text-slate-900 tracking-wider">
                          {bankAccountNo}
                        </span>
                        <span className="text-[11px] text-slate-500 block font-semibold mt-0.5">
                          a.n. {bankAccountHolder}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(bankAccountNo)}
                        className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        <span>{copiedText ? 'Tersalin!' : 'Salin'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Pastikan transfer tepat sejumlah <strong className="text-slate-900">Rp {amountNum.toLocaleString('id-ID')}</strong> agar admin dapat memverifikasi transaksi Anda dengan cepat.
                    </p>
                  </div>
                </div>
              )}

              {/* 3. KONTEN KHUSUS MIDTRANS */}
              {isMidtrans && (
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Pembayaran Otomatis via Midtrans
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Transaksi ini menggunakan sistem gateway otomatis Midtrans. Jika jendela popup tertutup atau tertunda, Anda dapat mengulang pembayaran kapan saja.
                  </p>
                  {trackingStatus !== 'lunas' && (
                    <div className="pt-2">
                      <Link
                        to={`/checkout/${order?.plan_id || 2}`}
                        className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-primary text-white font-bold text-xs shadow-md shadow-primary/20"
                      >
                        Buka Ulang Jendela Pembayaran Midtrans →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Panduan Transfer Ringkas */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                  Langkah Penyelesaian:
                </span>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                  <span>Selesaikan pembayaran sesuai nominal yang tertera pada rekening atau barcode QRIS di atas.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                  <span>Ambil foto atau tangkapan layar (screenshot) struk bukti transfer yang berhasil.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                  <span>Unggah bukti pembayaran pada formulir di sebelah kanan untuk diverifikasi oleh Admin.</span>
                </div>
              </div>

            </div>
          </div>

          {/* Kolom Kanan: Upload Bukti Transfer & Status Detail */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Form & Pratinjau Upload Bukti */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                  Konfirmasi Pembayaran
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Unggah Bukti Transfer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Diperlukan untuk verifikasi manual oleh admin ContentHub.
                </p>
              </div>

              {/* TAMPILKAN STATUS JIKA SUDAH LUNAS */}
              {trackingStatus === 'lunas' ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-2xl font-black">check</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-900">Pembayaran Terverifikasi!</h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      Paket langganan <strong>{order?.plan_name}</strong> Anda telah aktif. Seluruh limit fitur telah dibuka.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      to="/dashboard"
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">space_dashboard</span>
                      Buka Workspace Sekarang
                    </Link>
                  </div>
                </div>
              ) : (
                /* FORM UPLOAD JIKA BELUM LUNAS */
                <form onSubmit={handleUploadProof} className="space-y-4">
                  
                  {/* Pratinjau Bukti yang Sudah Ada atau Baru Dipilih */}
                  {(previewUrl || proofImageUrl) ? (
                    <div className="space-y-3">
                      <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-56 flex items-center justify-center">
                        <img 
                          src={previewUrl || proofImageUrl} 
                          alt="Bukti Transfer" 
                          className="w-full h-auto object-cover max-h-56 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setShowImageModal(true)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowImageModal(true)}
                          className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-bold transition-opacity"
                        >
                          <span className="material-symbols-outlined text-base">zoom_in</span>
                          Klik untuk Perbesar
                        </button>
                      </div>

                      {proofImageUrl && !previewUrl && (
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800 text-[11px] font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-blue-600">info</span>
                          <span>Bukti transfer telah tersimpan. Sedang ditinjau oleh Admin.</span>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Input File Box */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilih Foto / Tangkapan Layar Struk:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer border border-slate-200 rounded-xl p-1.5 bg-slate-50"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Format didukung: JPG, PNG, WEBP (Maksimal 5MB).
                    </span>
                  </div>

                  {/* Tombol Kirim Bukti */}
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="w-full py-3 bg-gradient-primary text-white rounded-xl font-extrabold text-xs shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Mengunggah Bukti...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                        <span>{order?.payment_proof_url ? 'Kirim Ulang Bukti Transfer' : 'Kirim Bukti Pembayaran'}</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Setelah bukti dikirim, status pesanan akan berubah menjadi <strong>Menunggu Verifikasi Admin</strong> dan diverifikasi dalam 5-15 menit.
                  </p>
                </form>
              )}

            </div>

            {/* Ringkasan Item Pesanan */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Ringkasan Tagihan
                </h4>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">receipt_long</span>
                  <span>Lihat Struk</span>
                </button>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">{order?.plan_name || 'Paket Langganan'}</span>
                <span className="font-semibold text-slate-600">Rp {amountNum.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Masa Berlaku</span>
                <span className="font-semibold text-slate-700">{order?.billing_cycle || 'Sesuai Paket'}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">Total Pembayaran</span>
                <span className="font-black text-primary text-sm">Rp {amountNum.toLocaleString('id-ID')}</span>
              </div>

              {/* Tombol Cetak Struk Cepat */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    trackingStatus === 'lunas'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  <span>Cetak Struk ({trackingStatus === 'lunas' ? 'Lunas' : 'Belum Lunas'})</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Modal Zoom Gambar Bukti Transfer */}
      {showImageModal && (previewUrl || proofImageUrl) && (
        <div 
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-2 border-b border-slate-100 mb-2">
              <span className="text-xs font-bold text-slate-700">Preview Bukti Transfer</span>
              <button 
                onClick={() => setShowImageModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <img 
              src={previewUrl || proofImageUrl} 
              alt="Bukti Transfer Penuh" 
              className="max-h-[75vh] w-auto mx-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      {/* Modal Struk / Faktur Tagihan Digital Resmi (Lunas / Belum Lunas) */}
      {showReceiptModal && order && (
        <InvoiceReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          order={order}
        />
      )}

    </div>
  );
}
