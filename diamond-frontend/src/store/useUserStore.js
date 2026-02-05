import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: (userData) => set({
    user: userData,
    isAuthenticated: true,
  }),
  
  logout: () => set({
    user: null,
    isAuthenticated: false,
  }),
  
  updateUser: (userData) => set((state) => ({
    user: { ...state.user, ...userData }
  })),
}));
