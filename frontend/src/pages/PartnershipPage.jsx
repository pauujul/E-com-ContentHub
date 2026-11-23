import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function PartnershipPage() {
  const [searchParams] = useSearchParams();
  const isInWorkspace = searchParams.get('mode') === 'workspace';

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getContent('partnerships')
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setContent(res.data[0]);
        }
      })
      .catch((err) => console.error('Gagal memuat Konten Kerja Sama:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col justify-between">
      {/* Tampilkan Sidebar untuk Workspace, atau Navbar jika mode landing */}
      {isInWorkspace ? <Sidebar /> : <Navbar />}

      <main
        className={`flex-1 w-full space-y-10 transition-all ${
          isInWorkspace
            ? 'ml-0 md:ml-64 p-6 sm:p-8 lg:p-10 max-w-6xl'
            : 'pt-24 pb-24 px-6 max-w-7xl mx-auto'
        }`}
      >
        {/* Navigasi Khusus Workspace (Anti Landing Page) */}
        {isInWorkspace && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Link
                to="/help?mode=workspace"
                className="hover:text-primary transition-colors flex items-center gap-1 font-bold text-slate-600 hover:underline"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Kembali ke Pusat Bantuan
              </Link>
              <span>/</span>
              <span className="text-cyan-700 font-black">Kerja Sama & Canva</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-black uppercase tracking-wider border border-cyan-200 w-fit">
              <span className="material-symbols-outlined text-xs">handshake</span>
              Ekosistem Integrasi Canva
            </span>
          </div>
        )}

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-extrabold uppercase tracking-widest shadow-xs">
            <span className="material-symbols-outlined text-sm">hub</span>
            Official Integration & Strategic Partnership
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Sinergi Kreatif: <span className="bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">ContentHub & Canva</span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Menghubungkan kecerdasan perencanaan kalender editorial ContentHub dengan kekuatan editor visual Canva, memberdayakan UMKM memproduksi konten berkualitas agensi dalam hitungan menit.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/templates"
              className="px-5 py-2.5 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">auto_awesome_motion</span>
              Buka Library Template Canva
            </Link>
            <Link
              to="/calendar"
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-primary rounded-xl text-xs font-bold shadow-xs hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">calendar_month</span>
              Ke Kalender Konten
            </Link>
          </div>
        </section>

        {/* 3 Core Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">draw</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">1. Fitur Desain Interaktif</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Akses langsung ke kanvas penyuntingan Canva tanpa hambatan log masuk ulang. Pilih layout Feed, Stories, Reels, atau Banner promo dan kustomisasi tipografi sesuai identitas unik toko UMKM Anda.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">sync_alt</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">2. Otomasi Kalender & Ekspor</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Setelah selesai mendesain di Canva, visual otomatis tersinkronisasi kembali ke slot jam posting kalender ContentHub. Tak perlu lagi ekspor, simpan manual ke galeri HP, dan mengunggah ulang.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">photo_library</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">3. Aset Visual Terkurasi</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lebih dari 200+ aset template siap pakai yang dikurasi khusus untuk persona pasar lokal Indonesia: kuliner gurih, kue donat kekinian, fashion hijab, salon, hingga jasa otomotif.
            </p>
          </div>
        </section>

        {/* Database Content Details */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : content ? (
          <section className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                  Dokumen Kemitraan Resmi
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">{content.title}</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Penyusun: {content.author} • Kategori: {content.category}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed space-y-3">
              {content.description}
            </div>
          </section>
        ) : null}
      </main>

      {!isInWorkspace && <Footer />}
    </div>
  );
}
