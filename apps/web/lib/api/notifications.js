import apiClient from './client';

export const notificationsAPI = {
    list: async (params = {}) => {
        const response = await apiClient.get('/notifications', { params });
        return response.data;
    },

    markRead: async (id) => {
        const response = await apiClient.put(`/notifications/${id}/read`);
        return response.data;
    },

    markAllRead: async () => {
        const response = await apiClient.put('/notifications/mark-all-read');
        return response.data;
    },
};
