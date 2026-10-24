import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AddLabelPage() {
  const navigate = useNavigate();
  const [labelName, setLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-pink-500');
  const [existingLabels, setExistingLabels] = useState([
    { id: 1, name: 'Instagram Feed', color: 'bg-pink-500', text: 'text-pink-700 bg-pink-100' },
    { id: 2, name: 'TikTok Video', color: 'bg-slate-900', text: 'text-slate-800 bg-slate-200' },
    { id: 3, name: 'Promo Diskon Payday', color: 'bg-amber-500', text: 'text-amber-800 bg-amber-100' },
    { id: 4, name: 'Edukasi & Tips UMKM', color: 'bg-blue-500', text: 'text-blue-800 bg-blue-100' },
    { id: 5, name: 'Story & Testimoni', color: 'bg-purple-500', text: 'text-purple-800 bg-purple-100' }
  ]);
  const [alertMsg, setAlertMsg] = useState('');

  const colors = [
    { name: 'Pink', bg: 'bg-pink-500', text: 'text-pink-700 bg-pink-100' },
    { name: 'Biru', bg: 'bg-blue-500', text: 'text-blue-700 bg-blue-100' },
    { name: 'Kuning', bg: 'bg-amber-500', text: 'text-amber-800 bg-amber-100' },
    { name: 'Hijau', bg: 'bg-green-500', text: 'text-green-800 bg-green-100' },
    { name: 'Ungu', bg: 'bg-purple-500', text: 'text-purple-800 bg-purple-100' },
    { name: 'Gelap', bg: 'bg-slate-900', text: 'text-slate-800 bg-slate-200' },
    { name: 'Merah', bg: 'bg-red-500', text: 'text-red-700 bg-red-100' }
  ];

  const handleAddLabel = (e) => {
    e.preventDefault();
    if (!labelName.trim()) return;

    const matched = colors.find(c => c.bg === selectedColor) || colors[0];
    const newLbl = {
      id: Date.now(),
      name: labelName.trim(),
      color: matched.bg,
      text: matched.text
    };

    setExistingLabels([...existingLabels, newLbl]);
    setLabelName('');
    setAlertMsg('Label kategori baru berhasil ditambahkan!');
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const handleDelete = (id) => {
    setExistingLabels(existingLabels.filter(l => l.id !== id));
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
              <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">Kelola Label Kategori</h1>
              <p className="text-xs text-on-surface-variant mt-1">
                Kustomisasi label warna untuk mengelompokkan jenis postingan di kalender.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-2xl">label</span>
            </div>
          </div>

          {alertMsg && (
            <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-200">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {alertMsg}
            </div>
          )}

          {/* Form Create Label */}
          <form onSubmit={handleAddLabel} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Nama Label Baru
              </label>
              <input
                type="text"
                value={labelName}
                onChange={(e) => setLabelName(e.target.value)}
                placeholder="Contoh: Flash Sale Mingguan, Live TikTok, Tips..."
                required
                className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-none text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Pilih Aksen Warna:
              </label>
              <div className="flex flex-wrap gap-3">
                {colors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedColor(c.bg)}
                    className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center transition-all ${
                      selectedColor === c.bg ? 'ring-4 ring-primary/30 scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {selectedColor === c.bg && (
                      <span className="material-symbols-outlined text-white text-base">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-primary text-white font-bold rounded-xl text-xs shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Tambahkan Label ke Kalender
              </button>
            </div>
          </form>

          {/* Existing Labels List */}
          <div className="space-y-3 pt-4 border-t border-outline-variant/15">
            <span className="text-xs font-bold uppercase tracking-wider text-outline block">
              Label yang Sedang Aktif ({existingLabels.length}):
            </span>
            <div className="space-y-2">
              {existingLabels.map(lbl => (
                <div
                  key={lbl.id}
                  className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3.5 h-3.5 rounded-full ${lbl.color}`}></span>
                    <span className="text-xs font-bold text-on-surface">{lbl.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(lbl.id)}
                    className="text-slate-400 hover:text-red-600 text-xs p-1"
                    title="Hapus Label"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
