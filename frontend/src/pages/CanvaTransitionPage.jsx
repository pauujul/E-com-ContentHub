import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CanvaTransitionPage() {
  const [progress, setProgress] = useState(25);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 15;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-radial-gradient">
      {/* Background Abstract Glow Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-xl w-full px-8 flex flex-col items-center z-10 text-center animate-in fade-in duration-500">
        {/* Logos Integration: ContentHub -> Canva */}
        <div className="flex items-center gap-8 md:gap-12 mb-12">
          {/* ContentHub Brand */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-surface-container-lowest rounded-2xl shadow-md border border-outline-variant/15 flex items-center justify-center p-4">
              <span className="material-symbols-outlined text-primary text-4xl">layers</span>
            </div>
            <span className="mt-3 text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">
              ContentHub
            </span>
          </div>

          {/* Animated Transition Indicator */}
          <div className="flex flex-col items-center">
            <div className="text-primary animate-pulse">
              <span className="material-symbols-outlined text-3xl">sync_alt</span>
            </div>
          </div>

          {/* Canva Brand */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-md flex items-center justify-center text-white font-extrabold text-xl p-4">
              Canva
            </div>
            <span className="mt-3 text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">
              Canva Editor
            </span>
          </div>
        </div>

        {/* Content & Status */}
        <div className="space-y-6 w-full">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight leading-tight">
              {progress < 100 ? 'Sedang menghubungkan ke Canva...' : 'Sinkronisasi Berhasil!'}
            </h1>
            <p className="text-on-surface-variant text-sm font-medium">
              {progress < 100
                ? 'Akun dan template visual Anda sedang disiapkan untuk pengeditan grafis real-time.'
                : 'Template siap diedit. Anda dapat mulai mengubah teks dan foto produk.'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto">
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-primary mt-2 block">{progress}% selesai</span>
          </div>

          {/* External Canva Link simulation & Back action */}
          <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.canva.com"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-gradient-primary text-white font-bold rounded-xl text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Buka Editor Canva Langsung
            </a>

            <button
              onClick={() => navigate('/templates')}
              className="px-6 py-3 bg-surface-container-high text-on-surface hover:bg-surface-dim font-bold rounded-xl text-xs transition-colors"
            >
              Kembali ke ContentHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
