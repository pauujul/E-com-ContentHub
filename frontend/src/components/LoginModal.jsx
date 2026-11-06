import React, { useState } from 'react';
import axios from 'axios';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
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
              Masukkan alamat email dan kata sandi akun Anda.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && (
          <div className="auth-error-alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="manual-login-form" style={{ marginTop: '16px' }}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Alamat Email
            </label>
            <input
              type="email"
              required
              placeholder="nama@bisnis.com"
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
              placeholder="Masukkan kata sandi"
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

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
          Platform E-Commerce ContentHub SaaS • Tim Amigos
        </div>
      </div>
    </div>
  );
}
