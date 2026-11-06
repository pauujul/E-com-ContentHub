import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

export default function TermsPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getContent('terms')
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setContent(res.data[0]);
        }
      })
      .catch((err) => console.error('Gagal memuat Syarat & Ketentuan:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto flex-1 w-full">
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-xs font-bold text-slate-400">Memuat Syarat & Ketentuan dari database...</p>
          </div>
        ) : content ? (
          <article className="space-y-8 animate-in fade-in duration-300">
            {/* Header Banner */}
            <header className="space-y-3 pb-6 border-b border-outline-variant/15">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {content.category || 'Dokumen Resmi'}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface leading-tight">
                {content.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                <span>Penyusun: {content.author}</span>
                <span>•</span>
                <span>Terakhir Diperbarui: {new Date(content.updated_at || content.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
              </div>
            </header>

            {content.image_url && (
              <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-sm border border-outline-variant/15">
                <img src={content.image_url} alt={content.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Content Body */}
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-outline-variant/15 shadow-sm text-sm md:text-base leading-relaxed text-slate-700 whitespace-pre-line space-y-4">
              {content.description}
            </div>
          </article>
        ) : (
          <div className="text-center py-20 bg-slate-100 rounded-3xl">
            <p className="text-slate-500 font-bold">Dokumen Syarat & Ketentuan sedang dalam proses pembaruan.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
