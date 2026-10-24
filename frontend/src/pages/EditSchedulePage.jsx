import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function EditSchedulePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: 'Summer Collection Launch: Premium Essentials & Donat Madu',
    channel: 'Instagram',
    format: 'Reels / Video',
    date: '2026-10-24',
    time: '19:00',
    caption: 'Koleksi varian rasa terbaru kami sudah resmi hadir! Dibuat dengan 100% madu murni dan adonan lembut yang meleleh di mulut. Dapatkan diskon 20% khusus pembelian hari ini via link di bio! #DonatMadu #KulinerUMKM',
    status: 'Terjadwal'
  });
  const [savedAlert, setSavedAlert] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
      navigate('/calendar/agenda');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 pt-20 px-8 pb-12 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-lg border border-outline-variant/15 space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-start">
            <div>
              <Link to="/calendar/agenda" className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Agenda
              </Link>
              <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">Edit Jadwal Konten</h1>
              <p className="text-xs text-on-surface-variant mt-1">Perbarui judul, tanggal, caption, atau channel postingan ini.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">edit_calendar</span>
            </div>
          </div>

          {savedAlert && (
            <div className="p-4 bg-green-50 text-green-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-200">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Perubahan jadwal berhasil disimpan!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Judul Agenda / Postingan
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-none text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Saluran Media Sosial
                </label>
                <select
                  name="channel"
                  value={formData.channel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-none text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-white"
                >
                  <option value="Instagram">Instagram (Feed & Story)</option>
                  <option value="TikTok">TikTok Video</option>
                  <option value="Facebook">Facebook Page</option>
                  <option value="YouTube">YouTube Shorts</option>
                  <option value="LinkedIn">LinkedIn Post</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Status Jadwal
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-none text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-white"
                >
                  <option value="Draf Canva">Draf Canva</option>
                  <option value="Siap Publish">Siap Publish</option>
                  <option value="Terjadwal">Terjadwal</option>
                  <option value="Selesai Terbit">Selesai Terbit</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Tanggal Posting
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-none text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Jam Tayang (WIB)
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-none text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Caption & Hastag Postingan
              </label>
              <textarea
                name="caption"
                rows="4"
                value={formData.caption}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-none text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-white leading-relaxed"
              ></textarea>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                to="/templates/canva-transition"
                className="px-5 py-3.5 bg-surface-container-high hover:bg-surface-dim rounded-xl font-bold text-xs text-on-surface flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Buka Desain di Canva
              </Link>
              <button
                type="submit"
                className="flex-1 py-3.5 bg-gradient-primary text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                Simpan Perubahan Jadwal
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
