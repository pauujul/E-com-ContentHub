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
  );
}
