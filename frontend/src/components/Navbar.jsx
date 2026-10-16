import React from 'react';

export default function Navbar({ activeTab, setActiveTab, currentRole, setCurrentRole }) {
  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      {/* Brand & Mode Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: currentRole === 'admin' ? '#0f172a' : '#2563eb',
          color: '#ffffff',
          fontWeight: 800,
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '18px'
        }}>
          CH
        </div>
        <div>
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>ContentHub</span>
          <span style={{
            marginLeft: '8px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: '999px',
            background: currentRole === 'admin' ? '#fee2e2' : '#dbeafe',
            color: currentRole === 'admin' ? '#991b1b' : '#1e40af'
          }}>
            {currentRole === 'admin' ? 'Portal Pemilik (Admin)' : 'Portal UMKM (Konsumen)'}
          </span>
        </div>
      </div>

      {/* Dynamic Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '8px' }}>
        {currentRole === 'customer' ? (
          <>
            <button
              onClick={() => setActiveTab('pricing')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                background: activeTab === 'pricing' ? '#2563eb' : 'transparent',
                color: activeTab === 'pricing' ? '#fff' : '#64748b'
              }}
            >
              🏷️ Paket Langganan
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                background: activeTab === 'calendar' ? '#2563eb' : 'transparent',
                color: activeTab === 'calendar' ? '#fff' : '#64748b'
              }}
            >
              📅 Kalender Konten Saya
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                background: activeTab === 'orders' ? '#2563eb' : 'transparent',
                color: activeTab === 'orders' ? '#fff' : '#64748b'
              }}
            >
              💳 Tagihan & Langganan
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('admin_dashboard')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                background: activeTab === 'admin_dashboard' ? '#0f172a' : 'transparent',
                color: activeTab === 'admin_dashboard' ? '#fff' : '#64748b'
              }}
            >
              📊 Ringkasan Bisnis
            </button>
            <button
              onClick={() => setActiveTab('admin_orders')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                background: activeTab === 'admin_orders' ? '#0f172a' : 'transparent',
                color: activeTab === 'admin_orders' ? '#fff' : '#64748b'
              }}
            >
              💰 Kelola Transaksi Masuk
            </button>
          </>
        )}
      </nav>

      {/* Switcher Role Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => {
            const nextRole = currentRole === 'customer' ? 'admin' : 'customer';
            setCurrentRole(nextRole);
            setActiveTab(nextRole === 'customer' ? 'pricing' : 'admin_dashboard');
          }}
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            color: '#334155'
          }}
        >
          🔄 Ganti ke: {currentRole === 'customer' ? 'Mode Pemilik' : 'Mode Pengguna'}
        </button>
      </div>
    </header>
  );
}