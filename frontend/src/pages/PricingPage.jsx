import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import PricingSection from '../components/PricingSection';

export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const isInWorkspace = searchParams.get('mode') === 'workspace';

  return (
    <div className={`min-h-screen ${isInWorkspace ? 'bg-background text-on-background' : 'bg-surface text-on-surface'} flex flex-col justify-between`}>
      {/* Tampilkan Sidebar untuk Workspace, atau Navbar jika mode public landing */}
      {isInWorkspace ? <Sidebar /> : <Navbar />}

      <main
        className={`flex-1 w-full transition-all ${
          isInWorkspace
            ? 'ml-0 md:ml-64 p-6 sm:p-8 lg:p-10 min-h-screen max-w-7xl'
            : 'pt-24 pb-16 max-w-7xl mx-auto'
        }`}
      >
        {/* Header Breadcrumb Khusus Workspace (Anti Landing Page) */}
        {isInWorkspace && (
          <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant/15">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1.5">
                <Link
                  to="/dashboard"
                  className="hover:text-primary transition-colors text-slate-600 font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Workspace
                </Link>
                <span>/</span>
                <span className="text-primary font-bold">Paket Langganan & Invoice</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Paket Hero Rp98rb & Langganan
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Pilih atau tingkatkan paket langganan Anda untuk membuka seluruh fitur kalender dan template Canva premium.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                to="/transactions"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs shadow-xs border border-outline-variant/20 transition-all"
              >
                <span className="material-symbols-outlined text-base text-primary">receipt_long</span>
                <span>Riwayat Transaksi & Invoice</span>
              </Link>
            </div>
          </header>
        )}

        <PricingSection
          showHeader={!isInWorkspace}
          showSupportBanner={true}
          className={isInWorkspace ? 'py-2 px-0' : ''}
        />
      </main>

      {/* Tampilkan Footer hanya jika di mode public landing */}
      {!isInWorkspace && <Footer />}
    </div>
  );
}
