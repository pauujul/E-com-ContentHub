import React, { useState } from 'react';
import axios from 'axios';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' or 'manual'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

  if (!isOpen) return null;

  const handleLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: loginEmail,
        password: loginPassword
      });

      if (response.data && response.data.success) {
        const { user, token } = response.data.data;
        onLoginSuccess(user, token);
        onClose();
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Gagal login. Pastikan server backend aktif di port 5000.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Harap isi email dan password.');
      return;
    }
    handleLogin(email, password);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header Modal */}
        <div className="modal-header">
          <div>
            <span className="auth-badge-tag">Autentikasi Pengguna</span>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              Masuk ke ContentHub
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Pilih peran akun (User / Admin) untuk menguji fitur & hak akses.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Tab Selector */}
        <div className="auth-tab-nav">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'quick' ? 'active' : ''}`}
            onClick={() => { setActiveTab('quick'); setError(null); }}
          >
            ⚡ Login Cepat (1-Klik)
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => { setActiveTab('manual'); setError(null); }}
          >
            🔑 Form Manual (Email & Sandi)
          </button>
        </div>

        {error && (
          <div className="auth-error-alert">
            ⚠️ {error}
          </div>
        )}

        {/* TAB 1: 1-Click Quick Demo Login */}
        {activeTab === 'quick' && (
          <div className="quick-login-list">
            {/* Akun 1: Customer UMKM */}
            <div className="quick-login-card customer" onClick={() => !loading && handleLogin('hasran.donat@gmail.com', 'hasran123')}>
              <div className="quick-avatar customer-avatar">🍩</div>
              <div className="quick-info">
                <div className="quick-header-row">
                  <strong>Muhammad Hasran</strong>
                  <span className="role-tag role-customer">Pelanggan UMKM</span>
                </div>
                <span className="quick-email">hasran.donat@gmail.com</span>
                <span className="quick-desc">Persona UMKM Donat: Berlangganan paket & kelola kalender konten</span>
              </div>
              <button className="quick-action-btn btn-customer" disabled={loading}>
                {loading ? '...' : 'Masuk →'}
              </button>
            </div>

            {/* Akun 2: Administrator Utama */}
            <div className="quick-login-card admin" onClick={() => !loading && handleLogin('jerry.hernis@amigos.id', 'admin123')}>
              <div className="quick-avatar admin-avatar">👑</div>
              <div className="quick-info">
                <div className="quick-header-row">
                  <strong>Jerry Hernis</strong>
                  <span className="role-tag role-admin">Administrator</span>
                </div>
                <span className="quick-email">jerry.hernis@amigos.id</span>
                <span className="quick-desc">Persona Admin: Kelola semua transaksi, verifikasi pembayaran & pantau statistik</span>
              </div>
              <button className="quick-action-btn btn-admin" disabled={loading}>
                {loading ? '...' : 'Masuk →'}
              </button>
            </div>

            {/* Akun 3: Administrator Kedua */}
            <div className="quick-login-card admin" onClick={() => !loading && handleLogin('fauzul@amigos.id', 'fauzul123')}>
              <div className="quick-avatar admin-avatar">🛡️</div>
              <div className="quick-info">
                <div className="quick-header-row">
                  <strong>Fauzul Rozaq</strong>
                  <span className="role-tag role-admin">Administrator</span>
                </div>
                <span className="quick-email">fauzul@amigos.id</span>
                <span className="quick-desc">Persona Admin Teknis: Manajemen katalog paket dan monitoring sistem</span>
              </div>
              <button className="quick-action-btn btn-admin" disabled={loading}>
                {loading ? '...' : 'Masuk →'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Form Input Manual */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="manual-login-form">
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Alamat Email
              </label>
              <input
                type="email"
                required
                placeholder="contoh: jerry.hernis@amigos.id atau hasran.donat@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Kata Sandi
              </label>
              <input
                type="password"
                required
                placeholder="Masukkan kata sandi (misal: admin123 atau hasran123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#64748b',
              marginBottom: '18px',
              border: '1px dashed #cbd5e1'
            }}>
              💡 <strong>Petunjuk Akun Database:</strong>
              <br />• Admin: <code>jerry.hernis@amigos.id</code> / Sandi: <code>admin123</code>
              <br />• Customer: <code>hasran.donat@gmail.com</code> / Sandi: <code>hasran123</code>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
          Platform E-Commerce ContentHub SaaS • Tim Amigos
        </div>
      </div>
    </div>
  );
}
