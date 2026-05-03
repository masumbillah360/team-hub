export function usePermissions(role) {
    const isAdmin = role === 'ADMIN';
    const isMember = role === 'MEMBER' || isAdmin;
    const isViewer = role === 'VIEWER' || isMember;

    return {
        canInviteMembers: isAdmin,
        canRemoveMembers: isAdmin,
        canChangeRoles: isAdmin,
        canUpdateWorkspace: isAdmin,
        canDeleteWorkspace: isAdmin,
        canCreateGoals: isMember,
        canUpdateGoals: isMember,
        canDeleteGoals: isAdmin,
        canCreateAnnouncements: isMember,
        canUpdateAnnouncements: isMember,
        canDeleteAnnouncements: isAdmin,
        canCreateActionItems: isMember,
        canUpdateActionItems: isMember,
        canDeleteActionItems: isAdmin,
        canViewAnalytics: isMember,
        canViewAuditLog: isAdmin,
        canViewWorkspaceSettings: isAdmin,
        isAdmin,
        isMember,
        isViewer,
    };
}
