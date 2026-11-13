import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UpgradeModalProvider } from './context/UpgradeModalContext';
import { ScheduleProvider } from './context/ScheduleContext';
import CartDrawer from './components/CartDrawer';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import HelpCenterPage from './pages/HelpCenterPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import PartnershipPage from './pages/PartnershipPage';
import BlogPage from './pages/BlogPage';
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

// Route guard for authenticated users (Customer & Admin)
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    if (localStorage.getItem('contenthub_logged_out') === 'true') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Role-based route guard for Admin
function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    if (localStorage.getItem('contenthub_logged_out') === 'true') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UpgradeModalProvider>
          <ScheduleProvider>
            <CartProvider>
              <CartDrawer />
              <Routes>
                {/* 1. Public Marketing Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/help" element={<HelpCenterPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/syarat-ketentuan" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/kebijakan-privasi" element={<PrivacyPage />} />
                <Route path="/partnership" element={<PartnershipPage />} />
                <Route path="/kerja-sama" element={<PartnershipPage />} />
                <Route path="/blog" element={<BlogPage />} />

                {/* 2. Authentication & User Profile */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/switch-account"
                  element={
                    <ProtectedRoute>
                      <SwitchAccountPage />
                    </ProtectedRoute>
                  }
                />

                {/* 3. Dashboard & Scheduling Calendar Suite */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <CalendarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar/agenda"
                  element={
                    <ProtectedRoute>
                      <AgendaDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar/agenda/:id"
                  element={
                    <ProtectedRoute>
                      <AgendaDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar/drag-drop"
                  element={
                    <ProtectedRoute>
                      <DragDropContentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar/pick-date"
                  element={
                    <ProtectedRoute>
                      <PickDatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar/set-time"
                  element={
                    <ProtectedRoute>
                      <SetTimePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar/edit-schedule"
                  element={
                    <ProtectedRoute>
                      <EditSchedulePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar/add-label"
                  element={
                    <ProtectedRoute>
                      <AddLabelPage />
                    </ProtectedRoute>
                  }
                />

                {/* 4. Templates & Canva Integration Suite */}
                <Route
                  path="/templates"
                  element={
                    <ProtectedRoute>
                      <TemplatesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates/search"
                  element={
                    <ProtectedRoute>
                      <SearchTemplatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates/results"
                  element={
                    <ProtectedRoute>
                      <SearchResultsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates/preview"
                  element={
                    <ProtectedRoute>
                      <PreviewTemplatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates/preview/:id"
                  element={
                    <ProtectedRoute>
                      <PreviewTemplatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates/add"
                  element={
                    <ProtectedRoute>
                      <AddTemplatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates/canva-transition"
                  element={
                    <ProtectedRoute>
                      <CanvaTransitionPage />
                    </ProtectedRoute>
                  }
                />

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
            </CartProvider>
          </ScheduleProvider>
        </UpgradeModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
