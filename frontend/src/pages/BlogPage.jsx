import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

export default function BlogPage() {
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
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 pb-24 px-6 max-w-7xl mx-auto flex-1 w-full space-y-12">
        {/* Header & Search */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-purple-100 text-purple-700 px-3.5 py-1 rounded-full">
            ContentHub Educational Journal
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight">
            Blog & Strategi Pemasaran UMKM
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-xl mx-auto">
            Pelajari strategi kalender konten teruji, rahasia jam emas posting, dan tips desain visual Canva untuk melejitkan omzet bisnis Anda.
          </p>

          <div className="pt-4 max-w-md mx-auto relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari artikel strategi (misal: jam emas, donat, canva)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 shadow-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </header>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article Grid */}
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-xs font-bold text-slate-400">Memuat artikel edukasi dari database...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">article</span>
            <p className="text-sm font-bold text-slate-600">Tidak ada artikel yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-3xl border border-outline-variant/15 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-primary/40 transition-all group"
              >
                <div>
                  <div className="h-52 w-full overflow-hidden bg-slate-100 relative">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <span className="material-symbols-outlined text-5xl">image</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-primary shadow-xs">
                      {article.category || 'Artikel'}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-extrabold text-lg text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-[10px]">
                      {article.author ? article.author.charAt(0) : 'A'}
                    </span>
                    <span className="font-bold text-slate-700 truncate max-w-[110px]">{article.author}</span>
                  </div>

                  <button
                    onClick={() => setActiveArticle(article)}
                    className="font-extrabold text-primary hover:underline flex items-center gap-1 text-xs"
                  >
                    <span>Baca Artikel</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Baca Artikel Lengkap */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    {activeArticle.category}
                  </span>
                  <button
                    onClick={() => setActiveArticle(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                  {activeArticle.title}
                </h2>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <span>Ditulis oleh: <strong>{activeArticle.author}</strong></span>
                  <span>•</span>
                  <span>{new Date(activeArticle.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                </div>

                {activeArticle.image_url && (
                  <div className="w-full h-72 rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                    <img src={activeArticle.image_url} alt={activeArticle.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="text-sm md:text-base leading-relaxed text-slate-700 whitespace-pre-line space-y-4">
                  {activeArticle.description}
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setActiveArticle(null)}
                    className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
                  >
                    Tutup Artikel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
