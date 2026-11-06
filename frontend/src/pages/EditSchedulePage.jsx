import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function EditSchedulePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const postId = searchParams.get('id');
  const dateFromQuery = searchParams.get('date');
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    judul: '',
    platform: 'Instagram',
    scheduled_date: dateFromQuery || todayStr,
    scheduled_time: '19:00',
    caption: '',
    status: 'Scheduled',
    stage: 'scheduled',
    category: 'Konten UMKM',
  });
  const [loading, setLoading] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (postId) {
      setLoading(true);
      api.getPostById(postId)
        .then((res) => {
          if (res.success && res.data) {
            const p = res.data;
            const pDate = new Date(p.scheduled_at);
            // Ambil format YYYY-MM-DD lokal
            const yearStr = pDate.getFullYear();
            const monthStr = String(pDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(pDate.getDate()).padStart(2, '0');
            const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

            const hourStr = String(pDate.getHours()).padStart(2, '0');
            const minStr = String(pDate.getMinutes()).padStart(2, '0');
            const timeStr = `${hourStr}:${minStr}`;

            setFormData({
              judul: p.judul || '',
              platform: p.platform || 'Instagram',
              scheduled_date: dateStr,
              scheduled_time: timeStr,
              caption: p.caption || '',
              status: p.status || 'Scheduled',
              stage: p.stage || 'scheduled',
              category: p.category || 'Konten UMKM',
            });
          }
        })
        .catch((err) => {
          console.error('Error fetching post:', err);
          setErrorMsg('Gagal memuat data agenda.');
        })
        .finally(() => setLoading(false));
    }
  }, [postId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}:00`).toISOString();
      const payload = {
        judul: formData.judul,
        caption: formData.caption,
        platform: formData.platform,
        category: formData.category,
        scheduled_at: scheduledDateTime,
        status: formData.status,
        stage: formData.stage,
      };

      if (postId) {
        await api.updatePost(postId, payload);
      } else {
        await api.createPost(payload);
      }

      setSavedAlert(true);
      setTimeout(() => {
        setSavedAlert(false);
        navigate('/calendar/agenda');
      }, 1000);
    } catch (err) {
      console.error('Error updating post:', err);
      setErrorMsg('Gagal menyimpan perubahan ke database.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800">
      <Sidebar />

      <main className="ml-0 md:ml-64 p-6 sm:p-8 lg:p-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg border border-slate-200 space-y-6 animate-in fade-in duration-300">
          
          <div className="flex justify-between items-start pb-2 border-b border-slate-100">
            <div>
              <Link to="/calendar/agenda" className="text-xs font-bold text-slate-400 hover:text-primary flex items-center gap-1 mb-2 transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Agenda
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {postId ? 'Edit Jadwal Konten' : 'Buat Jadwal Baru'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Perubahan tersimpan secara instan dan permanen ke database PostgreSQL Neon.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">edit_calendar</span>
            </div>
          </div>

          {savedAlert && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
              <span className="material-symbols-outlined text-base">check_circle</span>
              Perubahan jadwal berhasil disimpan ke database Neon!
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-200">
              <span className="material-symbols-outlined text-base">error</span>
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-xs font-bold text-slate-400">Memuat data jadwal...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Judul Postingan / Agenda
                </label>
                <input
                  type="text"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-bold focus:ring-2 focus:ring-primary focus:bg-white focus:outline-none"
                  placeholder="Masukkan judul postingan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Platform Sosial Media
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-bold focus:ring-2 focus:ring-primary focus:bg-white"
                  >
                    <option value="Instagram">Instagram (Feed & Story)</option>
                    <option value="TikTok">TikTok Video</option>
                    <option value="Facebook">Facebook Page</option>
                    <option value="Threads">Threads</option>
                    <option value="YouTube">YouTube Shorts</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Tahapan Planner
                  </label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-bold focus:ring-2 focus:ring-primary focus:bg-white"
                  >
                    <option value="backlog">Ide Konten (Backlog)</option>
                    <option value="design">Desain Canva</option>
                    <option value="ready">Siap Publish</option>
                    <option value="scheduled">Terjadwal di Kalender</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Tanggal Tayang
                  </label>
                  <input
                    type="date"
                    name="scheduled_date"
                    value={formData.scheduled_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-bold focus:ring-2 focus:ring-primary focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Jam Tayang (WIB)
                  </label>
                  <input
                    type="time"
                    name="scheduled_time"
                    value={formData.scheduled_time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-bold focus:ring-2 focus:ring-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Caption / Naskah Postingan
                </label>
                <textarea
                  name="caption"
                  rows="4"
                  value={formData.caption}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-primary focus:bg-white focus:outline-none leading-relaxed"
                  placeholder="Tuliskan naskah copywriting, call to action, dan hashtag..."
                ></textarea>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/calendar/agenda')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-primary text-white font-extrabold text-xs rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Simpan ke Database PostgreSQL
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
