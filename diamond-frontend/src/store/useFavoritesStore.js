// diamond-frontend/src/store/useFavoritesStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      // ============ STATE ============
      diamonds: [],        // Array of favorited diamonds
      settings: [],        // Array of favorited settings
      isLoading: false,
      error: null,

      // ============ LOAD FAVORITES FROM DATABASE ============
      loadFavorites: async (token) => {
        if (!token) {
          set({ diamonds: [], settings: [] });
          return;
        }


        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/favorites/my_favorites/`, {
            headers: { 'Authorization': `Token ${token}` },
          });

          const data = await response.json();

          if (data.success) {
            const diamondItems = data.diamonds || [];
            const settingItems = data.settings || [];

            set({
              diamonds: diamondItems.map(fav => fav.diamond || fav),
              settings: settingItems.map(fav => fav.setting || fav),
              isLoading: false,
              error: null,
            });
          } else {
            set({ error: data.error, isLoading: false });
          }
        } catch (error) {
          console.error('Load favorites error:', error);
          set({ isLoading: false, error: error.message });
        }
      },

      // ============ ADD DIAMOND TO FAVORITES ============
      addDiamond: async (diamond, token) => {
        if (!token) {
          // Fallback: save locally if not authenticated
          set((state) => {
            const exists = state.diamonds.some(d => d.diamond_id === diamond.diamond_id);
            return {
              diamonds: exists ? state.diamonds : [...state.diamonds, diamond],
            };
          });
          return { success: true, message: 'Saved locally (login to sync)' };
        }

        try {
          const response = await fetch(`${API_BASE_URL}/favorites/add_diamond/`, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ diamond_id: diamond.diamond_id }),
          });

          const data = await response.json();

          if (data.success) {
            set((state) => {
              const exists = state.diamonds.some(d => d.diamond_id === diamond.diamond_id);
              return {
                diamonds: exists ? state.diamonds : [...state.diamonds, diamond],
              };
            });
            return { success: true };
          } else {
            return { success: false, error: data.error };
          }
        } catch (error) {
          console.error('Add diamond error:', error);
          return { success: false, error: error.message };
        }
      },
      
      // ============ REMOVE DIAMOND FROM FAVORITES ============
      removeDiamond: async (diamondId, token) => {
        // Remove from state immediately (optimistic)
        set((state) => ({
          diamonds: state.diamonds.filter(d => d.diamond_id !== diamondId),
        }));

        if (!token) return { success: true };

        try {
          const response = await fetch(`${API_BASE_URL}/favorites/remove_diamond/`, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ diamond_id: diamondId }),
          });

          const data = await response.json();
          return data.success 
            ? { success: true } 
            : { success: false, error: data.error };
        } catch (error) {
          console.error('Remove diamond error:', error);
          return { success: false, error: error.message };
        }
      },

      // ============ ADD SETTING TO FAVORITES ============
      addSetting: async (setting, token) => {
        if (!token) {
          set((state) => {
            const exists = state.settings.some(s => s.setting_id === setting.setting_id);
            return {
              settings: exists ? state.settings : [...state.settings, setting],
            };
          });
          return { success: true, message: 'Saved locally (login to sync)' };
        }

        try {
          const response = await fetch(`${API_BASE_URL}/favorites/add_setting/`, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ setting_id: setting.setting_id }),
          });

          const data = await response.json();

          if (data.success) {
            set((state) => {
              const exists = state.settings.some(s => s.setting_id === setting.setting_id);
              return {
                settings: exists ? state.settings : [...state.settings, setting],
              };
            });
            return { success: true };
          } else {
            return { success: false, error: data.error };
          }
        } catch (error) {
          console.error('Add setting error:', error);
          return { success: false, error: error.message };
        }
      },

      // ============ REMOVE SETTING FROM FAVORITES ============
      removeSetting: async (settingId, token) => {
        set((state) => ({
          settings: state.settings.filter(s => s.setting_id !== settingId),
        }));

        if (!token) return { success: true };

        try {
          const response = await fetch(`${API_BASE_URL}/favorites/remove_setting/`, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ setting_id: settingId }),
          });

          const data = await response.json();
          return data.success 
            ? { success: true } 
            : { success: false, error: data.error };
        } catch (error) {
          console.error('Remove setting error:', error);
          return { success: false, error: error.message };
        }
      },

      // ============ CHECK IF DIAMOND IS FAVORITED ============
      isFavoriteDiamond: (diamondId) => {
        return get().diamonds.some(d => d.diamond_id === diamondId);
      },

      // ============ CHECK IF SETTING IS FAVORITED ============
      isFavoriteSetting: (settingId) => {
        return get().settings.some(s => s.setting_id === settingId);
      },

      // ============ OLD COMPATIBILITY METHODS ============
      // For backwards compatibility with existing code
      addFavorite: (item) => {
        if (item.type === 'diamond') {
          set((state) => ({
            diamonds: [...state.diamonds, { diamond_id: item.id, ...item }],
          }));
        } else if (item.type === 'setting') {
          set((state) => ({
            settings: [...state.settings, { setting_id: item.id, ...item }],
          }));
        }
      },

      removeFavorite: (id) => {
        set((state) => ({
          diamonds: state.diamonds.filter(d => d.diamond_id !== id),
          settings: state.settings.filter(s => s.setting_id !== id),
        }));
      },

      isFavorite: (id) => {
        const state = get();
        return state.diamonds.some(d => d.diamond_id === id) ||
               state.settings.some(s => s.setting_id === id);
      },

      // ============ CLEAR ALL FAVORITES ============
      clearFavorites: () => {
        set({ diamonds: [], settings: [], error: null });
      },

      // ============ CLEAR ERROR ============
      clearError: () => set({ error: null }),
    }),
    {
      name: 'favorites-store',
      partialize: (state) => ({
        diamonds: state.diamonds,
        settings: state.settings,
      }),
    }
  )
);