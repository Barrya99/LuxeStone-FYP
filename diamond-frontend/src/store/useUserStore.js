// diamond-frontend/src/store/useUserStore.js
// Single source of truth for authentication. Uses the real backend API.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── LOGIN ──────────────────────────────────────────────
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

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return { success: true };
        } catch (error) {
          const msg = error.message || 'Login failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      // ── REGISTER ──────────────────────────────────────────
      register: async (email, password, firstName, lastName = '', phone = '') => {
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

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return { success: true };
        } catch (error) {
          const msg = error.message || 'Registration failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      // ── LOGOUT ────────────────────────────────────────────
      logout: async () => {
        const token = get().token;
        // Best-effort server-side logout
        if (token) {
          try {
            await fetch(`${API_BASE_URL}/auth/logout/`, {
              method: 'POST',
              headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json',
              },
            });
          } catch (_) {}
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      // ── GET CURRENT USER (called on app boot) ─────────────
      getCurrentUser: async () => {
        const token = get().token;
        if (!token) return null;
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me/`, {
            headers: { Authorization: `Token ${token}` },
          });
          const data = await response.json();
          if (data.success) {
            set({ user: data.user, isAuthenticated: true });
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
          } else {
            // Token invalid — clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ token: null, user: null, isAuthenticated: false });
            return null;
          }
        } catch (_) {
          return null;
        }
      },

      // ── UPDATE PROFILE ────────────────────────────────────
      updateProfile: async (firstName, lastName, phone = '') => {
        set({ isLoading: true, error: null });
        try {
          const token = get().token;
          const response = await fetch(`${API_BASE_URL}/auth/update_profile/`, {
            method: 'PUT',
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ first_name: firstName, last_name: lastName, phone }),
          });
          const data = await response.json();
          if (!data.success) {
            set({ error: data.error, isLoading: false });
            return { success: false, error: data.error };
          }
          set({ user: data.user, isLoading: false, error: null });
          localStorage.setItem('user', JSON.stringify(data.user));
          return { success: true };
        } catch (error) {
          const msg = error.message || 'Update failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      // ── CHANGE PASSWORD ───────────────────────────────────
      changePassword: async (oldPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          const token = get().token;
          const response = await fetch(`${API_BASE_URL}/auth/change_password/`, {
            method: 'POST',
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
          });
          const data = await response.json();
          if (!data.success) {
            set({ error: data.error, isLoading: false });
            return { success: false, error: data.error };
          }
          set({ isLoading: false, error: null });
          return { success: true };
        } catch (error) {
          const msg = error.message || 'Password change failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

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