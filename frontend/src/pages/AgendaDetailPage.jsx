import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AgendaDetailPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Upcoming'); // 'Today' | 'Upcoming' | 'Past'
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.getPosts({ user_id: currentUser?.id });
      if (res.success && res.data) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error('Error loading agenda items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [currentUser]);

  const handleCopyCaption = (item) => {
    if (!item.caption) return;
    navigator.clipboard.writeText(item.caption);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeletePost = async (id, title) => {
    if (!window.confirm(`Hapus agenda '${title}' dari kalender?`)) return;

    try {
      const res = await api.deletePost(id);
      if (res.success) {
        setFeedbackMsg(`Agenda '${title}' berhasil dihapus.`);
        setTimeout(() => setFeedbackMsg(''), 3000);
        loadPosts();
      }
    } catch (err) {
      console.error('Gagal menghapus agenda:', err);
    }
  };

  // Filter posts based on target date vs now
  const now = new Date();
  const filteredPosts = posts.filter((p) => {
    const pDate = new Date(p.scheduled_at);
    if (filter === 'Today') {
      return (
        pDate.getDate() === now.getDate() &&
        pDate.getMonth() === now.getMonth() &&
        pDate.getFullYear() === now.getFullYear()
      );
    } else if (filter === 'Upcoming') {
      return pDate >= now || p.status === 'Scheduled' || p.stage === 'scheduled';
    } else {
      // Past / Selesai
      return pDate < now && p.status === 'Published';
    }
  });

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-64 p-8 pt-6 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4 border-b border-outline-variant/15">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link to="/calendar" className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Kalender
                </Link>
                <span className="text-xs text-outline">• Sinkronisasi Live PostgreSQL</span>
              </div>
              <h1 className="text-3xl font-extrabold text-on-surface">Detail Agenda Terjadwal</h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Kelola copywriting caption, aset kreatif visual Canva, dan pantau waktu tayang postingan Anda.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/calendar/pick-date"
                className="px-5 py-2 bg-gradient-primary text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Buat Agenda Baru
              </Link>

              <div className="flex gap-1.5 p-1 bg-surface-container-low rounded-2xl border border-outline-variant/15">
                {['Upcoming', 'Today', 'Past'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      filter === tab ? 'bg-white shadow-xs text-primary' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab === 'Today' ? 'Hari Ini' : tab === 'Upcoming' ? 'Akan Datang' : 'Selesai'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {feedbackMsg && (
            <div className="p-4 bg-green-50 text-green-800 rounded-2xl text-xs font-bold border border-green-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>
              {feedbackMsg}
            </div>
          )}

          {/* Agenda Cards List */}
          {loading ? (
            <div className="text-center py-24">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-3 text-xs font-bold text-slate-400">Memuat detail agenda dari database...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
              <p className="text-sm font-bold text-slate-600">Tidak ada agenda pada tab ini.</p>
              <Link
                to="/calendar/pick-date"
                className="inline-block px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
              >
                Jadwalkan Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-outline-variant/15 hover:shadow-md transition-all flex flex-col md:flex-row"
                >
                  {/* Thumbnail */}
                  <div className="md:w-56 h-48 md:h-auto overflow-hidden relative flex-shrink-0 bg-slate-100 flex items-center justify-center">
                    {item.thumbnail_url ? (
                      <img alt={item.judul} className="w-full h-full object-cover" src={item.thumbnail_url} />
                    ) : (
                      <div className="text-center p-4 text-slate-300">
                        <span className="material-symbols-outlined text-4xl">image</span>
                        <p className="text-[10px] font-bold mt-1 text-slate-400">Canva Ready</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-primary shadow-xs">
                      {item.platform}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {item.category || 'Konten'}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            Tahap: <strong className="text-slate-700">{item.stage}</strong>
                          </span>
                        </div>

                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {new Date(item.scheduled_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-slate-800 leading-snug">{item.judul}</h3>

                      {item.caption && (
                        <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed relative group">
                          <p className="whitespace-pre-line">{item.caption}</p>
                          <button
                            onClick={() => handleCopyCaption(item)}
                            className="mt-2 text-primary font-bold hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <span className="material-symbols-outlined text-xs">
                              {copiedId === item.id ? 'check' : 'content_copy'}
                            </span>
                            {copiedId === item.id ? 'Caption Berhasil Disalin!' : 'Salin Caption'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/calendar/edit-schedule?id=${item.id}`)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Edit Jadwal
                        </button>

                        <button
                          onClick={() => navigate('/templates/canva-transition')}
                          className="px-4 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">draw</span>
                          Buka di Canva
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeletePost(item.id, item.judul)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 p-2"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Hapus Agenda
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
