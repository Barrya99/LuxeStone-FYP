import { create } from 'zustand';

export const useFavoritesStore = create((set, get) => ({
  favorites: [],
  
  addFavorite: (item) => set((state) => ({
    favorites: [...state.favorites, item]
  })),
  
  removeFavorite: (id) => set((state) => ({
    favorites: state.favorites.filter(fav => fav.id !== id)
  })),
  
  isFavorite: (id) => {
    return get().favorites.some(fav => fav.id === id);
  },
  
  clearFavorites: () => set({ favorites: [] }),
}));