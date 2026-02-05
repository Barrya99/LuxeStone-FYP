import { create } from 'zustand';

export const useComparisonStore = create((set, get) => ({
  diamonds: [],
  settings: [],

  addDiamond: (diamond) => {
    const { diamonds } = get();
    // Check if already exists
    if (diamonds.some(d => d.diamond_id === diamond.diamond_id)) {
      return false; // Already in comparison
    }
    // Limit to 3 items
    if (diamonds.length >= 3) {
      return false; // Max 3 items
    }
    set((state) => ({
      diamonds: [...state.diamonds, diamond],
      settings: [], // Clear settings when adding diamond (can't mix types)
    }));
    return true;
  },

  addSetting: (setting) => {
    const { settings } = get();
    // Check if already exists
    if (settings.some(s => s.setting_id === setting.setting_id)) {
      return false; // Already in comparison
    }
    // Limit to 3 items
    if (settings.length >= 3) {
      return false; // Max 3 items
    }
    set((state) => ({
      settings: [...state.settings, setting],
      diamonds: [], // Clear diamonds when adding setting (can't mix types)
    }));
    return true;
  },

  removeDiamond: (diamondId) => {
    set((state) => ({
      diamonds: state.diamonds.filter(d => d.diamond_id !== diamondId),
    }));
  },

  removeSetting: (settingId) => {
    set((state) => ({
      settings: state.settings.filter(s => s.setting_id !== settingId),
    }));
  },

  clearComparison: () => set({ diamonds: [], settings: [] }),

  getDiamondIds: () => get().diamonds.map(d => d.diamond_id),
  getSettingIds: () => get().settings.map(s => s.setting_id),

  hasItems: () => {
    const { diamonds, settings } = get();
    return diamonds.length > 0 || settings.length > 0;
  },

  canRemove: () => {
    const { diamonds, settings } = get();
    return (diamonds.length > 2) || (settings.length > 2);
  },
}));
