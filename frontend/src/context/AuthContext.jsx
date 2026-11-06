import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const isExplicitlyLoggedOut = localStorage.getItem('contenthub_logged_out');
      if (isExplicitlyLoggedOut === 'true') {
        return null;
      }
      const saved = localStorage.getItem('contenthub_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Gagal membaca sesi user dari localStorage:', e);
    }
    // Default awal: Sesi pengguna default (Firman syah)
    return {
      id: 8,
      name: 'Firman syah',
      email: 'firmansyah.mks2006@gmail.com',
      role: 'admin',
      phone: '081234567899',
      business_name: 'ContentHub HQ',
      industry: 'Technology SaaS',
    };
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('contenthub_token') || null;
    } catch (e) {
      return null;
    }
  });

  const [allUsers, setAllUsers] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(() => {
    try {
      const savedUser = localStorage.getItem('contenthub_user');
      const uid = savedUser ? JSON.parse(savedUser)?.id : 8;
      const cached = localStorage.getItem(`contenthub_sub_${uid}`);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return {
      plan_id: 2,
      plan_name: 'ContentHub Starter',
      billing_cycle: 'Bulanan',
      status: 'Paid',
      status_label: 'Aktif',
      is_active: true,
    };
  });
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  // Fungsi sinkronisasi status paket keanggotaan subscription secara realtime
  const refreshSubscription = async (userId = currentUser?.id) => {
    if (!userId) {
      setActiveSubscription(null);
      return null;
    }
    setLoadingSubscription(true);
    try {
      const res = await api.getOrders(userId);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        // Cari order Paid paling baru
        const paidOrder = res.data.find((o) => o.status === 'Paid');
        if (paidOrder) {
          const sub = {
            id: paidOrder.id,
            order_number: paidOrder.order_number,
            plan_id: paidOrder.plan_id,
            plan_name: paidOrder.plan_name || 'ContentHub Starter',
            billing_cycle: paidOrder.billing_cycle || 'Bulanan',
            status: 'Paid',
            status_label: 'Aktif',
            total_amount: paidOrder.total_amount,
            paid_at: paidOrder.paid_at || paidOrder.created_at,
            created_at: paidOrder.created_at,
            payment_channel: paidOrder.payment_channel || 'Virtual Account',
            is_active: true,
            is_free: false,
          };
          setActiveSubscription(sub);
          localStorage.setItem(`contenthub_sub_${userId}`, JSON.stringify(sub));
          return sub;
        }

        // Jika belum ada Paid, cek order Pending
        const pendingOrder = res.data.find((o) => o.status === 'Pending');
        if (pendingOrder) {
          const sub = {
            id: pendingOrder.id,
            order_number: pendingOrder.order_number,
            plan_id: pendingOrder.plan_id,
            plan_name: pendingOrder.plan_name || 'ContentHub Starter',
            billing_cycle: pendingOrder.billing_cycle || 'Bulanan',
            status: 'Pending',
            status_label: 'Menunggu Pembayaran',
            total_amount: pendingOrder.total_amount,
            created_at: pendingOrder.created_at,
            payment_channel: pendingOrder.payment_channel || 'Virtual Account',
            is_active: false,
            is_free: false,
          };
          setActiveSubscription(sub);
          localStorage.setItem(`contenthub_sub_${userId}`, JSON.stringify(sub));
          return sub;
        }
      }

      // Default jika belum pernah bertransaksi
      const freeSub = {
        plan_id: 1,
        plan_name: 'ContentHub Starter Trial',
        billing_cycle: 'Free',
        status: 'Free',
        status_label: 'Gratis',
        is_active: false,
        is_free: true,
      };
      setActiveSubscription(freeSub);
      localStorage.setItem(`contenthub_sub_${userId}`, JSON.stringify(freeSub));
      return freeSub;
    } catch (err) {
      console.warn('Gagal memuat status langganan dari API:', err.message);
      try {
        const cached = localStorage.getItem(`contenthub_sub_${userId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setActiveSubscription(parsed);
          return parsed;
        }
      } catch (e) {}
      return null;
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Muat status langganan saat currentUser berubah
  useEffect(() => {
    if (currentUser?.id) {
      try {
        const cached = localStorage.getItem(`contenthub_sub_${currentUser.id}`);
        if (cached) setActiveSubscription(JSON.parse(cached));
      } catch (e) {}
      refreshSubscription(currentUser.id);
    } else {
      setActiveSubscription(null);
    }
  }, [currentUser?.id]);

  // Muat daftar pengguna untuk switcher
  useEffect(() => {
    api
      .getUsers()
      .then((res) => {
        if (res.success && res.data) {
          setAllUsers(res.data);
        }
      })
      .catch((err) => console.warn('Could not load users for switcher:', err.message));
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.data) {
      localStorage.removeItem('contenthub_logged_out');
      setCurrentUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('contenthub_user', JSON.stringify(res.data.user));
      localStorage.setItem('contenthub_token', res.data.token);
      return res.data;
    }
    throw new Error(res.message || 'Login gagal');
  };

  const register = async (userData) => {
    // Pastikan seluruh objek userData (termasuk business_name & industry) dikirim ke api.register
    console.log('Data yang masuk ke AuthContext:', userData);

    const response = await api.register(userData);

    if (response.data && response.data.token) {
      localStorage.removeItem('contenthub_logged_out');
      localStorage.setItem('contenthub_token', response.data.token);
      localStorage.setItem('contenthub_user', JSON.stringify(response.data.user));
      setCurrentUser(response.data.user);
      setToken(response.data.token);
    }

    return response;
  };

  const switchUser = (user) => {
    localStorage.removeItem('contenthub_logged_out');
    setCurrentUser(user);
    localStorage.setItem('contenthub_user', JSON.stringify(user));
  };

  const logout = () => {
    localStorage.removeItem('contenthub_user');
    localStorage.removeItem('contenthub_token');
    localStorage.setItem('contenthub_logged_out', 'true');
    setCurrentUser(null);
    setToken(null);
  };

  const updateCurrentUser = (updatedFields) => {
    setCurrentUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('contenthub_user', JSON.stringify(merged));
      return merged;
    });
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        allUsers,
        isAdmin,
        activeSubscription,
        loadingSubscription,
        refreshSubscription,
        login,
        register,
        switchUser,
        logout,
        setCurrentUser,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
