// diamond-frontend/src/store/useUserStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const useUserStore = create(
  persist(
    (set, get) => ({
      // ============ STATE ============
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ============ LOGIN ============
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!data.success) {
            set({ error: data.error || 'Login failed', isLoading: false });
            return { success: false, error: data.error };
          }

          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store in localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          return { success: true };
        } catch (error) {
          const errorMsg = error.message || 'Login failed';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      // ============ REGISTER ============
      register: async (email, password, firstName, lastName, phone = '') => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
              first_name: firstName,
              last_name: lastName,
              phone,
            }),
          });

          const data = await response.json();

          if (!data.success) {
            set({ error: data.error || 'Registration failed', isLoading: false });
            return { success: false, error: data.error };
          }

          // Auto-login after registration
          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          return { success: true };
        } catch (error) {
          const errorMsg = error.message || 'Registration failed';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      // ============ LOGOUT ============
      logout: async () => {
        set({ isLoading: true });
        try {
          const token = get().token;

          if (token) {
            await fetch(`${API_BASE_URL}/auth/logout/`, {
              method: 'POST',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
            });
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch (error) {
          console.error('Logout error:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // ============ GET CURRENT USER ============
      getCurrentUser: async () => {
        try {
          const token = get().token;
          if (!token) return null;

          const response = await fetch(`${API_BASE_URL}/auth/me/`, {
            headers: { 'Authorization': `Token ${token}` },
          });

          const data = await response.json();

          if (data.success) {
            set({ user: data.user, isAuthenticated: true });
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
          } else {
            set({ token: null, user: null, isAuthenticated: false });
            localStorage.removeItem('token');
            return null;
          }
        } catch (error) {
          console.error('Get user error:', error);
          return null;
        }
      },

      // ============ UPDATE PROFILE ============
      updateProfile: async (firstName, lastName, phone = '') => {
        set({ isLoading: true, error: null });
        try {
          const token = get().token;

          const response = await fetch(`${API_BASE_URL}/auth/update_profile/`, {
            method: 'PUT',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              first_name: firstName,
              last_name: lastName,
              phone,
            }),
          });

          const data = await response.json();

          if (!data.success) {
            set({ error: data.error, isLoading: false });
            return { success: false, error: data.error };
          }

          set({
            user: data.user,
            isLoading: false,
            error: null,
          });

          localStorage.setItem('user', JSON.stringify(data.user));
          return { success: true };
        } catch (error) {
          const errorMsg = error.message || 'Update failed';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      // ============ CHANGE PASSWORD ============
      changePassword: async (oldPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          const token = get().token;

          const response = await fetch(`${API_BASE_URL}/auth/change_password/`, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              old_password: oldPassword,
              new_password: newPassword,
            }),
          });

          const data = await response.json();

          if (!data.success) {
            set({ error: data.error, isLoading: false });
            return { success: false, error: data.error };
          }

          set({ isLoading: false, error: null });
          return { success: true };
        } catch (error) {
          const errorMsg = error.message || 'Password change failed';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      // ============ CLEAR ERROR ============
      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);