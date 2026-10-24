<<<<<<< HEAD
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path) =>
    `font-medium text-sm transition-colors py-1 ${
      isActive(path)
        ? 'text-primary border-b-2 border-primary font-bold'
        : 'text-slate-600 hover:text-primary'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/15 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-2xl">layers</span>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-primary">ContentHub</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full">
                SaaS UMKM
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            <Link to="/about" className={navLinkClass('/about')}>About</Link>
            <Link to="/pricing" className={navLinkClass('/pricing')}>Pricing</Link>
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
            <Link to="/calendar" className={navLinkClass('/calendar')}>Calendar</Link>
            <Link to="/templates" className={navLinkClass('/templates')}>Templates</Link>
            <Link to="/help" className={navLinkClass('/help')}>Bantuan</Link>

            {isAdmin && (
              <Link 
                to="/admin" 
                className="bg-error-container text-on-error-container text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full hover:bg-error hover:text-white transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Right Section: Auth & Role Info */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Profile Pill */}
              <div 
                onClick={() => navigate('/profile')} 
                className="flex items-center gap-2.5 p-1.5 pr-3 bg-surface-container-low hover:bg-surface-container-high rounded-full cursor-pointer transition-colors border border-outline-variant/15"
                title="Kelola Profil & Akun"
              >
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-on-surface leading-tight max-w-[120px] truncate">{currentUser.name}</p>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                    isAdmin ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Quick Switcher Button */}
              <Link
                to="/switch-account"
                className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                title="Ganti Akun"
              >
                <span className="material-symbols-outlined text-xl">switch_account</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                title="Keluar"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-primary hover:text-primary-container transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-bold bg-gradient-primary text-white rounded-xl shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Daftar Gratis
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant/20 px-6 py-4 space-y-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">Home</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">About</Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">Pricing</Link>
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">Dashboard</Link>
          <Link to="/calendar" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">Calendar</Link>
          <Link to="/templates" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">Templates</Link>
          <Link to="/help" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">Bantuan</Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-red-600">Admin Dashboard</Link>
          )}
        </div>
      )}
    </header>
  );
}
=======
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
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
