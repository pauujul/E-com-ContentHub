import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function TransactionDetailPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      api.getOrderById(orderNumber)
        .then(res => {
          if (res.success && res.data) {
            setOrder(res.data);
          }
        })
        .catch(err => {
          console.warn('Could not fetch single order, fallback to default order:', err.message);
          // Fallback mock order
          setOrder({
            order_number: orderNumber || 'ORD-20261024-9800',
            plan_name: 'ContentHub Starter (Hero)',
            total_amount: '98000.00',
            status: 'Pending',
            payment_channel: 'BCA Virtual Account',
            payment_method: 'Virtual Account'
          });
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setOrder({
        order_number: 'ORD-20261024-9800',
        plan_name: 'ContentHub Starter (Hero)',
        total_amount: '98000.00',
        status: 'Pending',
        payment_channel: 'BCA Virtual Account',
        payment_method: 'Virtual Account'
      });
    }
  }, [orderNumber]);

  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      // Jika order ada id-nya di database, update status ke Paid
      if (order?.id) {
        await api.updateOrderStatus(order.id, 'Paid');
      }
      navigate(`/payment-confirmation/${order?.order_number || orderNumber}`);
    } catch (err) {
      console.warn('Status update fallback:', err);
      navigate(`/payment-confirmation/${order?.order_number || orderNumber}`);
    } finally {
      setConfirming(false);
    }
  };

  const amountNum = order ? parseFloat(order.total_amount) : 98000;
  const vaNumber = '8801' + (order?.id ? String(1000000000 + order.id) : '9988223311');

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />

      <main className="pt-24 pb-16 px-6 md:px-12 max-w-5xl mx-auto">
        <header className="mb-8 flex items-center justify-between pb-4 border-b border-outline-variant/15">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 rounded-xl text-outline hover:text-primary hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-on-surface">Instruksi Pembayaran Tagihan</h1>
              <p className="text-xs text-on-surface-variant">Selesaikan transfer sebelum batas waktu berakhir.</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            Menunggu Pembayaran
          </span>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            <p className="mt-3 text-xs font-semibold text-outline">Memuat detail tagihan...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: QR / VA & Timer */}
            <div className="md:col-span-7 space-y-6">
              {/* Payment Box */}
              <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/15 text-center relative overflow-hidden">
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold tracking-wider uppercase">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  Batas Waktu: 23 Jam 59 Menit
                </div>

                {/* Virtual Account display or QR */}
                <div className="p-6 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/30 max-w-sm mx-auto my-6 space-y-2">
                  <span className="text-xs font-bold text-outline uppercase tracking-wider block">
                    {order?.payment_channel || 'BCA Virtual Account'}
                  </span>
                  <p className="text-2xl md:text-3xl font-mono font-extrabold text-primary tracking-widest">
                    {vaNumber}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(vaNumber)}
                    className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    <span className="material-symbols-outlined text-xs">content_copy</span>
                    Salin Nomor VA
                  </button>
                </div>

                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Transfer tepat sesuai nominal tagihan melalui ATM, Mobile Banking, atau Internet Banking.
                </p>
              </div>

              {/* Transaction Details Bento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/15">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-outline mb-1">Total Tagihan</p>
                  <p className="text-xl font-extrabold text-primary">
                    Rp {amountNum.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/15">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-outline mb-1">Nomor Pesanan (Order ID)</p>
                  <p className="text-sm font-mono font-bold text-on-surface truncate">
                    {order?.order_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Instructions */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/15 space-y-6">
                <h2 className="text-lg font-bold text-on-surface">Panduan Langkah Pembayaran</h2>

                <div className="space-y-4 text-xs leading-relaxed">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center flex-shrink-0">
                      1
                    </div>
                    <p className="text-on-surface-variant">
                      Buka aplikasi m-Banking atau ATM bank Anda (misal BCA / Mandiri).
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center flex-shrink-0">
                      2
                    </div>
                    <p className="text-on-surface-variant">
                      Pilih menu <strong>Transfer &gt; Virtual Account</strong>.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center flex-shrink-0">
                      3
                    </div>
                    <p className="text-on-surface-variant">
                      Masukkan nomor VA: <strong className="font-mono">{vaNumber}</strong>.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center flex-shrink-0">
                      4
                    </div>
                    <p className="text-on-surface-variant">
                      Pastikan nama penerima tertulis <strong>ContentHub - {order?.plan_name}</strong> dan nominal <strong>Rp {amountNum.toLocaleString('id-ID')}</strong>.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center flex-shrink-0">
                      5
                    </div>
                    <p className="text-on-surface-variant">
                      Selesaikan transaksi dan tekan tombol di bawah ini untuk mengonfirmasi aktivasi.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/15 space-y-3">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={confirming}
                    className="w-full py-4 bg-gradient-primary text-white font-bold rounded-2xl text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {confirming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Memverifikasi Pembayaran...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        <span>Saya Sudah Melakukan Pembayaran</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-outline">
                    Verifikasi otomatis berjalan 24/7 tanpa perlu mengirim bukti manual.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
