import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { currentUser } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Rute internal workspace dan flow checkout/pembayaran (Navbar landing page disembunyikan)
  const hiddenNavbarRoutes = [
    '/dashboard',
    '/calendar',
    '/templates',
    '/admin',
    '/profile',
    '/switch-account',
    '/help',
    '/search',
    '/label',
    '/checkout',
    '/payment-confirmation',
    '/transactions',
  ];
  const isNavbarHidden = hiddenNavbarRoutes.some((path) => location.pathname.startsWith(path));

  if (isNavbarHidden) {
    return null;
  }

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path) =>
    `font-semibold text-sm transition-colors py-1.5 px-3 rounded-lg whitespace-nowrap ${
      isActive(path) ? 'text-primary font-bold bg-primary/8' : 'text-slate-600 hover:text-primary hover:bg-slate-50'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between relative">
        {/* Sisi Kiri: Brand Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-xl">layers</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-primary">ContentHub</span>
          </Link>
        </div>

        {/* Sisi Tengah: Menu Navigasi Publik Berada Tepat di Tengah */}
        <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link to="/" className={navLinkClass('/')}>
            Home
          </Link>
          <Link to="/about" className={navLinkClass('/about')}>
            About
          </Link>
          <Link to="/pricing" className={navLinkClass('/pricing')}>
            Pricing
          </Link>
          <Link to="/blog" className={navLinkClass('/blog')}>
            Blog
          </Link>
        </nav>

        {/* Sisi Kanan: Action Controls (Keranjang & Masuk/Buat Akun atau Workspace) */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Tombol Keranjang (Cart) - Hanya tampil saat akun sudah login */}
          {currentUser && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl text-slate-700 hover:text-primary hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
              title="Buka Keranjang Belanja"
            >
              <span className="material-symbols-outlined text-2xl">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {currentUser ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 text-xs font-bold bg-primary-fixed text-primary hover:bg-primary hover:text-white rounded-xl transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">space_dashboard</span>
              <span>Workspace</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-primary transition-colors">
                Masuk
              </Link>
              <Link
                to="/register"
                className="px-4 sm:px-5 py-2.5 text-xs font-bold bg-gradient-primary text-white rounded-xl shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Buat Akun
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-2.5 shadow-xl max-h-[80vh] overflow-y-auto">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 hover:text-primary">
            Home
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 hover:text-primary">
            About
          </Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 hover:text-primary">
            Pricing
          </Link>
          <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 hover:text-primary">
            Blog
          </Link>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {currentUser && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full text-left py-2 text-xs font-bold text-primary flex items-center justify-between"
              >
                <span>Lihat Keranjang Belanja</span>
                <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{cartCount} Item</span>
              </button>
            )}

            {!currentUser && (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 text-xs font-bold text-slate-700">
                  Masuk
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 bg-primary text-white text-xs font-bold rounded-xl">
                  Buat Akun Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
