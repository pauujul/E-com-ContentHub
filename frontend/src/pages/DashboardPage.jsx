import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
  const { currentUser, isAdmin, activeSubscription } = useAuth();
  const navigate = useNavigate();
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      api
        .getOrders(currentUser.id)
        .then((res) => {
          if (res.success && res.data) {
            setUserOrders(res.data);
          }
        })
        .catch((err) => console.warn('Could not load user orders:', err.message))
        .finally(() => setLoadingOrders(false));

      api
        .getPosts()
        .then((res) => {
          if (res.success && res.data) {
            const filtered = res.data.filter((p) => !p.user_id || p.user_id === currentUser.id);
            setUserPosts(filtered);
          }
        })
        .catch((err) => console.warn('Could not load user posts:', err.message))
        .finally(() => setLoadingPosts(false));
    }
  }, [currentUser]);

  const activePlan = activeSubscription?.status === 'Paid'
    ? activeSubscription
    : (userOrders.find((o) => o.status === 'Paid') || activeSubscription || {
        plan_name: 'ContentHub Starter',
        billing_cycle: 'Bulanan',
        status: 'Paid',
      });

  // Perhitungan Kalender Minggu Ini Dinamis (Bukan statis 24 Oktober)
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Minggu
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayOfWeek);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDays.push({
      dateNum: d.getDate(),
      isToday: d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(),
      month: d.getMonth(),
      year: d.getFullYear(),
    });
  }

  const currentMonthName = today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />
      <Sidebar />

      {/* pt-8 menggantikan pt-24 agar menempel proporsional ke batas atas layar */}
      <main className="ml-64 p-8 pt-8 min-h-screen">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary-fixed px-3 py-1 rounded-full mb-3 inline-block">{isAdmin ? 'Mode Tinjauan Administrator' : 'Workspace Editorial'}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-background">Selamat datang kembali, {currentUser?.name || 'Pengguna'}</h1>
            <p className="text-on-surface-variant font-medium text-sm mt-1">Ruang kerja editorial Anda siap untuk perancangan dan kurasi konten hari ini.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/calendar/pick-date" className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>
                add_circle
              </span>
              <span>Buat Jadwal Baru</span>
            </Link>

            <Link to="/calendar/drag-drop" className="px-4 py-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-2xl font-semibold text-sm transition-colors flex items-center gap-1.5">
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
                  <div className="text-3xl font-extrabold text-on-surface">{userPosts.length > 0 ? `${userPosts.length} Post` : '28 Post'}</div>
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
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${activePlan?.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    <span className="material-symbols-outlined text-base">star</span>
                  </span>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-on-surface truncate">{activePlan?.plan_name || 'Starter Plan'}</div>
                  <div className="text-[11px] font-bold mt-1 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${activePlan?.status === 'Paid' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                    <span className={activePlan?.status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}>
                      {activePlan?.status === 'Paid' ? `Aktif (${activePlan.billing_cycle || 'Bulanan'})` : 'Menunggu Pembayaran'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Schedule Table */}
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
                {userPosts.length > 0 ? (
                  userPosts.slice(0, 4).map((post) => {
                    const platformInitial = (post.platform || 'IG').substring(0, 2).toUpperCase();
                    const platformBg =
                      platformInitial === 'TI' || platformInitial === 'TT'
                        ? 'bg-slate-900 text-cyan-400'
                        : platformInitial === 'FB'
                        ? 'bg-blue-100 text-blue-700'
                        : platformInitial === 'YT'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-pink-100 text-pink-700';

                    const stageBadge =
                      post.stage === 'published'
                        ? { label: 'Siap Publish', cls: 'bg-green-100 text-green-800' }
                        : post.stage === 'scheduled'
                        ? { label: 'Terjadwal', cls: 'bg-amber-100 text-amber-800' }
                        : post.stage === 'draft'
                        ? { label: 'Draf Canva', cls: 'bg-blue-100 text-blue-800' }
                        : { label: 'Review', cls: 'bg-purple-100 text-purple-800' };

                    return (
                      <div
                        key={post.id}
                        className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl hover:bg-surface-container-high transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 ${platformBg}`}
                          >
                            {platformInitial}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-on-surface">{post.title}</h4>
                            <p className="text-xs text-on-surface-variant">
                              {post.scheduled_date || 'Hari Ini'} • {post.scheduled_time || '10:00 WIB'} • {post.platform || 'Instagram'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${stageBadge.cls}`}>
                            {stageBadge.label}
                          </span>
                          <Link
                            to={`/calendar/agenda/${post.id}`}
                            className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors"
                            title="Lihat Detail Agenda"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">IG</div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">Promo Flash Sale Donat Glaze 30%</h4>
                        <p className="text-xs text-on-surface-variant">Hari Ini • 19:00 WIB • Instagram Feed & Story</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">Siap Publish</span>
                      <Link to="/calendar/agenda" className="p-2 text-slate-400 hover:text-primary rounded-lg">
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Mini Calendar & Quick Tools */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Mini Calendar Card */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/15">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-base text-on-surface">Kalender Minggu Ini</h3>
                <span className="text-xs font-bold text-primary">{currentMonthName}</span>
              </div>

              {/* Grid 7 Hari */}
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
                  <span key={i} className="text-[11px] font-bold text-outline uppercase">
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((dayItem, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/calendar?month=${dayItem.month}&year=${dayItem.year}`)}
                    className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      dayItem.isToday
                        ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105 ring-2 ring-primary/20'
                        : 'hover:bg-surface-container-high text-on-surface'
                    }`}
                    title={`${dayItem.dateNum} ${currentMonthName}`}
                  >
                    {dayItem.dateNum}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/15 flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">PostgreSQL Neon Sync</span>
                <Link to="/calendar" className="text-xs font-bold text-primary hover:underline">
                  Buka Kalender
                </Link>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/15 space-y-4">
              <h3 className="font-bold text-base text-on-surface">Aksi Cepat Fitur</h3>

              <div className="space-y-2">
                <Link to="/calendar/set-time" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-sm font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-secondary">schedule</span>
                  <span>Atur Jam Posting Emas</span>
                </Link>

                <Link to="/calendar/add-label" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-sm font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-primary">label</span>
                  <span>Kelola Label Kategori</span>
                </Link>

                <Link to="/templates" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-sm font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-tertiary">auto_awesome_motion</span>
                  <span>Pilih Desain Template</span>
                </Link>

                <Link to="/pricing" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-sm font-semibold text-on-surface">
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
