// diamond-frontend/src/store/useChatbotStore.js
// Full chatbot state: open/close, messages, session, loading, errors,
// and dynamic follow_up_suggestions returned by the AI pipeline.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const INITIAL_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hello! I'm your LuxeStone diamond expert 💎\n\n" +
    "I can help you:\n" +
    "• Understand the 4Cs (Cut, Carat, Colour, Clarity)\n" +
    "• Find diamonds that fit your budget\n" +
    "• Choose the perfect ring setting\n" +
    "• Learn about our ethically sourced lab-grown diamonds\n\n" +
    "What are you looking for today?",
  timestamp: new Date().toISOString(),
  followUpSuggestions: [
    "Explain the 4Cs of diamonds",
    "Show me diamonds under $5,000",
    "What makes lab-grown diamonds ethical?",
  ],
};

export const useChatbotStore = create(
  persist(
    (set, get) => ({
      // ── UI state ────────────────────────────────────────────────────────
      isOpen: false,
      isMinimized: false,

      // ── Conversation state ───────────────────────────────────────────────
      messages: [INITIAL_MESSAGE],
      sessionId: null,
      isLoading: false,
      isTyping: false,
      error: null,

      // ── UI actions ───────────────────────────────────────────────────────
      openChatbot:    () => set({ isOpen: true, isMinimized: false }),
      closeChatbot:   () => set({ isOpen: false }),
      toggleChatbot:  () => set((s) => ({ isOpen: !s.isOpen, isMinimized: false })),
      minimizeChatbot:() => set({ isMinimized: true }),
      restoreChatbot: () => set({ isMinimized: false }),

      // ── Send message ─────────────────────────────────────────────────────
      sendMessage: async (userText) => {
        const text = userText.trim();
        if (!text) return;

        const { sessionId, messages } = get();

        const userMsg = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date().toISOString(),
        };

        set({
          messages: [...messages, userMsg],
          isLoading: true,
          isTyping: true,
          error: null,
        });

        try {
          const token = localStorage.getItem('token');
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers.Authorization = `Token ${token}`;

          const response = await axios.post(
            `${API_BASE_URL}/chat/`,
            { message: text, session_id: sessionId },
            { headers, timeout: 45_000 }   // 45 s — LLM calls can be slow
          );

          const data = response.data;

          if (data.success) {
            const assistantMsg = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: data.message,
              timestamp: new Date().toISOString(),
              followUpSuggestions: data.follow_up_suggestions || [],
            };

            set((s) => ({
              messages: [...s.messages, assistantMsg],
              sessionId: data.session_id || s.sessionId,
              isLoading: false,
              isTyping: false,
              error: null,
            }));
          } else {
            throw new Error(data.error || 'Chatbot returned an error.');
          }
        } catch (err) {
          const errMsg =
            err.response?.data?.error ||
            (err.code === 'ECONNABORTED' ? 'Request timed out — please try again.' : null) ||
            err.message ||
            'Something went wrong. Please try again.';

          const assistantErrMsg = {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content:
              "I'm sorry, I ran into a technical issue. Please try again, " +
              "or contact us at hello@luxestone.com for immediate help.",
            timestamp: new Date().toISOString(),
            isError: true,
            followUpSuggestions: [],
          };

          set((s) => ({
            messages: [...s.messages, assistantErrMsg],
            isLoading: false,
            isTyping: false,
            error: errMsg,
          }));
        }
      },

      // ── Clear conversation ────────────────────────────────────────────────
      clearConversation: async () => {
        const { sessionId } = get();
        if (sessionId) {
          try {
            await axios.post(`${API_BASE_URL}/chat/clear/`, { session_id: sessionId });
          } catch (_) { /* best-effort */ }
        }
        set({
          messages: [{ ...INITIAL_MESSAGE, timestamp: new Date().toISOString() }],
          sessionId: null,
          error: null,
          isLoading: false,
          isTyping: false,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'luxestone-chatbot-v2',
      partialize: (s) => ({
        sessionId: s.sessionId,
        messages: s.messages.slice(-20),   // persist last 20 messages only
      }),
    }
  )
);