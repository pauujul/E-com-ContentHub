import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const itemClass = (path) => `
    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out font-semibold text-sm
    ${isActive(path)
      ? 'bg-primary/10 text-primary font-bold shadow-sm'
      : 'text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800'
    }
  `;

  return (
    <aside className="h-screen w-64 fixed left-0 top-16 bg-surface-container-low flex flex-col p-6 space-y-6 z-40 border-r border-outline-variant/15 overflow-y-auto">
      {/* Workspace Header */}
      <div className="flex items-center space-x-3 px-2">
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
          <span className="material-symbols-outlined text-white">layers</span>
        </div>
        <div>
          <h2 className="text-base font-bold text-primary leading-none">Workspace</h2>
          <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider mt-1">
            {isAdmin ? 'Admin Console' : 'Creative Director'}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5">
        <Link to="/dashboard" className={itemClass('/dashboard')}>
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span>Dashboard</span>
        </Link>

        <Link to="/calendar" className={itemClass('/calendar')}>
          <span className="material-symbols-outlined text-xl">calendar_month</span>
          <span>Calendar</span>
        </Link>

        <Link to="/calendar/agenda" className={itemClass('/calendar/agenda')}>
          <span className="material-symbols-outlined text-xl">event_note</span>
          <span>Detail Agenda</span>
        </Link>

        <Link to="/calendar/drag-drop" className={itemClass('/calendar/drag-drop')}>
          <span className="material-symbols-outlined text-xl">drag_indicator</span>
          <span>Drag & Drop Planner</span>
        </Link>

        <Link to="/templates" className={itemClass('/templates')}>
          <span className="material-symbols-outlined text-xl">auto_awesome_motion</span>
          <span>Template Library</span>
        </Link>

        <Link to="/templates/search" className={itemClass('/templates/search')}>
          <span className="material-symbols-outlined text-xl">search</span>
          <span>Cari Template</span>
        </Link>

        <Link to="/templates/add" className={itemClass('/templates/add')}>
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span>Tambah Template</span>
        </Link>

        <Link to="/help" className={itemClass('/help')}>
          <span className="material-symbols-outlined text-xl">help</span>
          <span>Bantuan</span>
        </Link>

        {isAdmin && (
          <div className="pt-4 mt-2 border-t border-outline-variant/15">
            <span className="px-4 text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">
              Admin Access
            </span>
            <Link to="/admin" className={itemClass('/admin')}>
              <span className="material-symbols-outlined text-xl text-red-600">manage_accounts</span>
              <span className="text-red-700 font-bold">Admin Orders</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User Footer Profile & Account Switcher Link */}
      <div className="pt-4 border-t border-outline-variant/15">
        <Link 
          to="/profile"
          className="flex items-center space-x-3 px-2 py-2 rounded-xl hover:bg-surface-container-high transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden flex-1 text-left">
            <p className="text-sm font-bold text-on-surface truncate">{currentUser?.name || 'Pengguna'}</p>
            <p className="text-xs text-on-surface-variant truncate">
              {currentUser?.role === 'admin' ? 'Administrator' : 'Premium Plan (UMKM)'}
            </p>
          </div>
        </Link>
        <div className="mt-2 flex justify-between px-2 text-xs">
          <Link to="/switch-account" className="text-primary hover:underline font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">switch_account</span>
            Ganti Akun
          </Link>
          <Link to="/pricing" className="text-secondary hover:underline font-semibold">
            Upgrade
          </Link>
        </div>
      </div>
    </aside>
  );
}
