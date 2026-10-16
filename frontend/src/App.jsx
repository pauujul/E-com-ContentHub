import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Pricing from './components/Pricing';
import CalendarPreview from './components/CalendarPreview';
import OrderHistory from './components/OrderHistory';

export default function App() {
  const [currentRole, setCurrentRole] = useState('customer'); // 'customer' | 'admin'
  const [activeTab, setActiveTab] = useState('pricing');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [adminStats, setAdminStats] = useState({ totalRevenue: 0, totalOrders: 0, orders: [] });

  const handleOrderCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Ambil data untuk dashboard pemilik platform
    axios.get('http://localhost:5000/api/orders')
      .then(res => {
        if (res.data && res.data.data) {
          const orders = res.data.data;
          const totalRevenue = orders
            .filter(o => o.status === 'Paid')
            .reduce((acc, curr) => acc + parseFloat(curr.total_amount || 0), 0);
          setAdminStats({
            totalRevenue,
            totalOrders: orders.length,
            orders
          });
        }
      })
      .catch(err => console.error(err));
  }, [refreshTrigger, currentRole]);

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
      />

      <main style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* ================= TAMPILAN PENGGUNA (UMKM) ================= */}
        {currentRole === 'customer' && (
          <>
            {activeTab === 'pricing' && (
              <Pricing onOrderCreated={handleOrderCreated} />
            )}
            {activeTab === 'calendar' && (
              <CalendarPreview />
            )}
            {activeTab === 'orders' && (
              <OrderHistory refreshKey={refreshTrigger} />
            )}
          </>
        )}

        {/* ================= TAMPILAN PEMILIK (ADMIN CONTENTHUB) ================= */}
        {currentRole === 'admin' && (
          <div>
            {activeTab === 'admin_dashboard' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Dashboard Manajemen ContentHub</h1>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>Pantau pendapatan platform, transaksi langganan UMKM, dan metrik bisnis SaaS.</p>
                </div>

                {/* Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>TOTAL PENDAPATAN LANGGANAN</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', marginTop: '8px' }}>
                      Rp {adminStats.totalRevenue.toLocaleString('id-ID')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px' }}>Status: Pembayaran Terverifikasi</div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>TOTAL TRANSAKSI MASUK</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
                      {adminStats.totalOrders} Pesanan
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Mencakup paket Free, Starter & Pro</div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>STATUS INFRASTRUKTUR</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb', marginTop: '12px' }}>
                      🟢 PostgreSQL Container Aktif
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Docker Bridge Network Connected</div>
                  </div>
                </div>

                {/* Quick Table View */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Transaksi Langganan Terbaru</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '10px' }}>No. Order</th>
                        <th style={{ padding: '10px' }}>Customer / UMKM</th>
                        <th style={{ padding: '10px' }}>Paket SaaS</th>
                        <th style={{ padding: '10px' }}>Total Bayar</th>
                        <th style={{ padding: '10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminStats.orders.map((ord, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontWeight: 600 }}>{ord.order_number}</td>
                          <td style={{ padding: '10px' }}>{ord.customer_name} ({ord.customer_email})</td>
                          <td style={{ padding: '10px' }}>{ord.plan_name}</td>
                          <td style={{ padding: '10px', fontWeight: 600 }}>Rp {parseFloat(ord.total_amount).toLocaleString('id-ID')}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: ord.status === 'Paid' ? '#dcfce7' : '#fef9c3',
                              color: ord.status === 'Paid' ? '#15803d' : '#a16207'
                            }}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'admin_orders' && (
              <OrderHistory refreshKey={refreshTrigger} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}