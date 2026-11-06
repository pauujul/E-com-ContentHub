import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUpgradeModal } from '../context/UpgradeModalContext';

export default function CalendarPage() {
  const { currentUser, isFreeTier, canAccessDragDrop } = useAuth();
  const { openUpgradeModal } = useUpgradeModal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Dukungan parameter URL ?month=...&year=... agar saat redirect dari penjadwalan langsung membuka bulan target
  const now = new Date();
  const initialYear = searchParams.get('year') ? parseInt(searchParams.get('year'), 10) : now.getFullYear();
  const initialMonth = searchParams.get('month') !== null ? parseInt(searchParams.get('month'), 10) : now.getMonth();

  const [currentDate, setCurrentDate] = useState(new Date(initialYear, initialMonth, 1));
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.getPosts({ user_id: currentUser?.id });
      if (res.success && res.data) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error('Error loading calendar posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [currentUser]);

  // Kalender Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (9 = Oktober, 10 = November)
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Minggu
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const realToday = new Date();

  const calendarCells = [];

  // Trailing hari bulan lalu
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const trailingDay = prevMonthTotalDays - i;
    const cellDate = new Date(year, month - 1, trailingDay);
    calendarCells.push({
      day: trailingDay,
      isCurrentMonth: false,
      dateObj: cellDate,
    });
  }

  // Hari-hari bulan aktif
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const fullDate = new Date(year, month, d);
    
    // Filter post yang tepat jatuh pada tanggal d, bulan month, tahun year
    const dayEvents = posts.filter((p) => {
      if (!p.scheduled_at) return false;
      const pDate = new Date(p.scheduled_at);
      return (
        pDate.getFullYear() === year &&
        pDate.getMonth() === month &&
        pDate.getDate() === d
      );
    });

    const isToday = (
      d === realToday.getDate() &&
      month === realToday.getMonth() &&
      year === realToday.getFullYear()
    );

    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      isToday: isToday,
      events: dayEvents,
      dateObj: fullDate,
    });
  }

  // Leading hari bulan berikutnya agar kelipatan 7
  const remaining = (7 - (calendarCells.length % 7)) % 7;
  for (let n = 1; n <= remaining; n++) {
    const leadingDate = new Date(year, month + 1, n);
    calendarCells.push({
      day: n,
      isCurrentMonth: false,
      dateObj: leadingDate,
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    setCurrentDate(new Date(realToday.getFullYear(), realToday.getMonth(), 1));
  };

  const monthPostsCount = posts.filter((p) => {
    if (!p.scheduled_at) return false;
    const pDate = new Date(p.scheduled_at);
    return pDate.getFullYear() === year && pDate.getMonth() === month;
  }).length;

  // Helper kuota mingguan untuk validasi Paket Free (maks. 3 agenda / minggu)
  const getWeeklyCount = (targetDate = new Date()) => {
    const d = new Date(targetDate);
    const day = d.getDay();
    const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setDate(diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);

    return posts.filter((p) => {
      if (!p.scheduled_at) return false;
      const pDate = new Date(p.scheduled_at);
      return !isNaN(pDate.getTime()) && pDate >= monday && pDate < sunday;
    }).length;
  };

  const handleScheduleClick = (e, targetDate) => {
    if (isFreeTier) {
      const count = getWeeklyCount(targetDate);
      if (count >= 3) {
        e.preventDefault();
        openUpgradeModal({
          reason: 'agenda_limit',
          currentCount: count,
          maxLimit: 3,
        });
        return;
      }
    }
  };

  const currentWeekCount = getWeeklyCount(realToday);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800">
      <Sidebar />

      <main className="ml-0 md:ml-64 p-6 sm:p-8 lg:p-10 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Header & Navigation */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-extrabold text-primary uppercase tracking-widest bg-primary/10 px-3 py-0.5 rounded-full border border-primary/20">
                  Kalender Interaktif PostgreSQL Neon
                </span>
                <span className="text-xs text-slate-400 font-semibold">• Tersinkronisasi Otomatis</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <span>{monthNames[month]} {year}</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                  {monthPostsCount} Konten Terjadwal
                </span>
                {isFreeTier && (
                  <button
                    onClick={() => openUpgradeModal({ reason: 'agenda_limit', currentCount: currentWeekCount, maxLimit: 3 })}
                    className={`text-[11px] font-black px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentWeekCount >= 3
                        ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}
                    title="Klik untuk upgrade ke Paket Pro atau Plus"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {currentWeekCount >= 3 ? 'warning' : 'schedule'}
                    </span>
                    <span>Kuota Free: {currentWeekCount}/3 Minggu Ini</span>
                    <span className="text-[9px] underline uppercase tracking-wider font-extrabold ml-1">Upgrade</span>
                  </button>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Visualisasikan seluruh jadwal posting sosial media UMKM dengan label kategori warna tersinkronisasi.
              </p>
            </div>

            {/* Quick Actions & Month Switcher */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleJumpToToday}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 shadow-xs transition-colors"
                title="Kembali ke Bulan Sekarang"
              >
                Hari Ini
              </button>

              <Link
                to="/calendar/drag-drop"
                onClick={(e) => {
                  if (isFreeTier) {
                    e.preventDefault();
                    openUpgradeModal({ reason: 'drag_drop' });
                  }
                }}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 border border-slate-200 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-base">drag_indicator</span>
                <span>Drag & Drop</span>
                {isFreeTier && <span className="material-symbols-outlined text-xs text-amber-500">lock</span>}
              </Link>

              <Link
                to={`/calendar/pick-date?year=${year}&month=${month + 1}&day=${realToday.getDate()}`}
                onClick={(e) => handleScheduleClick(e, realToday)}
                className="px-4 py-2 bg-gradient-primary text-white rounded-xl text-xs font-extrabold shadow-md shadow-primary/20 flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Jadwalkan Konten Baru
              </Link>

              {/* Month Navigation Controls */}
              <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                  title="Bulan Sebelumnya"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <span className="text-xs font-extrabold px-2 text-slate-800 min-w-[75px] text-center">
                  {monthNames[month]}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                  title="Bulan Berikutnya"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-4 sm:p-6 space-y-4">
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
              <span className="text-red-500">Min</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span className="text-blue-500">Sab</span>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <p className="mt-3 text-xs font-bold text-slate-400">Sinkronisasi jadwal dengan database PostgreSQL Neon...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((cell, idx) => (
                  <div
                    key={idx}
                    className={`min-h-[115px] p-2 sm:p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      !cell.isCurrentMonth
                        ? 'bg-slate-50/50 border-slate-100 opacity-40'
                        : cell.isToday
                        ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Day number & event count badge */}
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                          cell.isToday
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-slate-700'
                        }`}
                      >
                        {cell.day}
                      </span>

                      {cell.events && cell.events.length > 0 && (
                        <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                          {cell.events.length}
                        </span>
                      )}
                    </div>

                    {/* Events inside this day */}
                    <div className="space-y-1.5 my-1.5 flex-1 overflow-hidden">
                      {cell.events &&
                        cell.events.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className={`p-1.5 rounded-xl text-[10px] font-bold leading-tight cursor-pointer hover:scale-[1.02] transition-transform truncate border shadow-2xs ${
                              ev.color_label || 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                            title={`${ev.judul} (${ev.platform})`}
                          >
                            <span className="block truncate font-extrabold">{ev.judul}</span>
                            <span className="text-[9px] opacity-80 block truncate">
                              {new Date(ev.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {ev.platform}
                            </span>
                          </div>
                        ))}
                    </div>

                    {/* Add Schedule Quick Link */}
                    {cell.isCurrentMonth && (
                      <Link
                        to={`/calendar/pick-date?year=${year}&month=${month + 1}&day=${cell.day}`}
                        onClick={(e) => handleScheduleClick(e, cell.dateObj)}
                        className="text-[10px] text-slate-400 hover:text-primary font-extrabold text-center block pt-1 hover:underline transition-colors"
                      >
                        + Jadwal
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Event Detail Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-primary/10 text-primary">
                      {selectedEvent.platform} • {selectedEvent.category || 'Konten UMKM'}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-2 leading-tight">
                      {selectedEvent.judul}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <p>
                    <strong>Waktu Tayang:</strong>{' '}
                    {new Date(selectedEvent.scheduled_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB
                  </p>
                  <p>
                    <strong>Tahapan Planner:</strong> <span className="font-bold uppercase text-primary">{selectedEvent.stage}</span> (Status: {selectedEvent.status})
                  </p>
                </div>

                {selectedEvent.caption && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Caption / Copywriting:</label>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed max-h-36 overflow-y-auto">
                      {selectedEvent.caption}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                  <Link
                    to="/calendar/agenda"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Buka Semua Agenda</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>

                  <button
                    onClick={() => {
                      const id = selectedEvent.id;
                      setSelectedEvent(null);
                      navigate(`/calendar/edit-schedule?id=${id}`);
                    }}
                    className="px-4 py-2 bg-gradient-primary text-white text-xs font-bold rounded-xl shadow-xs hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Edit Jadwal Ini
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
