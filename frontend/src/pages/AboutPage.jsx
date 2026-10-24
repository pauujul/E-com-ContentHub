import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />

      <main className="pt-16">
        {/* Hero / Vision & Mission Section */}
        <section className="relative overflow-hidden pt-24 pb-28 px-8">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-6 bg-primary-fixed px-4 py-2 rounded-full">
                Our Vision & Mission
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-on-background mb-8 leading-tight">
                Menjadi Platform Konten Terpercaya untuk Setiap UMKM Indonesia
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

        {/* Social Proof Stats */}
        <section className="pb-24 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm border border-outline-variant/15">
              <span className="text-4xl font-extrabold text-primary mb-2">5,000+</span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">UMKM Terberdayakan</span>
            </div>
            <div className="bg-primary-container p-8 rounded-2xl flex flex-col justify-center items-center text-center md:col-span-2 text-on-primary-container shadow-md">
              <span className="text-4xl font-extrabold mb-2">1.2 Juta+</span>
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">Konten Terjadwal & Terbit</span>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm border border-outline-variant/15">
              <span className="text-4xl font-extrabold text-secondary mb-2">98%</span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pertumbuhan Konsistensi</span>
            </div>
          </div>
        </section>

        {/* Problem Solving Section */}
        <section className="bg-surface-container-low py-24 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  className="w-full h-full object-cover"
                  alt="Modern collaborative workspace with young professionals"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz_9eERlvnavmsn60qO3j3DrNDzRY9uaFKgp0kMc4JD5wkG_YZ2X_YSkTvY-WZLgMl8tYmLs0orbfA1frJySWwsr5hc_IeQ4gEjWYt7ABhZeE3Z_FmGhNSlKOZR3GCcyurDJCM8y7M3A9C0sRjJqreSv5yy0NYRpH2l1bB_VyCpthdiW7jcfXcsb5c6cOT9heZLI404f3rmiPvHXMIZ_PzaO47QQZB75o9lD9H4JbdRlUZ6kbfGUyZpPWDb3vvp-Ehxk0OA7Wc9A"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary rounded-2xl -z-10 opacity-20"></div>
            </div>

            <div className="space-y-6">
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary-fixed px-3 py-1 rounded-full">
                The Problem We Solve
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-background">
                Mengatasi "Consistency Gap" pada Bisnis Kecil
              </h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-base">
                <p>
                  Banyak pelaku UMKM Indonesia kesulitan bukan karena kualitas produk mereka kurang baik, melainkan karena ekosistem digital menuntut konsistensi konten setiap hari yang sulit dipertahankan sendirian di tengah kesibukan operasional bisnis.
                </p>
                <p>
                  ContentHub lahir dari titik permasalahan nyata ini. Kami membangun ruang kerja editorial yang menyederhanakan perencanaan dari hulu ke hilir—memungkinkan pelaku usaha mengatur jadwal 1 bulan penuh hanya dalam waktu 1 jam.
                </p>
              </div>

              <div className="flex gap-4 items-start p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/15 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-3xl">lightbulb</span>
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
                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Our Team</span>
                <h2 className="text-4xl font-bold tracking-tight text-on-surface">The Creative Minds behind ContentHub</h2>
                <p className="text-on-surface-variant mt-2 text-sm">
                  Dikembangkan oleh <strong>Amigos Team</strong> (Semester V / Kelas A 24) sebagai proyek SaaS terintegrasi penuh.
                </p>
              </div>
              <div className="hidden md:block h-[1px] flex-1 mx-12 bg-outline-variant/20 mb-4"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* MF */}
              <div className="group bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-lg transition-all">
                <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-surface-container-high transition-transform group-hover:scale-[1.02]">
                  <img
                    className="w-full h-full object-cover"
                    alt="MF - Chief Executive"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuApuRdYNFf16KtpxvvaaWy6buWkvuJTiwF5wTgZ5Q3EN03d80AE8YJnqTFxVq1YOkXkOQ0tqwwKM74Bff2HLKE_CWiRAGLWnnrEEz_wKPCgcyhc0gplly495v4SZ7juGc9efWxEnR30T1-6cEpA__u2hpVyWPJKBJv3gjs6tfVm7cVQRxqACGvTT-t1kbxw5u5vL3tre2MuAxUkdENWPioZN-6GRtO8KxE_D21qROdu_g9qOG04-IAdUb0S1G7xBitGBQ5Sritnuw"
                  />
                </div>
                <h3 className="font-bold text-base text-on-surface">M. Fajar</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Project Lead</p>
              </div>

              {/* ZA */}
              <div className="group bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-lg transition-all">
                <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-surface-container-high transition-transform group-hover:scale-[1.02]">
                  <img
                    className="w-full h-full object-cover"
                    alt="ZA - Creative Director"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEJ_RRYKebGx-ClyKZBB9LV5ZhiZLZ_-b9NYecWH3_NjzhGndoEKLoG6kTAWalSur4xjLqi3vWV6hJiI8LEJmn_6-h0Wq383ruD1ZcWDWk26aLzTFF9gAv5ITEvLQpB30EqAnZ4mJN7oFjM4sFO0MX8TMTThpcB9uLmo1U7y3sJxNDAANLHdFU5RriPUDZPoLbENJaIWgce3QR4ykFC9th54evU6EXhJWLkuljx8AjXmjr5-ypPBgTt8KtdtPJvylEF63Z17HZLw"
                  />
                </div>
                <h3 className="font-bold text-base text-on-surface">Zahra A.</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">UI/UX Designer</p>
              </div>

              {/* JH (Jerry Hernis - Database Seed Admin) */}
              <div className="group bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-lg transition-all">
                <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-surface-container-high transition-transform group-hover:scale-[1.02]">
                  <img
                    className="w-full h-full object-cover"
                    alt="Jerry Hernis - Tech Architect"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE7g9M_QC9KwK8hKIBbzAmRSaD_1zWBrmLhnrkfLa5X-Le9cl_iDQzO1ZKlm57OESwbnoWBHvWk4u7M_omsXtTKoRVOrALMVrD7eXSLtypr5QVqZqVP6JaHdm0w11HuVnC-N_lA14dAmOgeWUU6HnzdHHJgcF94bj5DV0hYtfQ_WoCvCsPzUIel813Eah30oHJcAhAGgxWeASPZQn0phnCejR0NFFAVvnQK1Pq0Mq0Uybgx199fNF-dD0-8AWQ938JyqPHF1PK1g"
                  />
                </div>
                <h3 className="font-bold text-base text-on-surface">Jerry Hernis</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Tech Architect & Admin</p>
              </div>

              {/* FS (Fauzul Rozaq - Database Seed Admin) */}
              <div className="group bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-lg transition-all">
                <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-surface-container-high transition-transform group-hover:scale-[1.02]">
                  <img
                    className="w-full h-full object-cover"
                    alt="Fauzul Rozaq - Backend Lead"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVhyrWwgXZ2sSnJRD7BwuaphUkfvBI15NJKhDXwo4OXCPs7LP0ho-IDA-I-u5R_uEeJF_1x0p4R5j6Ju65MJNQP4r5FqvM78I-qe34vb48yV20PnZYc86QbNiiX7FJlZh3ShprTwvLocolOGKObPJWIQOSF6MhQrU3F9NvzKccyLyDlOH2TMLdD3jelo1WseqWMgAspgY8nNE0jK7xa0A_bdbnnsL_dhzI-Ze7EjmZYKhcMGlYrtsVLWGAaVRhlJnkIzzNeIT81A"
                  />
                </div>
                <h3 className="font-bold text-base text-on-surface">Fauzul Rozaq</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Backend Engineer & Admin</p>
              </div>

              {/* MR (Muhammad Hasran - Database Seed Customer) */}
              <div className="group bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-lg transition-all">
                <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-surface-container-high transition-transform group-hover:scale-[1.02]">
                  <img
                    className="w-full h-full object-cover"
                    alt="Muhammad Hasran - SME Persona"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMYUu4pu74D8oi8XA3zlLEMrB96ZOA0kqdLqXRngZvrHnBmSK9p6SYNwg4OcE9gR7b3vWtd6EvClyNz5q1XfTNqO7HasxFSSKXmp6CTvpzRY9yQJevqRoJotKVvkKlZrpX_4yvteIH_4N5Qh19WuyumJQwwaeGyClq6pnOWyWSdRDnNVmFZLuT4bXeA6auN0toEFgxPOS5alnYcOy9KNsGQM3jACJgI5SWcMSEebRhiUYqsjDB7o0gB88Eu1s0lsXz8rnteKmdNA"
                  />
                </div>
                <h3 className="font-bold text-base text-on-surface">Muhammad Hasran</h3>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider">UMKM Persona Owner</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-primary to-primary-container rounded-3xl p-12 md:p-16 text-center text-on-primary shadow-xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Siap Mengembangkan Konten Bisnis Anda?</h2>
              <p className="text-base md:text-lg mb-10 opacity-90 max-w-2xl mx-auto">
                Bergabunglah bersama ribuan UMKM Indonesia yang telah mentransformasi produktivitas media sosial mereka.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/pricing"
                  className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all"
                >
                  Pilih Paket Berlangganan
                </Link>
                <Link
                  to="/register"
                  className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
                >
                  Daftar Akun Baru
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
