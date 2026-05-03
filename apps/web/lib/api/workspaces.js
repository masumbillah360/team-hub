import api from './client';

export const workspacesAPI = {
    // Get all workspaces for current user
    list: (params = {}) =>
        api.get('/workspaces', { params }),

    // Get specific workspace
    getWorkspace: (id) =>
        api.get(`/workspaces/${id}`),

    // Create new workspace
    create: (data) =>
        api.post('/workspaces', data),

    // Update workspace settings
    update: (id, data) =>
        api.put(`/workspaces/${id}`, data),

    // Delete workspace
    delete: (id) =>
        api.delete(`/workspaces/${id}`),

    // Invite member
    inviteMember: (id, data) =>
        api.post(`/workspaces/${id}/invite`, data),

    // Update member role
    updateMemberRole: (workspaceId, userId, data) =>
        api.put(`/workspaces/${workspaceId}/members/${userId}/role`, data),

    // Remove member
    removeMember: (workspaceId, userId) =>
        api.delete(`/workspaces/${workspaceId}/members/${userId}`),
};