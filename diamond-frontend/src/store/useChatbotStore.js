import { create } from 'zustand';

export const useChatbotStore = create((set) => ({
  isOpen: false,

  openChatbot: () => set({ isOpen: true }),
  
  closeChatbot: () => set({ isOpen: false }),
  
  toggleChatbot: () => set((state) => ({ isOpen: !state.isOpen })),
}));
