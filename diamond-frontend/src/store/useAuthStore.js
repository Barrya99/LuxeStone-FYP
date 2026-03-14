// diamond-frontend/src/store/useAuthStore.js - UPDATED

import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  loading: false,
  error: null,

  // Login user
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // In production, this would call your backend API
      // For now, using mock authentication
      
      // Mock API call - replace with real API when backend is ready
      const response = {
        data: {
          user: {
            id: Math.random(),
            email,
            name: email.split('@')[0],
          },
          token: `token_${Date.now()}`,
        }
      };

      // Save token to localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({
        error: errorMessage,
        loading: false,
      });
      throw error;
    }
  },

  // Register user
  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      // Mock API call - replace with real API when backend is ready
      const response = {
        data: {
          user: {
            id: Math.random(),
            email,
            name,
          },
          token: `token_${Date.now()}`,
        }
      };

      // Save token to localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      set({
        error: errorMessage,
        loading: false,
      });
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // Initialize auth (check if user is already logged in)
  initializeAuth: () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          token,
          user,
          isAuthenticated: true,
        });
      } catch (e) {
        // Invalid user data, clear auth
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  },

  // Check if user is logged in
  checkAuth: () => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),
}));