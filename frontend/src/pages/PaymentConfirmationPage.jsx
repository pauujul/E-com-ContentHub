import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function PaymentConfirmationPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderNumber) {
      api.getOrderById(orderNumber)
        .then(res => {
          if (res.success && res.data) {
            setOrder(res.data);
          }
        })
        .catch(err => {
          console.warn('Could not fetch confirmed order details:', err);
        });
    }
  }, [orderNumber]);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between">
      <Navbar />

      <main className="pt-28 pb-16 px-6 flex items-center justify-center flex-1">
        <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500 space-y-8 text-center">
          {/* Success Ring Indicator */}
          <div>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-surface-container-lowest shadow-md mb-6 relative border border-outline-variant/15">
              <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-pulse"></div>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  check_circle
                </span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-2">
              Pembayaran Berhasil!
            </h1>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
              Terima kasih telah mempercayai ContentHub. Akun bisnis Anda telah berhasil diperbarui ke paket langganan.
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="bg-surface-container-lowest rounded-3xl shadow-lg border border-outline-variant/15 overflow-hidden text-left">
            <div className="bg-surface-container-low px-8 py-4 flex justify-between items-center border-b border-outline-variant/15">
              <span className="text-xs font-bold font-mono uppercase text-outline">
                Order ID: {order?.order_number || orderNumber || 'CH-882910'}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 px-3 py-0.5 rounded-full">
                Lunas (Paid)
              </span>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">
                    {order?.plan_name || 'ContentHub Starter (Hero Plan)'}
                  </h2>
                  <p className="text-xs text-on-surface-variant">Siklus: {order?.billing_cycle || 'Bulanan'}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-primary">
                    Rp {order?.total_amount ? parseFloat(order.total_amount).toLocaleString('id-ID') : '98.000'}
                  </p>
                  <p className="text-[10px] text-green-600 font-bold">Terverifikasi Otomatis</p>
                </div>
              </div>

              {/* Bento Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/15">
                  <span className="text-[10px] font-bold uppercase text-outline block mb-1">Status Lisensi</span>
                  <p className="text-xs font-bold text-on-surface">Aktif Penuh</p>
                  <p className="text-[10px] text-on-surface-variant">Akses Kalender & Canva Terbuka</p>
                </div>

                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/15">
                  <span className="text-[10px] font-bold uppercase text-outline block mb-1">Metode Pembayaran</span>
                  <p className="text-xs font-bold text-on-surface">
                    {order?.payment_channel || 'BCA Virtual Account'}
                  </p>
                  <p className="text-[10px] text-on-surface-variant">Transaksi Sah & Resmi</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Link
                  to="/dashboard"
                  className="w-full py-4 bg-gradient-primary text-white font-bold rounded-2xl text-sm shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Masuk ke Dashboard Utama</span>
                  <span className="material-symbols-outlined text-base">dashboard</span>
                </Link>

                <Link
                  to="/calendar"
                  className="w-full py-3.5 bg-surface-container-high hover:bg-surface-dim font-bold rounded-2xl text-xs text-on-surface transition-colors text-center block"
                >
                  Mulai Rencanakan Konten di Kalender &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
