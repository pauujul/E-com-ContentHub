import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      api.getOrders(currentUser.id)
        .then(res => {
          if (res.success && res.data) {
            setUserOrders(res.data);
          }
        })
        .catch(err => console.warn('Could not load user orders:', err.message))
        .finally(() => setLoadingOrders(false));
    }
  }, [currentUser]);

  const activePlan = userOrders.find(o => o.status === 'Paid') || {
    plan_name: 'ContentHub Starter (Hero)',
    billing_cycle: 'Bulanan',
    status: 'Paid'
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />
      <Sidebar />

      <main className="ml-64 p-10 pt-24 min-h-screen">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary-fixed px-3 py-1 rounded-full mb-3 inline-block">
              {isAdmin ? 'Mode Tinjauan Administrator' : 'Workspace Editorial'}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-background">
              Selamat datang kembali, {currentUser?.name || 'Rina Wijaya'}
            </h1>
            <p className="text-on-surface-variant font-medium text-sm mt-1">
              Ruang kerja editorial Anda siap untuk perancangan dan kurasi konten hari ini.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/calendar/pick-date"
              className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>
                add_circle
              </span>
              <span>Buat Jadwal Baru</span>
            </Link>

            <Link
              to="/calendar/drag-drop"
              className="px-4 py-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-2xl font-semibold text-sm transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-lg">drag_indicator</span>
              <span>Planner</span>
            </Link>
          </div>
        </header>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-12 gap-8">
          {/* Key Stats Row */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Stat 1 */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between h-44 shadow-sm border border-outline-variant/10">
                <div className="flex justify-between items-start">
                  <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Total Post Terjadwal</span>
                  <span className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-base">send</span>
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-on-surface">28 Post</div>
                  <div className="text-[11px] text-green-600 font-bold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    +15% dari bulan lalu
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between h-44 shadow-sm border border-outline-variant/10">
                <div className="flex justify-between items-start">
                  <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Konsistensi Posting</span>
                  <span className="w-9 h-9 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-base">verified</span>
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-on-surface">94.8%</div>
                  <div className="text-[11px] text-secondary font-bold mt-1">Performa Prime Time Optimal</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between h-44 shadow-sm border border-outline-variant/10">
                <div className="flex justify-between items-start">
                  <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Status Langganan</span>
                  <span className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                    <span className="material-symbols-outlined text-base">star</span>
                  </span>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-on-surface truncate">
                    {activePlan.plan_name || 'Starter Hero'}
                  </div>
                  <div className="text-[11px] text-green-700 font-bold mt-1">
                    Status: {activePlan.status || 'Paid'} (Aktif)
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Schedule Table (From agenda UI) */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/15 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Agenda Konten Terdekat</h3>
                  <p className="text-xs text-on-surface-variant">Postingan yang telah diatur jadwal tayangnya minggu ini</p>
                </div>
                <Link to="/calendar" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Buka Kalender Penuh &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {/* Agenda Item 1 */}
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                      IG
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Promo Flash Sale Donat Glaze 30%</h4>
                      <p className="text-xs text-on-surface-variant">Hari Ini • 19:00 WIB • Instagram Feed & Story</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      Siap Publish
                    </span>
                    <Link
                      to="/calendar/agenda"
                      className="p-2 text-slate-400 hover:text-primary rounded-lg"
                      title="Lihat Detail Agenda"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </Link>
                  </div>
                </div>

                {/* Agenda Item 2 */}
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                      TT
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Behind The Scenes Produksi Donat Hangat</h4>
                      <p className="text-xs text-on-surface-variant">Besok • 12:30 WIB • TikTok Video</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                      Terjadwal
                    </span>
                    <Link
                      to="/calendar/edit-schedule"
                      className="p-2 text-slate-400 hover:text-primary rounded-lg"
                      title="Edit Jadwal"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </Link>
                  </div>
                </div>

                {/* Agenda Item 3 */}
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                      FB
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Edukasi: 3 Alasan Kenapa Bahan Alami Lebih Sehat</h4>
                      <p className="text-xs text-on-surface-variant">Lusa • 09:00 WIB • Carousel Edukasi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      Draf Canva
                    </span>
                    <Link
                      to="/templates/canva-transition"
                      className="p-2 text-slate-400 hover:text-primary rounded-lg"
                      title="Buka Canva"
                    >
                      <span className="material-symbols-outlined text-lg">open_in_new</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mini Calendar & Quick Tools */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Mini Calendar Card */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/15">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-base text-on-surface">Kalender Minggu Ini</h3>
                <span className="text-xs font-bold text-primary">Oktober 2026</span>
              </div>

              {/* Grid 7 Hari */}
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
                  <span key={i} className="text-[11px] font-bold text-outline uppercase">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {[19, 20, 21, 22, 23, 24, 25].map((day, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate('/calendar')}
                    className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      day === 24
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/15 flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">4 Post aktif hari ini</span>
                <Link to="/calendar" className="text-xs font-bold text-primary hover:underline">
                  Buka Kalender
                </Link>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/15 space-y-4">
              <h3 className="font-bold text-base text-on-surface">Aksi Cepat Fitur</h3>

              <div className="space-y-2">
                <Link
                  to="/calendar/set-time"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-sm font-semibold text-on-surface"
                >
                  <span className="material-symbols-outlined text-secondary">schedule</span>
                  <span>Atur Jam Posting Emas</span>
                </Link>

                <Link
                  to="/calendar/add-label"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-sm font-semibold text-on-surface"
                >
                  <span className="material-symbols-outlined text-primary">label</span>
                  <span>Kelola Label Kategori</span>
                </Link>

                <Link
                  to="/templates"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-sm font-semibold text-on-surface"
                >
                  <span className="material-symbols-outlined text-tertiary">auto_awesome_motion</span>
                  <span>Pilih Desain Template</span>
                </Link>

                <Link
                  to="/pricing"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-sm font-semibold text-on-surface"
                >
                  <span className="material-symbols-outlined text-green-600">credit_card</span>
                  <span>Paket Hero Rp98rb & Invoice</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
