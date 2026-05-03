import apiClient from './client';

export const actionItemsAPI = {
    list: async ({ workspaceId, status, assigneeId, search, page = 1, limit = 20 }) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (workspaceId) params.append('workspaceId', workspaceId);
        if (status) params.append('status', status);
        if (assigneeId) params.append('assigneeId', assigneeId);
        if (search) params.append('search', search);

        const response = await apiClient.get(`/action-items?${params}`);
        return response.data;
    },

    kanban: async (workspaceId) => {
        const params = new URLSearchParams();
        if (workspaceId) params.append('workspaceId', workspaceId);

        const response = await apiClient.get(`/action-items/kanban?${params}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/action-items/${id}`);
        return response.data;
    },

    create: async (itemData) => {
        const response = await apiClient.post('/action-items', itemData);
        return response.data;
    },

    update: async (id, updateData) => {
        const response = await apiClient.put(`/action-items/${id}`, updateData);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/action-items/${id}`);
        return response.data;
    },
};