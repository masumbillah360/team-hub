import { create } from 'zustand';

export const Page = {
    DASHBOARD: 'DASHBOARD',
    GOALS: 'GOALS',
    GOAL_DETAIL: 'GOAL_DETAIL',
    ANNOUNCEMENTS: 'ANNOUNCEMENTS',
    ACTION_ITEMS: 'ACTION_ITEMS',
    ANALYTICS: 'ANALYTICS',
    WORKSPACE_SETTINGS: 'WORKSPACE_SETTINGS',
    PROFILE: 'PROFILE',
    AUDIT_LOG: 'AUDIT_LOG',
};

const useStore = create((set) => ({
    currentPage: Page.DASHBOARD,
    currentWorkspaceId: null,
    currentWorkspaceRole: null,
    currentUser: null,
    onlineUsers: [],
    toasts: [],
    goals: [],
    commandPaletteOpen: false,
    showWorkspaceSelector: false,
    selectedGoalId: null,
    workspacesVersion: 0, // Increment to trigger workspace refresh

    setPage: (page) => set({ currentPage: page }),
    refreshWorkspaces: () => set((state) => ({ workspacesVersion: state.workspacesVersion + 1 })),
    setCurrentWorkspace: (workspaceId) => {
        if (typeof window !== 'undefined') {
            if (workspaceId) {
                localStorage.setItem('lastWorkspaceId', workspaceId);
            } else {
                localStorage.removeItem('lastWorkspaceId');
            }
        }
        set({ currentWorkspaceId: workspaceId });
    },
    setCurrentWorkspaceRole: (role) => set({ currentWorkspaceRole: role }),
    setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    setShowWorkspaceSelector: (show) => set({ showWorkspaceSelector: show }),
    setCurrentUser: (user) => set({ currentUser: user }),
    setOnlineUsers: (users) => set({ onlineUsers: users }),
    addToast: (toast) =>
        set((state) => ({
            toasts: [...state.toasts, { id: Date.now(), ...toast }],
        })),
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
    setSelectedGoalId: (id) => set({ selectedGoalId: id }),
}));

export default useStore;
