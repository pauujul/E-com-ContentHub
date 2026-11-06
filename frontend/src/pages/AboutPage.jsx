
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

export default function AboutPage() {
  const [aboutData, setAboutData] = useState(null);

  // Mengambil data About dari database
  useEffect(() => {
    api.getContent('about')
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setAboutData(res.data[0]);
        }
      })
      .catch((err) => {
        console.error('Gagal memuat konten About dari database:', err);
      });
  }, []);

  // Data anggota tim dan foto dari folder frontend/public
  const teamMembers = [
    {
      name: 'Jerry Hernis',
      role: 'Lead Architect & Product Owner',
      desc: 'Sistem Arsitektur Backend & Database Neon',
      initials: 'JH',
      bgStyle: 'bg-primary-fixed text-primary',
      photo_url: '/3.jpg',
    },
    {
      name: 'Fauzul Rozaq',
      role: 'Fullstack Developer & Canva Strategist',
      desc: 'Integrasi UI/UX & Sinkronisasi Kalender',
      initials: 'FR',
      bgStyle: 'bg-secondary-fixed text-secondary',
      photo_url: '/4.jpg',
    },
    {
      name: 'Firman syah',
      role: 'Lead Frontend & Security Engineer',
      desc: 'Pengembangan Antarmuka & Otentikasi SMTP',
      initials: 'FS',
      bgStyle: 'bg-sky-100 text-sky-800',
      photo_url: '/5.jpg',
    },
    {
      name: 'Zico Aryton',
      role: 'Creative Designer & Content Strategist',
      desc: 'Manajemen Aset Kreatif & Analisis Pasar UMKM',
      initials: 'ZA',
      bgStyle: 'bg-emerald-100 text-emerald-800',
      photo_url: '/6.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />

      <main className="pt-16">

        {/* Hero / Vision & Mission Section */}
        <section className="relative overflow-hidden pt-24 pb-24 px-8">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-6 bg-primary-fixed px-4 py-2 rounded-full">
                Our Vision & Mission
              </span>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-on-background mb-8 leading-tight">
                {aboutData?.title || 'Menjadi Platform Konten Terpercaya untuk Setiap UMKM Indonesia'}
              </h1>

              <p className="text-lg md:text-xl text-on-surface-variant font-medium max-w-3xl leading-relaxed">
                Memberdayakan pelaku UMKM lokal untuk menyuarakan kisah brand mereka melalui konten media sosial berkualitas profesional, terencana, dan konsisten.
              </p>

            </div>
          </div>

          <div className="absolute top-0 right-0 -z-10 w-1/2 h-full opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-bl-[100px]"></div>
          </div>
        </section>

        {/* Dynamic Database Description & Problem Solving Section */}
        {aboutData && (
          <section className="pb-16 px-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-outline-variant/15 shadow-sm space-y-6">

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">
                  verified
                </span>

                <div>
                  <h3 className="font-extrabold text-xl text-slate-800">
                    Pernyataan Visi & Misi Terverifikasi
                  </h3>

                  <span className="text-xs text-slate-400">
                    Dikelola langsung melalui Admin Dashboard ContentHub
                  </span>
                </div>
              </div>

              <div className="text-sm md:text-base leading-relaxed text-slate-700 whitespace-pre-line border-t border-slate-100 pt-6">
                {aboutData.description}
              </div>

            </div>
          </section>
        )}

        {/* Social Proof Stats */}
        <section className="pb-24 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">

            <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm border border-outline-variant/15">
              <span className="text-4xl font-extrabold text-primary mb-2">
                5,000+
              </span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                UMKM Terberdayakan
              </span>
            </div>

            <div className="bg-primary-container p-8 rounded-2xl flex flex-col justify-center items-center text-center md:col-span-2 text-white shadow-md">
              <span className="text-4xl font-extrabold mb-2">
                1.2 Juta+
              </span>
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                Konten Terjadwal & Terbit
              </span>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm border border-outline-variant/15">
              <span className="text-4xl font-extrabold text-secondary mb-2">
                98%
              </span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Pertumbuhan Konsistensi
              </span>
            </div>

          </div>
        </section>

        {/* Problem Solving Section: The Consistency Gap */}
        <section className="bg-surface-container-low py-24 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  className="w-full h-full object-cover"
                  alt="Modern collaborative workspace"
                  src={
                    aboutData?.image_url ||
                    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&fit=crop"
                  }
                />
              </div>

              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary rounded-2xl -z-10 opacity-20"></div>
            </div>

            <div className="space-y-6">
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary-fixed px-3 py-1 rounded-full">
                The Problem We Solve
              </span>

              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-background">
                Mengatasi "Consistency Gap" pada Bisnis UMKM
              </h2>

              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base">
                <p>
                  Banyak pelaku UMKM Indonesia kesulitan bukan karena kualitas produk mereka kurang baik, melainkan karena ekosistem digital menuntut konsistensi konten setiap hari yang sulit dipertahankan sendirian di tengah kesibukan operasional bisnis.
                </p>

                <p>
                  ContentHub lahir dari titik permasalahan nyata ini. Kami membangun ruang kerja editorial yang menyederhanakan perencanaan dari hulu ke hilir sehingga memungkinkan pelaku usaha mengatur jadwal 1 bulan penuh hanya dalam waktu 1 jam.
                </p>
              </div>

              <div className="flex gap-4 items-start p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/15 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-3xl">
                  lightbulb
                </span>

                <p className="text-sm font-medium italic text-on-surface">
                  "Misi kami adalah mengubah kebingungan dan beban pembuatan konten menjadi proses kreatif yang terstruktur dan berdampak nyata bagi pertumbuhan omzet bisnis."
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Team Section (Amigos Team) */}
        <section className="py-28 px-8">
          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
              <div className="max-w-xl">

                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
                  Our Team
                </span>

                <h2 className="text-4xl font-bold tracking-tight text-on-surface">
                  The Creative Minds behind ContentHub
                </h2>

                <p className="text-on-surface-variant mt-2 text-sm">
                  Dikembangkan oleh <strong>Amigos Team</strong> sebagai proyek SaaS E-Commerce terintegrasi penuh.
                </p>

              </div>

              <div className="hidden md:block h-[1px] flex-1 mx-12 bg-outline-variant/20 mb-4"></div>
            </div>

            {/* Team Members */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm space-y-4 text-center"
                >

                  {/* Foto Anggota Tim */}
                  <div className="relative w-24 h-24 mx-auto">

                    <img
                      src={member.photo_url}
                      alt={member.name}
                      loading="lazy"
                      className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-white"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';

                        const fallback = e.currentTarget.nextElementSibling;

                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />

                    {/* Fallback Inisial */}
                    <div
                      style={{ display: 'none' }}
                      className={`w-24 h-24 rounded-full items-center justify-center font-extrabold text-2xl shadow-sm ${member.bgStyle}`}
                    >
                      {member.initials}
                    </div>

                  </div>

                  {/* Informasi Anggota Tim */}
                  <div>
                    <h4 className="font-extrabold text-base text-slate-800">
                      {member.name}
                    </h4>

                    <p className={`text-xs font-bold ${member.bgStyle.split(' ')[1]}`}>
                      {member.role}
                    </p>

                    <p className="text-[11px] text-slate-400 mt-1">
                      {member.desc}
                    </p>
                  </div>

                </div>
              ))}

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
