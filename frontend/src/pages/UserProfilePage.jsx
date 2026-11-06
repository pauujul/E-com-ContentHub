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
      </main>
    </div>
  );
}
