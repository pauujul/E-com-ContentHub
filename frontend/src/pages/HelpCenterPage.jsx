import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'Bagaimana cara mulai menyusun jadwal konten di ContentHub?',
      a: 'Buka menu Calendar dari sidebar, klik pada tanggal yang diinginkan, tentukan jam posting (tersedia rekomendasi jam emas / prime time engagement), lalu masukkan judul agenda dan pilih template Canva favorit Anda.',
    },
    {
      q: 'Bagaimana integrasi Canva bekerja di ContentHub?',
      a: 'Saat Anda melihat preview template di menu Templates, klik tombol "Buka di Canva". Sistem akan mengarahkan Anda langsung ke editor Canva untuk menyesuaikan desain. Desain tersinkronisasi otomatis dengan slot waktu posting di ContentHub.',
    },
    {
      q: 'Metode pembayaran apa saja yang didukung untuk Paket Hero Rp98k?',
      a: 'Kami mendukung transfer Virtual Account otomatis (BCA, Mandiri, BRI), E-Wallet (GoPay, OVO, DANA), QRIS Nasional, serta verifikasi otomatis 24/7 yang terhubung langsung ke database PostgreSQL.',
    },
    {
      q: 'Bagaimana cara mengubah profil dan mengamankan kata sandi akun?',
      a: 'Kunjungi menu Profil Saya di sudut kiri bawah sidebar. Anda dapat memperbarui nama pemilik, nomor telepon, nama usaha UMKM, kategori industri, foto profil, serta mengganti alamat email dan kata sandi dengan aman.',
    },
    {
      q: 'Apakah pesanan langganan saya langsung aktif setelah pembayaran?',
      a: 'Ya, sistem transaksi terhubung secara otomatis ke database PostgreSQL/Neon. Begitu pembayaran berhasil, status order langsung berubah menjadi Paid dan akun Anda otomatis mendapatkan fasilitas paket tersebut.',
    },
    {
      q: 'Bagaimana cara memindahkan status konten di Kanban Planner?',
      a: 'Buka menu Drag & Drop Planner dari sidebar atau kalender. Anda dapat menggeser kartu dari Ide Konten (Backlog), Desain Canva, Siap Publish, hingga Terjadwal di Kalender. Posisi kartu tersimpan permanen secara real-time ke database.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800">
      <Sidebar />

      <main className="ml-0 md:ml-64 p-6 sm:p-8 lg:p-10 min-h-screen transition-all">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Top Breadcrumb & Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                <Link to="/dashboard" className="hover:text-primary transition-colors">Workspace</Link>
                <span>/</span>
                <span className="text-primary">Pusat Bantuan & Panduan</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Pusat Bantuan ContentHub
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Panduan operasional lengkap, integrasi Canva, regulasi legal, serta FAQ untuk mitra UMKM.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all"
              >
                <span className="material-symbols-outlined text-base">chat</span>
                <span>Live Chat Support</span>
              </a>
            </div>
          </div>

          {/* Hero Search Box */}
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-primary to-blue-700 p-8 sm:p-12 text-center text-white shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="inline-block text-[11px] font-extrabold tracking-widest uppercase bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-white border border-white/20">
                Help Center & Knowledge Base
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Ada yang bisa kami bantu hari ini?
              </h2>
              <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed">
                Ketik kata kunci kebutuhan Anda untuk menemukan panduan instan, aturan layanan, atau solusi teknis.
              </p>

              <div className="pt-2 relative max-w-xl mx-auto">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik kata kunci (contoh: Canva, Jadwal, Pembayaran, Profil)..."
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm font-medium shadow-md focus:outline-none focus:ring-4 focus:ring-white/30 border-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* 4 KOTAK CTA DOKUMEN & INTEGRASI */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Akses Cepat Informasi Utama</h2>
                <p className="text-xs text-slate-500 mt-0.5">Pilih dokumen resmi atau modul integrasi yang ingin Anda jelajahi:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {/* Card 1: Syarat & Ketentuan */}
              <Link
                to="/terms"
                className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                    <span className="material-symbols-outlined text-2xl">gavel</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    Legalitas SaaS
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-2.5 mb-1.5 group-hover:text-primary transition-colors">
                    Syarat & Ketentuan
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pedoman resmi hak cipta materi, batas kewajiban, ketentuan paket langganan, dan aturan hukum operasional.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary">
                  <span>Baca Dokumen</span>
                  <span className="material-symbols-outlined text-base group-hover:translate-x-1.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>

              {/* Card 2: Kebijakan & Privasi */}
              <Link
                to="/privacy"
                className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Keamanan & Data
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-2.5 mb-1.5 group-hover:text-emerald-600 transition-colors">
                    Kebijakan & Privasi
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Perlindungan informasi pribadi UMKM, standar enkripsi sandi SHA-256, dan jaminan kerahasiaan draf jadwal.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                  <span>Lihat Kebijakan</span>
                  <span className="material-symbols-outlined text-base group-hover:translate-x-1.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>

              {/* Card 3: Blog & Edukasi */}
              <Link
                to="/blog"
                className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:border-purple-400 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xs">
                    <span className="material-symbols-outlined text-2xl">menu_book</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                    Wawasan & Strategi
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-2.5 mb-1.5 group-hover:text-purple-600 transition-colors">
                    Blog & Edukasi UMKM
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Artikel panduan waktu posting optimal (prime time), taktik copywriting persuasif, dan tips menaikkan omzet.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                  <span>Jelajahi Artikel</span>
                  <span className="material-symbols-outlined text-base group-hover:translate-x-1.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>

              {/* Card 4: Kerja Sama (Integrasi Canva) */}
              <Link
                to="/partnership"
                className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:border-cyan-400 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-xs">
                    <span className="material-symbols-outlined text-2xl">handshake</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">
                    Integrasi Canva
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-2.5 mb-1.5 group-hover:text-cyan-700 transition-colors">
                    Kerja Sama & Canva
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Kolaborasi resmi ContentHub dengan ekosistem Canva: otomasi desain grafis, sinkronisasi template, dan program mitra.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700">
                  <span>Pelajari Kolaborasi</span>
                  <span className="material-symbols-outlined text-base group-hover:translate-x-1.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {/* Accordion FAQ Section */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Pertanyaan yang Sering Diajukan (FAQ)</h2>
                <p className="text-xs text-slate-500 mt-0.5">Solusi praktis untuk pertanyaan seputar fitur kalender, pembayaran, dan akun.</p>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full self-start sm:self-auto">
                {filteredFaqs.length} Topik Tersedia
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredFaqs.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-slate-400">
                  Tidak ada FAQ yang cocok dengan kata kunci "{searchQuery}".
                </div>
              ) : (
                filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="py-4">
                      <button
                        onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                        className="w-full flex justify-between items-center text-left py-1 group focus:outline-none"
                      >
                        <span className={`text-xs sm:text-sm font-extrabold transition-colors ${isOpen ? 'text-primary' : 'text-slate-800 group-hover:text-primary'}`}>
                          {faq.q}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                          <span className="material-symbols-outlined text-base">expand_more</span>
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-200">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Need Direct Help Banner */}
          <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-lg font-extrabold">Belum menemukan jawaban yang Anda cari?</h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Tim Support ContentHub siap membantu operasional dan kendala teknis akun UMKM Anda setiap hari (08.00 - 22.00 WIB).
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:support@contenthub.id"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">mail</span>
                <span>Kirim Email</span>
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/25 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">support_agent</span>
                <span>Hubungi Customer Care</span>
              </a>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
