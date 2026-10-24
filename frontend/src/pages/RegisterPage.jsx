import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
    businessCategory: 'Kuliner',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Nama lengkap, email, dan kata sandi wajib diisi.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      };

      const res = await register(payload);
      setSuccessMsg(res.message || 'Pendaftaran berhasil!');
      setStep(3);

      setTimeout(() => {
        if (formData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-4">
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch my-8">
        {/* Left Side: Visual Inspiration */}
        <section className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-primary-container rounded-3xl relative overflow-hidden text-on-primary-container shadow-xl">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}
          ></div>

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight mb-4 text-white">
              <span className="material-symbols-outlined text-3xl">layers</span>
              ContentHub
            </Link>
            <p className="text-xl font-medium opacity-90 leading-relaxed">
              Bangun narasi bisnis Anda dengan alat kreatif kelas dunia yang dirancang untuk UMKM.
            </p>
          </div>

          <div className="relative z-10 my-10">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 mb-8 shadow-sm">
              <p className="italic text-base mb-4 leading-relaxed">
                "Sejak menggunakan ContentHub, manajemen konten UMKM kami jadi jauh lebih tertata dan terlihat profesional seperti brand besar."
              </p>
              <div className="flex items-center gap-3">
                <img
                  alt="Founder Portrait"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/40"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFjUkGTOdBQnhDgnKFl5hwFw-x-nQick1boWrCXfuFqdkcfjiLi7aBrr3wCpR2SxQsfU8-UO_6cdVKW2VG3J8aNoxS4YSseR-oJ15lCEjMVrECg9QR4riv9ZNGSH2eNS1eJMfb9VON68QvE5YWttinZdK8ZtkT3fTzyoP_acB_zvtJ_a78T9yEfZ62aQonUqeSpCrzOvaFjsqDCeLFgVTV7YWDEDKfd4yGAucp0qunilfNFGxq1LV8G2h-LAqcA5GbY7t1VK_xLw"
                />
                <div>
                  <p className="text-sm font-bold text-white">Saraswati Putri</p>
                  <p className="text-xs text-white/75">Founder, Bloom Fashion</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-white/60">
            © 2024-2026 ContentHub. Solusi E-Commerce SaaS UMKM.
          </div>
        </section>

        {/* Right Side: Registration Flow */}
        <section className="lg:col-span-7 bg-surface-container-lowest rounded-3xl p-8 lg:p-14 shadow-md flex flex-col justify-between border border-outline-variant/15">
          {/* Step Indicator */}
          <nav className="flex items-center justify-between mb-10 max-w-md mx-auto w-full">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step >= 1 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-surface-container-high text-outline'
              }`}>
                1
              </div>
              <span className={`text-[11px] font-bold ${step >= 1 ? 'text-primary' : 'text-outline'}`}>Akun</span>
            </div>
            <div className={`h-[2px] flex-1 mx-3 mb-4 transition-colors ${step >= 2 ? 'bg-primary' : 'bg-surface-container-high'}`}></div>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step >= 2 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-surface-container-high text-outline'
              }`}>
                2
              </div>
              <span className={`text-[11px] font-bold ${step >= 2 ? 'text-primary' : 'text-outline'}`}>Profil Usaha</span>
            </div>
            <div className={`h-[2px] flex-1 mx-3 mb-4 transition-colors ${step >= 3 ? 'bg-primary' : 'bg-surface-container-high'}`}></div>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step >= 3 ? 'bg-green-600 text-white shadow-md' : 'bg-surface-container-high text-outline'
              }`}>
                3
              </div>
              <span className={`text-[11px] font-bold ${step >= 3 ? 'text-green-600' : 'text-outline'}`}>Selesai</span>
            </div>
          </nav>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-on-background mb-2">Mulai Gratis, Langsung Produktif.</h2>
                <p className="text-on-surface-variant text-sm">Lengkapi detail akun Anda untuk memulai ruang kerja editorial.</p>
              </div>

              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Santoso"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-container-high border-none text-sm text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Alamat Email Bisnis
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@bisnisumkm.com"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-container-high border-none text-sm text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Kata Sandi
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimal 6 karakter"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-surface-container-high border-none text-sm text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Ulangi Kata Sandi
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Konfirmasi password"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-surface-container-high border-none text-sm text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    Lanjutkan ke Profil Bisnis &rarr;
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-500 hover:text-primary mb-2 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Langkah 1
                </button>
                <h2 className="text-3xl font-extrabold text-on-background mb-2">Profil Usaha & Peran Akun</h2>
                <p className="text-on-surface-variant text-sm">Sesuaikan konten dengan ceruk pasar UMKM Anda.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-container-high border-none text-sm text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Nama Usaha / Brand
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Contoh: Donat Madu Hasran"
                      className="w-full px-4 py-3.5 rounded-xl bg-surface-container-high border-none text-sm text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Kategori Industri
                    </label>
                    <select
                      name="businessCategory"
                      value={formData.businessCategory}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-surface-container-high border-none text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    >
                      <option value="Kuliner">Kuliner & F&B</option>
                      <option value="Fashion">Fashion & Pakaian</option>
                      <option value="Jasa">Jasa & Konsultasi</option>
                      <option value="Kecantikan">Kecantikan & Skincare</option>
                      <option value="Retail">Retail & Toko Kelontong</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Pilih Peran Akun (Role)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      formData.role === 'customer'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-outline-variant/30 text-on-surface'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="customer"
                        checked={formData.role === 'customer'}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="material-symbols-outlined">storefront</span>
                      <div>
                        <p className="font-bold text-xs">Customer (UMKM)</p>
                        <p className="text-[10px] opacity-75">Kelola kalender konten bisnis</p>
                      </div>
                    </label>

                    <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      formData.role === 'admin'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-outline-variant/30 text-on-surface'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={formData.role === 'admin'}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="material-symbols-outlined text-red-600">shield_person</span>
                      <div>
                        <p className="font-bold text-xs">Admin Console</p>
                        <p className="text-[10px] opacity-75">Kelola pesanan & statistik</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Mendaftarkan ke database PostgreSQL...</span>
                      </>
                    ) : (
                      <span>Selesaikan Pendaftaran & Masuk</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-10 space-y-4">
              <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h2 className="text-3xl font-extrabold text-on-surface">Pendaftaran Berhasil!</h2>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                Akun Anda telah berhasil dibuat di database PostgreSQL ContentHub. Mengarahkan Anda ke Dashboard...
              </p>
            </div>
          )}

          <div className="mt-8 text-center pt-6 border-t border-outline-variant/15">
            <p className="text-xs text-on-surface-variant">
              Sudah memiliki akun?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline ml-1">
                Masuk di Sini
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
