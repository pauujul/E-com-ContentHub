import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DragDropContentPage() {
  const [columns, setColumns] = useState({
    backlog: [
      { id: '1', title: 'Ide: Donat Gluten-Free untuk Diet', platform: 'Instagram', label: 'Edukasi', color: 'bg-blue-100 text-blue-700' },
      { id: '2', title: 'Video Reels Unboxing Packaging Baru', platform: 'TikTok', label: 'Branding', color: 'bg-purple-100 text-purple-700' },
    ],
    design: [{ id: '3', title: 'Banner Promo Beli 2 Gratis 1', platform: 'Canva', label: 'Promo', color: 'bg-amber-100 text-amber-800' }],
    ready: [{ id: '4', title: 'Foto Estetik Donat Red Velvet', platform: 'Instagram', label: 'Produk', color: 'bg-pink-100 text-pink-700' }],
    scheduled: [{ id: '5', title: 'Pengumuman Pemenang Giveaway', platform: 'Instagram', label: 'Engagement', time: '19:00 WIB', color: 'bg-green-100 text-green-800' }],
  });

  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (item, sourceCol) => {
    setDraggedItem({ item, sourceCol });
  };

  const handleDrop = (targetCol) => {
    if (!draggedItem || draggedItem.sourceCol === targetCol) return;

    const sourceList = [...columns[draggedItem.sourceCol]];
    const targetList = [...columns[targetCol]];

    // Remove from source
    const filteredSource = sourceList.filter((i) => i.id !== draggedItem.item.id);
    // Add to target
    targetList.push(draggedItem.item);

    setColumns({
      ...columns,
      [draggedItem.sourceCol]: filteredSource,
      [targetCol]: targetList,
    });

    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 p-8 pt-6 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link to="/calendar" className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Kalender
                </Link>
              </div>
              <h1 className="text-3xl font-extrabold text-on-surface">Drag & Drop Content Planner</h1>
              <p className="text-sm text-on-surface-variant mt-1">Tarik dan lepaskan kartu konten untuk mengubah status pengerjaan secara fleksibel.</p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/calendar/pick-date" className="px-5 py-2.5 bg-gradient-primary text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-base">add</span>
                Buat Kartu Baru
              </Link>
            </div>
          </div>

          {/* Kanban Board Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Col 1: Ide Konten (Backlog) */}
            <div onDragOver={handleDragOver} onDrop={() => handleDrop('backlog')} className="bg-surface-container-low rounded-3xl p-5 border border-outline-variant/15 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <h3 className="font-bold text-sm text-on-surface">Ide Konten</h3>
                </div>
                <span className="text-xs font-bold text-outline bg-white px-2 py-0.5 rounded-full">{columns.backlog.length}</span>
              </div>

              <div className="space-y-3 flex-1">
                {columns.backlog.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item, 'backlog')}
                    className="p-4 bg-white rounded-2xl shadow-sm border border-outline-variant/15 cursor-grab active:cursor-grabbing hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.color}`}>{item.label}</span>
                      <span className="text-[10px] font-bold text-slate-400">{item.platform}</span>
                    </div>
                    <p className="font-bold text-sm text-on-surface leading-tight">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2: Proses Desain Canva */}
            <div onDragOver={handleDragOver} onDrop={() => handleDrop('design')} className="bg-surface-container-low rounded-3xl p-5 border border-outline-variant/15 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h3 className="font-bold text-sm text-on-surface">Proses Desain Canva</h3>
                </div>
                <span className="text-xs font-bold text-outline bg-white px-2 py-0.5 rounded-full">{columns.design.length}</span>
              </div>

              <div className="space-y-3 flex-1">
                {columns.design.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item, 'design')}
                    className="p-4 bg-white rounded-2xl shadow-sm border border-outline-variant/15 cursor-grab active:cursor-grabbing hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.color}`}>{item.label}</span>
                      <span className="text-[10px] font-bold text-slate-400">{item.platform}</span>
                    </div>
                    <p className="font-bold text-sm text-on-surface leading-tight">{item.title}</p>
                    <Link to="/templates/canva-transition" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline pt-1">
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      Buka Canva
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Siap Publikasi */}
            <div onDragOver={handleDragOver} onDrop={() => handleDrop('ready')} className="bg-surface-container-low rounded-3xl p-5 border border-outline-variant/15 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  <h3 className="font-bold text-sm text-on-surface">Siap Publikasi</h3>
                </div>
                <span className="text-xs font-bold text-outline bg-white px-2 py-0.5 rounded-full">{columns.ready.length}</span>
              </div>

              <div className="space-y-3 flex-1">
                {columns.ready.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item, 'ready')}
                    className="p-4 bg-white rounded-2xl shadow-sm border border-outline-variant/15 cursor-grab active:cursor-grabbing hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.color}`}>{item.label}</span>
                      <span className="text-[10px] font-bold text-slate-400">{item.platform}</span>
                    </div>
                    <p className="font-bold text-sm text-on-surface leading-tight">{item.title}</p>
                    <Link to="/calendar/set-time" className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline pt-1">
                      <span className="material-symbols-outlined text-sm">alarm</span>
                      Set Waktu Tayang
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 4: Terjadwal Aktif */}
            <div onDragOver={handleDragOver} onDrop={() => handleDrop('scheduled')} className="bg-surface-container-low rounded-3xl p-5 border border-outline-variant/15 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <h3 className="font-bold text-sm text-on-surface">Terjadwal Aktif</h3>
                </div>
                <span className="text-xs font-bold text-outline bg-white px-2 py-0.5 rounded-full">{columns.scheduled.length}</span>
              </div>

              <div className="space-y-3 flex-1">
                {columns.scheduled.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item, 'scheduled')}
                    className="p-4 bg-white rounded-2xl shadow-sm border border-outline-variant/15 cursor-grab active:cursor-grabbing hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.color}`}>{item.label}</span>
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{item.time || '19:00 WIB'}</span>
                    </div>
                    <p className="font-bold text-sm text-on-surface leading-tight">{item.title}</p>
                    <Link to="/calendar/agenda" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline pt-1">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      Lihat Detail Agenda
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
