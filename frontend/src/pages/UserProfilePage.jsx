import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function UserProfilePage() {
  const { currentUser, updateCurrentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

  // Tab 1: Form Profil
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    business_name: currentUser?.business_name || '',
    industry: currentUser?.industry || 'Kuliner & F&B',
    avatar_url: currentUser?.avatar_url || '',
  });

  // Tab 2: Form Ganti Password
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ==========================================
  // STATE MODAL UPGRADE SUBSCRIPTION (WORKSPACE POP-UP)
  // ==========================================
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState('plans'); // 'plans' | 'payment' | 'invoice'
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState(null);
  const [paymentCategory, setPaymentCategory] = useState('va'); // 'va' | 'ewallet'
  const [selectedChannel, setSelectedChannel] = useState('BCA Virtual Account');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [orderResult, setOrderResult] = useState(null);
  const [copiedVA, setCopiedVA] = useState(false);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await api.getProducts();
      if (res.success && res.data) {
        const filtered = res.data.filter(
          (p) => p.sku !== 'CH-ENT-Y' && !p.name?.toLowerCase().includes('enterprise') && p.is_active !== false
        );
        setAvailablePlans(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch upgrade plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleOpenUpgradeModal = () => {
    setIsUpgradeModalOpen(true);
    setUpgradeStep('plans');
    setSelectedUpgradePlan(null);
    setOrderResult(null);
    setPaymentError('');
    fetchPlans();
  };

  const handleSelectPlan = (plan) => {
    setSelectedUpgradePlan(plan);
    setUpgradeStep('payment');
  };

  const handleProcessPayment = async () => {
    if (!selectedUpgradePlan) return;
    setSubmittingPayment(true);
    setPaymentError('');

    try {
      const isFree = parseFloat(selectedUpgradePlan.price) === 0;
      const orderPayload = {
        user_id: currentUser?.id || 1,
        customer_name: currentUser?.name || 'Pelanggan ContentHub',
        customer_email: currentUser?.email || '',
        plan_id: selectedUpgradePlan.id,
        payment_method: isFree ? 'Free Activation' : (paymentCategory === 'va' ? 'Virtual Account' : 'E-Wallet'),
        payment_channel: isFree ? 'System' : selectedChannel,
      };

      const res = await api.createOrder(orderPayload);
      if (res.success && res.data) {
        setOrderResult(res.data);
        setUpgradeStep('invoice');
      } else {
        throw new Error(res.message || 'Gagal memproses transaksi upgrade.');
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCloseUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeStep('plans');
    setSelectedUpgradePlan(null);
    setOrderResult(null);
  };

  const formatRupiah = (val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num === 0) return 'Rp 0';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgrade') === 'true') {
      handleOpenUpgradeModal();
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        business_name: currentUser.business_name || '',
        industry: currentUser.industry || 'Kuliner & F&B',
        avatar_url: currentUser.avatar_url || '',
      });
    }
  }, [currentUser]);

  const clearAlerts = () => {
    setSuccessMsg('');
    setErrorMsg('');
  };

  // 1. Simpan Profil
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    clearAlerts();
    setLoading(true);

    try {
      const res = await api.updateProfile({
        id: currentUser?.id,
        ...profileForm,
      });

      if (res.success) {
        updateCurrentUser(res.data);
        setSuccessMsg('Profil dan data usaha Anda berhasil diperbarui!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        throw new Error(res.message || 'Gagal memperbarui profil.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Ganti Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setErrorMsg('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.changePassword({
        id: currentUser?.id,
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Kata sandi berhasil diperbarui dengan aman!');
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        throw new Error(res.message || 'Gagal mengubah kata sandi.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle upload avatar
  const handleAvatarFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await api.uploadImage(file);
      if (res.success && res.data?.url) {
        setProfileForm((prev) => ({ ...prev, avatar_url: res.data.url }));
        setSuccessMsg('Foto profil berhasil diunggah.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Upload avatar error:', err);
      setErrorMsg('Gagal mengunggah foto profil.');
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 p-8 pt-6 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="pb-6 border-b border-outline-variant/15 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-primary-fixed text-primary px-3 py-1 rounded-full">
                  User Account Center
                </span>
                <span className="text-xs text-outline">• Terhubung ke Database PostgreSQL / Neon</span>
              </div>
              <h1 className="text-3xl font-extrabold text-on-surface">Pengaturan Profil & Keamanan Akun</h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Kelola identitas usaha UMKM Anda, ubah alamat email resmi, dan perbarui kata sandi dengan verifikasi aman.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors border border-red-200 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Keluar Sesi
            </button>
          </div>

          {/* Alerts */}
          {successMsg && (
            <div className="p-4 bg-green-50 text-green-800 rounded-2xl text-xs font-bold border border-green-200 flex items-center gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-base text-green-600">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-800 rounded-2xl text-xs font-bold border border-red-200 flex items-center gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-base text-red-600">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User Hero Bento Card */}
          <div className="bg-white rounded-3xl p-6 border border-outline-variant/15 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 w-full sm:w-auto">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary text-white flex items-center justify-center text-3xl font-extrabold shadow-md shadow-primary/20">
                  {profileForm.avatar_url ? (
                    <img src={profileForm.avatar_url} alt={currentUser?.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <label className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-xs font-bold">
                  Ganti
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                </label>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-on-surface">{currentUser?.name || 'Pengguna ContentHub'}</h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {currentUser?.role || 'Customer'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">{currentUser?.email}</p>
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-outline">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">storefront</span>
                    {currentUser?.business_name || 'UMKM Mitra'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">category</span>
                    {currentUser?.industry || 'Kuliner'}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Upgrade Subscription */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleOpenUpgradeModal}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-lg">workspace_premium</span>
                Upgrade Subscription
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-2 p-1.5 bg-surface-container-high rounded-2xl w-fit">
            <button
              onClick={() => {
                setActiveTab('profile');
                clearAlerts();
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'profile' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">badge</span>
              1. Profil & Usaha UMKM
            </button>

            <button
              onClick={() => {
                setActiveTab('password');
                clearAlerts();
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'password' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">key</span>
              2. Keamanan & Kata Sandi
            </button>
          </div>

          {/* TAB 1: FORM GANTI PROFIL */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-8 border border-outline-variant/15 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-lg font-extrabold text-on-surface">Data Identitas Pribadi & Usaha UMKM</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Informasi ini digunakan untuk personalisasi template konten Canva dan rekomendasi jam emas postingan.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Nama Lengkap Pemilik
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:bg-white"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:bg-white"
                      placeholder="Contoh: 085299887766"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Nama Usaha / Brand UMKM
                    </label>
                    <input
                      type="text"
                      value={profileForm.business_name}
                      onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:bg-white"
                      placeholder="Contoh: Donat Kampoeng Makassar"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Kategori Industri Usaha
                    </label>
                    <select
                      value={profileForm.industry}
                      onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:bg-white"
                    >
                      <option value="Kuliner & F&B">Kuliner & F&B (Makanan & Minuman)</option>
                      <option value="Fashion & Busana">Fashion, Busana & Hijab</option>
                      <option value="Kecantikan & Skincare">Kecantikan & Skincare</option>
                      <option value="Jasa & Layanan">Jasa & Layanan (Laundry, Salon, Barbershop)</option>
                      <option value="Kreatif & Desain">Kreatif, Desain & Percetakan</option>
                      <option value="Retail & Grosir">Retail, Toko Kelontong & Grosir</option>
                      <option value="Teknologi & Digital">Teknologi & Digital Agency</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    URL Foto Profil / Logo Usaha
                  </label>
                  <input
                    type="url"
                    value={profileForm.avatar_url}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:bg-white"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="text-[11px] text-slate-400">
                    Anda dapat memasukkan tautan gambar langsung atau mengklik ikon foto profil di atas untuk mengunggah file.
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-primary text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-sm">save</span>
                    )}
                    Simpan Perubahan Profil
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: FORM GANTI PASSWORD */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-3xl p-8 border border-outline-variant/15 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-lg font-extrabold text-on-surface">Pembaruan Kata Sandi (Password)</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Kata sandi baru akan dienkripsi dengan standar SHA-256 dan notifikasi konfirmasi dikirim ke email terdaftar.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Kata Sandi Lama / Saat Ini
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:bg-white"
                    placeholder="Masukkan kata sandi lama"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Kata Sandi Baru (Minimal 6 Karakter)
                  </label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:bg-white"
                    placeholder="Masukkan kata sandi baru"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:bg-white"
                    placeholder="Ulangi kata sandi baru"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-secondary text-white font-extrabold text-xs rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-sm">lock_reset</span>
                    )}
                    Enkripsi & Simpan Kata Sandi Baru
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* MODAL WORKSPACE UPGRADE SUBSCRIPTION (3 LANGKAH POP-UP) */}
        {/* ======================================================== */}
        {isUpgradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-8 max-h-[90vh] flex flex-col">
              
              {/* Modal Top Bar */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shadow-xs">
                    <span className="material-symbols-outlined text-xl">workspace_premium</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {upgradeStep === 'plans' && 'Pilih Paket Subscription'}
                      {upgradeStep === 'payment' && 'Metode Pembayaran'}
                      {upgradeStep === 'invoice' && 'Status Transaksi & Pembayaran'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <span className={upgradeStep === 'plans' ? 'text-primary font-bold' : ''}>1. Paket</span>
                      <span>›</span>
                      <span className={upgradeStep === 'payment' ? 'text-primary font-bold' : ''}>2. Pembayaran</span>
                      <span>›</span>
                      <span className={upgradeStep === 'invoice' ? 'text-primary font-bold' : ''}>3. Konfirmasi</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCloseUpgradeModal}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body Container with Scroll */}
              <div className="p-6 overflow-y-auto flex-1">
                {/* Error Banner */}
                {paymentError && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {paymentError}
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* STEP 1: PILIH PAKET DARI DATABASE NEON */}
                {/* ---------------------------------------------------- */}
                {upgradeStep === 'plans' && (
                  <div className="space-y-6">
                    <div className="text-center max-w-xl mx-auto space-y-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                        Upgrade Langsung dalam Workspace
                      </span>
                      <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Pilih Paket Terbaik untuk Skala Usaha Anda
                      </h4>
                      <p className="text-xs text-slate-500">
                        Nikmati kalender posting tanpa batas, ekspor otomatis Canva, dan rekomendasi jam emas posting.
                      </p>
                    </div>

                    {loadingPlans ? (
                      <div className="text-center py-16 space-y-3">
                        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs font-bold text-slate-400">Memuat paket dari database Neon...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        {availablePlans.map((plan) => {
                          const isHero = plan.is_hero || plan.sku === 'CH-START-M';
                          const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]');
                          const priceNum = parseFloat(plan.price);

                          return (
                            <div
                              key={plan.id}
                              className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative border ${
                                isHero
                                  ? 'border-2 border-primary bg-gradient-to-b from-blue-50/40 via-white to-white shadow-xl shadow-primary/10'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
                              }`}
                            >
                              {isHero && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-sm">
                                  {plan.badge || 'PRODUK TERPOPULER'}
                                </div>
                              )}

                              <div className="space-y-4">
                                <div>
                                  <h5 className="font-extrabold text-slate-900 text-lg">{plan.name}</h5>
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plan.description}</p>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                  <div className="text-2xl font-black text-slate-900">
                                    {formatRupiah(plan.price)}
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-400">
                                    {plan.billing_cycle === 'Free' ? '/ Akses Gratis' : `/${plan.billing_cycle.toLowerCase()}`}
                                  </span>
                                </div>

                                <ul className="space-y-2 text-xs text-slate-600">
                                  {features.map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="material-symbols-outlined text-primary text-sm flex-shrink-0 mt-0.5">check_circle</span>
                                      <span className="leading-tight">{feat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="pt-6 mt-4 border-t border-slate-100">
                                <button
                                  onClick={() => handleSelectPlan(plan)}
                                  className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    isHero
                                      ? 'bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary/95 active:scale-95'
                                      : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-sm">bolt</span>
                                  {priceNum === 0 ? 'Pilih Paket Gratis' : 'Lanjut Pembayaran →'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* STEP 2: METODE PEMBAYARAN */}
                {/* ---------------------------------------------------- */}
                {upgradeStep === 'payment' && selectedUpgradePlan && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    {/* Ringkasan Paket Terpilih */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Paket Dipilih</span>
                        <h4 className="text-lg font-black text-slate-900">{selectedUpgradePlan.name}</h4>
                        <p className="text-xs text-slate-500">Siklus Penagihan: {selectedUpgradePlan.billing_cycle}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total Tagihan:</span>
                        <span className="text-2xl font-black text-primary">{formatRupiah(selectedUpgradePlan.price)}</span>
                      </div>
                    </div>

                    {/* Pemilihan Saluran Pembayaran jika paket berbayar */}
                    {parseFloat(selectedUpgradePlan.price) > 0 ? (
                      <div className="space-y-4">
                        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit mx-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentCategory('va');
                              setSelectedChannel('BCA Virtual Account');
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              paymentCategory === 'va' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'
                            }`}
                          >
                            Virtual Account (Bank Transfer)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentCategory('ewallet');
                              setSelectedChannel('GoPay QRIS');
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              paymentCategory === 'ewallet' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'
                            }`}
                          >
                            E-Wallet & QRIS Instan
                          </button>
                        </div>

                        {paymentCategory === 'va' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {['BCA Virtual Account', 'Mandiri Virtual Account', 'BRI Virtual Account', 'BNI Virtual Account'].map((channel) => (
                              <label
                                key={channel}
                                onClick={() => setSelectedChannel(channel)}
                                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                                  selectedChannel === channel
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="material-symbols-outlined text-slate-700">account_balance</span>
                                  <span className="text-xs font-bold text-slate-800">{channel}</span>
                                </div>
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  selectedChannel === channel ? 'border-primary bg-primary' : 'border-slate-300'
                                }`}>
                                  {selectedChannel === channel && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                        {paymentCategory === 'ewallet' && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {['GoPay QRIS', 'OVO', 'DANA'].map((channel) => (
                              <label
                                key={channel}
                                onClick={() => setSelectedChannel(channel)}
                                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                                  selectedChannel === channel
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-slate-700">qr_code_scanner</span>
                                  <span className="text-xs font-bold text-slate-800">{channel}</span>
                                </div>
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  selectedChannel === channel ? 'border-primary bg-primary' : 'border-slate-300'
                                }`}>
                                  {selectedChannel === channel && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-medium text-center">
                        Paket ini gratis tanpa dipungut biaya. Anda dapat langsung mengaktifkannya ke akun Anda.
                      </div>
                    )}

                    {/* Tombol Aksi */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => setUpgradeStep('plans')}
                        className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        ← Ganti Paket
                      </button>

                      <button
                        type="button"
                        onClick={handleProcessPayment}
                        disabled={submittingPayment}
                        className="px-7 py-3 bg-primary hover:bg-primary/95 active:scale-95 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-primary/25 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        {submittingPayment ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Memproses Pesanan...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            <span>Konfirmasi & Bayar Sekarang</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* STEP 3: KONFIRMASI INVOICE & STATUS TRANSAKSI */}
                {/* ---------------------------------------------------- */}
                {upgradeStep === 'invoice' && orderResult && (
                  <div className="max-w-md mx-auto text-center space-y-6 py-4 animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                      <span className="material-symbols-outlined text-4xl">verified</span>
                    </div>

                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        {orderResult.order?.status === 'Paid' ? 'Paket Aktif Seketika' : 'Pesanan Menunggu Pembayaran'}
                      </span>
                      <h4 className="text-2xl font-black text-slate-900 mt-2">
                        {orderResult.order?.status === 'Paid' ? 'Selamat! Paket Anda Telah Aktif' : 'Selesaikan Pembayaran Anda'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Nomor Pesanan: <strong className="text-slate-800 font-mono">#{orderResult.order?.order_number || orderResult.order_number}</strong>
                      </p>
                    </div>

                    {/* Detail Tagihan Box */}
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 text-left space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Paket Langganan:</span>
                        <strong className="text-slate-800">{selectedUpgradePlan?.name}</strong>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Metode Pembayaran:</span>
                        <span className="font-bold text-slate-800">{orderResult.order?.payment_channel || selectedChannel}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                        <span className="text-slate-700 font-bold">Total Pembayaran:</span>
                        <span className="text-base font-black text-primary">
                          {formatRupiah(orderResult.order?.total_amount || selectedUpgradePlan?.price)}
                        </span>
                      </div>

                      {/* Simulasi Virtual Account / Kode Bayar jika ada */}
                      {orderResult.payment_instructions?.virtual_account_number && (
                        <div className="mt-3 p-3 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400">Nomor Virtual Account Pembayaran</span>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg font-mono font-black text-slate-900 tracking-wider">
                              {orderResult.payment_instructions.virtual_account_number}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(orderResult.payment_instructions.virtual_account_number);
                                setCopiedVA(true);
                                setTimeout(() => setCopiedVA(false), 2000);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
                            >
                              {copiedVA ? 'Tersalin ✓' : 'Salin'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tombol Selesai */}
                    <button
                      type="button"
                      onClick={handleCloseUpgradeModal}
                      className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white rounded-2xl font-extrabold text-xs shadow-lg shadow-primary/25 transition-all cursor-pointer"
                    >
                      ✓ Selesai & Kembali ke Workspace
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
