import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function SetTimePage() {
  const [searchParams] = useSearchParams();
  const day = searchParams.get('day') || '24';
  const month = searchParams.get('month') || 'Oktober';
  const year = searchParams.get('year') || '2026';

  const [selectedHour, setSelectedHour] = useState('19');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const navigate = useNavigate();

  const primeTimes = [
    { label: 'Pagi (Commute)', time: '08:30', hour: '08', min: '30', icon: 'wb_twilight' },
    { label: 'Siang (Makan Siang)', time: '12:30', hour: '12', min: '30', icon: 'sunny', badge: 'Ramai' },
    { label: 'Sore (Santai)', time: '17:00', hour: '17', min: '00', icon: 'wb_sunny' },
    { label: 'Malam (Prime Time Emas)', time: '19:30', hour: '19', min: '30', icon: 'bedtime', badge: 'Terbaik' }
  ];

  const handleSelectPrime = (pt) => {
    setSelectedHour(pt.hour);
    setSelectedMinute(pt.min);
  };

  const handleContinue = () => {
    navigate(`/templates/add?date=${day}+${month}+${year}&time=${selectedHour}:${selectedMinute}`);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 pt-20 px-8 pb-12 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-lg border border-outline-variant/15 space-y-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-start">
            <div>
              <Link to="/calendar/pick-date" className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Pilih Tanggal
              </Link>
              <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">Atur Jam Posting Konten</h1>
              <p className="text-xs text-on-surface-variant mt-1">
                Langkah 2 dari 3: Pilih jam terbaik untuk tanggal <strong>{day} {month} {year}</strong>.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-2xl">alarm</span>
            </div>
          </div>

          {/* Time Picker Display */}
          <div className="p-8 bg-surface-container-low rounded-3xl text-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Waktu Tayang Dipilih:</span>
            <div className="flex items-center justify-center gap-3">
              <input
                type="text"
                maxLength="2"
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="w-20 h-20 text-4xl font-extrabold text-center bg-white rounded-2xl border border-outline-variant/20 text-primary focus:ring-2 focus:ring-primary shadow-sm"
              />
              <span className="text-4xl font-extrabold text-outline">:</span>
              <input
                type="text"
                maxLength="2"
                value={selectedMinute}
                onChange={(e) => setSelectedMinute(e.target.value)}
                className="w-20 h-20 text-4xl font-extrabold text-center bg-white rounded-2xl border border-outline-variant/20 text-primary focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
            <p className="text-xs font-bold text-outline">Zona Waktu: WIB (Waktu Indonesia Barat)</p>
          </div>

          {/* Prime Time AI Recommendations */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-outline block">
              Rekomendasi Jam Emas (Berdasarkan Engagement UMKM):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {primeTimes.map((pt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPrime(pt)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedHour === pt.hour && selectedMinute === pt.min
                      ? 'border-primary bg-primary/5 text-primary shadow-sm'
                      : 'border-outline-variant/20 hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg">{pt.icon}</span>
                    <div>
                      <p className="text-xs font-bold">{pt.time} WIB</p>
                      <p className="text-[10px] text-on-surface-variant">{pt.label}</p>
                    </div>
                  </div>
                  {pt.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary">
                      {pt.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/calendar')}
              className="flex-1 py-3.5 bg-surface-container-high hover:bg-surface-dim rounded-xl font-bold text-xs text-center text-on-surface transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex-2 py-3.5 bg-gradient-primary text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Lanjut: Pilih / Buat Template</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
