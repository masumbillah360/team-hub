import apiClient from './client';

export const auditLogsAPI = {
    list: async ({ workspaceId, action, search, page = 1, limit = 20 }) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (workspaceId) params.append('workspaceId', workspaceId);
        if (action && action !== 'All') params.append('action', action);
        if (search) params.append('search', search);

        const response = await apiClient.get(`/audit-logs?${params}`);
        return response.data;
    },

    exportCsv: async ({ workspaceId, action, search }) => {
        const params = new URLSearchParams({
            export: 'csv',
        });

        if (workspaceId) params.append('workspaceId', workspaceId);
        if (action && action !== 'All') params.append('action', action);
        if (search) params.append('search', search);

        const response = await apiClient.get(`/audit-logs?${params}`, {
            responseType: 'blob',
        });
        return response.data;
    },
};