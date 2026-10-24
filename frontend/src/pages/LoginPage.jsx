import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Harap masukkan alamat email dan kata sandi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await login(email, password);
      setSuccessMsg(data.message || 'Login berhasil!');

      // Role-Based Routing
      setTimeout(() => {
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  // Preset quick fill untuk evaluasi penguji/dosen
  const handleQuickLogin = (presetEmail, presetPass) => {
    setEmail(presetEmail);
    setPassword(presetPass);
  };

  return (
    <div className="bg-surface text-on-background min-h-screen">
      <main className="flex min-h-screen">
        {/* Left Side: Visual Editorial Branding */}
        <section className="hidden lg:flex w-1/2 relative overflow-hidden bg-primary items-center justify-center p-16">
          <div className="absolute inset-0 z-0 opacity-30">
            <img
              alt="Premium abstract gradient pattern with flowing deep blue"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7DHiSQ0QiCjujM4t09HqBSjtRH2-VvUd5H8OD-RGoa1CnZeuI7MTLKiE8eB5QxudHcs_TVfdJbpba46gMUurOZpBE9YW_uygaBSmO2y1dBjBuKBPgz6h1uMNlTJ30NFGAEiM2Qm-fQ6LZTqASv1_ws2w44xaC2wj29rNeGJHE-JXm4jUlvCd1KJsuXnD-UF1NuYyXy2vE3dHEvVSmXTFgEzA2srcUwCcMtYPzjum07yIdZAZtJqAflwSN2d9HHcZr6fiLK-x5vg"
            />
          </div>

          <div className="relative z-10 w-full max-w-xl text-white">
            <div className="mb-12 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">layers</span>
              </div>
              <span className="text-white text-2xl font-extrabold tracking-tight">ContentHub</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight mb-8">
              Kelola Konten Bisnis Kamu Lebih Cerdas
            </h1>

            <p className="text-white/80 text-lg mb-12 max-w-md leading-relaxed">
              Bergabunglah dengan ribuan pemilik usaha yang telah mentransformasi cara mereka merencanakan, mendesain, dan mengelola konten digital.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/15">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/20">
                  <img
                    alt="Sarah Owner Atelier Bali"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzGio_CPeCFtUV1A49_Qyv5qUPb8-muRndshHA7uIcVieJXfbckIoX3hMasyPXkj0t7psK8SIuFd1cwsdy-dqfe_7Sv3I1lWBN-_vooBXwrm9WCD-NI3lb67d3UyUZaveCuQyoRwhsTc-haeAXEw9r694xtZv5DzLLtLz8UjUi3vfdV88gTDc-I3xLfs12pBjgRd1PixhNQhux0ObZOi3L3QP-xFPIYmHXqd7DKCBFqOqXPL8xIivKuYi_mluKRBsK1SYx--8tQw"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">"ContentHub sangat membantu efisiensi tim!"</p>
                  <p className="text-white/70 text-sm italic">— Sarah, Owner Atelier Bali</p>
                </div>
              </div>
            </div>

            <div className="pt-16 flex justify-between items-center text-white/50 text-xs tracking-widest uppercase">
              <span>© 2024-2026 ContentHub</span>
              <div className="flex gap-6">
                <Link to="/about" className="hover:text-white">Tentang</Link>
                <Link to="/help" className="hover:text-white">Bantuan</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-20 bg-surface">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary mb-4">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Kembali ke Beranda
              </Link>
              <h2 className="text-3xl font-bold text-on-background mb-2">Selamat Datang Kembali</h2>
              <p className="text-on-surface-variant text-sm">
                Masuk untuk melanjutkan ke Workspace ContentHub Anda
              </p>
            </div>

            {/* Quick Login Presets (Untuk Penguji & Role Switching Cepat) */}
            <div className="mb-6 p-3 bg-surface-container-low rounded-xl border border-outline-variant/15">
              <span className="text-[10px] font-extrabold text-outline uppercase tracking-wider block mb-2">
                Simulasi Login Akun Cepat (Database Seed):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('hasran.donat@gmail.com', 'hasran123')}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold text-left flex items-center gap-1.5 transition-colors border border-blue-200"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Customer Hasran
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('jerry.hernis@amigos.id', 'admin123')}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold text-left flex items-center gap-1.5 transition-colors border border-red-200"
                >
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Admin Jerry
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200 flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleQuickLogin('hasran.donat@gmail.com', 'hasran123')}
              className="w-full flex items-center justify-center gap-3 bg-surface-container-low hover:bg-surface-container-high text-on-surface font-medium py-3 px-6 rounded-xl transition-all mb-6 border border-outline-variant/15 text-sm"
            >
              <img
                alt="Google logo"
                className="w-5 h-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuANjoascAmPxqpr0eQpu6QMrGUnTN_jXEkgf_o5QFq3IBvjm2KrJTWGdRLDiBQ3DzKe3IvsiBoxBp9sQjNhOhUzLzjstYsxDGjN3VhskUf57Ww9Qe1fpyHXz7SuWvxj-EE5kd231vvnfrWnzkvHU6AOzKepHgnjrp_1D8RQ8XZAK6y-NijTxMACFS8SLIhWixwZfB34HjzbTZlSxQEQW3Apb2ZO16z96yh2R-ufgGYLue_Slg0jnGAgXVXP_9ThU36PzE0Qqq4zfg"
              />
              <span>Masuk Cepat Persona UMKM</span>
            </button>

            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-outline-variant/30"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-outline uppercase tracking-wider">
                Atau dengan Email
              </span>
              <div className="flex-grow border-t border-outline-variant/30"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="email">
                  Alamat Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@bisnis.com"
                  required
                  className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm text-on-surface placeholder:text-outline/40"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="password">
                    Kata Sandi
                  </label>
                  <a href="#" className="text-xs font-bold text-primary hover:underline">
                    Lupa Kata Sandi?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm text-on-surface placeholder:text-outline/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Memverifikasi akun...</span>
                    </>
                  ) : (
                    <span>Masuk ke Dashboard</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-on-surface-variant">
                Belum punya akun ContentHub?{' '}
                <Link to="/register" className="text-secondary font-bold hover:underline ml-1">
                  Daftar Sekarang
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
