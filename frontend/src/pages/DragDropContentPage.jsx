import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DragDropContentPage() {
  const { currentUser } = useAuth();
  const [columns, setColumns] = useState({
    backlog: [],
    design: [],
    ready: [],
    scheduled: [],
  });
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);

  // Sample Preset Visual UMKM untuk mempermudah user
  const samplePresets = [
    { label: 'Donat Cokelat', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop' },
    { label: 'Kuliner Kopi', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop' },
    { label: 'Promo Diskon', url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&auto=format&fit=crop' },
    { label: 'Behind The Scenes', url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop' },
  ];

  // Modal Buat Kartu Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newCard, setNewCard] = useState({
    judul: '',
    caption: '',
    platform: 'Instagram',
    category: 'Ide Konten',
    color_label: 'bg-blue-50 text-blue-700 border-blue-200',
    stage: 'backlog',
    thumbnail_url: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '19:00',
  });

  // Modal Edit Kartu
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [updatingCard, setUpdatingCard] = useState(false);

  // Load posts from database
  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.getPosts({ user_id: currentUser?.id });
      if (res.success && res.data) {
        const posts = res.data;
        setColumns({
          backlog: posts.filter((p) => p.stage === 'backlog'),
          design: posts.filter((p) => p.stage === 'design'),
          ready: posts.filter((p) => p.stage === 'ready'),
          scheduled: posts.filter((p) => p.stage === 'scheduled'),
        });
      }
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [currentUser]);

  // Drag and drop handlers
  const handleDragStart = (item, sourceCol) => {
    setDraggedItem({ item, sourceCol });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetCol) => {
    if (!draggedItem || draggedItem.sourceCol === targetCol) return;

    const { item, sourceCol } = draggedItem;

    // Optimistic UI update
    const sourceList = columns[sourceCol].filter((i) => i.id !== item.id);
    const targetList = [...columns[targetCol], { ...item, stage: targetCol }];

    setColumns({
      ...columns,
      [sourceCol]: sourceList,
      [targetCol]: targetList,
    });
    setDraggedItem(null);

    // Kirim perubahan posisi ke database PostgreSQL / Neon
    try {
      const res = await api.updatePostStage(item.id, targetCol, targetList.length - 1);
      if (res.success) {
        setFeedbackMsg(`Kartu '${item.judul}' berhasil dipindahkan ke tahapan '${getStageTitle(targetCol)}' dan tersimpan ke database Neon.`);
        setTimeout(() => setFeedbackMsg(''), 3500);
      }
    } catch (err) {
      console.error('Gagal menyimpan posisi kartu ke database:', err);
      loadPosts();
    }
  };

  const getStageTitle = (col) => {
    switch (col) {
      case 'backlog':
        return 'Ide Konten';
      case 'design':
        return 'Desain Canva';
      case 'ready':
        return 'Siap Publish';
      case 'scheduled':
        return 'Terjadwal di Kalender';
      default:
        return col;
    }
  };

  // Upload file handler untuk Modal Buat Kartu
  const handleFileUpload = async (e, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      if (res.success && res.data?.url) {
        if (isEditing) {
          setEditingCard((prev) => ({ ...prev, thumbnail_url: res.data.url }));
        } else {
          setNewCard((prev) => ({ ...prev, thumbnail_url: res.data.url }));
        }
        setFeedbackMsg('Foto berhasil diunggah!');
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Gagal mengunggah gambar. Pastikan file berupa format gambar (JPG/PNG).');
    } finally {
      setUploadingImage(false);
    }
  };

  // Buat Kartu Baru via Modal langsung ke database
  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCard.judul) return;

    setLoading(true);
    try {
      const scheduledIso = new Date(`${newCard.scheduled_date}T${newCard.scheduled_time}:00`).toISOString();
      const payload = {
        user_id: currentUser?.id || 2,
        judul: newCard.judul,
        caption: newCard.caption,
        platform: newCard.platform,
        category: newCard.category,
        color_label: newCard.color_label,
        stage: newCard.stage,
        thumbnail_url: newCard.thumbnail_url || null,
        media_url: newCard.thumbnail_url || null,
        scheduled_at: scheduledIso,
        status: newCard.stage === 'scheduled' ? 'Scheduled' : 'Draft',
      };

      const res = await api.createPost(payload);
      if (res.success) {
        setIsModalOpen(false);
        setNewCard({
          judul: '',
          caption: '',
          platform: 'Instagram',
          category: 'Ide Konten',
          color_label: 'bg-blue-50 text-blue-700 border-blue-200',
          stage: 'backlog',
          thumbnail_url: '',
          scheduled_date: new Date().toISOString().split('T')[0],
          scheduled_time: '19:00',
        });
        setFeedbackMsg(`Kartu baru '${res.data.judul}' berhasil disimpan permanen ke database!`);
        setTimeout(() => setFeedbackMsg(''), 3500);
        loadPosts();
      }
    } catch (err) {
      console.error('Gagal membuat kartu baru:', err);
      alert('Gagal membuat kartu. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Buka Modal Edit Kartu
  const handleOpenEdit = (item, e) => {
    e.stopPropagation();
    const pDate = new Date(item.scheduled_at || new Date());
    const yearStr = pDate.getFullYear();
    const monthStr = String(pDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(pDate.getDate()).padStart(2, '0');
    const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

    const hourStr = String(pDate.getHours()).padStart(2, '0');
    const minStr = String(pDate.getMinutes()).padStart(2, '0');
    const timeStr = `${hourStr}:${minStr}`;

    setEditingCard({
      ...item,
      scheduled_date: dateStr,
      scheduled_time: timeStr,
    });
    setIsEditModalOpen(true);
  };

  // Simpan Perubahan Edit Kartu
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCard || !editingCard.judul) return;

    setUpdatingCard(true);
    try {
      const scheduledIso = new Date(`${editingCard.scheduled_date}T${editingCard.scheduled_time}:00`).toISOString();
      const payload = {
        judul: editingCard.judul,
        caption: editingCard.caption,
        platform: editingCard.platform,
        category: editingCard.category,
        stage: editingCard.stage,
        thumbnail_url: editingCard.thumbnail_url || null,
        media_url: editingCard.thumbnail_url || null,
        scheduled_at: scheduledIso,
        status: editingCard.stage === 'scheduled' ? 'Scheduled' : 'Draft',
      };

      const res = await api.updatePost(editingCard.id, payload);
      if (res.success) {
        setIsEditModalOpen(false);
        setEditingCard(null);
        setFeedbackMsg(`Perubahan kartu '${res.data.judul}' berhasil diperbarui di database Neon!`);
        setTimeout(() => setFeedbackMsg(''), 3500);
        loadPosts();
      }
    } catch (err) {
      console.error('Gagal mengupdate kartu:', err);
      alert('Gagal memperbarui kartu. Silakan coba lagi.');
    } finally {
      setUpdatingCard(false);
    }
  };

  // Hapus kartu
  const handleDeleteCard = async (postId, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kartu '${title}' dari database?`)) return;

    try {
      const res = await api.deletePost(postId);
      if (res.success) {
        setFeedbackMsg(`Kartu '${title}' berhasil dihapus.`);
        setTimeout(() => setFeedbackMsg(''), 3000);
        loadPosts();
      }
    } catch (err) {
      console.error('Gagal menghapus kartu:', err);
    }
  };

  // Helper render kartu pada kolom apa saja
  const renderCard = (item, stageCol) => {
    return (
      <div
        key={item.id}
        draggable
        onDragStart={() => handleDragStart(item, stageCol)}
        className="p-4 bg-white rounded-2xl shadow-xs border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-primary/40 transition-all space-y-3 group"
      >
        {/* Gambar Thumbnail Jika Ada */}
        {item.thumbnail_url ? (
          <div className="h-32 rounded-xl overflow-hidden bg-slate-100 relative group/img border border-slate-100">
            <img
              src={item.thumbnail_url}
              alt={item.judul}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop';
              }}
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
              <span>{item.platform}</span>
            </div>
          </div>
        ) : null}

        {/* Header Kategori & Tombol Aksi (Edit & Hapus) */}
        <div className="flex justify-between items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.color_label || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            {item.category || 'Konten UMKM'}
          </span>

          <div className="flex items-center gap-1">
            {/* Tombol Edit Kartu */}
            <button
              onClick={(e) => handleOpenEdit(item, e)}
              className="p-1 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
              title="Edit Kartu Ini"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>

            {/* Tombol Hapus Kartu */}
            <button
              onClick={(e) => handleDeleteCard(item.id, item.judul, e)}
              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Hapus Kartu"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>

        {/* Judul & Caption */}
        <div>
          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
            {item.judul}
          </h4>
          {item.caption && (
            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {item.caption}
            </p>
          )}
        </div>

        {/* Footer Info (Jadwal & Platform) */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">schedule</span>
            {item.scheduled_at ? (
              <span>
                {new Date(item.scheduled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })},{' '}
                {new Date(item.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </span>
            ) : (
              'Belum diatur'
            )}
          </span>

          {!item.thumbnail_url && (
            <span className="text-primary font-bold">{item.platform}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800">
      <Sidebar />

      <main className="ml-0 md:ml-64 p-6 sm:p-8 lg:p-10 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Link to="/calendar" className="text-xs font-bold text-slate-400 hover:text-primary flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Kalender
                </Link>
                <span className="text-xs text-slate-400 font-semibold">• Live PostgreSQL Neon Sync</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Drag & Drop Content Planner
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Tarik dan pindahkan kartu antar kolom secara fleksibel. Tambahkan visual gambar dan edit setiap kartu langsung dari papan ini.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={loadPosts}
                className="px-3.5 py-2.5 bg-white hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors border border-slate-200 shadow-xs"
                title="Sinkronkan data dari Neon Cloud"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Refresh
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-primary text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary/20 flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">add_photo_alternate</span>
                <span>+ Buat Kartu Baru (Ada Gambar)</span>
              </button>
            </div>
          </div>

          {/* Feedback message */}
          {feedbackMsg && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
              <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Kanban Board Grid */}
          {loading ? (
            <div className="text-center py-24">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
              <p className="mt-3 text-xs font-bold text-slate-400">Sinkronisasi kartu planner dengan database PostgreSQL Neon...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
              
              {/* Kolom 1: Ide Konten (Backlog) */}
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop('backlog')}
                className="bg-slate-100/80 rounded-3xl p-4 sm:p-5 border border-slate-200 flex flex-col min-h-[580px] transition-colors hover:border-blue-300"
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-xs"></span>
                    <h3 className="font-extrabold text-sm text-slate-900">1. Ide Konten (Backlog)</h3>
                  </div>
                  <span className="text-xs font-extrabold text-slate-700 bg-white px-2.5 py-0.5 rounded-full shadow-xs">
                    {columns.backlog.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {columns.backlog.map((item) => renderCard(item, 'backlog'))}

                  {columns.backlog.length === 0 && (
                    <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-xs">
                      Tarik kartu ide ke sini
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom 2: Desain & Visual Canva */}
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop('design')}
                className="bg-slate-100/80 rounded-3xl p-4 sm:p-5 border border-slate-200 flex flex-col min-h-[580px] transition-colors hover:border-purple-300"
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500 shadow-xs"></span>
                    <h3 className="font-extrabold text-sm text-slate-900">2. Desain Canva</h3>
                  </div>
                  <span className="text-xs font-extrabold text-slate-700 bg-white px-2.5 py-0.5 rounded-full shadow-xs">
                    {columns.design.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {columns.design.map((item) => renderCard(item, 'design'))}

                  {columns.design.length === 0 && (
                    <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-xs">
                      Tarik kartu desain ke sini
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom 3: Siap Publish */}
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop('ready')}
                className="bg-slate-100/80 rounded-3xl p-4 sm:p-5 border border-slate-200 flex flex-col min-h-[580px] transition-colors hover:border-amber-300"
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs"></span>
                    <h3 className="font-extrabold text-sm text-slate-900">3. Siap Publish</h3>
                  </div>
                  <span className="text-xs font-extrabold text-slate-700 bg-white px-2.5 py-0.5 rounded-full shadow-xs">
                    {columns.ready.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {columns.ready.map((item) => renderCard(item, 'ready'))}

                  {columns.ready.length === 0 && (
                    <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-xs">
                      Tarik kartu review ke sini
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom 4: Terjadwal di Kalender */}
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop('scheduled')}
                className="bg-slate-100/80 rounded-3xl p-4 sm:p-5 border border-slate-200 flex flex-col min-h-[580px] transition-colors hover:border-emerald-300"
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs"></span>
                    <h3 className="font-extrabold text-sm text-slate-900">4. Terjadwal di Kalender</h3>
                  </div>
                  <span className="text-xs font-extrabold text-slate-700 bg-white px-2.5 py-0.5 rounded-full shadow-xs">
                    {columns.scheduled.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {columns.scheduled.map((item) => renderCard(item, 'scheduled'))}

                  {columns.scheduled.length === 0 && (
                    <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-xs">
                      Tarik kartu terjadwal ke sini
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* MODAL 1: BUAT KARTU BARU (DENGAN DUKUNGAN GAMBAR VISUAL) */}
          {/* ======================================================== */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 my-8">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Tambah Kartu Planner Baru</h3>
                      <p className="text-[11px] text-slate-500">Lengkapi judul, caption, dan gambar visual konten Anda.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                <form onSubmit={handleCreateCard} className="space-y-4">
                  {/* Judul */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Judul Agenda / Postingan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newCard.judul}
                      onChange={(e) => setNewCard({ ...newCard, judul: e.target.value })}
                      placeholder="Contoh: Video Reels Donat Lumer Varian Baru"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Bagian Tambah Gambar Visual */}
                  <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-primary">image</span>
                        <span>Gambar Visual Konten (Opsional)</span>
                      </label>
                      {newCard.thumbnail_url && (
                        <button
                          type="button"
                          onClick={() => setNewCard({ ...newCard, thumbnail_url: '' })}
                          className="text-[10px] font-bold text-red-500 hover:underline"
                        >
                          Hapus Gambar
                        </button>
                      )}
                    </div>

                    {/* Preview Gambar Jika Ada */}
                    {newCard.thumbnail_url ? (
                      <div className="h-36 rounded-xl overflow-hidden relative border border-slate-200">
                        <img
                          src={newCard.thumbnail_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-md">
                          Gambar Siap Tampil
                        </span>
                      </div>
                    ) : null}

                    {/* Opsi Upload File */}
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <label className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs">
                        <span className="material-symbols-outlined text-base text-primary">upload_file</span>
                        <span>{uploadingImage ? 'Mengunggah...' : 'Pilih Gambar dari Komputer'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, false)}
                          className="hidden"
                        />
                      </label>

                      <span className="text-[10px] text-slate-400 font-bold uppercase">atau masukkan URL</span>
                    </div>

                    <input
                      type="url"
                      value={newCard.thumbnail_url}
                      onChange={(e) => setNewCard({ ...newCard, thumbnail_url: e.target.value })}
                      placeholder="https://images.unsplash.com/... atau link gambar Canva"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">Preset Gambar Cepat:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {samplePresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewCard({ ...newCard, thumbnail_url: preset.url })}
                            className="text-[10px] font-bold px-2 py-1 bg-white border border-slate-200 rounded-lg hover:border-primary text-slate-600 transition-colors"
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Draft Caption / Teks</label>
                    <textarea
                      rows="2"
                      value={newCard.caption}
                      onChange={(e) => setNewCard({ ...newCard, caption: e.target.value })}
                      placeholder="Tuliskan gagasan teks promosi, hashtag, atau call-to-action..."
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:bg-white focus:outline-none leading-relaxed"
                    ></textarea>
                  </div>

                  {/* Platform & Tahapan Awal */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Platform</label>
                      <select
                        value={newCard.platform}
                        onChange={(e) => setNewCard({ ...newCard, platform: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Threads">Threads</option>
                        <option value="YouTube">YouTube</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Kolom Awal</label>
                      <select
                        value={newCard.stage}
                        onChange={(e) => setNewCard({ ...newCard, stage: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                      >
                        <option value="backlog">1. Ide Konten (Backlog)</option>
                        <option value="design">2. Desain Canva</option>
                        <option value="ready">3. Siap Publish</option>
                        <option value="scheduled">4. Terjadwal di Kalender</option>
                      </select>
                    </div>
                  </div>

                  {/* Tanggal & Jam Tayang */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Tanggal Target</label>
                      <input
                        type="date"
                        value={newCard.scheduled_date}
                        onChange={(e) => setNewCard({ ...newCard, scheduled_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Jam Tayang (WIB)</label>
                      <input
                        type="time"
                        value={newCard.scheduled_time}
                        onChange={(e) => setNewCard({ ...newCard, scheduled_time: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploadingImage}
                      className="px-5 py-2.5 bg-gradient-primary text-white rounded-xl text-xs font-extrabold shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">save</span>
                      <span>{loading ? 'Menyimpan...' : 'Simpan Kartu ke Database'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODAL 2: EDIT KARTU KONTEN (IN-PLACE MODAL UNTUK REVISI) */}
          {/* ======================================================== */}
          {isEditModalOpen && editingCard && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 my-8">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200">
                      <span className="material-symbols-outlined text-lg">edit_note</span>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Edit Kartu Konten</h3>
                      <p className="text-[11px] text-slate-500">Perbaiki judul, gambar, atau jadwal jika terdapat kesalahan input.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingCard(null);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  {/* Judul */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Judul Agenda / Postingan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCard.judul}
                      onChange={(e) => setEditingCard({ ...editingCard, judul: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Gambar Visual */}
                  <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-primary">image</span>
                        <span>Gambar Thumbnail Visual</span>
                      </label>
                      {editingCard.thumbnail_url && (
                        <button
                          type="button"
                          onClick={() => setEditingCard({ ...editingCard, thumbnail_url: '' })}
                          className="text-[10px] font-bold text-red-500 hover:underline"
                        >
                          Hapus Gambar
                        </button>
                      )}
                    </div>

                    {/* Preview Gambar Saat Ini */}
                    {editingCard.thumbnail_url ? (
                      <div className="h-36 rounded-xl overflow-hidden relative border border-slate-200">
                        <img
                          src={editingCard.thumbnail_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-md">
                          Thumbnail Aktif
                        </span>
                      </div>
                    ) : null}

                    {/* Upload / Ganti Gambar */}
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <label className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs">
                        <span className="material-symbols-outlined text-base text-primary">upload_file</span>
                        <span>{uploadingImage ? 'Mengunggah...' : 'Ganti Gambar dari Komputer'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, true)}
                          className="hidden"
                        />
                      </label>

                      <span className="text-[10px] text-slate-400 font-bold uppercase">atau ubah URL</span>
                    </div>

                    <input
                      type="url"
                      value={editingCard.thumbnail_url || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, thumbnail_url: e.target.value })}
                      placeholder="https://... URL gambar baru"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">Pilih Gambar Cepat:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {samplePresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditingCard({ ...editingCard, thumbnail_url: preset.url })}
                            className="text-[10px] font-bold px-2 py-1 bg-white border border-slate-200 rounded-lg hover:border-primary text-slate-600 transition-colors"
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Caption / Catatan</label>
                    <textarea
                      rows="2"
                      value={editingCard.caption || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, caption: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:bg-white focus:outline-none leading-relaxed"
                    ></textarea>
                  </div>

                  {/* Platform & Tahapan Kolom */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Platform</label>
                      <select
                        value={editingCard.platform}
                        onChange={(e) => setEditingCard({ ...editingCard, platform: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Threads">Threads</option>
                        <option value="YouTube">YouTube</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Tahapan Planner</label>
                      <select
                        value={editingCard.stage}
                        onChange={(e) => setEditingCard({ ...editingCard, stage: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                      >
                        <option value="backlog">1. Ide Konten (Backlog)</option>
                        <option value="design">2. Desain Canva</option>
                        <option value="ready">3. Siap Publish</option>
                        <option value="scheduled">4. Terjadwal di Kalender</option>
                      </select>
                    </div>
                  </div>

                  {/* Tanggal & Jam Tayang */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Tanggal Tayang</label>
                      <input
                        type="date"
                        value={editingCard.scheduled_date}
                        onChange={(e) => setEditingCard({ ...editingCard, scheduled_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Jam Tayang (WIB)</label>
                      <input
                        type="time"
                        value={editingCard.scheduled_time}
                        onChange={(e) => setEditingCard({ ...editingCard, scheduled_time: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setEditingCard(null);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={updatingCard || uploadingImage}
                      className="px-5 py-2.5 bg-gradient-primary text-white rounded-xl text-xs font-extrabold shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">save</span>
                      <span>{updatingCard ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
