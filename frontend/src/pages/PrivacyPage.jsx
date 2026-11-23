import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function PrivacyPage() {
  const [searchParams] = useSearchParams();
  const isInWorkspace = searchParams.get('mode') === 'workspace';

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getContent('privacy')
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setContent(res.data[0]);
        }
      })
      .catch((err) => console.error('Gagal memuat Kebijakan Privasi:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col justify-between">
      {/* Tampilkan Sidebar untuk Workspace, atau Navbar jika mode landing */}
      {isInWorkspace ? <Sidebar /> : <Navbar />}

      <main
        className={`flex-1 w-full transition-all ${
          isInWorkspace
            ? 'ml-0 md:ml-64 p-6 sm:p-8 lg:p-10 max-w-5xl'
            : 'pt-24 pb-20 px-6 max-w-5xl mx-auto'
        }`}
      >
        {/* Navigasi Khusus Workspace (Anti Landing Page) */}
        {isInWorkspace && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Link
                to="/help?mode=workspace"
                className="hover:text-primary transition-colors flex items-center gap-1 font-bold text-slate-600 hover:underline"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Kembali ke Pusat Bantuan
              </Link>
              <span>/</span>
              <span className="text-emerald-700 font-black">Kebijakan & Privasi</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200 w-fit">
              <span className="material-symbols-outlined text-xs">verified_user</span>
              Keamanan Data Workspace
            </span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="mt-4 text-xs font-bold text-slate-400">Memuat Kebijakan & Privasi dari database...</p>
          </div>
        ) : content ? (
          <article className="space-y-6 animate-in fade-in duration-200">
            {/* Header Banner */}
            <header className="space-y-3 pb-6 border-b border-slate-200">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                {content.category || 'Kebijakan Privasi'}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {content.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                <span>Otoritas: <strong className="text-slate-700">{content.author}</strong></span>
                <span>•</span>
                <span>Terakhir Diperbarui: {new Date(content.updated_at || content.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
              </div>
            </header>

            {content.image_url && (
              <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-xs border border-slate-200">
                <img src={content.image_url} alt={content.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Content Body */}
            <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line space-y-4">
              {content.description}
            </div>
          </article>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 font-bold">Dokumen Kebijakan & Privasi sedang dimuat.</p>
          </div>
        )}
      </main>

      {/* Sembunyikan footer landing page jika sedang berada dalam mode workspace */}
      {!isInWorkspace && <Footer />}
    </div>
  );
}
