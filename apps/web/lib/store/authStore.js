import { create } from 'zustand';
import { authAPI } from '../api/auth';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setError: (error) => set({ error }),
    setLoading: (loading) => set({ loading }),

    checkAuth: async () => {
        try {
            const data = await authAPI.getProfile();
            set({ user: data, isAuthenticated: true });
            return true;
        } catch (error) {
            console.error('Check auth error -> ', error.message)
            set({ user: null, isAuthenticated: false });
            return false;
        }
    },

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const data = await authAPI.login(credentials);
            // Cookies are set automatically by backend, tokens are in data.tokens
            set({ user: data.user, isAuthenticated: true, loading: false });
            return data;
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            set({ error: message, loading: false });
            throw error;
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const data = await authAPI.register(userData);
            // Cookies are set automatically by backend
            set({ user: data.user, isAuthenticated: true, loading: false });
            return data;
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            set({ error: message, loading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            set({ user: null, isAuthenticated: false, error: null });
        }
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
