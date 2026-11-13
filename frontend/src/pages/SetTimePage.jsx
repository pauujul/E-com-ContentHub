import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function SetTimePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  function getMonthNumber(monthParam) {
    if (!monthParam) return 10;
    if (!isNaN(monthParam)) return parseInt(monthParam, 10);
    const idx = monthNames.findIndex(m => m.toLowerCase() === monthParam.toLowerCase());
    return idx >= 0 ? idx + 1 : 10;
  }

  const rawDate = searchParams.get('date');
  const day = searchParams.get('day') || '24';
  const monthStr = searchParams.get('month') || 'Oktober';
  const year = searchParams.get('year') || '2026';
  const monthNum = searchParams.get('monthNum') ? parseInt(searchParams.get('monthNum'), 10) : getMonthNumber(monthStr);

  // Bentuk tanggal ISO YYYY-MM-DD yang presisi
  const dateISO = rawDate && rawDate.includes('-')
    ? rawDate
    : `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const displayDate = new Date(`${dateISO}T00:00:00`);
  const formattedDisplay = !isNaN(displayDate.getTime())
    ? displayDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : `${day} ${monthStr} ${year}`;

  const [selectedHour, setSelectedHour] = useState('19');
  const [selectedMinute, setSelectedMinute] = useState('00');

  const primeTimes = [
    { label: 'Pagi (Commute & Sarapan)', time: '08:30', hour: '08', min: '30', icon: 'wb_twilight' },
    { label: 'Siang (Istirahat & Makan)', time: '12:30', hour: '12', min: '30', icon: 'sunny', badge: 'Ramai' },
    { label: 'Sore (Santai Sepulang Kerja)', time: '17:00', hour: '17', min: '00', icon: 'wb_sunny' },
    { label: 'Malam (Prime Time Emas UMKM)', time: '19:30', hour: '19', min: '30', icon: 'bedtime', badge: 'Terbaik' }
  ];

  const handleSelectPrime = (pt) => {
    setSelectedHour(pt.hour);
    setSelectedMinute(pt.min);
  };

  const handleContinue = () => {
    const cleanHour = String(selectedHour).padStart(2, '0');
    const cleanMin = String(selectedMinute).padStart(2, '0');
    navigate(`/templates/add?date=${dateISO}&time=${cleanHour}:${cleanMin}&displayDate=${encodeURIComponent(formattedDisplay)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800">
      <Sidebar />

      <main className="ml-0 md:ml-64 p-6 sm:p-8 lg:p-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg border border-slate-200 space-y-6 animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex justify-between items-start pb-2 border-b border-slate-100">
            <div>
              <Link to={`/calendar/pick-date?year=${year}&month=${monthNum}&day=${day}`} className="text-xs font-bold text-slate-400 hover:text-primary flex items-center gap-1 mb-2 transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Ubah Tanggal ({day} {monthStr} {year})
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Atur Jam Posting Konten
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Langkah 2 dari 3: Pilih jam terbaik untuk target tanggal <strong>{formattedDisplay}</strong>.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100">
              <span className="material-symbols-outlined text-2xl">alarm</span>
            </div>
          </div>

          {/* Time Picker Display */}
          <div className="p-6 sm:p-8 bg-slate-50 rounded-3xl text-center space-y-4 border border-slate-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Waktu Tayang Dipilih (Zona WIB):
            </span>

            <div className="flex items-center justify-center gap-3">
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  maxLength="2"
                  value={selectedHour}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 23)) {
                      setSelectedHour(val);
                    }
                  }}
                  className="w-20 h-20 text-4xl font-extrabold text-center bg-white rounded-2xl border border-slate-200 text-primary focus:ring-4 focus:ring-primary/20 shadow-xs"
                />
                <span className="text-[11px] font-bold text-slate-400 mt-1">Jam (00-23)</span>
              </div>

              <span className="text-4xl font-extrabold text-slate-400 pb-5">:</span>

              <div className="flex flex-col items-center">
                <input
                  type="text"
                  maxLength="2"
                  value={selectedMinute}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 59)) {
                      setSelectedMinute(val);
                    }
                  }}
                  className="w-20 h-20 text-4xl font-extrabold text-center bg-white rounded-2xl border border-slate-200 text-primary focus:ring-4 focus:ring-primary/20 shadow-xs"
                />
                <span className="text-[11px] font-bold text-slate-400 mt-1">Menit (00-59)</span>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-500">
              Jadwal otomatis tersimpan ke PostgreSQL Neon Cloud
            </p>
          </div>

          {/* Prime Time AI Recommendations */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Rekomendasi Jam Emas Berdasarkan Engagement UMKM:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {primeTimes.map((pt, idx) => {
                const isSelected = selectedHour === pt.hour && selectedMinute === pt.min;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPrime(pt)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary shadow-xs ring-2 ring-primary/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-lg">{pt.icon}</span>
                      <div>
                        <p className="text-xs font-bold">{pt.time} WIB</p>
                        <p className="text-[10px] text-slate-500">{pt.label}</p>
                      </div>
                    </div>
                    {pt.badge && (
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        {pt.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/calendar')}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs text-center text-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex-2 py-3.5 bg-gradient-primary text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Lanjut: Konfirmasi Jadwal Konten</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
