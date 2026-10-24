import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState('Month'); // Day | Week | Month
  const navigate = useNavigate();

  // Sample schedule items with colored labels
  const calendarDays = [
    { day: 28, isCurrentMonth: false },
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true, events: [
      { id: 1, title: 'Tips Donat Anti Bantat', platform: 'Instagram', time: '10:00', color: 'bg-pink-100 text-pink-700 border-pink-300' }
    ]},
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true, events: [
      { id: 2, title: 'TikTok Reel Resep Baru', platform: 'TikTok', time: '13:00', color: 'bg-slate-900 text-cyan-300 border-slate-700' }
    ]},
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true, events: [
      { id: 3, title: 'Diskon Payday Akhir Pekan', platform: 'Promo', time: '18:30', color: 'bg-amber-100 text-amber-800 border-amber-300' }
    ]},
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true, events: [
      { id: 4, title: 'Testimoni Pembeli Donat Box', platform: 'Story', time: '12:00', color: 'bg-purple-100 text-purple-700 border-purple-300' }
    ]},
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true, events: [
      { id: 5, title: 'Promo Beli 1 Gratis 1', platform: 'Instagram', time: '19:00', color: 'bg-pink-100 text-pink-700 border-pink-300' },
      { id: 6, title: 'Live Baking TikTok', platform: 'TikTok', time: '20:30', color: 'bg-slate-900 text-cyan-300 border-slate-700' }
    ]},
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true, events: [
      { id: 7, title: 'Edukasi: Memilih Tepung Berkualitas', platform: 'Edukasi', time: '14:00', color: 'bg-blue-100 text-blue-700 border-blue-300' }
    ]},
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true, events: [
      { id: 8, title: 'Flash Sale 9.9 UMKM', platform: 'Promo', time: '11:30', color: 'bg-amber-100 text-amber-800 border-amber-300' }
    ]},
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true, events: [
      { id: 9, title: 'Video Donat Cokelat Lumer', platform: 'Reels', time: '17:00', color: 'bg-rose-100 text-rose-700 border-rose-300' }
    ]},
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true, isToday: true, events: [
      { id: 10, title: 'Launching Varian Green Tea Matcha', platform: 'Instagram', time: '19:00', color: 'bg-green-100 text-green-800 border-green-300' }
    ]},
    { day: 25, isCurrentMonth: true, events: [
      { id: 11, title: 'Behind the Scenes Packing Order', platform: 'TikTok', time: '12:00', color: 'bg-slate-900 text-cyan-300 border-slate-700' }
    ]},
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true, events: [
      { id: 12, title: 'Q&A Story Tanya Jawab Reseller', platform: 'Story', time: '16:00', color: 'bg-purple-100 text-purple-700 border-purple-300' }
    ]},
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true }
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 pt-20 px-8 pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Calendar Top Navigation Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary-fixed px-3 py-1 rounded-full mb-2 inline-block">
                Interactive Calendar
              </span>
              <h1 className="text-3xl font-extrabold text-on-surface">Oktober 2026</h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Visualisasikan seluruh jadwal posting sosial media dengan label kategori warna.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Actions Button */}
              <Link
                to="/calendar/add-label"
                className="px-4 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-xl text-xs font-bold text-on-surface flex items-center gap-1.5 border border-outline-variant/15"
              >
                <span className="material-symbols-outlined text-base">label</span>
                + Tambah Label
              </Link>

              <Link
                to="/calendar/drag-drop"
                className="px-4 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-xl text-xs font-bold text-on-surface flex items-center gap-1.5 border border-outline-variant/15"
              >
                <span className="material-symbols-outlined text-base">drag_indicator</span>
                Drag & Drop Planner
              </Link>

              <Link
                to="/calendar/pick-date"
                className="px-5 py-2.5 bg-gradient-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Jadwalkan Konten
              </Link>

              {/* View Switcher: Day, Week, Month */}
              <div className="flex p-1 bg-surface-container-high rounded-xl gap-1">
                {['Day', 'Week', 'Month'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      viewMode === mode
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-500 hover:text-on-surface'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Label Filter Legend Bar */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm text-xs">
            <span className="font-bold text-outline uppercase tracking-wider">Kategori Label:</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500"></span>
              <span className="font-medium text-slate-700">Instagram Feed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-900"></span>
              <span className="font-medium text-slate-700">TikTok Video</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="font-medium text-slate-700">Promo Diskon</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="font-medium text-slate-700">Edukasi Carousel</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span className="font-medium text-slate-700">Story & QnA</span>
            </div>
          </div>

          {/* Main Month Grid (7 columns Sun - Sat) */}
          <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant/15">
            {/* Day Header Row */}
            <div className="grid grid-cols-7 border-b border-outline-variant/15 bg-surface-container-low text-center">
              {['Minggu (Sun)', 'Senin (Mon)', 'Selasa (Tue)', 'Rabu (Wed)', 'Kamis (Thu)', 'Jumat (Fri)', 'Sabtu (Sat)'].map((name, i) => (
                <div key={i} className="py-3.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  {name}
                </div>
              ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-outline-variant/10">
              {calendarDays.map((item, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => navigate('/calendar/agenda')}
                    className={`min-h-[135px] p-2.5 transition-colors cursor-pointer group flex flex-col justify-between ${
                      !item.isCurrentMonth
                        ? 'bg-slate-50/50 opacity-40'
                        : item.isToday
                        ? 'bg-blue-50/50'
                        : 'bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full ${
                        item.isToday
                          ? 'bg-primary text-white'
                          : 'text-on-surface group-hover:text-primary'
                      }`}>
                        {item.day}
                      </span>
                      {item.isToday && (
                        <span className="text-[10px] font-bold text-primary uppercase">Hari Ini</span>
                      )}
                    </div>

                    {/* Events inside date cell */}
                    <div className="space-y-1.5 flex-1 overflow-hidden">
                      {item.events?.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/calendar/agenda`);
                          }}
                          className={`p-1.5 rounded-lg border text-[11px] font-semibold leading-tight shadow-xs hover:shadow-sm transition-all ${ev.color}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold truncate">{ev.title}</span>
                          </div>
                          <span className="text-[9px] opacity-80 block mt-0.5">{ev.time} • {ev.platform}</span>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add icon visible on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-right">
                      <span className="material-symbols-outlined text-xs text-primary">add_circle</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
