import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

export default function PartnershipPage() {
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
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 pb-24 px-6 max-w-7xl mx-auto flex-1 w-full space-y-16">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 text-cyan-800 text-xs font-extrabold uppercase tracking-widest shadow-xs">
            <span className="material-symbols-outlined text-sm">hub</span>
            Official Integration & Strategic Partnership
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-on-surface tracking-tight leading-tight">
            Sinergi Kreatif: <span className="bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">ContentHub & Canva</span>
          </h1>

          <p className="text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Menghubungkan kecerdasan perencanaan kalender editorial ContentHub dengan kekuatan editor visual Canva, memberdayakan UMKM memproduksi konten berkualitas agensi dalam hitungan menit.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/pricing"
              className="px-6 py-3.5 bg-gradient-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">rocket_launch</span>
              Mulai Langganan Paket Canva Ready
            </Link>
            <Link
              to="/templates"
              className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 hover:text-primary rounded-xl text-xs font-bold shadow-xs hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">auto_awesome_motion</span>
              Jelajahi Library Template Canva
            </Link>
          </div>
        </section>

        {/* 3 Core Pillars: Fitur Desain, Otomasi & Aset Visual */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm space-y-4 hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-3xl">draw</span>
            </div>
            <h3 className="text-xl font-extrabold text-on-surface">1. Fitur Desain Interaktif</h3>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              Akses langsung ke kanvas penyuntingan Canva tanpa hambatan log masuk ulang. Pilih layout Feed, Stories, Reels, atau Banner promo dan kustomisasi tipografi sesuai identitas unik toko UMKM Anda.
            </p>
          </div>

          <div className="p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm space-y-4 hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-3xl">sync_alt</span>
            </div>
            <h3 className="text-xl font-extrabold text-on-surface">2. Otomasi Kalender & Ekspor</h3>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              Setelah selesai mendesain di Canva, visual otomatis tersinkronisasi kembali ke slot jam posting kalender ContentHub. Tak perlu lagi ekspor, simpan manual ke galeri HP, dan mengunggah ulang.
            </p>
          </div>

          <div className="p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm space-y-4 hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-3xl">photo_library</span>
            </div>
            <h3 className="text-xl font-extrabold text-on-surface">3. Aset Visual Terkurasi</h3>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
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
          <section className="bg-white p-8 md:p-12 rounded-3xl border border-outline-variant/15 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                  Dokumen Kemitraan Resmi
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">{content.title}</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Penyusun: {content.author} • Kategori: {content.category}
              </span>
            </div>

            <div className="text-sm md:text-base text-slate-700 whitespace-pre-line leading-relaxed space-y-4">
              {content.description}
            </div>
          </section>
        ) : null}

        {/* Call to Action for Partnership */}
        <section className="p-10 md:p-14 rounded-3xl bg-gradient-to-r from-primary to-primary-container text-white text-center space-y-6 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-extrabold">Tertarik Berkolaborasi dengan ContentHub?</h2>
          <p className="text-sm md:text-base text-white/90 max-w-xl mx-auto leading-relaxed">
            Kami membuka pintu kemitraan seluas-luasnya untuk asosiasi UMKM daerah, kreator template Canva, payment gateway, dan komunitas bisnis digital.
          </p>
          <a
            href="mailto:partnership@amigos.id?subject=Pengajuan%20Kerja%20Sama%20ContentHub"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-extrabold text-sm rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg">mail</span>
            Hubungi Tim Kerja Sama (partnership@amigos.id)
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
