import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function SearchTemplatePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const trendingTags = [
    'Fashion', 'Kuliner & F&B', 'Donat Madu', 'Flash Sale', 'Promo Gajian', 'Edukasi Carousel', 'Quotes Bisnis'
  ];

  const handleSearch = (searchTerm) => {
    const q = searchTerm || query;
    if (q.trim()) {
      navigate(`/templates/results?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 pt-20 px-8 pb-12 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl p-8 md:p-12 shadow-xl border border-outline-variant/15 space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary-fixed px-3 py-1 rounded-full">
              Pencarian Cerdas Template
            </span>
            <h1 className="text-3xl font-extrabold text-on-surface">Cari Template Sesuai Bisnis Anda</h1>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              Temukan inspirasi desain Canva yang telah dikurasi untuk berbagai ceruk industri UMKM.
            </p>
          </div>

          {/* Search Box Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-outline">
              search
            </span>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik topik (misal: Fashion, Donat, Diskon)..."
              className="w-full pl-14 pr-32 py-4 bg-surface-container-low border border-outline-variant/20 rounded-2xl text-base font-medium focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-primary text-white font-bold text-xs rounded-xl shadow-md"
            >
              Cari Sekarang
            </button>
          </form>

          {/* Trending Searches Tags */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-outline block">
              Paling Sering Dicari:
            </span>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearch(tag)}
                  className="px-4 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-full text-xs font-bold text-on-surface transition-colors flex items-center gap-1.5 border border-outline-variant/15"
                >
                  <span className="material-symbols-outlined text-sm text-primary">trending_up</span>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Back link */}
          <div className="pt-4 border-t border-outline-variant/15 text-center">
            <Link to="/templates" className="text-xs font-bold text-slate-500 hover:text-primary">
              &larr; Kembali ke Seluruh Library Template
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
