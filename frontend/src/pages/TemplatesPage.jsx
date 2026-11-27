import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUpgradeModal } from '../context/UpgradeModalContext';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const { isFreeTier, currentUser } = useAuth();
  const { openUpgradeModal } = useUpgradeModal();

  // Reset scroll ke atas saat halaman dibuka
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Fetch templates secara dinamis dari API
  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getTemplates();
      if (res && res.success && Array.isArray(res.data)) {
        setTemplates(res.data);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err.response?.data?.message || err.message || 'Gagal memuat pustaka template.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleTemplateClick = (tpl) => {
    const isPremium = (tpl.access_tier || tpl.tier || '').toLowerCase() === 'premium' || Boolean(tpl.is_premium);
    const isLocked = Boolean(tpl.is_locked) || (isFreeTier && isPremium);

    if (isLocked) {
      openUpgradeModal({
        reason: 'premium_template',
        templateTitle: tpl.title,
      });
      return;
    }

    const canvaLink = tpl.canva_url || tpl.canva_link;
    if (canvaLink) {
      window.open(canvaLink, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/templates/preview/${tpl.id}`);
    }
  };

  // Filter 6 Kategori & Format + Real-Time Search Term
  const filteredTemplates = templates.filter((t) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q));

    let matchesFilter = true;
    if (activeFilter === 'Promosi' || activeFilter === 'Edukasi' || activeFilter === 'Engagement') {
      matchesFilter = t.category === activeFilter;
    } else if (activeFilter === '1:1') {
      const fmt = t.format_ratio || t.format || '';
      matchesFilter = fmt.includes('1:1');
    } else if (activeFilter === '9:16') {
      const fmt = t.format_ratio || t.format || '';
      matchesFilter = fmt.includes('9:16');
    }

    return matchesSearch && matchesFilter;
  });

  const filterButtons = [
    { key: 'All', label: 'Semua Template' },
    { key: 'Promosi', label: 'Promosi' },
    { key: 'Edukasi', label: 'Edukasi' },
    { key: 'Engagement', label: 'Engagement' },
    { key: '1:1', label: 'Format 1:1' },
    { key: '9:16', label: 'Format 9:16' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <Sidebar />

      <main className="ml-0 md:ml-64 flex-1 p-6 sm:p-8 pt-6 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Search & Title Header */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-2 inline-block">
                Curated Design Assets
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Template Library
              </h1>
              <p className="text-sm text-slate-500 max-w-lg mt-1">
                Koleksi aset desain visual siap pakai Canva yang dirancang profesional untuk kebutuhan UMKM.
              </p>
            </div>

            {/* Real-time Search Input Box */}
            <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari template (Fashion, Kuliner, Promo)..."
                className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-slate-800 placeholder:text-slate-400 shadow-xs outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-xs"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          </section>

          {/* 6 Filter Buttons (Solid Blue Active State) */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {filterButtons.map((btn, index) => {
              const isActive = activeFilter === btn.key;
              return (
                <React.Fragment key={btn.key}>
                  {index === 4 && <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block"></div>}
                  <button
                    type="button"
                    onClick={() => setActiveFilter(btn.key)}
                    className={`px-4 py-2 rounded-xl text-xs transition-all cursor-pointer select-none ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/25 font-extrabold scale-[1.02]'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold shadow-2xs'
                    }`}
                  >
                    {btn.label}
                  </button>
                </React.Fragment>
              );
            })}

            <span className="ml-auto text-xs font-bold text-slate-400 hidden sm:inline-block">
              Menampilkan {filteredTemplates.length} Template
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-4xl animate-spin text-primary mb-3">
                progress_activity
              </span>
              <p className="text-sm font-bold text-slate-600">Memuat koleksi template Canva...</p>
              <p className="text-xs text-slate-400 mt-1">Mengambil desain terbaru dari database</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="py-16 text-center bg-red-50/60 rounded-3xl border border-red-200 p-8 space-y-3">
              <span className="material-symbols-outlined text-4xl text-red-500">error</span>
              <h3 className="text-base font-extrabold text-red-800">Gagal Memuat Template</h3>
              <p className="text-xs text-red-600 max-w-md mx-auto">{error}</p>
              <button
                type="button"
                onClick={fetchTemplates}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all cursor-pointer shadow-sm"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredTemplates.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">auto_awesome_motion</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-800">Tidak Ada Template Ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchTerm
                  ? `Tidak ada template yang cocok dengan kata kunci "${searchTerm}" pada filter yang dipilih.`
                  : 'Belum ada template aktif pada kategori ini.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('All');
                  setSearchTerm('');
                }}
                className="mt-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
              >
                Reset Filter & Pencarian
              </button>
            </div>
          )}

          {/* Pinterest / Bento Grid Template Cards */}
          {!loading && !error && filteredTemplates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-in fade-in duration-200">
              {filteredTemplates.map((tpl) => {
                const isPremium = (tpl.access_tier || tpl.tier || '').toLowerCase() === 'premium' || Boolean(tpl.is_premium);
                const isLockedForUser = Boolean(tpl.is_locked) || (isFreeTier && isPremium);
                const formatLabel = tpl.format_ratio || tpl.format || '1:1';
                const thumbnailSrc = tpl.thumbnail_url || tpl.image;

                let catBadgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
                if (tpl.category === 'Edukasi') catBadgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                if (tpl.category === 'Engagement') catBadgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';

                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleTemplateClick(tpl)}
                    className={`group cursor-pointer bg-white rounded-3xl overflow-hidden border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                      isLockedForUser
                        ? 'border-amber-300/60 ring-1 ring-amber-300/30'
                        : 'border-slate-200 hover:border-primary/40'
                    }`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                      <img
                        alt={tpl.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={thumbnailSrc}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
                        }}
                      />

                      {/* Tier Badge: Free vs Premium */}
                      {isPremium ? (
                        <div
                          className={`absolute top-4 left-4 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 z-10 ${
                            isLockedForUser ? 'bg-amber-600 text-white' : 'bg-amber-500 text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {isLockedForUser ? 'lock' : 'workspace_premium'}
                          </span>
                          <span>{isLockedForUser ? 'Terkunci (Free)' : 'Pro & Plus'}</span>
                        </div>
                      ) : (
                        <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 z-10">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          <span>Free</span>
                        </div>
                      )}

                      {/* Format Badge (1:1 / 9:16) */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-slate-700 border border-slate-200/60 shadow-xs z-10">
                        {formatLabel}
                      </div>

                      {/* Hover Overlay Button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 z-20">
                        {isLockedForUser ? (
                          <button
                            type="button"
                            className="px-5 py-2.5 bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">lock</span>
                            Upgrade ke Pro / Plus
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="px-5 py-2.5 bg-white text-primary font-bold text-xs rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">open_in_new</span>
                            Buka Template di Canva
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-wider ${catBadgeStyle}`}>
                          {tpl.category || 'Promosi'}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {formatLabel}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-primary transition-colors flex items-center justify-between">
                        <span className="truncate">{tpl.title}</span>
                        {isLockedForUser && (
                          <span className="material-symbols-outlined text-sm text-amber-500 flex-shrink-0 ml-1" title="Khusus Pro & Plus">
                            lock
                          </span>
                        )}
                      </h3>

                      {tpl.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
