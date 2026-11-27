import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import InvoiceReceiptModal from '../components/InvoiceReceiptModal';

export default function InvoiceReceiptPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderNumber) {
      setLoading(true);
      api.getOrderById(orderNumber)
        .then(res => {
          if (res.success && res.data) {
            setOrder(res.data);
          } else {
            setError(res.message || 'Struk tidak ditemukan.');
          }
        })
        .catch(err => {
          console.error('Error fetching receipt order:', err);
          setError('Gagal memuat struk transaksi.');
        })
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Menyiapkan Struk Tagihan...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <span className="material-symbols-outlined text-4xl text-red-500">error</span>
          <h2 className="text-lg font-black text-slate-800">Struk Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">{error || 'Nomor faktur tidak ditemukan.'}</p>
          <Link
            to="/transactions"
            className="inline-block py-2.5 px-5 bg-primary text-white rounded-xl text-xs font-bold shadow-xs hover:bg-primary/90"
          >
            Kembali ke Riwayat Transaksi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <InvoiceReceiptModal 
      isOpen={true} 
      onClose={() => window.history.back()} 
      order={order} 
    />
  );
}
