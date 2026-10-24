import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function PreviewTemplatePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const template = {
    id: id || '1',
    title: 'Flash Sale Minimalist Neon — Donat & Kuliner',
    category: 'Promosi & Diskon',
    format: '9:16 Story / Reels (1080 x 1920 px)',
    software: 'Canva Pro Sync Ready',
    tags: ['Kuliner', 'Promo', 'Diskon', 'Flash Sale', 'Baking', 'UMKM'],
    description:
      'Template bertema visual dinamis dengan tata letak tipografi mencolok untuk mempromosikan diskon terbatas atau menu hero baru Anda. Didesain siap edit di Canva dengan layer teks, warna aksen, dan frame foto yang fleksibel.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBbIgOIY1vEqSgoHHMLzpfb_ErzCGmQ2WW9DAvI5yFxoDcZQNnob255a9mBzum9u5mTcazxGoFAlSqDmfxQ7K-LxgzRVtGbDAOMJUVW5buFf-2GdnFNWvBqRqmaknbYQrJpR7VGk5pTrJA_jAtArxcGoQGtkabBKNojLodvshv8Lntke92kuqwA1f42TnTU73jaARKcvtMnKm-7SN9TmHm2fDQ_dT-j8nh9hl3txOlydwZnMu0XV-0dFKi4twGjPtPGLm3Z2sDrOg',
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      {/* Mengurangi padding atas ke pt-6 dan membuang items-center agar konten tidak terdorong ke tengah bawah */}
      <main className="ml-64 p-8 pt-6 pb-12 min-h-screen flex justify-center">
        <div className="w-full max-w-5xl bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-xl border border-outline-variant/15 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/15">
            <Link to="/templates" className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Library Template
            </Link>
            <span className="text-xs font-bold text-primary bg-primary-fixed px-3 py-1 rounded-full uppercase">{template.software}</span>
          </div>
          {/* Sisa konten card tetap sama */}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Preview Image */}
            <div className="md:col-span-6 flex justify-center bg-surface-container-low p-6 rounded-3xl border border-outline-variant/15">
              <div className="max-w-sm rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <img alt={template.title} className="w-full h-auto object-cover" src={template.image} />
              </div>
            </div>

            {/* Right Details & CTA */}
            <div className="md:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary block mb-1">{template.category}</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface leading-tight">{template.title}</h1>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  Ukuran Desain: <strong>{template.format}</strong>
                </p>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl text-xs text-on-surface-variant leading-relaxed">
                <p>{template.description}</p>
              </div>

              {/* Tag Chips */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">Tag Kata Kunci:</span>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-surface-container-high text-xs font-semibold text-on-surface">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Primary Actions */}
              <div className="space-y-3 pt-4 border-t border-outline-variant/15">
                <Link
                  to="/templates/canva-transition"
                  className="w-full py-4 bg-gradient-primary text-white font-bold rounded-2xl text-sm shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                  Buka & Edit Template di Canva
                </Link>

                <Link to="/calendar/pick-date" className="w-full py-3.5 bg-surface-container-high hover:bg-surface-dim font-bold rounded-2xl text-xs text-on-surface transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  Jadwalkan Template Ini ke Kalender
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
