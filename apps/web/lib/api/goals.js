import apiClient from './client';

export const goalsAPI = {
    list: async ({ workspaceId, status, search, page = 1, limit = 20 }) => {
        const params = new URLSearchParams({
            workspaceId,
            page: page.toString(),
            limit: limit.toString(),
        });

        if (status) params.append('status', status);
        if (search) params.append('search', search);

        const response = await apiClient.get(`/goals?${params}`);
        return response.data;
    },

    getById: async (goalId) => {
        const response = await apiClient.get(`/goals/${goalId}`);
        return response.data;
    },

    create: async (goalData) => {
        const response = await apiClient.post('/goals', goalData);
        return response.data;
    },

    update: async (goalId, updateData) => {
        const response = await apiClient.put(`/goals/${goalId}`, updateData);
        return response.data;
    },

    delete: async (goalId) => {
        const response = await apiClient.delete(`/goals/${goalId}`);
        return response.data;
    },

    addMilestone: async (goalId, milestoneData) => {
        const response = await apiClient.post(`/goals/${goalId}/milestones`, milestoneData);
        return response.data;
    },

    updateMilestone: async (goalId, milestoneId, updateData) => {
        const response = await apiClient.put(`/goals/${goalId}/milestones/${milestoneId}`, updateData);
        return response.data;
    },

    addUpdate: async (goalId, updateData) => {
        const response = await apiClient.post(`/goals/${goalId}/updates`, updateData);
        return response.data;
    },
};