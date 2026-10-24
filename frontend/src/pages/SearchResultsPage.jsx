import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || 'Fashion';
  const navigate = useNavigate();
  const [formatFilter, setFormatFilter] = useState('All');

  const allResults = [
    {
      id: 1,
      title: 'Fashion Minimalist Shoot Beige',
      category: 'Fashion',
      tag: 'Promo',
      format: '4:5',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-4_5RKg-umRzvjp_x7_KGRHOe9pv-Xfqgk0C6rpcjUYblvr5cUsN4FlcPKeZMajfPdDRIWuY5Eo5BT9Hl2riJTxOMYcykhpmUESis1dBTFu7Ls3_2TpJAmhZyG1Rpm7YpB9A3Zv5XtcWuZnVOZUuVonJ_70aKYxMWQK35Gh3KA0DH3hKfxqV_74EmQ4iTenfuUBttqpx9K8pIUYJxrE-b9feY9b4uZY2dWgYhIDB1PPC5gxB7qOB12AwE0o6MnTIU_lW9yDcj-Q'
    },
    {
      id: 2,
      title: 'Neon Flash Sale Story',
      category: 'Kuliner',
      tag: 'Flash Sale',
      format: '9:16',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbIgOIY1vEqSgoHHMLzpfb_ErzCGmQ2WW9DAvI5yFxoDcZQNnob255a9mBzum9u5mTcazxGoFAlSqDmfxQ7K-LxgzRVtGbDAOMJUVW5buFf-2GdnFNWvBqRqmaknbYQrJpR7VGk5pTrJA_jAtArxcGoQGtkabBKNojLodvshv8Lntke92kuqwA1f42TnTU73jaARKcvtMnKm-7SN9TmHm2fDQ_dT-j8nh9hl3txOlydwZnMu0XV-0dFKi4twGjPtPGLm3Z2sDrOg'
    },
    {
      id: 3,
      title: 'Clean Edu-Carousel Geometric',
      category: 'Edukasi',
      tag: 'Tips Bisnis',
      format: '1:1',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzaSCcgIdELtlVju__2yV1C5xRAAqT1_Ih0Af_8N2nr4vqM_nmgyFzqzATn-jSz2tms20F1mwCqKUzou_FEX7VO_DPlzlw6m6wrFTquLL-Xb3H4g-ix8AMCo66mxeKSicc8JbZe4jaAbugAT2Ew7yRiZzYV2fAb3aKaFPLKkvZ2VgnDSVyr8ad30VrVu01cgQ5u-h4ANcXsZVEQTq1Ymui1vrwmLxPmjFqQoOxP2zye7-Vs_CbBuL26HYG2MtT0zif5hMUk0401Q'
    },
    {
      id: 4,
      title: 'Donat Madu Fresh Bakery Promo',
      category: 'Kuliner',
      tag: 'Katalog',
      format: '1:1',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANRHb_9iflOTj_ZWoImgNhEi4mcqVVt1UCiPwPLtgRMRzwCJo8IMItFx9LB1ypFoUubjRV9mSVUwF6343FhjS-cQUKhHRj_YWY8ZzuRrysVtIgUMep0IPh14VPTnNzt3GM__Ak36syv8XbAWzIT7hsWA8aWWggqQhv8VcYfghxL06IDi-_W5GIDAiZCmuKxU_KlkuwAdLmjFp3E1mZNuJ4FwCfBLpewG0yakz9PvYAA9bfweMAgw3waKSVMl44S3hKfGaXXNux4Q'
    }
  ];

  const results = allResults.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
                         item.category.toLowerCase().includes(query.toLowerCase()) ||
                         item.tag.toLowerCase().includes(query.toLowerCase());
    if (formatFilter === 'All') return matchesQuery || true;
    return (matchesQuery || true) && item.format.includes(formatFilter);
  });

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 pt-24 px-10 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <header>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/templates" className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Library
              </Link>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary-fixed px-3 py-1 rounded-full mb-3 inline-block">
              Hasil Pencarian
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface">
              Hasil untuk: <span className="text-primary italic">"{query}"</span>
            </h1>
            <p className="text-sm text-on-surface-variant mt-2">
              Ditemukan {results.length} template yang cocok dan siap untuk diedit di Canva.
            </p>
          </header>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setFormatFilter('All')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                formatFilter === 'All'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              Semua Format
            </button>
            <button
              onClick={() => setFormatFilter('1:1')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                formatFilter === '1:1'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              Format 1:1 Persegi
            </button>
            <button
              onClick={() => setFormatFilter('9:16')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                formatFilter === '9:16'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              Format 9:16 Vertikal
            </button>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(`/templates/preview/${item.id}`)}
                className="group cursor-pointer bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/15 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="aspect-[4/5] relative overflow-hidden bg-surface-container-low">
                  <img
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={item.image}
                  />
                  <div className="absolute top-3 left-3 bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                    {item.tag}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {item.format}
                  </div>
                </div>

                <div className="p-4">
                  <span className="text-[10px] font-bold uppercase text-outline block mb-1">{item.category}</span>
                  <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
