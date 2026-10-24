import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function SwitchAccountPage() {
  const { currentUser, allUsers, switchUser } = useAuth();
  const navigate = useNavigate();

  const handleSelectUser = (user) => {
    switchUser(user);
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  // Seed fallback if allUsers still loading
  const accounts = allUsers.length > 0 ? allUsers : [
    { id: 2, name: 'Muhammad Hasran', email: 'hasran.donat@gmail.com', role: 'customer', phone: '085299887766' },
    { id: 1, name: 'Jerry Hernis', email: 'jerry.hernis@amigos.id', role: 'admin', phone: '081234567890' },
    { id: 3, name: 'Fauzul Rozaq', email: 'fauzul@amigos.id', role: 'admin', phone: '081298765432' }
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <Sidebar />

      {/* Main Content (Behind blur) */}
      <main className="ml-64 pt-24 px-8 min-h-screen relative flex items-center justify-center">
        {/* Modal Backdrop (Matching original ganti_akun design) */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/15 overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-8 pb-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-fixed mb-4 shadow-sm">
                <span className="material-symbols-outlined text-primary text-3xl">switch_account</span>
              </div>
              <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">Ganti Akun Pengguna</h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Pilih persona akun dari database untuk menguji role-based routing (Customer vs Admin).
              </p>
            </div>

            {/* Account List */}
            <div className="px-6 py-4 space-y-2.5 max-h-[360px] overflow-y-auto">
              {accounts.map((user) => {
                const isActive = currentUser?.id === user.id;
                const isAdmin = user.role === 'admin';

                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-primary/10 border-2 border-primary shadow-sm'
                        : 'bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm ${
                          isAdmin ? 'bg-gradient-to-tr from-red-600 to-rose-500' : 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        {isActive && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-on-surface">{user.name}</p>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            isAdmin ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant truncate max-w-[180px]">{user.email}</p>
                      </div>
                    </div>

                    <div>
                      {isActive ? (
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-white px-2 py-1 rounded shadow-xs">
                          Aktif
                        </span>
                      ) : (
                        <button className="text-xs font-bold text-slate-400 group-hover:text-primary">
                          Pilih
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 pt-2 bg-surface-container-low/50 border-t border-outline-variant/15 flex flex-col gap-2">
              <Link
                to="/register"
                className="w-full py-3 bg-gradient-primary text-white font-bold rounded-xl text-xs text-center shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                + Daftarkan Akun Baru ke Database
              </Link>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-surface-container-high transition-colors"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
