import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function TemplatesPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const templates = [
    {
      id: 1,
      title: 'Flash Sale Minimalist Neon',
      category: 'Promosi',
      format: '9:16 Vertical',
      channel: 'Instagram Story / Reels',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbIgOIY1vEqSgoHHMLzpfb_ErzCGmQ2WW9DAvI5yFxoDcZQNnob255a9mBzum9u5mTcazxGoFAlSqDmfxQ7K-LxgzRVtGbDAOMJUVW5buFf-2GdnFNWvBqRqmaknbYQrJpR7VGk5pTrJA_jAtArxcGoQGtkabBKNojLodvshv8Lntke92kuqwA1f42TnTU73jaARKcvtMnKm-7SN9TmHm2fDQ_dT-j8nh9hl3txOlydwZnMu0XV-0dFKi4twGjPtPGLm3Z2sDrOg'
    },
    {
      id: 2,
      title: 'Edu-Carousel Insights UMKM',
      category: 'Edukasi',
      format: '1:1 Square',
      channel: 'Carousel Post',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzaSCcgIdELtlVju__2yV1C5xRAAqT1_Ih0Af_8N2nr4vqM_nmgyFzqzATn-jSz2tms20F1mwCqKUzou_FEX7VO_DPlzlw6m6wrFTquLL-Xb3H4g-ix8AMCo66mxeKSicc8JbZe4jaAbugAT2Ew7yRiZzYV2fAb3aKaFPLKkvZ2VgnDSVyr8ad30VrVu01cgQ5u-h4ANcXsZVEQTq1Ymui1vrwmLxPmjFqQoOxP2zye7-Vs_CbBuL26HYG2MtT0zif5hMUk0401Q'
    },
    {
      id: 3,
      title: 'Fashion Elegant Lookbook Beige',
      category: 'Promosi',
      format: '4:5 Portrait',
      channel: 'Instagram Feed',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-4_5RKg-umRzvjp_x7_KGRHOe9pv-Xfqgk0C6rpcjUYblvr5cUsN4FlcPKeZMajfPdDRIWuY5Eo5BT9Hl2riJTxOMYcykhpmUESis1dBTFu7Ls3_2TpJAmhZyG1Rpm7YpB9A3Zv5XtcWuZnVOZUuVonJ_70aKYxMWQK35Gh3KA0DH3hKfxqV_74EmQ4iTenfuUBttqpx9K8pIUYJxrE-b9feY9b4uZY2dWgYhIDB1PPC5gxB7qOB12AwE0o6MnTIU_lW9yDcj-Q'
    },
    {
      id: 4,
      title: 'Kuliner Donat Madu Warmth Studio',
      category: 'Promosi',
      format: '1:1 Square',
      channel: 'Instagram / WhatsApp',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANRHb_9iflOTj_ZWoImgNhEi4mcqVVt1UCiPwPLtgRMRzwCJo8IMItFx9LB1ypFoUubjRV9mSVUwF6343FhjS-cQUKhHRj_YWY8ZzuRrysVtIgUMep0IPh14VPTnNzt3GM__Ak36syv8XbAWzIT7hsWA8aWWggqQhv8VcYfghxL06IDi-_W5GIDAiZCmuKxU_KlkuwAdLmjFp3E1mZNuJ4FwCfBLpewG0yakz9PvYAA9bfweMAgw3waKSVMl44S3hKfGaXXNux4Q'
    },
    {
      id: 5,
      title: 'Quotes Inspirasi & Motivasi Bisnis',
      category: 'Engagement',
      format: '1:1 Square',
      channel: 'Daily Story',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfLJh7RN9TgJ2cILn3EtmgBWR6xOMzLX16G1Wu4AQlbdIDTeobeF5c4Tyqce90WUIDTIZAG7i3DLIKHbhNNIV5vGBLz7GT0gcIRAxzArxKRlFmTdlf_JfFbOEFuN_G9Uh46CcAUSGJyzhG5thwjQnlXTM6mAIPDDUlH8dcexqk_mdoI-682Z9gBoLKNUPUOfslYxuP_SWW8HgpOJGCbTOQ-emZ0QWJF4B9WfXfVDSZCD18Cmj2jSeaYmDoto5QnwG6NSgduFcEoA'
    },
    {
      id: 6,
      title: 'Customer Review & Rating Showcase',
      category: 'Engagement',
      format: '9:16 Vertical',
      channel: 'TikTok / Story',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfoPAIgrso-NHEurkslE8-Op6KOwjQNK9T8qX-bFyGghhi2re3u8gsYyaqTZ7-Sq6ZPAJa2rOHSFHKDFiDj4ETYiaex6GPSVPJ9f1hibtDf_YGfrciy7D6DObnB5QdZHBf8VS_wZtv3fXb1Yp9ktjVuGWRYuRmQqwQ_gBnWNXB7NHIEmKCMtJqRvzovJHP-Ej7t9UQp8b1B4XIKODUJP2RVfgzJ-wcSDDaPpgMAkQI4N0Ulef1FxKgVOckBGIDwzPW5AyAX2yW8w'
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/templates/results?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const filteredTemplates = templates.filter(t => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Promosi' && t.category === 'Promosi') return true;
    if (activeFilter === 'Edukasi' && t.category === 'Edukasi') return true;
    if (activeFilter === 'Engagement' && t.category === 'Engagement') return true;
    if (activeFilter === '1:1' && t.format.includes('1:1')) return true;
    if (activeFilter === '9:16' && t.format.includes('9:16')) return true;
    return true;
  });

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 pt-24 px-8 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Search & Title Header */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary-fixed px-3 py-1 rounded-full mb-2 inline-block">
                Curated Design Assets
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-background">
                Template Library
              </h1>
              <p className="text-sm text-on-surface-variant max-w-lg mt-1">
                Koleksi aset desain visual siap pakai Canva yang dirancang profesional untuk kebutuhan UMKM.
              </p>
            </div>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari template (Fashion, Kuliner, Promo)..."
                className="w-full pl-12 pr-4 py-3 bg-surface-container-high border-none rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm text-on-surface placeholder:text-outline/50 shadow-sm"
              />
            </form>
          </section>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {['All', 'Promosi', 'Edukasi', 'Engagement'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeFilter === f
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {f === 'All' ? 'Semua Template' : f}
              </button>
            ))}

            <div className="h-6 w-px bg-outline-variant/30 mx-2"></div>

            {['1:1', '9:16'].map(format => (
              <button
                key={format}
                onClick={() => setActiveFilter(format)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeFilter === format
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-secondary-fixed text-on-secondary-fixed-variant hover:opacity-90'
                }`}
              >
                Format {format}
              </button>
            ))}

            <Link
              to="/templates/search"
              className="ml-auto text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              Pencarian Lanjutan &rarr;
            </Link>
          </div>

          {/* Pinterest / Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {filteredTemplates.map(tpl => (
              <div
                key={tpl.id}
                onClick={() => navigate(`/templates/preview/${tpl.id}`)}
                className="group cursor-pointer bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/15 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
                  <img
                    alt={tpl.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={tpl.image}
                  />

                  {/* Format Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-primary shadow-xs">
                    {tpl.format}
                  </div>

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                    <button className="px-6 py-3 bg-white text-primary font-bold text-xs rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">visibility</span>
                      Lihat Preview & Edit di Canva
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-outline uppercase tracking-wider mb-1">
                    <span>{tpl.category}</span>
                    <span className="text-secondary">{tpl.channel}</span>
                  </div>
                  <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                    {tpl.title}
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
