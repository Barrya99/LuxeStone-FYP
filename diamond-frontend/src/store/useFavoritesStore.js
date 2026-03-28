// diamond-frontend/src/store/useFavoritesStore.js
// Favorites are always stored server-side for authenticated users.
// Unauthenticated users see an empty list (no local-only favorites
// to avoid confusion when they later log in).

import { create } from 'zustand';
import { favoriteAPI } from '../services/api';

export const useFavoritesStore = create((set, get) => ({
  diamonds: [],
  settings: [],
  isLoading: false,
  error: null,

  // ── LOAD from server (called after login / on app boot) ──
  loadFavorites: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ diamonds: [], settings: [] });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await favoriteAPI.getMyFavorites();
      const data = res.data;
      if (data.success) {
        set({
          diamonds: (data.diamonds || []).map(f => f.diamond).filter(Boolean),
          settings: (data.settings || []).map(f => f.setting).filter(Boolean),
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false, error: data.error });
      }
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  // ── ADD DIAMOND ───────────────────────────────────────────
  addDiamond: async (diamond) => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, error: 'Please log in to save favorites' };

    // Optimistic update
    set(state => {
      const exists = state.diamonds.some(d => d.diamond_id === diamond.diamond_id);
      return { diamonds: exists ? state.diamonds : [...state.diamonds, diamond] };
    });

    try {
      const res = await favoriteAPI.addDiamond(diamond.diamond_id);
      if (!res.data.success) {
        // Rollback
        set(state => ({
          diamonds: state.diamonds.filter(d => d.diamond_id !== diamond.diamond_id),
        }));
        return { success: false, error: res.data.error };
      }
      return { success: true };
    } catch (err) {
      // Rollback
      set(state => ({
        diamonds: state.diamonds.filter(d => d.diamond_id !== diamond.diamond_id),
      }));
      return { success: false, error: err.response?.data?.error || err.message };
    }
  },

  // ── REMOVE DIAMOND ────────────────────────────────────────
  removeDiamond: async (diamondId) => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, error: 'Please log in' };

    // Optimistic update
    const prev = get().diamonds;
    set(state => ({ diamonds: state.diamonds.filter(d => d.diamond_id !== diamondId) }));

    try {
      const res = await favoriteAPI.removeDiamond(diamondId);
      if (!res.data.success) {
        set({ diamonds: prev }); // Rollback
        return { success: false, error: res.data.error };
      }
      return { success: true };
    } catch (err) {
      set({ diamonds: prev }); // Rollback
      return { success: false, error: err.response?.data?.error || err.message };
    }
  },

  // ── ADD SETTING ───────────────────────────────────────────
  addSetting: async (setting) => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, error: 'Please log in to save favorites' };

    set(state => {
      const exists = state.settings.some(s => s.setting_id === setting.setting_id);
      return { settings: exists ? state.settings : [...state.settings, setting] };
    });

    try {
      const res = await favoriteAPI.addSetting(setting.setting_id);
      if (!res.data.success) {
        set(state => ({
          settings: state.settings.filter(s => s.setting_id !== setting.setting_id),
        }));
        return { success: false, error: res.data.error };
      }
      return { success: true };
    } catch (err) {
      set(state => ({
        settings: state.settings.filter(s => s.setting_id !== setting.setting_id),
      }));
      return { success: false, error: err.response?.data?.error || err.message };
    }
  },

  // ── REMOVE SETTING ────────────────────────────────────────
  removeSetting: async (settingId) => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, error: 'Please log in' };

    const prev = get().settings;
    set(state => ({ settings: state.settings.filter(s => s.setting_id !== settingId) }));

    try {
      const res = await favoriteAPI.removeSetting(settingId);
      if (!res.data.success) {
        set({ settings: prev });
        return { success: false, error: res.data.error };
      }
      return { success: true };
    } catch (err) {
      set({ settings: prev });
      return { success: false, error: err.response?.data?.error || err.message };
    }
  },

  // ── HELPERS ───────────────────────────────────────────────
  isFavoriteDiamond: (diamondId) =>
    get().diamonds.some(d => d.diamond_id === diamondId),

  isFavoriteSetting: (settingId) =>
    get().settings.some(s => s.setting_id === settingId),

  // Legacy helper used in older components
  isFavorite: (id) => {
    const s = get();
    return s.diamonds.some(d => d.diamond_id === id) ||
           s.settings.some(s => s.setting_id === id);
  },

  // Legacy addFavorite used in older components
  addFavorite: async (item) => {
    if (item.type === 'diamond') {
      return get().addDiamond({ diamond_id: item.id || item.diamond_id, ...item });
    }
    if (item.type === 'setting') {
      return get().addSetting({ setting_id: item.id || item.setting_id, ...item });
    }
    return { success: false, error: 'Unknown item type' };
  },

  // Legacy removeFavorite used in older components
  removeFavorite: async (id) => {
    const s = get();
    if (s.diamonds.some(d => d.diamond_id === id)) return s.removeDiamond(id);
    if (s.settings.some(sv => sv.setting_id === id)) return s.removeSetting(id);
    return { success: false, error: 'Item not found in favorites' };
  },

  clearFavorites: () => set({ diamonds: [], settings: [], error: null }),
  clearError: () => set({ error: null }),
}));