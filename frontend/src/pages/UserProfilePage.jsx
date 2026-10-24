import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function UserProfilePage() {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || 'Muhammad Hasran');
  const [phone, setPhone] = useState(currentUser?.phone || '085299887766');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 pt-24 pb-16 px-8 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Profile Header Section */}
          <section className="flex flex-col md:flex-row items-center md:items-end gap-8 pb-8 border-b border-outline-variant/15">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl ring-4 ring-white ring-offset-4 ring-offset-primary/10 bg-primary-container flex items-center justify-center text-white text-5xl font-extrabold">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <button className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-xl shadow-lg hover:bg-primary-hover transition-colors">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-1.5">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                  isAdmin ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isAdmin ? 'Administrator Console' : 'Customer UMKM'}
                </span>
                <span className="text-xs text-outline">• ID #{currentUser?.id || '2'}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
                {currentUser?.name || 'Muhammad Hasran'}
              </h1>
              <p className="text-sm text-on-surface-variant font-medium">
                {currentUser?.email || 'hasran.donat@gmail.com'}
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                to="/switch-account"
                className="px-5 py-2.5 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-xs font-bold text-on-surface flex items-center gap-1.5 transition-colors border border-outline-variant/15"
              >
                <span className="material-symbols-outlined text-base">switch_account</span>
                Ganti Akun
              </Link>
              <button
                onClick={logout}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold text-red-600 transition-colors border border-red-200"
              >
                Keluar
              </button>
            </div>
          </section>

          {savedSuccess && (
            <div className="p-4 bg-green-50 text-green-700 rounded-2xl text-xs font-bold border border-green-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Profil berhasil diperbarui!
            </div>
          )}

          {/* Form & Settings Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Edit Profile */}
            <div className="lg:col-span-7 bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Informasi Akun Pribadi</h3>
                <p className="text-xs text-on-surface-variant mt-1">Data ini digunakan untuk komunikasi invoice dan jadwal.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-none text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline">
                    Alamat Email (Akun Utama)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-none text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-none text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-primary text-white font-bold rounded-xl text-xs shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Security & Shortcuts */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-on-surface">Paket Langganan Aktif</h3>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-primary">ContentHub Starter (Hero)</span>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Aktif</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Rp 98.000 / bulanan • Termasuk Kalender Drag & Drop</p>
                </div>
                <Link
                  to="/pricing"
                  className="w-full py-2.5 bg-surface-container-high hover:bg-surface-dim font-bold text-xs text-on-surface rounded-xl transition-colors block text-center"
                >
                  Upgrade ke Paket Pro Tahunan
                </Link>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-on-surface">Akses Cepat Pengguna</h3>
                <Link
                  to="/switch-account"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">switch_account</span>
                    Ganti Akun & Simulasi Persona
                  </span>
                  <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-xs font-bold text-red-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-red-600">admin_panel_settings</span>
                      Buka Admin Console
                    </span>
                    <span className="material-symbols-outlined text-sm text-red-500">chevron_right</span>
                  </Link>
                )}

                <Link
                  to="/help"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-secondary">help</span>
                    Pusat Bantuan & Tutorial
                  </span>
                  <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
