import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Active Admin Menu (1 s.d. 9 sesuai spesifikasi)
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Loading & Feedback
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Dashboard State
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // 2. Users Management State
  const [usersList, setUsersList] = useState([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
    business_name: '',
    industry: 'Kuliner & F&B',
    avatar_url: '',
  });

  // Monitoring Jadwal Konten Pengguna State
  const [allUserPosts, setAllUserPosts] = useState([]);
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [postStageFilter, setPostStageFilter] = useState('ALL');
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);

  // 3. Subscription Catalog State
  const [plans, setPlans] = useState([]);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    billing_cycle: 'Bulanan',
    featuresText: '',
    badge: '',
    is_hero: false,
    is_active: true,
  });

  // 4. Terms State
  const [termsData, setTermsData] = useState(null);
  // 5. Privacy State
  const [privacyData, setPrivacyData] = useState(null);
  // 6. Partnerships State
  const [partnershipData, setPartnershipData] = useState(null);
  // 7. Blog State
  const [articles, setArticles] = useState([]);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    slug: '',
    description: '',
    image_url: '',
    author: 'Editorial ContentHub',
    category: 'Strategi Konten',
  });
  const [articleLogs, setArticleLogs] = useState([]);
  // 8. About State
  const [aboutData, setAboutData] = useState(null);

  // 9. Web Settings State (3 Tab: General, Email, Payment)
  const [settingsTab, setSettingsTab] = useState('general'); // 'general' | 'email' | 'payment'
  const [generalSettings, setGeneralSettings] = useState({
    tagline: '',
    description: '',
    logo_url: '',
    favicon_url: '',
    support_email: '',
    support_phone: '',
    address: '',
    social_instagram: '',
    social_tiktok: '',
  });
  const [emailSettings, setEmailSettings] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_from: 'no-reply@contenthub.id',
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: false,
    templates: {
      welcome: { subject: '', body: '' },
      invoice: { subject: '', body: '' },
      reset_password: { subject: '', body: '' },
    },
  });
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [paymentSettings, setPaymentSettings] = useState({
    mode: 'sandbox',
    provider: 'Midtrans',
    server_key: '',
    client_key: '',
    merchant_id: '',
    supported_channels: [],
  });

  // Load All Data
  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        ordersRes,
        usersRes,
        productsRes,
        termsRes,
        privacyRes,
        partnershipsRes,
        articlesRes,
        aboutRes,
        settingsRes,
        postsRes,
      ] = await Promise.all([
        api.getAdminStats(),
        api.getOrders(),
        api.getUsers(),
        api.getProducts(true),
        api.getContent('terms'),
        api.getContent('privacy'),
        api.getContent('partnerships'),
        api.getContent('articles'),
        api.getContent('about'),
        api.getSettings(),
        api.getPosts(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (usersRes.success) setUsersList(usersRes.data);
      if (productsRes.success) setPlans(productsRes.data);
      if (postsRes && postsRes.success) setAllUserPosts(postsRes.data);
      if (termsRes.success && termsRes.data?.length > 0) setTermsData(termsRes.data[0]);
      if (privacyRes.success && privacyRes.data?.length > 0) setPrivacyData(privacyRes.data[0]);
      if (partnershipsRes.success && partnershipsRes.data?.length > 0) setPartnershipData(partnershipsRes.data[0]);
      if (articlesRes.success) setArticles(articlesRes.data);
      api.getArticleLogs().then(r => { if (r?.success && r.data) setArticleLogs(r.data); }).catch(() => {});
      if (aboutRes.success && aboutRes.data?.length > 0) setAboutData(aboutRes.data[0]);

      if (settingsRes.success && settingsRes.data) {
        if (settingsRes.data.general) setGeneralSettings(settingsRes.data.general);
        if (settingsRes.data.email) setEmailSettings(settingsRes.data.email);
        if (settingsRes.data.payment_gateway) setPaymentSettings(settingsRes.data.payment_gateway);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const showToast = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // 1. Order Status Update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(res.message);
        // Refresh orders & stats
        const ordersRes = await api.getOrders();
        if (ordersRes.success) setOrders(ordersRes.data);
        const statsRes = await api.getAdminStats();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // 2. Users Management Actions
  const handleOpenUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role || 'customer',
        phone: user.phone || '',
        business_name: user.business_name || '',
        industry: user.industry || 'Kuliner & F&B',
        avatar_url: user.avatar_url || '',
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        phone: '',
        business_name: '',
        industry: 'Kuliner & F&B',
        avatar_url: '',
      });
    }
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const res = await api.updateUser(editingUser.id, userForm);
        if (res.success) showToast('Data pengguna berhasil diperbarui.');
      } else {
        const res = await api.createUser(userForm);
        if (res.success) showToast('Pengguna baru berhasil ditambahkan.');
      }
      setUserModalOpen(false);
      const usersRes = await api.getUsers();
      if (usersRes.success) setUsersList(usersRes.data);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Hapus pengguna '${name}' secara permanen?`)) return;
    try {
      const res = await api.deleteUser(id);
      if (res.success) {
        showToast(`Pengguna '${name}' berhasil dihapus.`);
        const usersRes = await api.getUsers();
        if (usersRes.success) setUsersList(usersRes.data);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Catalog Management Actions
  const handleOpenPlanModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      const feats = Array.isArray(plan.features) ? plan.features.join('\n') : '';
      setPlanForm({
        sku: plan.sku,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        billing_cycle: plan.billing_cycle,
        featuresText: feats,
        badge: plan.badge || '',
        is_hero: Boolean(plan.is_hero),
        is_active: plan.is_active !== false,
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        sku: '',
        name: '',
        description: '',
        price: '',
        billing_cycle: 'Bulanan',
        featuresText: '',
        badge: '',
        is_hero: false,
        is_active: true,
      });
    }
    setPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    const features = planForm.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      ...planForm,
      features,
    };

    try {
      if (editingPlan) {
        const res = await api.updateProduct(editingPlan.id, payload);
        if (res.success) showToast('Paket langganan berhasil diperbarui.');
      } else {
        const res = await api.createProduct(payload);
        if (res.success) showToast('Paket langganan baru berhasil ditambahkan.');
      }
      setPlanModalOpen(false);
      const productsRes = await api.getProducts(true);
      if (productsRes.success) setPlans(productsRes.data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePlan = async (id, name) => {
    if (!window.confirm(`Hapus paket '${name}'?`)) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        showToast(`Paket '${name}' berhasil dihapus.`);
        const productsRes = await api.getProducts(true);
        if (productsRes.success) setPlans(productsRes.data);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 4-6. Content Saves (Terms, Privacy, Partnerships, About)
  const handleSaveTerms = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateContent('terms', termsData.id, termsData);
      if (res.success) showToast('Konten Syarat & Ketentuan berhasil disimpan ke database!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSavePrivacy = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateContent('privacy', privacyData.id, privacyData);
      if (res.success) showToast('Konten Kebijakan & Privasi berhasil disimpan ke database!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSavePartnership = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateContent('partnerships', partnershipData.id, partnershipData);
      if (res.success) showToast('Konten Kerja Sama & Integrasi Canva berhasil disimpan ke database!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveAbout = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateContent('about', aboutData.id, aboutData);
      if (res.success) showToast('Konten Profil Perusahaan About berhasil disimpan ke database!');
    } catch (err) {
      alert(err.message);
    }
  };

  // 7. Blog CRUD
  const handleOpenArticleModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setArticleForm({
        title: article.title,
        slug: article.slug,
        description: article.description,
        image_url: article.image_url || '',
        author: article.author || currentUser?.name || 'Jerry Hernis',
        category: article.category || 'Strategi Konten',
      });
    } else {
      setEditingArticle(null);
      setArticleForm({
        title: '',
        slug: '',
        description: '',
        image_url: '',
        author: currentUser?.name || 'Jerry Hernis',
        category: 'Strategi Konten',
      });
    }
    setArticleModalOpen(true);
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    try {
      const activeAdminName = currentUser?.name || articleForm.author || 'Jerry Hernis';
      const payload = { ...articleForm, author: activeAdminName };

      if (editingArticle) {
        const res = await api.updateContent('articles', editingArticle.id, payload);
        if (res.success) showToast(`Artikel blog berhasil diperbarui oleh ${activeAdminName}.`);
      } else {
        const res = await api.createContent('articles', payload);
        if (res.success) showToast(`Artikel blog baru berhasil diterbitkan oleh ${activeAdminName}.`);
      }
      setArticleModalOpen(false);
      const resArticles = await api.getContent('articles');
      if (resArticles.success) setArticles(resArticles.data);
      api.getArticleLogs().then(r => { if (r?.success && r.data) setArticleLogs(r.data); });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteArticle = async (id, title) => {
    if (!window.confirm(`Hapus artikel '${title}'?`)) return;
    try {
      const res = await api.deleteContent('articles', id);
      if (res.success) {
        showToast('Artikel berhasil dihapus.');
        const resArticles = await api.getContent('articles');
        if (resArticles.success) setArticles(resArticles.data);
        api.getArticleLogs().then(r => { if (r?.success && r.data) setArticleLogs(r.data); });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 9. Web Settings Saves
  const handleSaveGeneralSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateGeneralSettings(generalSettings);
      if (res.success) showToast('General Settings berhasil disimpan!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveEmailSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateEmailSettings(emailSettings);
      if (res.success) showToast('Konfigurasi SMTP dan Template Email berhasil disimpan!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      alert('Masukkan alamat email tujuan untuk uji coba.');
      return;
    }
    try {
      const res = await api.testEmail(testEmailAddress);
      if (res.success) showToast(res.message);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updatePaymentSettings(paymentSettings);
      if (res.success) showToast('Kredensial Payment Gateway & Transaksi berhasil disimpan!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Menu items list
  const adminMenuItems = [
    { key: 'dashboard', label: 'Ringkasan Dashboard', icon: 'dashboard' },
    { key: 'users', label: 'Kelola Pengguna', icon: 'group' },
    { key: 'user_posts', label: 'Jadwal Konten Pengguna', icon: 'event_note' },
    { key: 'catalog', label: 'Katalog Paket Langganan', icon: 'loyalty' },
    { key: 'terms', label: 'Syarat & Ketentuan', icon: 'gavel' },
    { key: 'privacy', label: 'Kebijakan & Privasi', icon: 'security' },
    { key: 'partnerships', label: 'Kerja Sama (Canva)', icon: 'handshake' },
    { key: 'blog', label: 'Kelola Artikel Blog', icon: 'menu_book' },
    { key: 'about', label: 'Kelola Halaman About', icon: 'info' },
    { key: 'settings', label: 'Pengaturan Sistem Web', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* ======================================================== */}
      {/* SIDEBAR ADMIN PANEL - TEMA RESMI CONTENTHUB (WHITE & BLUE) */}
      {/* ======================================================== */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-40 flex flex-col justify-between shadow-xs">
        <div>
          {/* Admin Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
                <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-800 leading-tight">Admin Console</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary">ContentHub HQ</span>
              </div>
            </div>
          </div>

          {/* Menu Navigasi Admin */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-185px)]">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-3 py-2 block">
              Menu Manajemen
            </span>

            {adminMenuItems.map((menu) => {
              const isSelected = activeMenu === menu.key;
              return (
                <button
                  key={menu.key}
                  onClick={() => setActiveMenu(menu.key)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-primary font-bold' : 'text-slate-400'}`}>
                    {menu.icon}
                  </span>
                  <span className="truncate">{menu.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Sidebar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">Super Admin</p>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="w-full py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            Buka Workspace User
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full py-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ======================================================== */}
      <main className="ml-64 flex-1 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Bar Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  Panel Administrator
                </span>
                <span className="text-xs text-slate-400">• Database: PostgreSQL / Neon</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {adminMenuItems.find((m) => m.key === activeMenu)?.label || 'Dashboard'}
              </h1>
            </div>

            <button
              onClick={loadAllAdminData}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Segarkan Data Server
            </button>
          </header>

          {/* Feedback Toast */}
          {feedbackMsg && (
            <div className="p-4 bg-green-50 text-green-800 rounded-2xl text-xs font-bold border border-green-200 flex items-center gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-base text-green-600">check_circle</span>
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* 1. MENU: DASHBOARD (RINGKASAN UTAMA & TABEL ORDERS) */}
          {/* ======================================================== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* 4 Kotak Teks Statistik Transaksi di Bagian Atas */}
              {stats && (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Total Pendapatan (Paid)
                    </span>
                    <p className="text-2xl font-extrabold text-primary">
                      Rp {parseFloat(stats.total_revenue || 0).toLocaleString('id-ID')}
                    </p>
                    <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      Terverifikasi Database
                    </span>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Total Transaksi Pesanan
                    </span>
                    <p className="text-2xl font-extrabold text-slate-800">{stats.total_orders}</p>
                    <span className="text-[10px] font-bold text-slate-400">
                      {stats.paid_orders} Paid • {stats.pending_orders} Pending
                    </span>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Pesanan Butuh Verifikasi
                    </span>
                    <p className="text-2xl font-extrabold text-amber-600">{stats.pending_orders}</p>
                    <span className="text-[10px] font-bold text-amber-700">Menunggu Tindakan Admin</span>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Total Pengguna Terdaftar
                    </span>
                    <p className="text-2xl font-extrabold text-secondary">{stats.total_users}</p>
                    <span className="text-[10px] font-bold text-slate-400">{stats.total_customers} Customer UMKM</span>
                  </div>
                </section>
              )}

              {/* Tabel Daftar Transaksi Pembelian Subscription (`orders`) */}
              <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Daftar Transaksi Pembelian Subscription (Tabel Orders)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Terhubung langsung ke tabel PostgreSQL `orders` dengan relasi `user_id` dan informasi pembeli eksplisit.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold bg-primary-fixed text-primary px-3 py-1 rounded-full">
                    {orders.length} Transaksi Terdata
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4 font-bold">No. Order</th>
                        <th className="py-3 px-4 font-bold">Pelanggan (User ID)</th>
                        <th className="py-3 px-4 font-bold">Paket Langganan</th>
                        <th className="py-3 px-4 font-bold">Total (Rp)</th>
                        <th className="py-3 px-4 font-bold">Metode / Channel</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold text-center">Aksi Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-primary">{ord.order_number}</td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-800">{ord.customer_name}</p>
                            <p className="text-[11px] text-slate-400">
                              {ord.customer_email} (User #{ord.user_id})
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-800">{ord.plan_name}</span>
                            <span className="text-[10px] text-slate-400 block">({ord.billing_cycle})</span>
                          </td>
                          <td className="py-4 px-4 font-extrabold text-slate-900">
                            Rp {parseFloat(ord.total_amount).toLocaleString('id-ID')}
                          </td>
                          <td className="py-4 px-4 text-slate-600">
                            <p className="font-semibold">{ord.payment_channel}</p>
                            <p className="text-[10px] text-slate-400">{ord.payment_method}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                ord.status === 'Paid'
                                  ? 'bg-green-100 text-green-800'
                                  : ord.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex items-center gap-1">
                              {ord.status !== 'Paid' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'Paid')}
                                  disabled={updatingOrderId === ord.id}
                                  className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                                  title="Konfirmasi Pembayaran Selesai"
                                >
                                  Set Paid
                                </button>
                              )}
                              {ord.status !== 'Pending' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'Pending')}
                                  disabled={updatingOrderId === ord.id}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition-colors"
                                >
                                  Set Pending
                                </button>
                              )}
                              {ord.status !== 'Cancelled' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'Cancelled')}
                                  disabled={updatingOrderId === ord.id}
                                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[10px] font-bold transition-colors"
                                >
                                  Batal
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. MENU: KELOLA PENGGUNA (USERS MANAGEMENT) */}
          {/* ======================================================== */}
          {activeMenu === 'users' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Manajemen Akun Pengguna Terdaftar (`users`)</h2>
                  <p className="text-xs text-slate-500">
                    Pantau seluruh pengguna, ubah hak akses (Role), sunting profil usaha, atau hapus akun pengguna.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenUserModal()}
                  className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  + Tambah Pengguna Baru
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold">ID</th>
                      <th className="py-3 px-4 font-bold">Nama & Email</th>
                      <th className="py-3 px-4 font-bold">Role</th>
                      <th className="py-3 px-4 font-bold">Nama Usaha / Industri</th>
                      <th className="py-3 px-4 font-bold">Telepon</th>
                      <th className="py-3 px-4 font-bold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-400">#{u.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-800">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              u.role === 'admin'
                                ? 'bg-red-100 text-red-700'
                                : u.role === 'editor'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-700">{u.business_name || '-'}</p>
                          <p className="text-[10px] text-slate-400">{u.industry || '-'}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{u.phone || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenUserModal(u)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. MENU: MONITORING JADWAL KONTEN PENGGUNA */}
          {/* ======================================================== */}
          {activeMenu === 'user_posts' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Box */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-md border border-purple-200">
                      PostgreSQL Neon Live Database
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">• Monitoring Seluruh UMKM</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">Monitoring Jadwal Konten Pengguna</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Admin dapat memantau seluruh jadwal posting, naskah copywriting, dan draf visual yang diinput oleh mitra UMKM.
                  </p>
                </div>

                <button
                  onClick={async () => {
                    const res = await api.getPosts();
                    if (res.success) {
                      setAllUserPosts(res.data);
                      showToast('Data jadwal konten pengguna berhasil diperbarui!');
                    }
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>Refresh Jadwal</span>
                </button>
              </div>

              {/* 4 Kotak Statistik Konten Pengguna */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Konten Pengguna</span>
                    <span className="material-symbols-outlined text-lg text-primary">view_agenda</span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">{allUserPosts.length}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Tersimpan di tabel content_posts</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Terjadwal di Kalender</span>
                    <span className="material-symbols-outlined text-lg text-emerald-600">calendar_month</span>
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-600">
                    {allUserPosts.filter((p) => p.stage === 'scheduled').length}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Siap tayang sesuai jadwal</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Desain Canva</span>
                    <span className="material-symbols-outlined text-lg text-purple-600">palette</span>
                  </div>
                  <p className="text-2xl font-extrabold text-purple-600">
                    {allUserPosts.filter((p) => p.stage === 'design').length}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Sedang dalam proses grafis</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Ide Konten (Backlog)</span>
                    <span className="material-symbols-outlined text-lg text-blue-600">lightbulb</span>
                  </div>
                  <p className="text-2xl font-extrabold text-blue-600">
                    {allUserPosts.filter((p) => p.stage === 'backlog' || p.stage === 'ready').length}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Draf gagasan & review naskah</p>
                </div>
              </div>

              {/* Tabel Jadwal Konten Pengguna */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <div className="relative w-full sm:w-80">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      search
                    </span>
                    <input
                      type="text"
                      value={postSearchQuery}
                      onChange={(e) => setPostSearchQuery(e.target.value)}
                      placeholder="Cari user, bisnis, judul, atau platform..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-400">Filter Tahapan:</span>
                    <select
                      value={postStageFilter}
                      onChange={(e) => setPostStageFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                    >
                      <option value="ALL">Semua Tahapan</option>
                      <option value="scheduled">Terjadwal di Kalender</option>
                      <option value="design">Desain Canva</option>
                      <option value="ready">Siap Publish</option>
                      <option value="backlog">Ide Konten (Backlog)</option>
                    </select>
                  </div>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                        <th className="py-3 px-3">Pengguna & UMKM</th>
                        <th className="py-3 px-3">Konten & Visual</th>
                        <th className="py-3 px-3">Platform</th>
                        <th className="py-3 px-3">Jadwal Tayang (WIB)</th>
                        <th className="py-3 px-3">Tahapan Planner</th>
                        <th className="py-3 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {allUserPosts
                        .filter((p) => {
                          const matchesQuery =
                            !postSearchQuery ||
                            (p.judul && p.judul.toLowerCase().includes(postSearchQuery.toLowerCase())) ||
                            (p.user_name && p.user_name.toLowerCase().includes(postSearchQuery.toLowerCase())) ||
                            (p.user_business_name && p.user_business_name.toLowerCase().includes(postSearchQuery.toLowerCase())) ||
                            (p.platform && p.platform.toLowerCase().includes(postSearchQuery.toLowerCase()));

                          const matchesStage = postStageFilter === 'ALL' || p.stage === postStageFilter;

                          return matchesQuery && matchesStage;
                        })
                        .map((post) => {
                          const stageBadgeColor =
                            post.stage === 'scheduled'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : post.stage === 'design'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : post.stage === 'ready'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200';

                          const stageLabel =
                            post.stage === 'scheduled'
                              ? 'Terjadwal'
                              : post.stage === 'design'
                              ? 'Desain Canva'
                              : post.stage === 'ready'
                              ? 'Siap Publish'
                              : 'Ide Konten';

                          return (
                            <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Kolom 1: User & Business */}
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase flex-shrink-0">
                                    {post.user_name ? post.user_name.charAt(0) : 'U'}
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-slate-900 leading-tight">
                                      {post.user_name || 'Pengguna ContentHub'}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {post.user_business_name || 'UMKM Mitra'} • {post.user_email}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Kolom 2: Konten & Visual */}
                              <td className="py-3.5 px-3 max-w-xs">
                                <div className="flex items-center gap-2.5">
                                  {post.thumbnail_url ? (
                                    <img
                                      src={post.thumbnail_url}
                                      alt=""
                                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                      <span className="material-symbols-outlined text-lg">image</span>
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-800 truncate" title={post.judul}>
                                      {post.judul}
                                    </p>
                                    {post.caption && (
                                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]" title={post.caption}>
                                        {post.caption}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Kolom 3: Platform */}
                              <td className="py-3.5 px-3">
                                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                                  {post.platform || 'Instagram'}
                                </span>
                              </td>

                              {/* Kolom 4: Jadwal Tayang */}
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <p className="font-bold text-slate-800">
                                  {new Date(post.scheduled_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {new Date(post.scheduled_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}{' '}
                                  WIB
                                </p>
                              </td>

                              {/* Kolom 5: Tahapan Planner */}
                              <td className="py-3.5 px-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${stageBadgeColor}`}>
                                  {stageLabel}
                                </span>
                              </td>

                              {/* Kolom 6: Aksi */}
                              <td className="py-3.5 px-3 text-right">
                                <button
                                  onClick={() => setSelectedPostDetail(post)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors inline-flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-xs">visibility</span>
                                  <span>Detail</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Detail Postingan untuk Admin */}
              {selectedPostDetail && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-primary/10 text-primary">
                          {selectedPostDetail.platform} • {selectedPostDetail.category || 'Konten UMKM'}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                          {selectedPostDetail.judul}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedPostDetail(null)}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>

                    {/* Gambar Thumbnail Besar */}
                    {selectedPostDetail.thumbnail_url && (
                      <div className="h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={selectedPostDetail.thumbnail_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Informasi Pengguna Pembuat */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                      <p>
                        <strong>Pembuat:</strong> {selectedPostDetail.user_name} ({selectedPostDetail.user_email})
                      </p>
                      <p>
                        <strong>Nama Usaha UMKM:</strong> {selectedPostDetail.user_business_name || 'Mitra UMKM'}
                      </p>
                      <p>
                        <strong>Jadwal Tayang:</strong>{' '}
                        {new Date(selectedPostDetail.scheduled_at).toLocaleString('id-ID', {
                          dateStyle: 'full',
                          timeStyle: 'short',
                        })}{' '}
                        WIB
                      </p>
                      <p>
                        <strong>Tahapan Planner:</strong> <span className="font-bold uppercase text-primary">{selectedPostDetail.stage}</span>
                      </p>
                    </div>

                    {/* Caption Lengkap */}
                    {selectedPostDetail.caption && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-slate-400">Naskah Caption / Catatan:</label>
                        <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed max-h-36 overflow-y-auto">
                          {selectedPostDetail.caption}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setSelectedPostDetail(null)}
                        className="px-5 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. MENU: KELOLA KATALOG SUBSCRIPTION */}
          {/* ======================================================== */}
          {activeMenu === 'catalog' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Pengaturan Katalog Paket Langganan</h2>
                  <p className="text-xs text-slate-500">
                    Atur harga, perbarui deskripsi tier paket (Trial Free, Starter, Pro), ubah daftar fitur, dan tentukan status aktif.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenPlanModal()}
                  className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  + Tambah Tier Paket Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {plans.map((p) => {
                  const feats = Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]');
                  return (
                    <div
                      key={p.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        p.is_hero ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {p.sku}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {p.is_active ? 'Aktif' : 'Non-Aktif'}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base text-slate-800">{p.name}</h3>
                        <p className="text-lg font-extrabold text-primary mt-1">
                          Rp {parseFloat(p.price).toLocaleString('id-ID')}
                          <span className="text-[10px] font-semibold text-slate-400">/{p.billing_cycle}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{p.description}</p>

                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Fitur ({feats.length}):</span>
                          <ul className="text-[11px] text-slate-600 space-y-1">
                            {feats.slice(0, 3).map((f, i) => (
                              <li key={i} className="truncate">• {f}</li>
                            ))}
                            {feats.length > 3 && <li className="text-primary font-bold">+{feats.length - 3} fitur lainnya</li>}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => handleOpenPlanModal(p)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                        >
                          Sunting Paket
                        </button>
                        <button
                          onClick={() => handleDeletePlan(p.id, p.name)}
                          className="text-red-600 hover:text-red-800 text-xs font-bold p-1"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. MENU: KELOLA SYARAT & KETENTUAN */}
          {/* ======================================================== */}
          {activeMenu === 'terms' && termsData && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5 animate-in fade-in duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Kelola Syarat & Ketentuan (Tabel terms_conditions)</h2>
                  <p className="text-xs text-slate-500">Perbarui pasal-pasal ketentuan layanan yang tayang di halaman publik /terms.</p>
                </div>
              </div>

              <form onSubmit={handleSaveTerms} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Judul Dokumen</label>
                    <input
                      type="text"
                      required
                      value={termsData.title || ''}
                      onChange={(e) => setTermsData({ ...termsData, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Slug URL</label>
                    <input
                      type="text"
                      required
                      value={termsData.slug || ''}
                      onChange={(e) => setTermsData({ ...termsData, slug: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-600">Isi Naskah Syarat & Ketentuan</label>
                  <textarea
                    rows="14"
                    required
                    value={termsData.description || ''}
                    onChange={(e) => setTermsData({ ...termsData, description: e.target.value })}
                    className="w-full p-4 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-primary"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Penulis / Author</label>
                    <input
                      type="text"
                      value={termsData.author || ''}
                      onChange={(e) => setTermsData({ ...termsData, author: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Kategori</label>
                    <input
                      type="text"
                      value={termsData.category || ''}
                      onChange={(e) => setTermsData({ ...termsData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">URL Gambar Banner</label>
                    <input
                      type="url"
                      value={termsData.image_url || ''}
                      onChange={(e) => setTermsData({ ...termsData, image_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    Simpan Syarat & Ketentuan ke Database
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. MENU: KELOLA KEBIJAKAN & PRIVASI */}
          {/* ======================================================== */}
          {activeMenu === 'privacy' && privacyData && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5 animate-in fade-in duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Kelola Kebijakan & Privasi (Tabel privacy_policies)</h2>
                  <p className="text-xs text-slate-500">Perbarui dokumen perlindungan data dan privasi pengguna (/privacy).</p>
                </div>
              </div>

              <form onSubmit={handleSavePrivacy} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Judul Dokumen</label>
                    <input
                      type="text"
                      required
                      value={privacyData.title || ''}
                      onChange={(e) => setPrivacyData({ ...privacyData, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-secondary font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Slug URL</label>
                    <input
                      type="text"
                      required
                      value={privacyData.slug || ''}
                      onChange={(e) => setPrivacyData({ ...privacyData, slug: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-600">Isi Kebijakan Privasi</label>
                  <textarea
                    rows="14"
                    required
                    value={privacyData.description || ''}
                    onChange={(e) => setPrivacyData({ ...privacyData, description: e.target.value })}
                    className="w-full p-4 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-secondary"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Otoritas / Author</label>
                    <input
                      type="text"
                      value={privacyData.author || ''}
                      onChange={(e) => setPrivacyData({ ...privacyData, author: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Kategori</label>
                    <input
                      type="text"
                      value={privacyData.category || ''}
                      onChange={(e) => setPrivacyData({ ...privacyData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">URL Gambar Banner</label>
                    <input
                      type="url"
                      value={privacyData.image_url || ''}
                      onChange={(e) => setPrivacyData({ ...privacyData, image_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-secondary text-white rounded-xl text-xs font-bold shadow-md hover:bg-secondary/90 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    Simpan Kebijakan & Privasi ke Database
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. MENU: KELOLA KERJA SAMA (INTEGRASI CANVA) */}
          {/* ======================================================== */}
          {activeMenu === 'partnerships' && partnershipData && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5 animate-in fade-in duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Kelola Kerja Sama & Integrasi Canva (Tabel partnerships)</h2>
                  <p className="text-xs text-slate-500">
                    Sajikan informasi komprehensif mengenai integrasi fitur desain Canva, sinkronisasi kalender, dan aset visual UMKM.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSavePartnership} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Judul Kemitraan</label>
                    <input
                      type="text"
                      required
                      value={partnershipData.title || ''}
                      onChange={(e) => setPartnershipData({ ...partnershipData, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-600 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Slug URL</label>
                    <input
                      type="text"
                      required
                      value={partnershipData.slug || ''}
                      onChange={(e) => setPartnershipData({ ...partnershipData, slug: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-600">
                    Isi Penjelasan Komprehensif (Integrasi Canva, Alur Desain, Otomasi Kalender)
                  </label>
                  <textarea
                    rows="14"
                    required
                    value={partnershipData.description || ''}
                    onChange={(e) => setPartnershipData({ ...partnershipData, description: e.target.value })}
                    className="w-full p-4 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-cyan-600"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Penanggung Jawab / Author</label>
                    <input
                      type="text"
                      value={partnershipData.author || ''}
                      onChange={(e) => setPartnershipData({ ...partnershipData, author: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Kategori</label>
                    <input
                      type="text"
                      value={partnershipData.category || ''}
                      onChange={(e) => setPartnershipData({ ...partnershipData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">URL Gambar Banner Canva</label>
                    <input
                      type="url"
                      value={partnershipData.image_url || ''}
                      onChange={(e) => setPartnershipData({ ...partnershipData, image_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md hover:bg-cyan-800 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    Simpan Konten Kerja Sama ke Database
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. MENU: KELOLA BLOG (CRUD ARTIKEL) */}
          {/* ======================================================== */}
          {activeMenu === 'blog' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Kelola Artikel Blog (Tabel articles)</h2>
                  <p className="text-xs text-slate-500">
                    Tambah artikel baru, upload gambar pendukung, kelola kategori, dan atur naskah edukasi UMKM.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenArticleModal()}
                  className="px-4 py-2.5 bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md hover:bg-purple-800 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">post_add</span>
                  + Tulis Artikel Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map((art) => (
                  <div key={art.id} className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="h-40 bg-slate-100 overflow-hidden relative">
                        {art.image_url ? (
                          <img src={art.image_url} alt={art.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <span className="material-symbols-outlined text-4xl">image</span>
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {art.category}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="font-extrabold text-sm text-slate-800 line-clamp-2">{art.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-3">{art.description}</p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-700">✍️ {art.author || 'Jerry Hernis'}</span>
                        <span className="text-[10px] text-slate-400">
                          {art.updated_at ? new Date(art.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} WIB
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenArticleModal(art)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id, art.title)}
                          className="text-red-600 hover:underline text-[10px] font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AUDIT TRAIL / LOG RIWAYAT PERUBAHAN ARTIKEL OLEH ADMIN */}
              <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">history_edu</span>
                      Riwayat Aktivitas & Audit Log Artikel (Catatan Semua Admin)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Seluruh pembaruan, penambahan, dan penghapusan artikel oleh Admin (Jerry Hernis, Fauzul Rozaq, Firman syah, Zico) otomatis tercatat permanen di database Neon.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full w-fit">
                    {articleLogs.length} Aktivitas Terekam
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Waktu (WIB)</th>
                        <th className="py-3 px-4">Nama Admin</th>
                        <th className="py-3 px-4">Aksi</th>
                        <th className="py-3 px-4">Judul Artikel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {articleLogs.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-slate-400">Belum ada riwayat aktivitas artikel.</td>
                        </tr>
                      ) : (
                        articleLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                              {log.created_at ? new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} WIB
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-extrabold">
                                  {log.admin_name ? log.admin_name.charAt(0).toUpperCase() : 'A'}
                                </span>
                                {log.admin_name || 'Admin'}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                                log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {log.action === 'CREATE' ? 'Tambah Baru' : log.action === 'UPDATE' ? 'Perbarui' : 'Hapus'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-700 font-medium max-w-xs truncate">
                              {log.article_title || `Artikel #${log.article_id}`}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 8. MENU: KELOLA ABOUT (PROFIL PERUSAHAAN) */}
          {/* ======================================================== */}
          {activeMenu === 'about' && aboutData && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5 animate-in fade-in duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Kelola Informasi Perusahaan (Tabel about_content)</h2>
                  <p className="text-xs text-slate-500">
                    Sunting naskah Visi, Misi, Masalah yang Dipecahkan (Consistency Gap), dan profil tim pengembang.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveAbout} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Headline Halaman About</label>
                    <input
                      type="text"
                      required
                      value={aboutData.title || ''}
                      onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Slug</label>
                    <input
                      type="text"
                      required
                      value={aboutData.slug || ''}
                      onChange={(e) => setAboutData({ ...aboutData, slug: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-600">
                    Uraian Profil Perusahaan, Visi, Misi & Solusi
                  </label>
                  <textarea
                    rows="12"
                    required
                    value={aboutData.description || ''}
                    onChange={(e) => setAboutData({ ...aboutData, description: e.target.value })}
                    className="w-full p-4 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-primary"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">URL Gambar Showcase Kantor</label>
                    <input
                      type="url"
                      value={aboutData.image_url || ''}
                      onChange={(e) => setAboutData({ ...aboutData, image_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-600">Author</label>
                    <input
                      type="text"
                      value={aboutData.author || ''}
                      onChange={(e) => setAboutData({ ...aboutData, author: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    Simpan Profil About ke Database
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* 9. MENU: PENGATURAN WEB (WEB SETTINGS - 3 BAGIAN UTAMA) */}
          {/* ======================================================== */}
          {activeMenu === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 3 Sub-Tabs Navigation */}
              <div className="flex gap-2 p-1.5 bg-slate-200/80 rounded-2xl w-fit">
                <button
                  onClick={() => setSettingsTab('general')}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                    settingsTab === 'general' ? 'bg-white shadow-xs text-primary' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">public</span>
                  General Settings
                </button>

                <button
                  onClick={() => setSettingsTab('email')}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                    settingsTab === 'email' ? 'bg-white shadow-xs text-primary' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">mail</span>
                  Email System (SMTP)
                </button>

                <button
                  onClick={() => setSettingsTab('payment')}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                    settingsTab === 'payment' ? 'bg-white shadow-xs text-primary' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                  Payment Gateway
                </button>
              </div>

              {/* TAB 1: GENERAL SETTINGS */}
              {settingsTab === 'general' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="font-extrabold text-base text-slate-800">Pengaturan Umum & Branding Website</h3>
                    <p className="text-xs text-slate-500">Konfigurasi Tagline, Logo, Favicon, dan Kontak Resmi ContentHub.</p>
                  </div>

                  <form onSubmit={handleSaveGeneralSettings} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-600">Tagline Website</label>
                      <input
                        type="text"
                        value={generalSettings.tagline}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, tagline: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-600">Deskripsi Web (SEO)</label>
                      <textarea
                        rows="2"
                        value={generalSettings.description}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, description: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-600">URL Logo Web</label>
                        <input
                          type="url"
                          value={generalSettings.logo_url}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, logo_url: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-600">URL Favicon</label>
                        <input
                          type="url"
                          value={generalSettings.favicon_url}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, favicon_url: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-600">Email Dukungan Resmi</label>
                        <input
                          type="email"
                          value={generalSettings.support_email}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, support_email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-600">WhatsApp / Call Center</label>
                        <input
                          type="text"
                          value={generalSettings.support_phone}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, support_phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-600">Alamat Kantor Resmi</label>
                      <input
                        type="text"
                        value={generalSettings.address}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">save</span>
                        Simpan Pengaturan Umum
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: EMAIL SYSTEM (SMTP CREDENTIALS & TEMPLATE EDITOR) */}
              {settingsTab === 'email' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                  <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-800">Konfigurasi SMTP & Email Template Editor</h3>
                      <p className="text-xs text-slate-500">
                        Atur kredensial pengiriman email via server SMTP dan sesuaikan kata-kata default template email.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveEmailSettings} className="space-y-6">
                    {/* Bagian 1: Kredensial SMTP */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                        1. Kredensial Server SMTP
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase text-slate-500">SMTP Host</label>
                          <input
                            type="text"
                            value={emailSettings.smtp_host}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                            placeholder="smtp.gmail.com"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase text-slate-500">SMTP Port</label>
                          <input
                            type="number"
                            value={emailSettings.smtp_port}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: parseInt(e.target.value, 10) })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                            placeholder="587"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase text-slate-500">Email Pengirim (From)</label>
                          <input
                            type="email"
                            value={emailSettings.smtp_from}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtp_from: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                            placeholder="no-reply@contenthub.id"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase text-slate-500">SMTP Username</label>
                          <input
                            type="text"
                            value={emailSettings.smtp_user}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtp_user: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                            placeholder="email.anda@gmail.com"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase text-slate-500">App Password / Auth Key</label>
                          <input
                            type="password"
                            value={emailSettings.smtp_pass}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtp_pass: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                            placeholder="App Password 16 karakter"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bagian 2: Email Template Editor */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-5">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                        2. Email Template Editor (Sesuaikan Kata-kata Default)
                      </span>

                      {/* Template 1: Welcome Email */}
                      <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                        <span className="text-xs font-extrabold text-primary">A. Welcome Email (Saat User Baru Daftar)</span>
                        <input
                          type="text"
                          value={emailSettings.templates?.welcome?.subject || ''}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              templates: {
                                ...emailSettings.templates,
                                welcome: { ...emailSettings.templates.welcome, subject: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                          placeholder="Subjek Welcome Email"
                        />
                        <textarea
                          rows="3"
                          value={emailSettings.templates?.welcome?.body || ''}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              templates: {
                                ...emailSettings.templates,
                                welcome: { ...emailSettings.templates.welcome, body: e.target.value },
                              },
                            })
                          }
                          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs leading-relaxed font-mono"
                        ></textarea>
                      </div>

                      {/* Template 2: Invoice Email */}
                      <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                        <span className="text-xs font-extrabold text-green-700">B. Invoice Email (Bukti Transaksi Pesanan)</span>
                        <input
                          type="text"
                          value={emailSettings.templates?.invoice?.subject || ''}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              templates: {
                                ...emailSettings.templates,
                                invoice: { ...emailSettings.templates.invoice, subject: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                          placeholder="Subjek Invoice Email"
                        />
                        <textarea
                          rows="3"
                          value={emailSettings.templates?.invoice?.body || ''}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              templates: {
                                ...emailSettings.templates,
                                invoice: { ...emailSettings.templates.invoice, body: e.target.value },
                              },
                            })
                          }
                          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs leading-relaxed font-mono"
                        ></textarea>
                      </div>

                      {/* Template 3: Reset Password Email */}
                      <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                        <span className="text-xs font-extrabold text-amber-700">C. Reset Password & Keamanan Email</span>
                        <input
                          type="text"
                          value={emailSettings.templates?.reset_password?.subject || ''}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              templates: {
                                ...emailSettings.templates,
                                reset_password: { ...emailSettings.templates.reset_password, subject: e.target.value },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                          placeholder="Subjek Reset Password Email"
                        />
                        <textarea
                          rows="3"
                          value={emailSettings.templates?.reset_password?.body || ''}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              templates: {
                                ...emailSettings.templates,
                                reset_password: { ...emailSettings.templates.reset_password, body: e.target.value },
                              },
                            })
                          }
                          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs leading-relaxed font-mono"
                        ></textarea>
                      </div>
                    </div>

                    {/* Uji Coba Pengiriman Email */}
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="space-y-0.5 text-xs text-purple-900 w-full sm:w-auto">
                        <p className="font-extrabold">Uji Coba Pengiriman Email SMTP:</p>
                        <p className="text-[11px] text-purple-700">Kirim email pengujian langsung ke alamat email Anda.</p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="email"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          placeholder="masukkan email test..."
                          className="px-3 py-2 bg-white rounded-xl border border-purple-200 text-xs flex-1 sm:w-56"
                        />
                        <button
                          type="button"
                          onClick={handleTestEmail}
                          className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold hover:bg-purple-800 transition-colors whitespace-nowrap"
                        >
                          Kirim Tes
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">save</span>
                        Simpan Konfigurasi SMTP & Template
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: PAYMENT GATEWAY & TRANSAKSI */}
              {settingsTab === 'payment' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="font-extrabold text-base text-slate-800">
                      Pengaturan Mode Pembayaran & Kredensial Payment Gateway
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pilih antara mode Sandbox (Pengujian) vs Production (Live) dan atur Server Key / Client Key Midtrans, Xendit, atau Tripay.
                    </p>
                  </div>

                  <form onSubmit={handleSavePaymentSettings} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-600">Mode Pembayaran Gateway</label>
                        <select
                          value={paymentSettings.mode}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, mode: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                        >
                          <option value="sandbox">Sandbox / Testing (Pengujian Transaksi)</option>
                          <option value="production">Production / Live (Transaksi Uang Asli)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-600">Provider Payment Gateway</label>
                        <select
                          value={paymentSettings.provider}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, provider: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                        >
                          <option value="Midtrans">Midtrans (Snap & Core API)</option>
                          <option value="Xendit">Xendit Invoice</option>
                          <option value="Tripay">Tripay Payment Gateway</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                        Kredensial API ({paymentSettings.provider})
                      </span>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-slate-500">Server Key (Secret Key)</label>
                        <input
                          type="password"
                          value={paymentSettings.server_key}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, server_key: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-mono"
                          placeholder="SB-Mid-server-..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-slate-500">Client Key (Public Key)</label>
                        <input
                          type="text"
                          value={paymentSettings.client_key}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, client_key: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-mono"
                          placeholder="SB-Mid-client-..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-slate-500">Merchant ID</label>
                        <input
                          type="text"
                          value={paymentSettings.merchant_id}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, merchant_id: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-mono"
                          placeholder="M10928374"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-green-700 text-white rounded-xl text-xs font-bold shadow-md hover:bg-green-800 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">save</span>
                        Simpan Kredensial Payment Gateway
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ======================================================== */}
      {/* MODAL USER FORM (TAMBAH / EDIT) */}
      {/* ======================================================== */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingUser ? `Edit Data User #${editingUser.id}` : 'Tambah Akun Pengguna Baru'}
              </h3>
              <button
                onClick={() => setUserModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Kata Sandi {editingUser && '(Kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary"
                  placeholder={editingUser ? '••••••••' : 'Password baru'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Role Akun</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="customer">Customer (Pelaku UMKM)</option>
                    <option value="admin">Administrator</option>
                    <option value="editor">Editor Konten</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Nama Usaha UMKM</label>
                  <input
                    type="text"
                    value={userForm.business_name}
                    onChange={(e) => setUserForm({ ...userForm, business_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Kategori Industri</label>
                  <input
                    type="text"
                    value={userForm.industry}
                    onChange={(e) => setUserForm({ ...userForm, industry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary/90"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL SUBSCRIPTION PLAN (TAMBAH / EDIT) */}
      {/* ======================================================== */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingPlan ? `Edit Paket #${editingPlan.sku}` : 'Tambah Tier Paket Subscription'}
              </h3>
              <button
                onClick={() => setPlanModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">SKU Paket (Unik)</label>
                  <input
                    type="text"
                    required
                    value={planForm.sku}
                    onChange={(e) => setPlanForm({ ...planForm, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    placeholder="CH-PRO-M"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Nama Paket</label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    placeholder="ContentHub Pro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    placeholder="98000"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Siklus Penagihan</label>
                  <select
                    value={planForm.billing_cycle}
                    onChange={(e) => setPlanForm({ ...planForm, billing_cycle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="Free">Free (Tanpa Biaya)</option>
                    <option value="Bulanan">Bulanan</option>
                    <option value="Tahunan">Tahunan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Deskripsi Paket</label>
                <textarea
                  rows="2"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Fitur (1 baris per fitur):</label>
                <textarea
                  rows="4"
                  value={planForm.featuresText}
                  onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]"
                  placeholder="Kalender Drag & Drop&#10;50+ Template Canva&#10;Customer Support WA"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Badge (Opsional)</label>
                  <input
                    type="text"
                    value={planForm.badge}
                    onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    placeholder="Paling Sesuai untuk UMKM"
                  />
                </div>

                <div className="flex items-center gap-4 pt-3">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planForm.is_hero}
                      onChange={(e) => setPlanForm({ ...planForm, is_hero: e.target.checked })}
                      className="rounded"
                    />
                    <span>Hero Product</span>
                  </label>

                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planForm.is_active}
                      onChange={(e) => setPlanForm({ ...planForm, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <span>Aktif</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary/90"
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL ARTIKEL BLOG (TAMBAH / EDIT) */}
      {/* ======================================================== */}
      {articleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingArticle ? 'Edit Artikel Blog' : 'Tulis Artikel Blog Baru'}
              </h3>
              <button
                onClick={() => setArticleModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Judul Artikel</label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Kategori</label>
                  <input
                    type="text"
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Penulis</label>
                  <input
                    type="text"
                    value={articleForm.author}
                    onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">URL Gambar Thumbnail</label>
                <input
                  type="url"
                  value={articleForm.image_url}
                  onChange={(e) => setArticleForm({ ...articleForm, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Isi Konten Artikel</label>
                <textarea
                  rows="6"
                  required
                  value={articleForm.description}
                  onChange={(e) => setArticleForm({ ...articleForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 leading-relaxed font-mono"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setArticleModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 text-white rounded-xl font-bold shadow-md hover:bg-purple-800"
                >
                  Terbitkan Artikel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
