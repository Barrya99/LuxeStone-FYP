import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — use "Token <key>" format (DRF TokenAuthentication)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const diamondAPI = {
  getAll: (params) => api.get('/diamonds/', { params }),
  getById: (id) => api.get(`/diamonds/${id}/`),
  getStatistics: () => api.get('/diamonds/statistics/'),
};

export const settingAPI = {
  getAll: (params) => api.get('/settings/', { params }),
  getById: (id) => api.get(`/settings/${id}/`),
};

export const configurationAPI = {
  getAll: (params) => api.get('/configurations/', { params }),
  getById: (id) => api.get(`/configurations/${id}/`),
  create: (data) => api.post('/configurations/', data),
  update: (id, data) => api.patch(`/configurations/${id}/`, data),
  delete: (id) => api.delete(`/configurations/${id}/`),
  getMy: (userId) => api.get('/configurations/my_configurations/', { params: { user_id: userId } }),
};

export const favoriteAPI = {
  // All favorite endpoints require auth token (set in interceptor above)
  getMyFavorites: () => api.get('/favorites/my_favorites/'),
  addDiamond: (diamondId) => api.post('/favorites/add_diamond/', { diamond_id: diamondId }),
  removeDiamond: (diamondId) => api.post('/favorites/remove_diamond/', { diamond_id: diamondId }),
  addSetting: (settingId) => api.post('/favorites/add_setting/', { setting_id: settingId }),
  removeSetting: (settingId) => api.post('/favorites/remove_setting/', { setting_id: settingId }),
  checkDiamond: (diamondId) => api.get('/favorites/check_diamond/', { params: { diamond_id: diamondId } }),
  checkSetting: (settingId) => api.get('/favorites/check_setting/', { params: { setting_id: settingId } }),
};

export const reviewAPI = {
  getAll: (params) => api.get('/reviews/', { params }),
  create: (data) => api.post('/reviews/', data),
  getProductReviews: (params) => api.get('/reviews/product_reviews/', { params }),
  markHelpful: (id) => api.post(`/reviews/${id}/mark_helpful/`),
};

export const orderAPI = {
  // Returns only the authenticated user's orders
  getMyOrders: () => api.get('/orders/my_orders/'),
  getById: (id) => api.get(`/orders/${id}/`),
  create: (data) => api.post('/orders/', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/update_status/`, { status }),
};

export const interactionAPI = {
  create: (data) => api.post('/interactions/', data),
  getSummary: (params) => api.get('/interactions/analytics_summary/', { params }),
};

export const pricingAPI = {
  calculateDiamondPrice: (diamondId) =>
    api.post('/pricing/calculate-diamond-price/', { diamond_id: diamondId }),
  calculateRingPrice: (diamondId, settingId, ringSize, customizations) =>
    api.post('/pricing/calculate-ring-price/', {
      diamond_id: diamondId,
      setting_id: settingId,
      ring_size: ringSize,
      customizations: customizations || {},
    }),
  getPriceBreakdown: (diamondId, settingId, ringSize) =>
    api.post('/pricing/get-price-breakdown/', {
      diamond_id: diamondId,
      setting_id: settingId,
      ring_size: ringSize,
    }),
};

export default api;