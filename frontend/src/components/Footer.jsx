import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant/15 bg-surface-container-lowest text-on-surface-variant">
      <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-extrabold text-primary text-xl tracking-tight">ContentHub</span>
            <span className="text-[10px] font-bold bg-primary-fixed text-primary px-2 py-0.5 rounded-full uppercase">
              B2C SaaS
            </span>
          </div>
          <p className="text-xs text-on-surface-variant max-w-md">
            Platform Perencanaan & Manajemen Konten Media Sosial UMKM Indonesia.
            Dikembangkan oleh <strong>Amigos Team</strong> (Semester V / Kelas A 24).
          </p>
          <p className="text-[11px] text-outline mt-1">
            © 2024-2026 ContentHub by Amigos Team. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 text-xs font-semibold">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/about" className="hover:text-primary transition-colors">Tentang Kami</Link>
          <Link to="/pricing" className="hover:text-primary transition-colors">Paket & Harga</Link>
          <Link to="/templates" className="hover:text-primary transition-colors">Library Template</Link>
          <Link to="/help" className="hover:text-primary transition-colors">Pusat Bantuan</Link>
        </div>
      </div>
    </footer>
  );
}
