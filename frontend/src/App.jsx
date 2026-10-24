<<<<<<< HEAD
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import HelpCenterPage from './pages/HelpCenterPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import AgendaDetailPage from './pages/AgendaDetailPage';
import DragDropContentPage from './pages/DragDropContentPage';
import PickDatePage from './pages/PickDatePage';
import SetTimePage from './pages/SetTimePage';
import EditSchedulePage from './pages/EditSchedulePage';
import AddLabelPage from './pages/AddLabelPage';
import TemplatesPage from './pages/TemplatesPage';
import SearchTemplatePage from './pages/SearchTemplatePage';
import SearchResultsPage from './pages/SearchResultsPage';
import PreviewTemplatePage from './pages/PreviewTemplatePage';
import AddTemplatePage from './pages/AddTemplatePage';
import CanvaTransitionPage from './pages/CanvaTransitionPage';
import PaymentMethodPage from './pages/PaymentMethodPage';
import PaymentConfirmationPage from './pages/PaymentConfirmationPage';
import TransactionDetailPage from './pages/TransactionDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import SwitchAccountPage from './pages/SwitchAccountPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Role-based route guard for Admin
function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Public Marketing Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/help" element={<HelpCenterPage />} />

          {/* 2. Authentication & User Profile */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/switch-account" element={<SwitchAccountPage />} />

          {/* 3. Dashboard & Scheduling Calendar Suite */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/calendar/agenda" element={<AgendaDetailPage />} />
          <Route path="/calendar/agenda/:id" element={<AgendaDetailPage />} />
          <Route path="/calendar/drag-drop" element={<DragDropContentPage />} />
          <Route path="/calendar/pick-date" element={<PickDatePage />} />
          <Route path="/calendar/set-time" element={<SetTimePage />} />
          <Route path="/calendar/edit-schedule" element={<EditSchedulePage />} />
          <Route path="/calendar/add-label" element={<AddLabelPage />} />

          {/* 4. Templates & Canva Integration Suite */}
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/search" element={<SearchTemplatePage />} />
          <Route path="/templates/results" element={<SearchResultsPage />} />
          <Route path="/templates/preview" element={<PreviewTemplatePage />} />
          <Route path="/templates/preview/:id" element={<PreviewTemplatePage />} />
          <Route path="/templates/add" element={<AddTemplatePage />} />
          <Route path="/templates/canva-transition" element={<CanvaTransitionPage />} />

          {/* 5. Checkout, Payments & Transactions Suite */}
          <Route path="/checkout" element={<PaymentMethodPage />} />
          <Route path="/checkout/:planId" element={<PaymentMethodPage />} />
          <Route path="/payment-confirmation" element={<PaymentConfirmationPage />} />
          <Route path="/payment-confirmation/:orderNumber" element={<PaymentConfirmationPage />} />
          <Route path="/transactions" element={<TransactionDetailPage />} />
          <Route path="/transactions/:orderNumber" element={<TransactionDetailPage />} />

          {/* 6. Admin Panel (Role-Protected) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
=======

import React, { useState, useEffect } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import Pricing from "./components/Pricing";
import CalendarPreview from "./components/CalendarPreview";
import OrderHistory from "./components/OrderHistory";

import "./App.css";

const API_URL = "http://localhost:5000/api/orders";

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(Number(value) || 0);

function MetricCard({ label, value, description, icon, accent }) {
  return (
    <article className={`metric-card metric-${accent}`}>
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <span className="metric-icon" aria-hidden="true">
          {icon}
        </span>
      </div>

      <div className="metric-value">{value}</div>
      <p className="metric-description">{description}</p>
    </article>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "Pending").toLowerCase();

  const statusClass =
    normalizedStatus === "paid"
      ? "status-paid"
      : normalizedStatus === "pending"
        ? "status-pending"
        : normalizedStatus === "cancelled" ||
            normalizedStatus === "canceled" ||
            normalizedStatus === "failed"
          ? "status-failed"
          : "status-default";

  return (
    <span className={`status-badge ${statusClass}`}>
      <span className="status-dot" />
      {status || "Pending"}
    </span>
  );
}

function AdminDashboard({ stats, loading, error }) {
  return (
    <section className="dashboard">
      <header className="dashboard-header">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            CONTENTHUB OVERVIEW
          </div>

          <h1>Dashboard Manajemen</h1>

          <p className="dashboard-subtitle">
            Pantau pendapatan langganan, transaksi UMKM, dan performa
            platform ContentHub dalam satu tempat.
          </p>
        </div>

        <div className="dashboard-date">
          <span className="date-icon">◷</span>
          <div>
            <span className="date-label">Periode pemantauan</span>
            <strong>Semua transaksi</strong>
          </div>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">!</span>
          <div>
            <strong>Data belum dapat dimuat</strong>
            <p>{error}</p>
            <small>
              Pastikan backend berjalan dan endpoint API dapat diakses.
            </small>
          </div>
        </div>
      )}

      <div className="section-heading">
        <div>
          <h2>Ringkasan bisnis</h2>
          <p>Metrik utama dari data transaksi yang diterima.</p>
        </div>

        <span className="live-indicator">
          <span className="live-dot" />
          {loading ? "Memuat data" : "Ringkasan data"}
        </span>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label="Pendapatan terbayar"
          value={loading ? "Memuat..." : formatRupiah(stats.totalRevenue)}
          description="Akumulasi pesanan berstatus Paid"
          icon="↗"
          accent="green"
        />

        <MetricCard
          label="Total transaksi"
          value={loading ? "..." : formatNumber(stats.totalOrders)}
          description="Seluruh pesanan yang tercatat"
          icon="▤"
          accent="blue"
        />

        <MetricCard
          label="Pesanan terbayar"
          value={loading ? "..." : formatNumber(stats.paidOrders)}
          description="Transaksi dengan status Paid"
          icon="✓"
          accent="purple"
        />
      </div>

      <section className="panel infrastructure-panel">
        <div className="infrastructure-icon">▦</div>

        <div className="infrastructure-copy">
          <h3>Infrastruktur aplikasi</h3>
          <p>
            Informasi koneksi database dan layanan backend.
          </p>
        </div>

        <span className="infrastructure-status">
          <span className="live-dot" />
          Status tampilan: aktif
        </span>
      </section>

      <section className="panel transactions-panel">
        <div className="panel-header">
          <div>
            <h2>Transaksi langganan terbaru</h2>
            <p>
              Pantau paket SaaS, nilai pembayaran, dan status setiap pesanan.
            </p>
          </div>

          <span className="record-count">
            {formatNumber(stats.orders.length)} pesanan
          </span>
        </div>

        {loading ? (
          <div className="table-state">
            <div className="spinner" />
            <p>Memuat data transaksi...</p>
          </div>
        ) : stats.orders.length === 0 ? (
          <div className="table-state empty-state">
            <span className="empty-icon">▤</span>
            <h3>Belum ada transaksi</h3>
            <p>Data pesanan akan ditampilkan di sini setelah tersedia.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>No. Pesanan</th>
                  <th>Customer / UMKM</th>
                  <th>Paket SaaS</th>
                  <th>Total pembayaran</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {stats.orders.map((order, index) => (
                  <tr
                    key={order.id ?? order.order_number ?? index}
                  >
                    <td>
                      <span className="order-number">
                        {order.order_number || "—"}
                      </span>
                    </td>

                    <td>
                      <div className="customer-cell">
                        <span className="customer-avatar">
                          {String(order.customer_name || "U")
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <div className="customer-details">
                          <strong>
                            {order.customer_name || "Nama tidak tersedia"}
                          </strong>
                          <span>{order.customer_email || "—"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="plan-name">
                        {order.plan_name || "—"}
                      </span>
                    </td>

                    <td className="amount-cell">
                      {formatRupiah(order.total_amount)}
                    </td>

                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="table-footer">
          <span>
            Menampilkan {formatNumber(stats.orders.length)} pesanan
          </span>
          <span>ContentHub Admin</span>
        </footer>
      </section>
    </section>
  );
}

export default function App() {
  const [currentRole, setCurrentRole] = useState("customer");
  const [activeTab, setActiveTab] = useState("pricing");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [adminStats, setAdminStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    orders: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOrderCreated = () => {
    setRefreshTrigger((previous) => previous + 1);
  };

  useEffect(() => {
    if (currentRole !== "admin") return;

    const controller = new AbortController();

    async function fetchOrders() {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(API_URL, {
          signal: controller.signal,
        });

        const orders = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const paidOrders = orders.filter(
          (order) =>
            String(order.status || "").toLowerCase() === "paid"
        );

        const totalRevenue = paidOrders.reduce(
          (total, order) =>
            total + (Number(order.total_amount) || 0),
          0
        );

        setAdminStats({
          totalRevenue,
          totalOrders: orders.length,
          paidOrders: paidOrders.length,
          orders,
        });
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;

        console.error("Gagal mengambil data pesanan:", err);

        setError(
          err.response
            ? `Server merespons dengan status ${err.response.status}.`
            : "Tidak dapat terhubung ke server API."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => controller.abort();
  }, [currentRole, refreshTrigger]);

  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
      />

      <main className="app-main">
        {currentRole === "customer" && (
          <div className="customer-content">
            {activeTab === "pricing" && (
              <Pricing onOrderCreated={handleOrderCreated} />
            )}

            {activeTab === "calendar" && <CalendarPreview />}

            {activeTab === "orders" && (
              <OrderHistory refreshKey={refreshTrigger} />
            )}
          </div>
        )}

        {currentRole === "admin" && (
          <div className="admin-content">
            {activeTab === "admin_dashboard" && (
              <AdminDashboard
                stats={adminStats}
                loading={loading}
                error={error}
              />
            )}

            {activeTab === "admin_orders" && (
              <OrderHistory refreshKey={refreshTrigger} />
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <span>© {new Date().getFullYear()} ContentHub</span>
        <span>Platform manajemen konten untuk UMKM</span>
      </footer>
    </div>
>>>>>>> e2e81f391c4379bdef82cb04f6e1e391fed0e7bc
  );
}
