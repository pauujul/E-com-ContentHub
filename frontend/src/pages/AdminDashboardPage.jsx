import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { currentUser, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, usersRes] = await Promise.all([api.getAdminStats(), api.getOrders(), api.getUsers()]);

      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (usersRes.success) setUsersList(usersRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setFeedbackMsg(res.message);
        setTimeout(() => setFeedbackMsg(''), 3000);
        // Refresh orders
        const ordersRes = await api.getOrders();
        if (ordersRes.success) setOrders(ordersRes.data);
        const statsRes = await api.getAdminStats();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 p-8 pt-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Admin Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-outline-variant/15">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-300">Role: Administrator</span>
                <span className="text-xs text-outline">• Logged in as: {currentUser?.name}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-on-surface">Admin Dashboard & Order Management</h1>
              <p className="text-sm text-on-surface-variant mt-1">Pantau seluruh transaksi database PostgreSQL, konfirmasi pembayaran, dan lihat log login pengguna.</p>
            </div>

            <button onClick={loadAdminData} className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-dim rounded-xl text-xs font-bold text-on-surface flex items-center gap-2 transition-colors border border-outline-variant/15">
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh Data Database
            </button>
          </header>

          {feedbackMsg && (
            <div className="p-4 bg-green-50 text-green-700 rounded-2xl text-xs font-bold border border-green-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {feedbackMsg}
            </div>
          )}

          {/* Admin Metrics Bento */}
          {stats && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-outline">Total Pendapatan (Paid)</span>
                <p className="text-2xl font-extrabold text-primary">Rp {stats.total_revenue.toLocaleString('id-ID')}</p>
                <span className="text-[10px] font-bold text-green-600">Terverifikasi Real-time</span>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-outline">Total Pesanan</span>
                <p className="text-2xl font-extrabold text-on-surface">{stats.total_orders}</p>
                <span className="text-[10px] font-bold text-outline">
                  {stats.paid_orders} Paid • {stats.pending_orders} Pending
                </span>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-outline">Pesanan Butuh Verifikasi</span>
                <p className="text-2xl font-extrabold text-amber-600">{stats.pending_orders}</p>
                <span className="text-[10px] font-bold text-amber-700">Status Menunggu</span>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-outline">Total Pengguna Terdaftar</span>
                <p className="text-2xl font-extrabold text-secondary">{stats.total_users}</p>
                <span className="text-[10px] font-bold text-outline">{stats.total_customers} Customer UMKM</span>
              </div>
            </section>
          )}

          {/* Orders Table from Database */}
          <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex justify-between items-center px-2">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Daftar Transaksi Pesanan (Tabel Orders)</h2>
                <p className="text-xs text-on-surface-variant">Terhubung live ke tabel PostgreSQL `orders` dan `order_items`.</p>
              </div>
              <span className="text-xs font-bold bg-primary-fixed text-primary px-3 py-1 rounded-full">{orders.length} Transaksi</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/15 text-outline uppercase tracking-wider bg-surface-container-low">
                    <th className="py-3 px-4 font-bold">No. Order</th>
                    <th className="py-3 px-4 font-bold">Pelanggan</th>
                    <th className="py-3 px-4 font-bold">Paket Langganan</th>
                    <th className="py-3 px-4 font-bold">Total (Rp)</th>
                    <th className="py-3 px-4 font-bold">Metode / Channel</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-center">Aksi Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-primary">{ord.order_number}</td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-on-surface">{ord.customer_name}</p>
                        <p className="text-[10px] text-outline">{ord.customer_email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-on-surface">{ord.plan_name}</span>
                        <span className="text-[10px] text-outline block">({ord.billing_cycle})</span>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-on-surface">Rp {parseFloat(ord.total_amount).toLocaleString('id-ID')}</td>
                      <td className="py-4 px-4 text-on-surface-variant">
                        <p className="font-semibold">{ord.payment_channel}</p>
                        <p className="text-[10px] text-outline">{ord.payment_method}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.status === 'Paid' ? 'bg-green-100 text-green-800' : ord.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {ord.status !== 'Paid' && (
                            <button onClick={() => handleUpdateStatus(ord.id, 'Paid')} disabled={updatingId === ord.id} className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold transition-colors">
                              Set Paid
                            </button>
                          )}
                          {ord.status !== 'Pending' && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, 'Pending')}
                              disabled={updatingId === ord.id}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition-colors"
                            >
                              Set Pending
                            </button>
                          )}
                          {ord.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, 'Cancelled')}
                              disabled={updatingId === ord.id}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[10px] font-bold transition-colors"
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Users Login Log (Table Users from Database) */}
          <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center px-2">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Daftar Akun Pengguna & Aktivitas Login (Tabel Users)</h2>
                <p className="text-xs text-on-surface-variant">Kolom `updated_at` mencatat aktivitas login terbaru secara langsung ke database.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/15 text-outline uppercase tracking-wider bg-surface-container-low">
                    <th className="py-3 px-4 font-bold">ID</th>
                    <th className="py-3 px-4 font-bold">Nama Pengguna</th>
                    <th className="py-3 px-4 font-bold">Email</th>
                    <th className="py-3 px-4 font-bold">Role</th>
                    <th className="py-3 px-4 font-bold">Telepon</th>
                    <th className="py-3 px-4 font-bold">Aktivitas Terakhir (updated_at)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container-low/50">
                      <td className="py-3 px-4 font-bold text-outline">#{u.id}</td>
                      <td className="py-3 px-4 font-bold text-on-surface">{u.name}</td>
                      <td className="py-3 px-4 text-on-surface-variant">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                      </td>
                      <td className="py-3 px-4 text-outline">{u.phone || '—'}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-green-700">{u.created_at ? new Date(u.created_at).toLocaleString('id-ID') : 'Aktif'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
