// src/store/useConfiguratorStore.js
import { create } from 'zustand';

export const useConfiguratorStore = create((set, get) => ({
  currentStep: 1,
  selectedDiamond: null,
  selectedSetting: null,
  ringSize: '',
  budget: null,
  
  setStep: (step) => set({ currentStep: step }),
  
  selectDiamond: (diamond) => set({ 
    selectedDiamond: diamond,
    currentStep: 2 
  }),
  
  selectSetting: (setting) => set({ 
    selectedSetting: setting,
    currentStep: 3 
  }),
  
  setRingSize: (size) => set({ ringSize: size }),
  
  setBudget: (budget) => set({ budget }),
  
  getTotalPrice: () => {
    const state = get();
    const diamondPrice = parseFloat(state.selectedDiamond?.base_price || 0);
    const settingPrice = parseFloat(state.selectedSetting?.base_price || 0);
    return diamondPrice + settingPrice;
  },
  
  reset: () => set({
    currentStep: 1,
    selectedDiamond: null,
    selectedSetting: null,
    ringSize: '',
    budget: null,
  }),
}));