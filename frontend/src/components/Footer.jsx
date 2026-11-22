import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-600">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 pb-6 border-b border-slate-200">
          {/* Kolom Brand Info */}
          <div className="space-y-2 max-w-xs">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined text-base">layers</span>
              </div>
              <span className="font-extrabold text-primary text-lg tracking-tight">ContentHub</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Platform Perencanaan & Manajemen Kalender Konten Editorial UMKM Indonesia.
            </p>
            <p className="text-[10px] text-slate-400">
              © 2024–2026 ContentHub by Amigos Team.
            </p>
          </div>

          {/* 3 Kolom Menu Kompak & Rapat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {/* Kolom 1: Menu Utama */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 whitespace-nowrap">
                Menu Utama
              </h5>
              <ul className="space-y-1.5 text-xs font-medium">
                <li>
                  <Link to="/" className="text-slate-600 hover:text-primary transition-colors block py-0.5">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-slate-600 hover:text-primary transition-colors block py-0.5">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-slate-600 hover:text-primary transition-colors block py-0.5">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kolom 2: Kebijakan & Privasi (Dipisahkan Garis Pembatas) */}
            <div className="space-y-2 sm:border-l sm:border-slate-200 sm:pl-6">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 whitespace-nowrap">
                Kebijakan & Privasi
              </h5>
              <ul className="space-y-1.5 text-xs font-medium">
                <li>
                  <Link to="/terms" className="text-slate-600 hover:text-primary transition-colors block py-0.5 whitespace-nowrap">
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-slate-600 hover:text-primary transition-colors block py-0.5 whitespace-nowrap">
                    Kebijakan & Privasi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kolom 3: Blog & Kerja Sama (Dipisahkan Garis Pembatas) */}
            <div className="space-y-2 sm:border-l sm:border-slate-200 sm:pl-6">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 whitespace-nowrap">
                Blog & Kerja Sama
              </h5>
              <ul className="space-y-1.5 text-xs font-medium">
                <li>
                  <Link to="/blog" className="text-slate-600 hover:text-primary transition-colors block py-0.5 whitespace-nowrap">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/partnership" className="text-slate-600 hover:text-primary transition-colors block py-0.5 whitespace-nowrap">
                    Kerja Sama (Canva)
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-slate-600 hover:text-primary transition-colors block py-0.5 whitespace-nowrap">
                    Pusat Bantuan
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Baris Bawah: Status & Info */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>Dikembangkan secara terstruktur & profesional oleh Amigos Team.</p>
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span>PostgreSQL Neon Cloud Connected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
