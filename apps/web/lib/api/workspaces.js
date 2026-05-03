import apiClient from './client';

export const workspacesAPI = {
    list: async (params = {}) => {
        const response = await apiClient.get('/workspaces', { params });
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/workspaces', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/workspaces/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/workspaces/${id}`);
        return response.data;
    },

    inviteMember: async (workspaceId, data) => {
        const response = await apiClient.post(`/workspaces/${workspaceId}/invite`, data);
        return response.data;
    },

    updateMemberRole: async (workspaceId, userId, data) => {
        const response = await apiClient.put(`/workspaces/${workspaceId}/members/${userId}/role`, data);
        return response.data;
    },

    removeMember: async (workspaceId, userId) => {
        const response = await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
        return response.data;
    },
};
