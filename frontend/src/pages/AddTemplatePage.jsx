import React from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AddTemplatePage() {
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date') || '24 Oktober 2026';
  const time = searchParams.get('time') || '19:00';
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 p-10 min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
        {/* Abstract Architectural Background Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary-container/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[5%] w-80 h-80 bg-secondary-container/10 rounded-full blur-[80px] pointer-events-none"></div>

        <section className="max-w-2xl w-full relative z-10">
          <div className="mb-6 flex items-center gap-2">
            <Link to="/calendar" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-semibold">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Kembali ke Kalender
            </Link>
          </div>

          <div className="bg-surface-container-lowest rounded-[2.5rem] p-10 md:p-12 shadow-xl text-center relative overflow-hidden border border-outline-variant/15">
            <div className="mb-8 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mb-6 shadow-sm">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  calendar_today
                </span>
              </div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-extrabold uppercase tracking-widest mb-4">
                Waktu Tersimpan
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface mb-2">
                Jadwal diatur: {date}, {time} WIB
              </h2>
              <p className="text-slate-500 max-w-md mx-auto text-xs md:text-sm font-medium leading-relaxed">
                Slot waktu posting Anda telah dikunci. Sekarang saatnya memilih template konten yang tepat dari library Canva untuk mengisi jadwal ini.
              </p>
            </div>

            {/* Visual Decorative Element */}
            <div className="relative h-36 w-full mb-8 rounded-2xl bg-surface-container-low flex items-center justify-center overflow-hidden border border-outline-variant/15">
              <div className="relative z-10 flex gap-4 items-center">
                <div className="w-16 h-20 bg-white/80 backdrop-blur rounded-lg border border-slate-200 transform -rotate-12 translate-y-2 shadow-sm"></div>
                <div className="w-16 h-20 bg-primary-container text-white rounded-lg shadow-lg z-20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">add</span>
                </div>
                <div className="w-16 h-20 bg-white/80 backdrop-blur rounded-lg border border-slate-200 transform rotate-12 translate-y-2 shadow-sm"></div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/templates"
                className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-gradient-primary shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xl">post_add</span>
                + Pilih Template Desain untuk Jadwal Ini
              </Link>

              <button
                type="button"
                onClick={() => navigate('/calendar/agenda')}
                className="w-full py-3.5 rounded-2xl text-primary font-bold text-xs hover:bg-surface-container-high transition-colors"
              >
                Simpan Sebagai Draf Dulu
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-between items-center text-[11px] uppercase tracking-wider font-bold text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs">info</span>
                <span>Tersinkronisasi Otomatis</span>
              </div>
              <span>Canva Ready</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
