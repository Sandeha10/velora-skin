import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAuthModalOpen: false,
      modalView: 'login', // 'login' | 'register' | 'forgot-password'

      // Modal Handlers
      openAuthModal: (view = 'login') => set({ isAuthModalOpen: true, modalView: view }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      setModalView: (view) => set({ modalView: view }),

      // Auth Actions
      login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        const { user } = response.data.data;
        set({ user, isAuthenticated: true, isAuthModalOpen: false });
        return response.data;
      },

      register: async (name, email, password) => {
        const response = await apiClient.post('/auth/register', { name, email, password });
        const { user } = response.data.data;
        set({ user, isAuthenticated: true, isAuthModalOpen: false });
        return response.data;
      },

      forgotPassword: async (email) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch (err) {
          console.error('Logout error:', err);
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },

      // Check current session from /auth/me
      checkAuth: async () => {
        try {
          const res = await apiClient.get('/auth/me');
          set({ user: res.data.data.user, isAuthenticated: true });
        } catch (err) {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'velora_auth_vault',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);