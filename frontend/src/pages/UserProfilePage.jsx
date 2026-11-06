import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useUpgradeModal } from '../context/UpgradeModalContext';
import api from '../services/api';

export default function UserProfilePage() {
  const {
    currentUser,
    isAdmin,
    updateCurrentUser,
    logout,
    activeSubscription,
    refreshSubscription,
    isPlusTier,
    canAccessNotifications,
    userTier,
  } = useAuth();
  const { openUpgradeModal } = useUpgradeModal();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'subscription'

  // Tab 1: Form Profil
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    business_name: currentUser?.business_name || '',
    industry: currentUser?.industry || 'Kuliner & F&B',
    avatar_url: currentUser?.avatar_url || '',
    email_notifications_enabled: currentUser?.email_notifications_enabled !== false,
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

  // Riwayat Transaksi & Keanggotaan User
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [simulatingPaymentId, setSimulatingPaymentId] = useState(null);

  const fetchUserOrders = async () => {
    if (!currentUser?.id) return;
    setLoadingOrders(true);
    try {
      const res = await api.getOrders(currentUser.id);
      if (res.success && res.data) {
        setUserOrders(res.data);
      }
    } catch (err) {
      console.warn('Gagal memuat riwayat order user:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [currentUser?.id]);

  const handleSimulatePayOrder = async (orderId) => {
    if (!orderId) return;
    setSimulatingPaymentId(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, 'Paid');
      if (res.success) {
        setSuccessMsg('Pembayaran Berhasil! Paket langganan Anda kini aktif (Status: Paid).');
        setTimeout(() => setSuccessMsg(''), 5000);
        await refreshSubscription();
        await fetchUserOrders();
      } else {
        throw new Error(res.message || 'Gagal mengubah status');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Gagal memverifikasi simulasi pembayaran.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setSimulatingPaymentId(null);
    }
  };

  const handleOpenUpgradeModal = () => {
    openUpgradeModal({ step: 'pricing' });
  };

  const formatRupiah = (val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num === 0) return 'Rp 0';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgrade') === 'true') {
      openUpgradeModal({ step: 'pricing' });
    }
  }, [openUpgradeModal]);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        business_name: currentUser.business_name || '',
        industry: currentUser.industry || 'Kuliner & F&B',
        avatar_url: currentUser.avatar_url || '',
        email_notifications_enabled: currentUser.email_notifications_enabled !== false,
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
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold text-on-surface">{currentUser?.name || 'Pengguna ContentHub'}</h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {currentUser?.role || 'Customer'}
                  </span>

                  {/* Tanda Keanggotaan Subscription */}
                  {isAdmin ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-300 text-purple-900 text-xs font-black shadow-xs">
                      <span className="material-symbols-outlined text-sm text-purple-600">admin_panel_settings</span>
                      <span>👑 Administrator HQ (Akses Penuh)</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded-full">Unlimited</span>
                    </div>
                  ) : activeSubscription?.status === 'Paid' ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black shadow-xs">
                      <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                      <span>⭐ {activeSubscription.plan_name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded-full">Aktif</span>
                    </div>
                  ) : activeSubscription?.status === 'Pending' ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold shadow-xs">
                      <span className="material-symbols-outlined text-sm text-amber-600">hourglass_top</span>
                      <span>{activeSubscription.plan_name}</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full">Menunggu Pembayaran</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                      <span className="material-symbols-outlined text-sm text-slate-500">lock_open</span>
                      <span>Starter Trial (Free)</span>
                    </div>
                  )}
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

            {/* CTA Aksi Kanan (Admin: Tombol Admin Panel, Customer: Upgrade Subscription) */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {isAdmin ? (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-slate-900/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-lg text-amber-400">admin_panel_settings</span>
                  Buka Admin Panel
                </button>
              ) : (
                <button
                  onClick={handleOpenUpgradeModal}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-lg">workspace_premium</span>
                  {activeSubscription?.status === 'Paid' ? 'Kelola / Ganti Paket' : 'Upgrade Subscription'}
                </button>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-surface-container-high rounded-2xl w-fit">
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

            <button
              onClick={() => {
                setActiveTab('subscription');
                clearAlerts();
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'subscription' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">workspace_premium</span>
              3. Paket & Status Keanggotaan
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

                {/* Manajemen Izin Notifikasi Email (User Consent & SMTP Gmail) */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-base">notifications_active</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Notifikasi Pengingat Jadwal (Gmail & HP)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Presisi menit berbasis Google Gmail SMTP & push notification smartphone
                        </p>
                      </div>
                    </div>
                    <div>
                      {canAccessNotifications ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          Fitur Aktif ({isAdmin ? 'Admin' : 'Paket Plus'})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
                          <span className="material-symbols-outlined text-xs">lock</span>
                          Eksklusif Paket Plus
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Kotak Perizinan (User Consent) */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileForm.email_notifications_enabled}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            email_notifications_enabled: e.target.checked,
                          })
                        }
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <div className="text-xs text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-900">
                          Saya bersedia menerima pengingat jadwal dan notifikasi otomatis melalui email saya.
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Email pengingat berisi draf judul, waktu tayang, dan deskripsi agenda dikirim langsung ke{' '}
                          <strong className="text-slate-700">{currentUser?.email}</strong> tepat pada jam agenda. Anda
                          dapat mencabut izin kapan saja melalui kotak centang ini atau tautan <em>Unsubscribe</em> di footer email.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Callout untuk Free / Pro Tier */}
                  {!canAccessNotifications && (
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600 text-lg">bolt</span>
                        <p className="text-xs text-purple-900 font-semibold">
                          Akun Anda saat ini berada di <strong>{userTier === 'pro' ? 'Paket Pro' : 'Paket Free'}</strong>.
                          Upgrade ke Paket Plus untuk mengaktifkan pengiriman email otomatis.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openUpgradeModal({ step: 'pricing', reason: 'notification' })}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        Upgrade ke Paket Plus
                      </button>
                    </div>
                  )}
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

          {/* TAB 3: STATUS KEANGGOTAAN & PAKET SUBSCRIPTION */}
          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Card Ringkasan Paket Aktif (Mode Admin vs Mode Pelanggan) */}
              {isAdmin ? (
                <div className="bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/50 rounded-3xl p-8 border border-purple-200/80 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/25">
                        <span className="material-symbols-outlined text-2xl">shield_person</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-700">Tingkat Hak Akses</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">Master Administrator HQ</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                          👑 Lisensi Administrator ContentHub (Akses Penuh)
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-100 text-purple-900 text-xs font-black shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                        Hak Akses Master Aktif (Unlimited)
                      </span>
                      <button
                        onClick={() => navigate('/admin')}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-base text-amber-400">admin_panel_settings</span>
                        Buka Admin Control Panel
                      </button>
                    </div>
                  </div>

                  {/* Grid Detail Lisensi Admin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Siklus Lisensi</span>
                      <p className="text-sm font-extrabold text-slate-800">Permanen (Lifetime)</p>
                      <p className="text-[11px] text-slate-500">Tanpa batas waktu aktif</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Biaya Langganan</span>
                      <p className="text-sm font-extrabold text-purple-700">Rp 0 (Internal Master)</p>
                      <p className="text-[11px] text-slate-500">Bebas biaya pemakaian</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Hak Akses</span>
                      <p className="text-sm font-extrabold text-slate-800">Super Administrator</p>
                      <p className="text-[11px] text-slate-500">Kelola artikel, order & user</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Integrasi Desain</span>
                      <p className="text-sm font-extrabold text-emerald-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">palette</span>
                        Canva Enterprise Master
                      </p>
                      <p className="text-[11px] text-slate-500">Akses seluruh template</p>
                    </div>
                  </div>

                  {/* Fasilitas Admin */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-purple-600">verified_user</span>
                      Kewenangan Penuh Akun Administrator:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-purple-600">check_circle</span>
                        <span>Akses Tanpa Batas Kalender & Postingan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-purple-600">check_circle</span>
                        <span>Audit Log & Catatan Aktivitas Semua Admin</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-purple-600">check_circle</span>
                        <span>Manajemen Pengguna & Switcher Akun</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-purple-600">check_circle</span>
                        <span>Kelola Katalog & Harga Paket Langganan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-purple-600">check_circle</span>
                        <span>Monitoring Riwayat Transaksi & Invoice</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-purple-600">check_circle</span>
                        <span>Editor Canva & Akses Jam Emas Posting</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-white via-slate-50/50 to-primary/5 rounded-3xl p-8 border border-outline-variant/15 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                        <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Status Keanggotaan</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">Tier Langganan UMKM</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                          {activeSubscription?.status === 'Paid'
                            ? `⭐ ${activeSubscription.plan_name}`
                            : activeSubscription?.status === 'Pending'
                            ? `⏳ ${activeSubscription.plan_name} (Pending)`
                            : '🌱 Starter Trial (Free Tier)'}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {activeSubscription?.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Langganan Aktif ({activeSubscription.billing_cycle || 'Bulanan'})
                        </span>
                      ) : activeSubscription?.status === 'Pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100 text-amber-800 text-xs font-black shadow-xs">
                          <span className="material-symbols-outlined text-sm">hourglass_top</span>
                          Menunggu Pembayaran
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold">
                          Akses Percobaan Gratis
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Grid Informasi Detail Langganan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Siklus Penagihan</span>
                      <p className="text-sm font-extrabold text-slate-800">{activeSubscription?.billing_cycle || 'Free'}</p>
                      <p className="text-[11px] text-slate-500">Perpanjangan berkala aktif</p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Biaya Paket</span>
                      <p className="text-sm font-extrabold text-primary">
                        {activeSubscription?.status === 'Paid'
                          ? formatRupiah(activeSubscription.total_amount || 98000)
                          : 'Rp 0 (Gratis)'}
                      </p>
                      <p className="text-[11px] text-slate-500">Termasuk pajak & biaya admin</p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">No. Invoice Terakhir</span>
                      <p className="text-sm font-mono font-extrabold text-slate-800 truncate">
                        {activeSubscription?.order_number ? `#${activeSubscription.order_number}` : 'Belum Ada Transaksi'}
                      </p>
                      <p className="text-[11px] text-slate-500">ID Faktur Resmi</p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Integrasi Desain</span>
                      <p className="text-sm font-extrabold text-emerald-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">palette</span>
                        Canva Pro Siap Pakai
                      </p>
                      <p className="text-[11px] text-slate-500">One-click Sync Kalender</p>
                    </div>
                  </div>

                  {/* Included Features List */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
                      Fasilitas Unggulan yang Termasuk dalam Paket Anda:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                        <span>Kalender Drag & Drop Interaktif Penuh</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                        <span>50+ Template Konten Siap Pakai</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                        <span>Editor Terhubung Langsung Canva</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                        <span>Pengingat Jadwal via Email (Alert)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                        <span>Hingga 5 Saluran Media Sosial</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                        <span>Dukungan WhatsApp Prioritas UMKM</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Riwayat Faktur & Transaksi Pemesanan */}
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/15 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-extrabold text-on-surface">Riwayat Transaksi & Faktur Langganan</h3>
                    <p className="text-xs text-on-surface-variant">Daftar semua invoice pemesanan subscription paket Anda di ContentHub</p>
                  </div>
                  <button
                    onClick={fetchUserOrders}
                    className="p-2 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Segarkan Riwayat Pesanan"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                    Refresh
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="p-8 text-center text-slate-400 text-xs">Memuat data transaksi...</div>
                ) : userOrders.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">receipt_long</span>
                    <p className="text-xs font-bold text-slate-600">Belum ada riwayat pesanan.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tingkatkan paket Anda melalui tombol Upgrade di atas.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                          <th className="py-3 px-3">No. Invoice</th>
                          <th className="py-3 px-3">Paket Langganan</th>
                          <th className="py-3 px-3">Total Tagihan</th>
                          <th className="py-3 px-3">Metode Bayar</th>
                          <th className="py-3 px-3">Tanggal Transaksi</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {userOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-slate-800">
                              #{ord.order_number}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-800">
                              {ord.plan_name} ({ord.billing_cycle || 'Bulanan'})
                            </td>
                            <td className="py-3 px-3 font-extrabold text-primary">
                              {formatRupiah(ord.total_amount)}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {ord.payment_channel || ord.payment_method || 'Virtual Account'}
                            </td>
                            <td className="py-3 px-3 text-slate-500">
                              {new Date(ord.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-3 px-3">
                              {ord.status === 'Paid' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  Lunas (Aktif)
                                </span>
                              ) : ord.status === 'Pending' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                                  Menunggu Bayar
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                                  {ord.status}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {ord.status === 'Pending' ? (
                                <button
                                  type="button"
                                  disabled={simulatingPaymentId === ord.id}
                                  onClick={() => handleSimulatePayOrder(ord.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-xs">check</span>
                                  {simulatingPaymentId === ord.id ? 'Memproses...' : 'Simulasi Lunas'}
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">verified</span>
                                  Terverifikasi
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
