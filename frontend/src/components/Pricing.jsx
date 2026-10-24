import React, { useState, useEffect } from 'react';
import axios from 'axios';

<<<<<<< HEAD
export default function Pricing({ onOrderCreated, currentUser, onOpenLogin }) {
=======
export default function Pricing({ onOrderCreated }) {
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Modal Checkout
  const [selectedPlan, setSelectedPlan] = useState(null);
<<<<<<< HEAD
  const [customerName, setCustomerName] = useState(currentUser ? currentUser.name : 'Muhammad Hasran (UMKM Donat)');
  const [customerEmail, setCustomerEmail] = useState(currentUser ? currentUser.email : 'hasran.donat@gmail.com');
=======
  const [customerName, setCustomerName] = useState('Muhammad Hasran (UMKM Donat)');
  const [customerEmail, setCustomerEmail] = useState('hasran.donat@gmail.com');
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
  const [paymentMethod, setPaymentMethod] = useState('Virtual Account');
  const [paymentChannel, setPaymentChannel] = useState('BCA Virtual Account');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

<<<<<<< HEAD
  // Sinkronisasi data user aktif saat checkout
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);

=======
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
  // 1. Fetch katalog produk dari backend Node.js menggunakan Axios
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/products`);
      if (response.data && response.data.data) {
        setPlans(response.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil paket dari backend:', err);
      setError('Koneksi ke server backend belum terhubung. Pastikan container backend aktif di port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // Format IDR Rupiah
  const formatRupiah = (val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num === 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // 2. Handle Pembuatan Pesanan Langganan (Simulasi Checkout)
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
<<<<<<< HEAD
        user_id: currentUser ? currentUser.id : 2, // Sesuai user yang login (default: Hasran)
=======
        user_id: 2, // Sesuai customer persona LKM (Muhammad Hasran)
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
        plan_id: selectedPlan.id,
        payment_method: selectedPlan.price === 0 || selectedPlan.price === '0.00' ? 'Free Activation' : paymentMethod,
        payment_channel: selectedPlan.price === 0 || selectedPlan.price === '0.00' ? 'System' : paymentChannel
      };

      const response = await axios.post(`${API_BASE}/orders`, payload);

      if (response.data && response.data.success) {
        setOrderResult(response.data.data);
        if (onOrderCreated) {
          onOrderCreated();
        }
      }
    } catch (err) {
      alert('Gagal memproses transaksi: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedPlan(null);
    setOrderResult(null);
  };

  return (
    <section>
      {/* Hero Header */}
      <div className="hero-banner">
        <div className="hero-pill">
          ⚡ Solusi Perencanaan Konten Media Sosial UMKM Indonesia
        </div>
        <h1 className="hero-title">
          Tingkatkan Penjualan dengan <br />
          <span>Konten yang Konsisten & Terjadwal</span>
        </h1>
        <p className="hero-subtitle">
          Pilih paket langganan yang fleksibel untuk bisnis Anda. Dilengkapi kalender drag-and-drop interaktif,
          puluhan template siap pakai, dan notifikasi jadwal publikasi.
        </p>
      </div>

      <div className="container">
        {/* Loading & Error Handling */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <p>🔄 Sedang memuat data paket dari database PostgreSQL...</p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '16px 20px',
            borderRadius: '12px',
            margin: '20px auto',
            maxWidth: '700px',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>⚠️ Backend Belum Siap</p>
            <p style={{ fontSize: '14px' }}>{error}</p>
            <button 
              onClick={fetchProducts}
              style={{
                marginTop: '12px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: '#dc2626',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Coba Hubungkan Kembali
            </button>
          </div>
        )}

        {/* Pricing Cards Grid */}
        {!loading && !error && (
          <div className="pricing-grid">
            {plans.map((plan) => {
              const isHero = plan.is_hero || plan.sku === 'CH-START-M';
              const features = Array.isArray(plan.features) 
                ? plan.features 
                : typeof plan.features === 'string' 
                  ? JSON.parse(plan.features) 
                  : [];

              return (
                <div 
                  key={plan.id} 
                  className={`pricing-card ${isHero ? 'hero-card' : ''}`}
                >
                  {/* Badge Highlight untuk Hero Product UMKM */}
                  {plan.badge && (
                    <div className="badge-tag">
                      {plan.badge}
                    </div>
                  )}

                  <div className="plan-header">
                    <h3 className="plan-title">{plan.name}</h3>
                    <p className="plan-desc">{plan.description}</p>
                  </div>

                  <div className="plan-price-box">
                    <span className="plan-price">{formatRupiah(plan.price)}</span>
                    <span className="plan-cycle">
                      {plan.billing_cycle === 'Free' ? '/ selamanya' : `/${plan.billing_cycle.toLowerCase()}`}
                    </span>
                  </div>

                  {/* Fitur-Fitur Paket */}
                  <ul className="features-list">
                    {features.map((feature, idx) => (
                      <li key={idx}>
                        <span className="feature-check">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tombol Call To Action */}
                  <button
                    className={`btn-plan ${isHero ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {plan.price === 0 || plan.price === '0.00' 
                      ? '🚀 Mulai Gratis Sekarang' 
                      : `Pilih Paket ${plan.name.replace('ContentHub ', '')}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Simulasi Checkout & Pembayaran */}
      {selectedPlan && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {orderResult ? 'Status Transaksi' : 'Checkout Langganan'}
              </h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {!orderResult ? (
                <form onSubmit={handleCheckoutSubmit}>
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Paket Dipilih:</span>
                      <strong>{selectedPlan.name}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Siklus Penagihan:</span>
                      <span>{selectedPlan.billing_cycle}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total Biaya:</span>
                      <span style={{ color: '#4f46e5' }}>{formatRupiah(selectedPlan.price)}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nama Pelanggan (UMKM):</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Terdaftar:</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={customerEmail} 
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required 
                    />
                  </div>

                  {selectedPlan.price > 0 && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Metode Pembayaran (Sesuai LKM):</label>
                        <select 
                          className="form-select" 
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          <option value="Virtual Account">Virtual Account (Pilihan Utama)</option>
                          <option value="QRIS">QRIS (Gopay / Dana / OVO / ShopeePay)</option>
                          <option value="E-Wallet">E-Wallet Langsung</option>
                          <option value="Credit Card">Kartu Debit / Kredit</option>
                        </select>
                      </div>

                      {paymentMethod === 'Virtual Account' && (
                        <div className="form-group">
                          <label className="form-label">Pilih Bank Virtual Account:</label>
                          <select 
                            className="form-select" 
                            value={paymentChannel}
                            onChange={(e) => setPaymentChannel(e.target.value)}
                          >
                            <option value="BCA Virtual Account">BCA Virtual Account</option>
                            <option value="Mandiri Virtual Account">Mandiri Virtual Account</option>
                            <option value="BRI Virtual Account">BRI Virtual Account</option>
                            <option value="BNI Virtual Account">BNI Virtual Account</option>
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  <button 
                    type="submit" 
                    className="btn-plan btn-primary"
                    disabled={isSubmitting}
                    style={{ marginTop: '20px' }}
                  >
                    {isSubmitting 
                      ? 'Sedang Memproses ke Database...' 
                      : selectedPlan.price > 0 
                        ? 'Konfirmasi & Lanjutkan Pembayaran' 
                        : 'Aktifkan Paket Gratis Sekarang'}
                  </button>
                </form>
              ) : (
                <div className="success-box">
                  <div className="success-icon">
                    {orderResult.order.status === 'Paid' ? '🎉' : '⏳'}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
                    {orderResult.order.status === 'Paid' ? 'Aktivasi Berhasil!' : 'Pesanan Menunggu Pembayaran'}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                    Nomor Pesanan: <strong>{orderResult.order.order_number}</strong>
                  </p>

                  {orderResult.payment_instructions && (
                    <div className="va-box">
                      <p style={{ fontSize: '13px', color: '#64748b' }}>
                        Bayar via {orderResult.payment_instructions.channel}:
                      </p>
                      <div className="va-number">
                        {orderResult.payment_instructions.virtual_account_number}
                      </div>
                      <p style={{ fontSize: '12px', color: '#d97706', marginTop: '6px' }}>
                        Batas waktu pembayaran: {orderResult.payment_instructions.expired_in}
                      </p>
                    </div>
                  )}

                  <div className="order-summary" style={{ textAlign: 'left' }}>
                    <div className="summary-row">
                      <span>Status Pesanan:</span>
                      <span className={`badge-status ${orderResult.order.status.toLowerCase()}`}>
                        {orderResult.order.status}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span>Total Transaksi:</span>
                      <strong>{formatRupiah(orderResult.order.total_amount)}</strong>
                    </div>
                  </div>

                  <button 
                    className="btn-plan btn-primary" 
                    onClick={closeModal}
                    style={{ marginTop: '16px' }}
                  >
                    Selesai & Tutup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
