import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserProfilePage() {
  const { currentUser, logout, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '085299887766',
    businessName: currentUser?.businessName || 'Usaha Donat & Pastry',
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (updateCurrentUser) {
      updateCurrentUser(formData);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Menempel Penuh ke Atas */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">layers</span>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-primary leading-tight">Workspace</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">ContentHub</span>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 hover:text-primary transition-all">
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/calendar" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 hover:text-primary transition-all">
            <span className="material-symbols-outlined text-xl">calendar_month</span>
            <span>Calendar</span>
          </Link>
          <Link to="/calendar/agenda" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 hover:text-primary transition-all">
            <span className="material-symbols-outlined text-xl">view_agenda</span>
            <span>Detail Agenda</span>
          </Link>
          <Link to="/calendar/drag-drop" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 hover:text-primary transition-all">
            <span className="material-symbols-outlined text-xl">drag_indicator</span>
            <span>Drag & Drop Planner</span>
          </Link>
          <Link to="/templates" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 hover:text-primary transition-all">
            <span className="material-symbols-outlined text-xl">auto_awesome_motion</span>
            <span>Template Library</span>
          </Link>
          <Link to="/templates/search" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 hover:text-primary transition-all">
            <span className="material-symbols-outlined text-xl">search</span>
            <span>Cari Template</span>
          </Link>
          <Link to="/templates/add" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 hover:text-primary transition-all">
            <span className="material-symbols-outlined text-xl">add_circle</span>
            <span>Tambah Template</span>
          </Link>
          <Link to="/help" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 hover:text-primary transition-all">
            <span className="material-symbols-outlined text-xl">help</span>
            <span>Bantuan</span>
          </Link>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-100">
          <Link to="/profile" className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 text-primary font-semibold text-sm">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs uppercase font-bold">{currentUser?.name?.charAt(0) || 'U'}</div>
            <div className="truncate flex-1">
              <p className="truncate leading-tight text-xs">{currentUser?.name || 'User'}</p>
              <span className="text-[10px] text-slate-400 font-normal">Profil Saya</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area Menempel Penuh ke Atas */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header Profil */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-primary text-white flex items-center justify-center text-4xl font-extrabold shadow-lg shadow-primary/25">{currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">{currentUser?.role || 'Customer UMKM'}</span>
                  <span className="text-xs text-slate-400 font-semibold">• ID #{currentUser?.id || 1}</span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{currentUser?.name}</h1>
                <p className="text-sm text-slate-500 font-medium">{currentUser?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button onClick={() => navigate('/switch-account')} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">switch_account</span>
                Ganti Akun
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Keluar
              </button>
            </div>
          </div>

          {/* Form & Langganan Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Informasi Akun */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Informasi Akun Pribadi</h2>
              <p className="text-xs text-slate-500 mb-6">Data ini digunakan untuk komunikasi invoice dan jadwal posting media sosial.</p>

              {isSaved && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Data profil berhasil diperbarui!
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Alamat Email (Akun Utama)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nomor WhatsApp / Telepon</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" className="px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary-container transition-all">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>

            {/* Status Paket & Quick Access */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Paket Langganan Aktif</h3>
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-primary text-sm">ContentHub Starter (Hero)</h4>
                    <span className="text-[10px] font-extrabold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Aktif</span>
                  </div>
                  <p className="text-xs text-slate-500">Rp 98.000 / bulanan • Termasuk Kalender Drag & Drop</p>
                </div>

                <Link to="/pricing" className="w-full block text-center py-2.5 rounded-xl bg-blue-100 text-blue-800 text-xs font-bold hover:bg-blue-200 transition-all">
                  Upgrade ke Paket Pro Tahunan
                </Link>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Akses Cepat Pengguna</h3>
                <div className="space-y-2">
                  <Link to="/calendar" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 transition-all">
                    <span>Buka Kalender Konten</span>
                    <span className="material-symbols-outlined text-base text-slate-400">chevron_right</span>
                  </Link>
                  <Link to="/transactions" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 transition-all">
                    <span>Lihat Bukti Transaksi</span>
                    <span className="material-symbols-outlined text-base text-slate-400">chevron_right</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
