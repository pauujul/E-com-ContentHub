import React, { useState, useEffect } from 'react';
import axios from 'axios';

<<<<<<< HEAD
export default function OrderHistory({ refreshKey, currentUser, onOpenLogin }) {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const API_BASE = 'http://localhost:5000/api';
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, [refreshKey, currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Ambil data order: jika user biasa, filter berdasarkan user_id miliknya
      let orderUrl = `${API_BASE}/orders`;
      if (!isAdmin && currentUser) {
        orderUrl += `?user_id=${currentUser.id}`;
      }

      const resOrders = await axios.get(orderUrl);
      if (resOrders.data && resOrders.data.data) {
        setOrders(resOrders.data.data);
      }

      // 2. Jika Admin, ambil juga statistik analitik
      if (isAdmin) {
        try {
          const resStats = await axios.get(`${API_BASE}/admin/stats`);
          if (resStats.data && resStats.data.success) {
            setStats(resStats.data.data);
          }
        } catch (e) {
          console.warn('Gagal memuat statistik admin:', e);
        }
      } else {
        setStats(null);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data transaksi dari server backend.');
=======
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
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // Khusus Admin: Update status pembayaran pesanan
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await axios.patch(`${API_BASE}/orders/${orderId}/status`, {
        status: newStatus
      });

      if (res.data && res.data.success) {
        setFeedbackMsg(`Berhasil! Pesanan statusnya telah diperbarui ke ${newStatus}.`);
        setTimeout(() => setFeedbackMsg(null), 4000);
        fetchData();
      }
    } catch (err) {
      alert('Gagal mengubah status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

=======
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
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
<<<<<<< HEAD
      {/* Header Halaman */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              {isAdmin ? '👑 Dashboard Admin - Manajemen Transaksi' : '💳 Riwayat Pesanan & Langganan'}
            </h2>
            <span className={`role-pill ${isAdmin ? 'pill-admin' : 'pill-customer'}`}>
              {isAdmin ? 'Mode Administrator' : 'Mode Pelanggan UMKM'}
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            {isAdmin 
              ? 'Administrator memiliki hak istimewa melihat semua transaksi pelanggan UMKM dan mengonfirmasi pembayaran.'
              : `Menampilkan riwayat langganan untuk akun: ${currentUser?.name || 'Tamu / Default'}`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchData}
            style={{
              padding: '9px 16px',
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
      </div>

      {/* Alert Notifikasi Sukses / Pesan */}
      {feedbackMsg && (
        <div style={{
          background: '#dcfce7',
          color: '#15803d',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontWeight: 600,
          fontSize: '14px',
          border: '1px solid #86efac'
        }}>
          ✅ {feedbackMsg}
        </div>
      )}

      {/* STATS KHUSUS ADMIN */}
      {isAdmin && stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-title">Total Pendapatan Lunas</div>
            <div className="stat-value text-success">{formatRupiah(stats.total_revenue)}</div>
            <div className="stat-desc">Akumulasi transaksi status Paid</div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-title">Total Seluruh Pesanan</div>
            <div className="stat-value">{stats.total_orders} Pesanan</div>
            <div className="stat-desc">{stats.paid_orders} Lunas • {stats.pending_orders} Menunggu</div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-title">Pesanan Butuh Verifikasi</div>
            <div className="stat-value text-warning">{stats.pending_orders} Pending</div>
            <div className="stat-desc">Memerlukan konfirmasi pembayaran</div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-title">Total Pelanggan UMKM</div>
            <div className="stat-value text-primary">{stats.total_customers} UMKM</div>
            <div className="stat-desc">Terdaftar di database users</div>
          </div>
        </div>
      )}

      {/* Banner info akun jika belum login atau bukan admin */}
      {!currentUser && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          padding: '14px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong style={{ color: '#1e40af' }}>Ingin melihat tampilan sebagai Admin atau User lain?</strong>
            <p style={{ color: '#3b82f6', fontSize: '13px', margin: 0 }}>
              Gunakan fitur login untuk beralih antara akun Administrator (Jerry Hernis) dan Pelanggan UMKM (Muhammad Hasran).
            </p>
          </div>
          <button 
            onClick={onOpenLogin}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Pilih Akun Login
          </button>
        </div>
      )}

      {loading && <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Memuat transaksi dari PostgreSQL...</p>}
=======
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
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc

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
<<<<<<< HEAD
                {isAdmin && <th>Aksi Admin</th>}
=======
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
<<<<<<< HEAD
                  <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Belum ada riwayat transaksi pada akun ini. Silakan pilih paket di menu Katalog Paket!
=======
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    Belum ada riwayat transaksi. Silakan lakukan pemesanan di menu Paket & Harga!
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
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
<<<<<<< HEAD
                      <div style={{ fontWeight: 600 }}>{ord.plan_name}</div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>({ord.billing_cycle})</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatRupiah(ord.total_amount)}</td>
                    <td>{ord.payment_channel || ord.payment_method}</td>
                    <td>
                      <span className={`badge-status ${ord.status.toLowerCase()}`}>
                        {ord.status === 'Paid' ? '✓ LUNAS' : ord.status === 'Pending' ? '⏳ PENDING' : '✕ BATAL'}
=======
                      <div>{ord.plan_name}</div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>({ord.billing_cycle})</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatRupiah(ord.total_amount)}</td>
                    <td>{ord.payment_channel || ord.payment_method}</td>
                    <td>
                      <span className={`badge-status ${ord.status.toLowerCase()}`}>
                        {ord.status}
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(ord.created_at).toLocaleString('id-ID')}
                    </td>
<<<<<<< HEAD
                    {isAdmin && (
                      <td>
                        {ord.status === 'Pending' ? (
                          <button
                            disabled={updatingId === ord.id}
                            onClick={() => handleUpdateStatus(ord.id, 'Paid')}
                            style={{
                              background: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Konfirmasi pembayaran pelanggan telah diterima"
                          >
                            {updatingId === ord.id ? '...' : '✅ Set Lunas'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                            Selesai
                          </span>
                        )}
                      </td>
                    )}
=======
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
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
