import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AgendaDetailPage() {
  const [filter, setFilter] = useState('Today');
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  const agendaItems = [
    {
      id: 1,
      title: 'Summer Collection Launch: Premium Essentials & Donat Madu',
      category: 'Instagram Reel',
      channel: 'Instagram',
      date: 'Senin, 24 Okt 2026',
      time: '19:00 WIB',
      caption: 'Koleksi varian rasa terbaru kami sudah resmi hadir! Dibuat dengan 100% madu murni dan adonan lembut yang meleleh di mulut. Dapatkan diskon 20% khusus pembelian hari ini via link di bio! #DonatMadu #KulinerUMKM #KoleksiBaru',
      status: 'Siap Publish',
      statusColor: 'bg-green-100 text-green-800',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANRHb_9iflOTj_ZWoImgNhEi4mcqVVt1UCiPwPLtgRMRzwCJo8IMItFx9LB1ypFoUubjRV9mSVUwF6343FhjS-cQUKhHRj_YWY8ZzuRrysVtIgUMep0IPh14VPTnNzt3GM__Ak36syv8XbAWzIT7hsWA8aWWggqQhv8VcYfghxL06IDi-_W5GIDAiZCmuKxU_KlkuwAdLmjFp3E1mZNuJ4FwCfBLpewG0yakz9PvYAA9bfweMAgw3waKSVMl44S3hKfGaXXNux4Q'
    },
    {
      id: 2,
      title: 'Behind The Scenes: Proses Pembuatan Donat Segar Tiap Subuh',
      category: 'TikTok Video',
      channel: 'TikTok',
      date: 'Senin, 24 Okt 2026',
      time: '12:30 WIB',
      caption: 'Pernah penasaran gimana serunya tim kami bangun jam 4 subuh demi memastikan donat yang kalian santap selalu hangat dan fresh? Tonton video ini sampai habis! #UMKMBangkit #BehindTheScenes #BakingLife',
      status: 'Terjadwal',
      statusColor: 'bg-amber-100 text-amber-800',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbIgOIY1vEqSgoHHMLzpfb_ErzCGmQ2WW9DAvI5yFxoDcZQNnob255a9mBzum9u5mTcazxGoFAlSqDmfxQ7K-LxgzRVtGbDAOMJUVW5buFf-2GdnFNWvBqRqmaknbYQrJpR7VGk5pTrJA_jAtArxcGoQGtkabBKNojLodvshv8Lntke92kuqwA1f42TnTU73jaARKcvtMnKm-7SN9TmHm2fDQ_dT-j8nh9hl3txOlydwZnMu0XV-0dFKi4twGjPtPGLm3Z2sDrOg'
    },
    {
      id: 3,
      title: 'Edukasi: 3 Cara Menyimpan Donat Agar Tetap Lembut Hingga Esok Hari',
      category: 'Carousel Edukasi',
      channel: 'Instagram',
      date: 'Selasa, 25 Okt 2026',
      time: '09:00 WIB',
      caption: 'Jangan simpan donat di tempat terbuka! Simak 3 tips mudah ini agar tekstur donat favoritmu tetap lembut dan tidak mengeras. Geser ke kanan untuk tips lengkapnya ya!',
      status: 'Draf Canva',
      statusColor: 'bg-blue-100 text-blue-800',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzaSCcgIdELtlVju__2yV1C5xRAAqT1_Ih0Af_8N2nr4vqM_nmgyFzqzATn-jSz2tms20F1mwCqKUzou_FEX7VO_DPlzlw6m6wrFTquLL-Xb3H4g-ix8AMCo66mxeKSicc8JbZe4jaAbugAT2Ew7yRiZzYV2fAb3aKaFPLKkvZ2VgnDSVyr8ad30VrVu01cgQ5u-h4ANcXsZVEQTq1Ymui1vrwmLxPmjFqQoOxP2zye7-Vs_CbBuL26HYG2MtT0zif5hMUk0401Q'
    }
  ];

  const handleCopyCaption = (item) => {
    navigator.clipboard.writeText(item.caption);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 pt-24 pb-16 px-8 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link to="/calendar" className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Kalender
                </Link>
              </div>
              <h1 className="text-3xl font-extrabold text-on-surface">Detail Agenda Terjadwal</h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Kelola caption, aset kreatif visual Canva, dan waktu tayang konten Anda.
              </p>
            </div>

            <div className="flex gap-2 p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/15">
              {['Today', 'Upcoming', 'Past'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    filter === tab
                      ? 'bg-white shadow-sm text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {tab === 'Today' ? 'Hari Ini' : tab === 'Upcoming' ? 'Akan Datang' : 'Selesai'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Main Cards List */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {agendaItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant/15 hover:shadow-md transition-all flex flex-col md:flex-row"
                >
                  {/* Thumbnail Image */}
                  <div className="md:w-56 h-56 md:h-auto overflow-hidden relative flex-shrink-0 bg-slate-100">
                    <img
                      alt={item.title}
                      className="w-full h-full object-cover"
                      src={item.thumbnail}
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-primary shadow-xs">
                      {item.channel}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary-fixed px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-on-surface leading-snug mb-2">
                        {item.title}
                      </h3>

                      <div className="p-3 bg-surface-container-low rounded-xl mb-4 text-xs text-on-surface-variant leading-relaxed">
                        <span className="font-bold text-outline block mb-1">Caption Terjadwal:</span>
                        <p className="line-clamp-2 italic">"{item.caption}"</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-outline-variant/10 text-xs">
                        <div className="flex items-center gap-4 text-on-surface-variant font-medium">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-outline">calendar_today</span>
                            {item.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-outline">alarm</span>
                            {item.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyCaption(item)}
                            className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-dim rounded-lg text-xs font-bold text-on-surface flex items-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {copiedId === item.id ? 'check' : 'content_copy'}
                            </span>
                            {copiedId === item.id ? 'Tersalin!' : 'Salin'}
                          </button>

                          <Link
                            to="/calendar/edit-schedule"
                            className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-dim rounded-lg text-xs font-bold text-primary flex items-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit
                          </Link>

                          <Link
                            to="/templates/canva-transition"
                            className="px-3 py-1.5 bg-gradient-primary text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                            Buka Canva
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Calendar Insights Widget */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-on-surface">Target Konsistensi Mingguan</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Progres Posting (5 dari 7 target)</span>
                    <span className="text-primary">71%</span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="w-[71%] h-full bg-gradient-primary rounded-full"></div>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Bagus sekali! Anda hanya butuh 2 postingan lagi untuk mencapai target mingguan 100%.
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary-container to-primary text-white p-6 rounded-3xl shadow-lg shadow-primary/20 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">electric_bolt</span>
                </div>
                <h4 className="font-bold text-lg">Jam Emas Hari Ini</h4>
                <p className="text-xs text-white/90 leading-relaxed">
                  Berdasarkan analitik engagement UMKM lokal, jam terbaik mempublikasikan konten hari ini adalah pukul <strong>12:30 WIB</strong> dan <strong>19:00 WIB</strong>.
                </p>
                <Link
                  to="/calendar/set-time"
                  className="bg-white text-primary px-4 py-2 rounded-xl text-xs font-bold inline-block hover:bg-slate-100 transition-colors"
                >
                  Atur Pengingat Jam Emas &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
