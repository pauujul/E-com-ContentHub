import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'Bagaimana cara mulai menyusun jadwal konten di ContentHub?',
      a: 'Buka menu Calendar dari sidebar, klik pada salah satu tanggal yang diinginkan, pilih jam posting (tersedia rekomendasi jam emas / prime time), lalu pilih template atau masukkan deskripsi caption Anda.'
    },
    {
      q: 'Bagaimana integrasi Canva bekerja di ContentHub?',
      a: 'Saat Anda melihat preview template di menu Templates, klik tombol "Buka di Canva". Sistem akan mengarahkan Anda ke ruang kerja Canva untuk mengedit visual, dan hasilnya dapat langsung dihubungkan kembali ke jadwal kalender Anda.'
    },
    {
      q: 'Metode pembayaran apa saja yang didukung untuk Paket Hero Rp98k?',
      a: 'Kami mendukung transfer Virtual Account (BCA, Mandiri, BRI), E-Wallet (GoPay, OVO, DANA), QRIS, serta Kartu Debit/Kredit internasional.'
    },
    {
      q: 'Apakah saya bisa mengganti akun antara Admin dan Customer UMKM?',
      a: 'Ya, Anda dapat menggunakan fitur "Ganti Akun" dari avatar profil di sidebar atau mengunjungi halaman /switch-account untuk beralih antara akun Customer (Muhammad Hasran) dan Admin Console (Jerry Hernis / Fauzul Rozaq).'
    },
    {
      q: 'Apakah pesanan saya langsung aktif setelah pembayaran?',
      a: 'Ya, sistem transaksi terhubung secara otomatis ke database PostgreSQL. Begitu pembayaran terverifikasi atau diubah statusnya menjadi Paid, akun Anda langsung menikmati fasilitas paket tersebut.'
    }
  ];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 pt-24 pb-16 px-8 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Hero Search Section */}
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-surface-container-low to-secondary/5 p-12 text-center border border-outline-variant/15 shadow-sm">
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">
              ContentHub Help Center
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface mt-4 mb-3">
              Ada yang bisa kami bantu?
            </h1>
            <p className="text-on-surface-variant max-w-lg mx-auto text-sm md:text-base mb-8">
              Cari panduan penggunaan, troubleshooting kalender, sinkronisasi Canva, atau informasi penagihan langganan.
            </p>

            <div className="max-w-xl mx-auto relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik kata kunci pertanyaan Anda (misal: Canva, BCA, jadwal)..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-outline-variant/20 shadow-md focus:ring-2 focus:ring-primary focus:outline-none text-sm text-on-surface placeholder:text-outline/60"
              />
            </div>
          </section>

          {/* Category Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-2xl">rocket_launch</span>
              </div>
              <h3 className="font-bold text-base text-on-surface mb-1">Panduan Awal</h3>
              <p className="text-xs text-on-surface-variant">Setup profil bisnis dan mengenal fitur utama ContentHub.</p>
            </div>

            <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined text-2xl">calendar_month</span>
              </div>
              <h3 className="font-bold text-base text-on-surface mb-1">Kalender & Jadwal</h3>
              <p className="text-xs text-on-surface-variant">Cara menjadwalkan konten, drag & drop, dan atur jam emas.</p>
            </div>

            <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary mb-4">
                <span className="material-symbols-outlined text-2xl">auto_awesome_motion</span>
              </div>
              <h3 className="font-bold text-base text-on-surface mb-1">Template & Canva</h3>
              <p className="text-xs text-on-surface-variant">Eksplorasi library template dan panduan ekspor ke Canva.</p>
            </div>

            <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-700 mb-4">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <h3 className="font-bold text-base text-on-surface mb-1">Billing & Pembayaran</h3>
              <p className="text-xs text-on-surface-variant">Info invoice, Virtual Account, konfirmasi, dan upgrade paket.</p>
            </div>
          </section>

          {/* Accordion FAQ */}
          <section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Pertanyaan yang Sering Diajukan (FAQ)</h2>
              <p className="text-sm text-on-surface-variant mt-1">Jawaban cepat untuk pertanyaan seputar platform ContentHub.</p>
            </div>

            <div className="divide-y divide-outline-variant/15">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="py-4">
                    <button
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="w-full flex justify-between items-center text-left text-base font-bold text-on-surface hover:text-primary transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className="material-symbols-outlined text-outline ml-4 flex-shrink-0">
                        {isOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Contact Support Box */}
          <section className="bg-primary text-white p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-primary/20">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-bold">Masih butuh bantuan langsung?</h3>
              <p className="text-xs text-white/80">Tim Customer Support Amigos siap membantu bisnis Anda 24/7.</p>
            </div>
            <a
              href="mailto:support@contenthub.id"
              className="px-6 py-3 bg-white text-primary font-bold rounded-xl text-sm shadow hover:bg-slate-100 transition-all flex items-center gap-2 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-lg">mail</span>
              Hubungi Support
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}
