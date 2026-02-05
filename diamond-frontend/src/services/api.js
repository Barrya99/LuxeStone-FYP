import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
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
  getAll: (params) => api.get('/favorites/', { params }),
  create: (data) => api.post('/favorites/', data),
  delete: (id) => api.delete(`/favorites/${id}/`),
  getMy: (userId) => api.get('/favorites/my_favorites/', { params: { user_id: userId } }),
};

export const reviewAPI = {
  getAll: (params) => api.get('/reviews/', { params }),
  create: (data) => api.post('/reviews/', data),
  getProductReviews: (params) => api.get('/reviews/product_reviews/', { params }),
  markHelpful: (id) => api.post(`/reviews/${id}/mark_helpful/`),
};

export const orderAPI = {
  getAll: (params) => api.get('/orders/', { params }),
  getById: (id) => api.get(`/orders/${id}/`),
  create: (data) => api.post('/orders/', data),
  getMy: (userId) => api.get('/orders/my_orders/', { params: { user_id: userId } }),
  updateStatus: (id, status) => api.patch(`/orders/${id}/update_status/`, { status }),
};

export const interactionAPI = {
  create: (data) => api.post('/interactions/', data),
  getSummary: (params) => api.get('/interactions/analytics_summary/', { params }),
};

export default api;