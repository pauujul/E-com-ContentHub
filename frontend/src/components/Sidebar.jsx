import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();

  const isActive = (path) => {
    const current = location.pathname;
    if (path === '/dashboard') return current === '/dashboard';

    if (path === '/calendar/agenda') {
      return current === '/calendar/agenda' || current.startsWith('/calendar/agenda/');
    }

    if (path === '/calendar/drag-drop') {
      return current === '/calendar/drag-drop';
    }

    if (path === '/calendar') {
      // Kalender utama & alur setup jadwal kalender; BUKAN menu Detail Agenda atau Drag & Drop
      const calendarRoutes = [
        '/calendar',
        '/calendar/pick-date',
        '/calendar/set-time',
        '/calendar/edit-schedule',
        '/calendar/add-label',
      ];
      return calendarRoutes.includes(current);
    }

    if (path === '/templates/add') {
      return current === '/templates/add';
    }

    if (path === '/templates') {
      return current === '/templates' || (current.startsWith('/templates') && current !== '/templates/add');
    }

    if (path === '/help') {
      return current === '/help';
    }

    if (path === '/admin') {
      return current.startsWith('/admin');
    }

    return current === path;
  };

  const navItemClass = (path) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all
    ${isActive(path) ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-primary'}
  `;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-40 flex flex-col justify-between">
      {/* Bagian Atas: Logo Workspace */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">layers</span>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 leading-tight">Workspace</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Creative Director</span>
          </div>
        </div>

        {/* Menu Navigasi Utama */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          <Link to="/dashboard" className={navItemClass('/dashboard')}>
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span>Dashboard</span>
          </Link>

          <Link to="/calendar" className={navItemClass('/calendar')}>
            <span className="material-symbols-outlined text-xl">calendar_month</span>
            <span>Calendar</span>
          </Link>

          <Link to="/calendar/agenda" className={navItemClass('/calendar/agenda')}>
            <span className="material-symbols-outlined text-xl">view_agenda</span>
            <span>Detail Agenda</span>
          </Link>

          <Link to="/calendar/drag-drop" className={navItemClass('/calendar/drag-drop')}>
            <span className="material-symbols-outlined text-xl">drag_indicator</span>
            <span>Drag & Drop Planner</span>
          </Link>

          <Link to="/templates" className={navItemClass('/templates')}>
            <span className="material-symbols-outlined text-xl">auto_awesome_motion</span>
            <span>Template Library</span>
          </Link>

          {/* <Link to="/templates/search" className={navItemClass('/templates/search')}>
            <span className="material-symbols-outlined text-xl">search</span>
            <span>Cari Template</span>
          </Link> */}

          <Link to="/templates/add" className={navItemClass('/templates/add')}>
            <span className="material-symbols-outlined text-xl">add_circle</span>
            <span>Tambah Template</span>
          </Link>

          <Link to="/help" className={navItemClass('/help')}>
            <span className="material-symbols-outlined text-xl">help</span>
            <span>Bantuan</span>
          </Link>

          {isAdmin && (
            <Link to="/admin" className={navItemClass('/admin')}>
              <span className="material-symbols-outlined text-xl text-red-600">admin_panel_settings</span>
              <span className="text-red-600 font-bold">Admin Panel</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Bagian Bawah: Profil User */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white cursor-pointer transition-all border border-transparent hover:border-slate-200 hover:shadow-sm group"
          title="Buka Pengaturan Profil & Keamanan"
        >
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
              {currentUser?.name || 'Pengguna'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {currentUser?.role === 'admin' ? 'Administrator' : 'Premium Plan (UMKM)'}
            </p>
          </div>
          <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-base transition-colors">
            chevron_right
          </span>
        </div>
      </div>
    </aside>
  );
}
