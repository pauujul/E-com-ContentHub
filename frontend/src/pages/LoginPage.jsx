import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // States untuk Modal Lupa & Reset Kata Sandi
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Input Email, 2 = Input OTP & Password Baru, 3 = Selesai
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotShowPass, setForgotShowPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

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

  // Buka Modal Reset Password
  const handleOpenForgotModal = () => {
    setForgotStep(1);
    setForgotEmail(email || '');
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
    setIsForgotModalOpen(true);
  };

  // Step 1: Kirim Kode OTP ke Gmail
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Harap masukkan alamat email Gmail yang terdaftar.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await api.forgotPassword(forgotEmail);
      if (res.success) {
        setForgotSuccess(res.message);
        setForgotStep(2);
      } else {
        throw new Error(res.message || 'Gagal mengirim kode verifikasi.');
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || err.message || 'Gagal mengirim kode ke Gmail.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verifikasi OTP & Terapkan Sandi Baru
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotOtp || !forgotNewPassword) {
      setForgotError('Kode OTP dan kata sandi baru wajib diisi.');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');

    try {
      const res = await api.resetPassword({
        email: forgotEmail,
        otp: forgotOtp,
        new_password: forgotNewPassword,
        confirm_password: forgotConfirmPassword,
      });

      if (res.success) {
        setForgotSuccess(res.message);
        setForgotStep(3);
        setEmail(forgotEmail);
        setPassword('');
      } else {
        throw new Error(res.message || 'Gagal mereset kata sandi.');
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || err.message || 'Kode verifikasi tidak valid atau telah kedaluwarsa.');
    } finally {
      setForgotLoading(false);
    }
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
                  <p className="text-white/70 text-sm italic">Sarah, Owner Atelier Bali</p>
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
                  <button
                    type="button"
                    onClick={handleOpenForgotModal}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Lupa Kata Sandi?
                  </button>
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

      {/* ======================================================== */}
      {/* MODAL RESET KATA SANDI VIA GMAIL SMTP                    */}
      {/* ======================================================== */}
      {isForgotModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => !forgotLoading && setIsForgotModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">
                    {forgotStep === 3 ? 'verified' : forgotStep === 2 ? 'mail_lock' : 'lock_reset'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    {forgotStep === 1 && 'Lupa Kata Sandi'}
                    {forgotStep === 2 && 'Verifikasi Kode OTP'}
                    {forgotStep === 3 && 'Sandi Berhasil Diperbarui'}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Google Gmail SMTP Security</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !forgotLoading && setIsForgotModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Error & Info Alerts */}
            {forgotError && (
              <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-base flex-shrink-0">error</span>
                <span>{forgotError}</span>
              </div>
            )}

            {/* Modal Body: STEP 1 - INPUT EMAIL */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp} className="p-6 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Masukkan alamat email akun ContentHub Anda. Sistem akan memverifikasi dan mengirimkan <strong>kode OTP 6 digit</strong> via Google Gmail SMTP.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Alamat Email Terdaftar
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="nama@gmail.com atau nama@bisnis.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Catatan: Akun dengan email samaran/asalan tetap bebas dibuat dan login, namun hanya email yang terdaftar resmi di Google Gmail yang dapat menerima notifikasi pesan reset sandi ini.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 bg-gradient-primary text-white font-bold rounded-xl shadow-md shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengirim Kode ke Gmail...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">send</span>
                        <span>Kirim Kode Verifikasi ke Gmail</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Body: STEP 2 - INPUT OTP & KATA SANDI BARU */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-2.5 text-xs text-sky-800">
                  <span className="material-symbols-outlined text-sky-600 text-lg flex-shrink-0">mark_email_read</span>
                  <div>
                    <p className="font-bold">Kode telah dikirim ke:</p>
                    <p className="font-mono text-xs font-extrabold text-primary">{forgotEmail}</p>
                    <p className="text-[11px] text-sky-700/80 mt-1">Periksa kotak masuk (inbox) atau folder spam akun Gmail Anda.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Kode Verifikasi (OTP 6 Digit)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-[8px] font-extrabold focus:ring-2 focus:ring-primary focus:bg-white transition-all text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Kata Sandi Baru (Min. 6 Karakter)
                  </label>
                  <div className="relative">
                    <input
                      type={forgotShowPass ? 'text' : 'password'}
                      required
                      minLength="6"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Masukkan kata sandi baru"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setForgotShowPass(!forgotShowPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-base">
                        {forgotShowPass ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all text-slate-800"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 bg-gradient-primary text-white font-bold rounded-xl shadow-md shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Memperbarui Sandi...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">check</span>
                        <span>Verifikasi & Simpan Kata Sandi</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    disabled={forgotLoading}
                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 text-center"
                  >
                    Salah alamat email? Ubah Email
                  </button>
                </div>
              </form>
            )}

            {/* Modal Body: STEP 3 - SUKSES */}
            {forgotStep === 3 && (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-sm">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">Kata Sandi Berhasil Diperbarui!</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Kata sandi baru Anda telah aktif. Konfirmasi pembaruan keamanan juga telah dikirim ke kotak masuk Gmail Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-md shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all text-sm cursor-pointer"
                >
                  Masuk Sekarang dengan Sandi Baru
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
