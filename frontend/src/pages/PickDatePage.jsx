import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function PickDatePage() {
  const [selectedDay, setSelectedDay] = useState(24);
  const navigate = useNavigate();

  const days = [
    { num: 28, isCurrent: false },
    { num: 29, isCurrent: false },
    { num: 30, isCurrent: false },
    { num: 1, isCurrent: true },
    { num: 2, isCurrent: true },
    { num: 3, isCurrent: true },
    { num: 4, isCurrent: true },
    { num: 5, isCurrent: true },
    { num: 6, isCurrent: true },
    { num: 7, isCurrent: true },
    { num: 8, isCurrent: true },
    { num: 9, isCurrent: true },
    { num: 10, isCurrent: true },
    { num: 11, isCurrent: true },
    { num: 12, isCurrent: true },
    { num: 13, isCurrent: true },
    { num: 14, isCurrent: true },
    { num: 15, isCurrent: true },
    { num: 16, isCurrent: true },
    { num: 17, isCurrent: true },
    { num: 18, isCurrent: true },
    { num: 19, isCurrent: true },
    { num: 20, isCurrent: true },
    { num: 21, isCurrent: true },
    { num: 22, isCurrent: true },
    { num: 23, isCurrent: true },
    { num: 24, isCurrent: true },
    { num: 25, isCurrent: true },
    { num: 26, isCurrent: true },
    { num: 27, isCurrent: true },
    { num: 28, isCurrent: true },
    { num: 29, isCurrent: true },
    { num: 30, isCurrent: true },
    { num: 31, isCurrent: true }
  ];

  const handleContinue = () => {
    navigate(`/calendar/set-time?day=${selectedDay}&month=Oktober&year=2026`);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 pt-20 px-8 pb-12 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-lg border border-outline-variant/15 space-y-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-start">
            <div>
              <Link to="/calendar" className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Kalender
              </Link>
              <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">Pilih Tanggal Jadwal Konten</h1>
              <p className="text-xs text-on-surface-variant mt-1">Langkah 1 dari 3: Tentukan hari tayang konten Anda.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">calendar_today</span>
            </div>
          </div>

          {/* Month Header */}
          <div className="p-4 bg-surface-container-low rounded-2xl flex justify-between items-center">
            <button className="p-2 hover:bg-white rounded-lg transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="font-extrabold text-sm text-on-surface">Oktober 2026</span>
            <button className="p-2 hover:bg-white rounded-lg transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          {/* Calendar Day Picker Grid */}
          <div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-outline uppercase mb-2">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={!item.isCurrent}
                  onClick={() => setSelectedDay(item.num)}
                  className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                    !item.isCurrent
                      ? 'opacity-20 cursor-not-allowed'
                      : selectedDay === item.num
                      ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105'
                      : 'hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  {item.num}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Date Summary */}
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Tanggal Terpilih:</span>
              <p className="text-base font-extrabold text-primary">
                {selectedDay} Oktober 2026
              </p>
            </div>
            <span className="text-xs font-bold bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full">
              Siap Dijadwalkan
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link
              to="/calendar"
              className="flex-1 py-3.5 bg-surface-container-high hover:bg-surface-dim rounded-xl font-bold text-xs text-center text-on-surface transition-colors"
            >
              Batal
            </Link>
            <button
              onClick={handleContinue}
              className="flex-2 py-3.5 bg-gradient-primary text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Lanjut: Atur Jam Tayang</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
