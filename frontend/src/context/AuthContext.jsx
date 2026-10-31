import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('contenthub_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Gagal membaca sesi user dari localStorage:', e);
    }
    // Default awal: Persona UMKM Muhammad Hasran
    return {
      id: 2,
      name: 'Muhammad Hasran',
      email: 'hasran.donat@gmail.com',
      role: 'customer',
      phone: '085299887766',
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
      localStorage.setItem('contenthub_token', response.data.token);
      localStorage.setItem('contenthub_user', JSON.stringify(response.data.user));
      setCurrentUser(response.data.user);
      setToken(response.data.token);
    }

    return response;
  };

  const switchUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('contenthub_user', JSON.stringify(user));
  };

  const logout = () => {
    localStorage.removeItem('contenthub_user');
    localStorage.removeItem('contenthub_token');
    setCurrentUser(null);
    setToken(null);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        allUsers,
        isAdmin,
        login,
        register,
        switchUser,
        logout,
        setCurrentUser,
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
