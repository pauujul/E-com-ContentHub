import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function OrderHistory({ refreshKey }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchOrders();
  }, [refreshKey]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/orders`);
      if (res.data && res.data.data) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Gagal memuat data transaksi dari backend.');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num === 0) return 'Rp 0 (Gratis)';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="container" style={{ padding: '32px 20px 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
            💳 Riwayat Transaksi & Langganan
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Data tersinkronisasi langsung dari database PostgreSQL (`orders` & `users`).
          </p>
        </div>
        <button 
          onClick={fetchOrders}
          style={{
            padding: '8px 16px',
            background: '#e0e7ff',
            color: '#4338ca',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px'
          }}
        >
          🔄 Refresh Data
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Memuat transaksi...</p>}

      {error && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Order</th>
                <th>Nama Pelanggan</th>
                <th>Paket Langganan</th>
                <th>Total Biaya</th>
                <th>Metode Bayar</th>
                <th>Status</th>
                <th>Waktu Transaksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    Belum ada riwayat transaksi. Silakan lakukan pemesanan di menu Paket & Harga!
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5' }}>
                      {ord.order_number}
                    </td>
                    <td>
                      <div><strong>{ord.customer_name}</strong></div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{ord.customer_email}</div>
                    </td>
                    <td>
                      <div>{ord.plan_name}</div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>({ord.billing_cycle})</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatRupiah(ord.total_amount)}</td>
                    <td>{ord.payment_channel || ord.payment_method}</td>
                    <td>
                      <span className={`badge-status ${ord.status.toLowerCase()}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(ord.created_at).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
