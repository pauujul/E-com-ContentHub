import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Rute workspace yang menggunakan Sidebar (Navbar disembunyikan total)
  const dashboardRoutes = ['/dashboard', '/calendar', '/templates', '/admin', '/profile', '/help', '/transactions', '/switch-account'];

  const isWorkspace = dashboardRoutes.some((path) => location.pathname.startsWith(path));

  // Jika sedang di dalam halaman aplikasi/workspace, jangan render Navbar
  if (isWorkspace) {
    return null;
  }

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path) => `font-semibold text-sm transition-colors py-1 ${isActive(path) ? 'text-primary border-b-2 border-primary' : 'text-slate-600 hover:text-primary'}`;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Brand Logo & Navigasi Publik */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-2xl">layers</span>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-primary">ContentHub</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full">SaaS UMKM</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={navLinkClass('/')}>
              Home
            </Link>
            <Link to="/about" className={navLinkClass('/about')}>
              About
            </Link>
            <Link to="/pricing" className={navLinkClass('/pricing')}>
              Pricing
            </Link>
          </nav>
        </div>

        {/* Tombol Auth Murni (Selalu Masuk & Buat Akun) */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-primary transition-colors">
            Masuk
          </Link>
          <Link to="/register" className="px-5 py-2.5 text-xs font-bold bg-gradient-primary text-white rounded-xl shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            Buat Akun Sekarang
          </Link>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100">
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">
            Home
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">
            About
          </Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">
            Pricing
          </Link>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 text-xs font-bold text-slate-700">
              Masuk
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 bg-primary text-white text-xs font-bold rounded-xl">
              Buat Akun Sekarang
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
