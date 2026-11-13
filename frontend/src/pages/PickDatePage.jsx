import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function PickDatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Ambil parameter tanggal dari URL jika ada, atau gunakan default hari ini
  const initialYear = parseInt(searchParams.get('year'), 10) || 2026;
  const initialMonth = searchParams.get('month') 
    ? (isNaN(searchParams.get('month')) ? parseMonthNameToIndex(searchParams.get('month')) : parseInt(searchParams.get('month'), 10) - 1)
    : 9; // Default 9 = Oktober (0-indexed)
  const initialDay = parseInt(searchParams.get('day'), 10) || 24;

  const [viewDate, setViewDate] = useState(new Date(initialYear, initialMonth, 1));
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  function parseMonthNameToIndex(name) {
    if (!name) return 9;
    const lower = name.toLowerCase();
    const idx = monthNames.findIndex(m => m.toLowerCase() === lower);
    return idx >= 0 ? idx : 9;
  }

  const curYear = viewDate.getFullYear();
  const curMonth = viewDate.getMonth();

  // Hitung jumlah hari dalam bulan ini
  const firstDayIndex = new Date(curYear, curMonth, 1).getDay(); // 0 = Minggu
  const totalDaysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(curYear, curMonth, 0).getDate();

  const daysGrid = [];

  // Trailing hari bulan lalu
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    daysGrid.push({
      num: prevMonthTotalDays - i,
      isCurrentMonth: false,
    });
  }

  // Hari-hari bulan aktif
  for (let d = 1; d <= totalDaysInMonth; d++) {
    daysGrid.push({
      num: d,
      isCurrentMonth: true,
    });
  }

  // Leading hari bulan berikutnya agar kelipatan 7
  const remaining = (7 - (daysGrid.length % 7)) % 7;
  for (let n = 1; n <= remaining; n++) {
    daysGrid.push({
      num: n,
      isCurrentMonth: false,
    });
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(curYear, curMonth - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setViewDate(new Date(curYear, curMonth + 1, 1));
    setSelectedDay(1);
  };

  const handleContinue = () => {
    // Format YYYY-MM-DD yang standar & presisi
    const formattedMonth = String(curMonth + 1).padStart(2, '0');
    const formattedDay = String(selectedDay).padStart(2, '0');
    const dateISO = `${curYear}-${formattedMonth}-${formattedDay}`;

    navigate(`/calendar/set-time?date=${dateISO}&day=${selectedDay}&month=${monthNames[curMonth]}&year=${curYear}&monthNum=${curMonth + 1}`);
  };

  const today = new Date();
  const isActualToday = (day) => {
    return day === today.getDate() && curMonth === today.getMonth() && curYear === today.getFullYear();
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800">
      <Sidebar />

      <main className="ml-0 md:ml-64 p-6 sm:p-8 lg:p-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg border border-slate-200 space-y-6 animate-in fade-in duration-300">
          
          {/* Header & Back Link */}
          <div className="flex justify-between items-start pb-2 border-b border-slate-100">
            <div>
              <Link to="/calendar" className="text-xs font-bold text-slate-400 hover:text-primary flex items-center gap-1 mb-2 transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Kalender
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Pilih Tanggal Jadwal Konten
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Langkah 1 dari 3: Tentukan tanggal tayang konten UMKM Anda secara presisi.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">calendar_today</span>
            </div>
          </div>

          {/* Month Switcher Header */}
          <div className="p-3 bg-slate-100 rounded-2xl flex justify-between items-center shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 hover:text-primary flex items-center justify-center shadow-xs hover:shadow"
              title="Bulan Sebelumnya"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>

            <div className="text-center">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 block">
                {monthNames[curMonth]} {curYear}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Kalender PostgreSQL Neon
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 hover:text-primary flex items-center justify-center shadow-xs hover:shadow"
              title="Bulan Berikutnya"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>

          {/* Day Names Header */}
          <div>
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              <span className="text-red-500">Min</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span className="text-blue-500">Sab</span>
            </div>

            {/* Calendar Day Picker Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {daysGrid.map((item, idx) => {
                const isSelected = item.isCurrentMonth && selectedDay === item.num;
                const isToday = isActualToday(item.num) && item.isCurrentMonth;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!item.isCurrentMonth}
                    onClick={() => {
                      if (item.isCurrentMonth) {
                        setSelectedDay(item.num);
                      }
                    }}
                    className={`h-11 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center relative ${
                      !item.isCurrentMonth
                        ? 'opacity-20 cursor-not-allowed bg-slate-50 text-slate-400'
                        : isSelected
                        ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105 ring-2 ring-primary ring-offset-2 z-10'
                        : isToday
                        ? 'bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    <span>{item.num}</span>
                    {isToday && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-primary absolute bottom-1.5"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tanggal Terpilih Summary */}
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tanggal Target Dipilih:</span>
              <p className="text-base font-extrabold text-primary">
                {selectedDay} {monthNames[curMonth]} {curYear}
              </p>
            </div>
            <span className="text-xs font-bold bg-primary text-white px-3 py-1 rounded-full shadow-xs">
              Terpilih & Siap
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Link
              to="/calendar"
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs text-center text-slate-700 transition-colors flex items-center justify-center"
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
