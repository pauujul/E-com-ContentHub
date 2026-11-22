import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function BlogPage() {
  const { token } = useAuth();
  const isLoggedIn =
    (Boolean(token) || Boolean(localStorage.getItem('contenthub_user'))) &&
    localStorage.getItem('contenthub_logged_out') !== 'true';

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);

  useEffect(() => {
    api.getContent('articles')
      .then((res) => {
        if (res.success && res.data) {
          setArticles(res.data);
        }
      })
      .catch((err) => console.error('Gagal memuat artikel blog:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Semua', ...new Set(articles.map((a) => a.category).filter(Boolean))];

  const filteredArticles = articles.filter((a) => {
    const matchCat = selectedCategory === 'Semua' || a.category === selectedCategory;
    const matchSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col justify-between">
      {/* Jika login, tampilkan Sidebar Workspace. Jika pengunjung publik, tampilkan Navbar Landing */}
      {isLoggedIn ? <Sidebar /> : <Navbar />}

      <main
        className={`flex-1 w-full space-y-8 transition-all ${
          isLoggedIn
            ? 'ml-0 md:ml-64 p-6 sm:p-8 lg:p-10 max-w-6xl'
            : 'pt-24 pb-24 px-6 max-w-7xl mx-auto'
        }`}
      >
        {/* Navigasi Khusus Workspace (Anti Landing Page) */}
        {isLoggedIn && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Link
                to="/help"
                className="hover:text-primary transition-colors flex items-center gap-1 font-bold text-slate-600 hover:underline"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Kembali ke Pusat Bantuan
              </Link>
              <span>/</span>
              <span className="text-purple-700 font-black">Blog & Edukasi UMKM</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wider border border-purple-200 w-fit">
              <span className="material-symbols-outlined text-xs">menu_book</span>
              Wawasan & Strategi Konten
            </span>
          </div>
        )}

        {/* Header & Search */}
        <header className="text-center max-w-3xl mx-auto space-y-3 pt-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-purple-100 text-purple-700 px-3.5 py-1 rounded-full">
            ContentHub Educational Journal
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Blog & Strategi Pemasaran UMKM
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Pelajari strategi kalender konten teruji, rahasia jam emas posting, dan tips desain visual Canva untuk melejitkan omzet bisnis Anda.
          </p>

          <div className="pt-2 max-w-md mx-auto relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari artikel strategi (misal: jam emas, donat, canva)..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 shadow-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </header>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
            <p className="mt-3 text-xs font-bold text-slate-400">Memuat artikel edukasi...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <span className="material-symbols-outlined text-4xl text-slate-300">article</span>
            <p className="mt-2 text-xs font-bold text-slate-500">Tidak ada artikel yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => (
              <article
                key={art.id}
                onClick={() => setActiveArticle(art)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {art.image_url ? (
                    <div className="h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={art.image_url}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-gradient-to-tr from-purple-100 to-indigo-50 flex items-center justify-center text-purple-400">
                      <span className="material-symbols-outlined text-4xl">feed</span>
                    </div>
                  )}

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">
                      {art.category || 'Wawasan UMKM'}
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {art.title}
                    </h2>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {art.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>{art.author || 'Tim ContentHub'}</span>
                  <span className="text-purple-600 font-bold flex items-center gap-1 group-hover:underline">
                    Baca Artikel <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Modal Baca Artikel Lengkap */}
        {activeArticle && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setActiveArticle(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                  {activeArticle.category || 'Artikel Edukasi'}
                </span>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {activeArticle.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <span>Penulis: {activeArticle.author}</span>
                <span>•</span>
                <span>{new Date(activeArticle.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
              </div>

              {activeArticle.image_url && (
                <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 shadow-xs">
                  <img src={activeArticle.image_url} alt={activeArticle.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line space-y-3 pt-2">
                {activeArticle.description}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Tutup Artikel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {!isLoggedIn && <Footer />}
    </div>
  );
}
