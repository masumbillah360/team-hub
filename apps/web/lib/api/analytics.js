import apiClient from './client';

export const analyticsAPI = {
    stats: async ({ workspaceId }) => {
        const params = new URLSearchParams();
        if (workspaceId) params.append('workspaceId', workspaceId);

        const response = await apiClient.get(`/analytics/stats?${params}`);
        return response.data;
    },

    goalsCompletion: async ({ workspaceId }) => {
        const params = new URLSearchParams();
        if (workspaceId) params.append('workspaceId', workspaceId);

        const response = await apiClient.get(`/analytics/goals-completion?${params}`);
        return response.data;
    },

    activityOverview: async ({ workspaceId }) => {
        const params = new URLSearchParams();
        if (workspaceId) params.append('workspaceId', workspaceId);

        const response = await apiClient.get(`/analytics/activity?${params}`);
        return response.data;
    },

    exportData: async ({ workspaceId }) => {
        const params = new URLSearchParams();
        if (workspaceId) params.append('workspaceId', workspaceId);

        const response = await apiClient.get(`/analytics/export?${params}`, {
            responseType: 'blob',
        });
        return response.data;
    },
};