import apiClient from './client';

export const announcementsAPI = {
    list: async ({ workspaceId, pinned, search, page = 1, limit = 20 }) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (workspaceId) params.append('workspaceId', workspaceId);
        if (pinned !== undefined) params.append('pinned', pinned.toString());
        if (search) params.append('search', search);

        const response = await apiClient.get(`/announcements?${params}`);
        return response.data;
    },

    getById: async (announcementId) => {
        const response = await apiClient.get(`/announcements/${announcementId}`);
        return response.data;
    },

    create: async (announcementData) => {
        const response = await apiClient.post('/announcements', announcementData);
        return response.data;
    },

    togglePin: async (announcementId) => {
        const response = await apiClient.put(`/announcements/${announcementId}/pin`);
        return response.data;
    },

    addReaction: async (announcementId, reactionData) => {
        const response = await apiClient.post(
            `/announcements/${announcementId}/reactions`,
            reactionData
        );
        return response.data;
    },

    addComment: async (announcementId, commentData) => {
        const response = await apiClient.post(
            `/announcements/${announcementId}/comments`,
            commentData
        );
        return response.data;
    },

    delete: async (announcementId) => {
        const response = await apiClient.delete(`/announcements/${announcementId}`);
        return response.data;
    },
};