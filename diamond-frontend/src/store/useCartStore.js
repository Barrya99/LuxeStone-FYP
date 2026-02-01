// src/store/useCartStore.js
import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  
  addItem: (item) => set((state) => ({
    items: [...state.items, { ...item, id: Date.now() }]
  })),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  
  clearCart: () => set({ items: [] }),
  
  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
  },
  
  getItemCount: () => get().items.length,
}));