import axios from 'axios';

// Default URL: fallback port support between 5000 and 5001
const DEFAULT_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: DEFAULT_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to inject token from localStorage
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('contenthub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

// Fallback interceptor: if 5001 fails or 5000 fails, try the alternative port
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      originalRequest._retry = true;
      if (originalRequest.baseURL && originalRequest.baseURL.includes(':5001')) {
        originalRequest.baseURL = originalRequest.baseURL.replace(':5001', ':5000');
        return apiClient(originalRequest);
      } else if (originalRequest.baseURL && originalRequest.baseURL.includes(':5000')) {
        originalRequest.baseURL = originalRequest.baseURL.replace(':5000', ':5001');
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // ==========================================
  // 1. AUTHENTICATION & USER MANAGEMENT
  // ==========================================
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },

  getMe: async (id) => {
    const res = await apiClient.get(`/auth/me${id ? `?id=${id}` : ''}`);
    return res.data;
  },

  getUsers: async () => {
    const res = await apiClient.get('/auth/users');
    return res.data;
  },

  createUser: async (userData) => {
    const res = await apiClient.post('/auth/users', userData);
    return res.data;
  },

  updateUser: async (id, userData) => {
    const res = await apiClient.put(`/auth/users/${id}`, userData);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await apiClient.delete(`/auth/users/${id}`);
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await apiClient.put('/auth/profile', profileData);
    return res.data;
  },

  changeEmail: async (data) => {
    const res = await apiClient.put('/auth/change-email', data);
    return res.data;
  },

  changePassword: async (data) => {
    const res = await apiClient.put('/auth/change-password', data);
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data) => {
    const res = await apiClient.post('/auth/reset-password', data);
    return res.data;
  },

  // ==========================================
  // 2. SUBSCRIPTION PLANS & CATALOG (CRUD)
  // ==========================================
  getProducts: async (all = false) => {
    const res = await apiClient.get(`/products${all ? '?all=true' : ''}`);
    return res.data;
  },

  createProduct: async (productData) => {
    const res = await apiClient.post('/products', productData);
    return res.data;
  },

  updateProduct: async (id, productData) => {
    const res = await apiClient.put(`/products/${id}`, productData);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },

  // ==========================================
  // 3. ORDERS & TRANSACTIONS
  // ==========================================
  createOrder: async (orderData) => {
    const res = await apiClient.post('/orders', orderData);
    return res.data;
  },

  getOrders: async (userId) => {
    const validId = userId && userId !== 'undefined' && userId !== 'null' ? `?user_id=${userId}` : '';
    const res = await apiClient.get(`/orders${validId}`);
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

  // ==========================================
  // 4. CONTENT POSTS (CALENDAR & KANBAN PLANNER)
  // Sinkronisasi permanen ke PostgreSQL / Neon
  // ==========================================
  getPosts: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== 'undefined') {
        cleanParams[k] = params[k];
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    const res = await apiClient.get(`/posts${query ? `?${query}` : ''}`);
    return res.data;
  },

  getPostById: async (id) => {
    const res = await apiClient.get(`/posts/${id}`);
    return res.data;
  },

  createPost: async (postData) => {
    const res = await apiClient.post('/posts', postData);
    return res.data;
  },

  updatePost: async (id, postData) => {
    const res = await apiClient.put(`/posts/${id}`, postData);
    return res.data;
  },

  updatePostStage: async (id, stage, order_position) => {
    const res = await apiClient.patch(`/posts/${id}/stage`, { stage, order_position });
    return res.data;
  },

  deletePost: async (id) => {
    const res = await apiClient.delete(`/posts/${id}`);
    return res.data;
  },

  // ==========================================
  // 4B. SCHEDULES & USER TIER (SYNC DENGAN NEON)
  // ==========================================
  getSchedules: async (userId) => {
    const validId = userId && userId !== 'undefined' && userId !== 'null' ? `?user_id=${userId}` : '';
    const res = await apiClient.get(`/schedules${validId}`);
    return res.data;
  },

  getScheduleById: async (id) => {
    const res = await apiClient.get(`/schedules/${id}`);
    return res.data;
  },

  createSchedule: async (scheduleData) => {
    const res = await apiClient.post('/schedules', scheduleData);
    return res.data;
  },

  updateSchedule: async (id, scheduleData) => {
    const res = await apiClient.put(`/schedules/${id}`, scheduleData);
    return res.data;
  },

  updateScheduleItem: async (id, patchData) => {
    const res = await apiClient.patch(`/schedules/${id}`, patchData);
    return res.data;
  },

  deleteSchedule: async (id) => {
    const res = await apiClient.delete(`/schedules/${id}`);
    return res.data;
  },

  getUserTier: async (userId) => {
    const validId = userId ? `?user_id=${userId}` : '';
    const res = await apiClient.get(`/auth/user-tier${validId}`);
    return res.data;
  },

  // ==========================================
  // 5. UNIVERSAL CONTENT & STATIC PAGES (CRUD)
  // Terms, Privacy, Partnerships (Canva), Articles, About
  // ==========================================
  getContent: async (contentType) => {
    const res = await apiClient.get(`/content/${contentType}`);
    return res.data;
  },

  getContentItem: async (contentType, slugOrId) => {
    const res = await apiClient.get(`/content/${contentType}/${slugOrId}`);
    return res.data;
  },

  createContent: async (contentType, data) => {
    const res = await apiClient.post(`/content/${contentType}`, data);
    return res.data;
  },

  updateContent: async (contentType, id, data) => {
    const res = await apiClient.put(`/content/${contentType}/${id}`, data);
    return res.data;
  },

  deleteContent: async (contentType, id) => {
    const res = await apiClient.delete(`/content/${contentType}/${id}`);
    return res.data;
  },

  // ==========================================
  // 6. WEB SETTINGS & EMAIL SYSTEM
  // ==========================================
  getSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data;
  },

  updateGeneralSettings: async (settings) => {
    const res = await apiClient.put('/settings/general', settings);
    return res.data;
  },

  updateEmailSettings: async (settings) => {
    const res = await apiClient.put('/settings/email', settings);
    return res.data;
  },

  testEmail: async (testEmail) => {
    const res = await apiClient.post('/settings/email/test', { test_email: testEmail });
    return res.data;
  },

  updatePaymentSettings: async (settings) => {
    const res = await apiClient.put('/settings/payment-gateway', settings);
    return res.data;
  },

  // ==========================================
  // 7. FILE & IMAGE UPLOAD
  // ==========================================
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // ==========================================
  // 8. ADMIN STATS & AUDIT LOGS
  // ==========================================
  getAdminStats: async () => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },

  getArticleLogs: async () => {
    const res = await apiClient.get('/article-logs');
    return res.data;
  },
};

export default api;
