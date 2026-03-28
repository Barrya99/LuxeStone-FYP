// diamond-frontend/src/store/useAuthStore.js
// Thin wrapper — delegates to useUserStore so the whole app
// uses one token, one user object, one source of truth.

import { useUserStore } from './useUserStore';

// Re-export useUserStore as useAuthStore so every existing
// import of useAuthStore continues to work without changes.
export const useAuthStore = useUserStore;