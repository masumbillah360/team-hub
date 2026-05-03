/**
 * Permission Matrix for Workspace Resources
 * Defines what each role can do for each resource
 */
const PERMISSIONS = {
    // Workspace settings
    'workspace:view': ['ADMIN', 'MEMBER', 'VIEWER'],
    'workspace:update': ['ADMIN'],
    'workspace:delete': ['ADMIN'],
    'workspace:invite': ['ADMIN'],
    'workspace:change_role': ['ADMIN'],
    'workspace:remove_member': ['ADMIN'],
    'workspace:view_settings': ['ADMIN'],

    // Goals
    'goal:view': ['ADMIN', 'MEMBER', 'VIEWER'],
    'goal:create': ['ADMIN', 'MEMBER'],
    'goal:update': ['ADMIN', 'MEMBER'],
    'goal:delete': ['ADMIN'],
    'goal:update_status': ['ADMIN', 'MEMBER'],
    'goal:add_milestone': ['ADMIN', 'MEMBER'],
    'goal:add_update': ['ADMIN', 'MEMBER'],

    // Announcements
    'announcement:view': ['ADMIN', 'MEMBER', 'VIEWER'],
    'announcement:create': ['ADMIN', 'MEMBER'],
    'announcement:update': ['ADMIN', 'MEMBER'],
    'announcement:delete': ['ADMIN'],
    'announcement:pin': ['ADMIN'],
    'announcement:react': ['ADMIN', 'MEMBER', 'VIEWER'],
    'announcement:comment': ['ADMIN', 'MEMBER', 'VIEWER'],

    // Action Items
    'action_item:view': ['ADMIN', 'MEMBER', 'VIEWER'],
    'action_item:create': ['ADMIN', 'MEMBER'],
    'action_item:update': ['ADMIN', 'MEMBER'],
    'action_item:delete': ['ADMIN'],
    'action_item:update_status': ['ADMIN', 'MEMBER'],
    'action_item:assign': ['ADMIN', 'MEMBER'],

    // Analytics
    'analytics:view': ['ADMIN', 'MEMBER', 'VIEWER'],
    'analytics:export': ['ADMIN'],

    // Audit Log
    'audit_log:view': ['ADMIN'],
    'audit_log:export': ['ADMIN'],

    // Notifications
    'notification:view': ['ADMIN', 'MEMBER', 'VIEWER'],
    'notification:update': ['ADMIN', 'MEMBER', 'VIEWER'],
};

/**
 * Check if a role has permission for a specific action
 */
export function hasPermission(role, permission) {
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) return false;
    return allowedRoles.includes(role);
}

/**
 * Middleware to check permission
 */
export function requirePermission(permission) {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !hasPermission(userRole, permission)) {
            return res.status(403).json({
                message: 'Insufficient permissions',
                required: permission,
            });
        }
        next();
    };
}

/**
 * Get all permissions for a role (useful for frontend)
 */
export function getRolePermissions(role) {
    const permissions = {};
    Object.entries(PERMISSIONS).forEach(([permission, roles]) => {
        permissions[permission] = roles.includes(role);
    });
    return permissions;
}
