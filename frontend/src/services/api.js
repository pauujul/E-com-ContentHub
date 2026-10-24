import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk inject token jika ada di localStorage
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('contenthub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // LocalStorage mungkin tidak tersedia di environment tertentu
  }
  return config;
});

export const api = {
  // 1. Auth & Users
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getUsers: async () => {
    const res = await apiClient.get('/auth/users');
    return res.data;
  },
  getMe: async (id) => {
    const res = await apiClient.get(`/auth/me${id ? `?id=${id}` : ''}`);
    return res.data;
  },

  // 2. Subscription Plans / Products
  getProducts: async () => {
    const res = await apiClient.get('/products');
    return res.data;
  },

  // 3. Orders & Transactions
  createOrder: async (orderData) => {
    const res = await apiClient.post('/orders', orderData);
    return res.data;
  },
  getOrders: async (userId) => {
    const res = await apiClient.get(`/orders${userId ? `?user_id=${userId}` : ''}`);
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data;
  },
  updateOrderStatus: async (id, status) => {
    const res = await apiClient.patch(`/orders/${id}/status`, { status });
    return res.data;
  },

  // 4. Admin
  getAdminStats: async () => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  }
};

export default api;
