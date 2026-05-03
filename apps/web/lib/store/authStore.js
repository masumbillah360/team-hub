import { create } from 'zustand';
import { authAPI } from '../api/auth';
import useStore from './index';

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
            const { user: userData, workspaces } = data;
            set({ user: userData, isAuthenticated: true });

            // Set current user in main store
            useStore.getState().setCurrentUser(userData);

            // Handle workspace selection
            const store = useStore.getState();
            const lastWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('lastWorkspaceId') : null;

            if (lastWorkspaceId && workspaces?.some(w => w.id === lastWorkspaceId)) {
                store.setCurrentWorkspace(lastWorkspaceId);
            } else if (workspaces?.length > 0) {
                store.setCurrentWorkspace(workspaces[0].id);
            } else {
                store.setCurrentWorkspace(null);
                store.setShowWorkspaceSelector(true);
            }

            return true;
        } catch (error) {
            console.error('Check auth error -> ', error.message)
            set({ user: null, isAuthenticated: false });
            useStore.getState().setCurrentUser(null);
            return false;
        }
    },

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const data = await authAPI.login(credentials);
            const { user, workspaces } = data;
            set({ user, isAuthenticated: true, loading: false });

            // Set current user in main store
            useStore.getState().setCurrentUser(user);

            // Handle workspace selection
            const store = useStore.getState();
            const lastWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('lastWorkspaceId') : null;

            if (lastWorkspaceId && workspaces?.some(w => w.id === lastWorkspaceId)) {
                store.setCurrentWorkspace(lastWorkspaceId);
            } else if (workspaces?.length > 0) {
                store.setCurrentWorkspace(workspaces[0].id);
            } else {
                store.setCurrentWorkspace(null);
                store.setShowWorkspaceSelector(true);
            }

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
            const { user, workspaces } = data;
            set({ user, isAuthenticated: true, loading: false });

            // Set current user in main store
            useStore.getState().setCurrentUser(user);

            // Handle workspace selection
            const store = useStore.getState();
            const lastWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('lastWorkspaceId') : null;

            if (lastWorkspaceId && workspaces?.some(w => w.id === lastWorkspaceId)) {
                store.setCurrentWorkspace(lastWorkspaceId);
            } else if (workspaces?.length > 0) {
                store.setCurrentWorkspace(workspaces[0].id);
            } else {
                store.setCurrentWorkspace(null);
                store.setShowWorkspaceSelector(true);
            }

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
            useStore.getState().setCurrentUser(null);
            useStore.getState().setCurrentWorkspace(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('lastWorkspaceId');
            }
        }
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
