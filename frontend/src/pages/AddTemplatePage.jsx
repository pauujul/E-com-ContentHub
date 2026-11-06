import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AddTemplatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const dateParam = searchParams.get('date'); // Format ISO: YYYY-MM-DD
  const timeParam = searchParams.get('time') || '19:00';
  const displayDateParam = searchParams.get('displayDate');

  // Hitung tanggal target secara aman
  let targetDateObj;
  if (dateParam && dateParam.includes('-')) {
    targetDateObj = new Date(`${dateParam}T${timeParam.length === 5 ? timeParam + ':00' : '19:00:00'}`);
  } else {
    targetDateObj = new Date();
  }

  const validTargetDate = !isNaN(targetDateObj.getTime()) ? targetDateObj : new Date();
  const standardDateISO = validTargetDate.toISOString().split('T')[0]; // YYYY-MM-DD

  const formattedDateTitle = displayDateParam
    ? decodeURIComponent(displayDateParam)
    : validTargetDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const [saving, setSaving] = useState(false);
  const [postTitle, setPostTitle] = useState('Agenda Konten Baru Canva');
  const [platform, setPlatform] = useState('Instagram');
  const [caption, setCaption] = useState('Draf konten terjadwal via ContentHub & Canva integration.');

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const scheduledIsoString = validTargetDate.toISOString();

      await api.createPost({
        user_id: currentUser?.id || 1,
        judul: postTitle,
        caption: caption,
        platform: platform,
        category: 'Promosi UMKM',
        scheduled_at: scheduledIsoString,
        status: 'Scheduled',
        stage: 'scheduled',
      });

      // Arahkan ke kalender pada bulan target yang baru saja dijadwalkan
      const targetMonth = validTargetDate.getMonth();
      const targetYear = validTargetDate.getFullYear();
      navigate(`/calendar?month=${targetMonth}&year=${targetYear}`);
    } catch (err) {
      console.error('Error creating post draft:', err);
      navigate('/calendar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800">
      <Sidebar />

      <main className="ml-0 md:ml-64 p-6 sm:p-8 lg:p-10 min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[5%] w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <section className="max-w-xl w-full relative z-10">
          <div className="mb-4 flex items-center gap-2">
            <Link to="/calendar" className="flex items-center gap-1.5 text-slate-400 hover:text-primary transition-colors text-xs font-bold">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Kembali ke Kalender
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg text-center relative overflow-hidden border border-slate-200">
            <div className="mb-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-xs">
                <span className="material-symbols-outlined text-3xl">
                  event_available
                </span>
              </div>
              <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold uppercase tracking-widest mb-2 border border-emerald-200">
                Jadwal Terpilih Presisi
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mb-1">
                {formattedDateTitle}
              </h2>
              <p className="text-primary font-extrabold text-sm mb-2">
                Pukul {timeParam} WIB
              </p>
              <p className="text-slate-500 max-w-md mx-auto text-xs font-medium leading-relaxed">
                Slot waktu posting Anda telah dikonfirmasi. Tentukan judul postingan dan Anda dapat langsung menyimpannya ke database atau mengedit visual template Canva.
              </p>
            </div>

            {/* Input Form Sederhana */}
            <div className="space-y-4 text-left mb-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Judul Postingan / Agenda
                </label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Contoh: Menu Donat Cokelat Lumer Special"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Threads">Threads</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Status
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="Terjadwal di Kalender"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Caption / Catatan
                </label>
                <textarea
                  rows="3"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-primary focus:outline-none leading-relaxed"
                  placeholder="Naskah promosi atau deskripsi konten..."
                ></textarea>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                className="w-full py-3.5 rounded-xl text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 bg-gradient-primary shadow-md shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>{saving ? 'Menyimpan ke Database Neon...' : 'Simpan Jadwal ke Kalender Sekarang'}</span>
              </button>

              <Link
                to={`/templates?scheduledDate=${standardDateISO}&time=${timeParam}`}
                className="w-full py-3 rounded-xl text-primary font-bold text-xs hover:bg-slate-50 transition-colors border border-primary/25 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">palette</span>
                <span>+ Buka Template Canva untuk Jadwal Ini</span>
              </Link>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] uppercase tracking-wider font-bold text-slate-400">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-emerald-600">cloud_done</span>
                <span>PostgreSQL Neon Live Sync</span>
              </div>
              <span>Canva Ready</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
