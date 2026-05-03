// Permission definitions
export const PERMISSIONS = {
    // Workspace management
    edit_workspace_settings: 'edit_workspace_settings',
    delete_workspace: 'delete_workspace',

    // Member management
    invite_members: 'invite_members',
    remove_members: 'remove_members',
    change_roles: 'change_roles',

    // Goal management
    create_goals: 'create_goals',
    edit_all_goals: 'edit_all_goals',
    delete_goals: 'delete_goals',
    assign_goals: 'assign_goals',

    // Action items
    create_action_items: 'create_action_items',
    edit_all_action_items: 'edit_all_action_items',
    delete_action_items: 'delete_action_items',
    assign_action_items: 'assign_action_items',

    // Announcements
    create_announcements: 'create_announcements',
    edit_all_announcements: 'edit_all_announcements',
    delete_announcements: 'delete_announcements',
    pin_announcements: 'pin_announcements',

    // Comments and reactions
    comment_on_announcements: 'comment_on_announcements',
    react_to_announcements: 'react_to_announcements',

    // Audit and reporting
    view_audit_logs: 'view_audit_logs',
    export_workspace_data: 'export_workspace_data',
};

export const PERMISSION_LABELS = {
    edit_workspace_settings: 'Edit workspace settings',
    delete_workspace: 'Delete workspace',
    invite_members: 'Invite new members',
    remove_members: 'Remove members',
    change_roles: 'Change member roles',
    create_goals: 'Create goals',
    edit_all_goals: 'Edit all goals',
    delete_goals: 'Delete goals',
    assign_goals: 'Assign goals to members',
    create_action_items: 'Create action items',
    edit_all_action_items: 'Edit all action items',
    delete_action_items: 'Delete action items',
    assign_action_items: 'Assign action items',
    create_announcements: 'Create announcements',
    edit_all_announcements: 'Edit all announcements',
    delete_announcements: 'Delete announcements',
    pin_announcements: 'Pin announcements',
    comment_on_announcements: 'Comment on announcements',
    react_to_announcements: 'React to announcements',
    view_audit_logs: 'View audit logs',
    export_workspace_data: 'Export workspace data',
};

export const PERMISSION_GROUPS = [
    {
        label: 'Workspace Management',
        permissions: [
            PERMISSIONS.edit_workspace_settings,
            PERMISSIONS.delete_workspace,
            PERMISSIONS.export_workspace_data,
            PERMISSIONS.view_audit_logs,
        ]
    },
    {
        label: 'Member Management',
        permissions: [
            PERMISSIONS.invite_members,
            PERMISSIONS.remove_members,
            PERMISSIONS.change_roles,
        ]
    },
    {
        label: 'Goals & Milestones',
        permissions: [
            PERMISSIONS.create_goals,
            PERMISSIONS.edit_all_goals,
            PERMISSIONS.delete_goals,
            PERMISSIONS.assign_goals,
        ]
    },
    {
        label: 'Action Items',
        permissions: [
            PERMISSIONS.create_action_items,
            PERMISSIONS.edit_all_action_items,
            PERMISSIONS.delete_action_items,
            PERMISSIONS.assign_action_items,
        ]
    },
    {
        label: 'Announcements',
        permissions: [
            PERMISSIONS.create_announcements,
            PERMISSIONS.edit_all_announcements,
            PERMISSIONS.delete_announcements,
            PERMISSIONS.pin_announcements,
        ]
    },
    {
        label: 'Social Features',
        permissions: [
            PERMISSIONS.comment_on_announcements,
            PERMISSIONS.react_to_announcements,
        ]
    },
];

// Default permission matrix
export const DEFAULT_PERMISSION_MATRIX = {
    [PERMISSIONS.edit_workspace_settings]: { ADMIN: true, MEMBER: false, VIEWER: false },
    [PERMISSIONS.delete_workspace]: { ADMIN: true, MEMBER: false, VIEWER: false },
    [PERMISSIONS.invite_members]: { ADMIN: true, MEMBER: true, VIEWER: false },
    [PERMISSIONS.remove_members]: { ADMIN: true, MEMBER: false, VIEWER: false },
    [PERMISSIONS.change_roles]: { ADMIN: true, MEMBER: false, VIEWER: false },
    [PERMISSIONS.create_goals]: { ADMIN: true, MEMBER: true, VIEWER: false },
    [PERMISSIONS.edit_all_goals]: { ADMIN: true, MEMBER: false, VIEWER: false },
    [PERMISSIONS.delete_goals]: { ADMIN: true, MEMBER: false, VIEWER: false },
    [PERMISSIONS.assign_goals]: { ADMIN: true, MEMBER: true, VIEWER: false },
    [PERMISSIONS.create_action_items]: { ADMIN: true, MEMBER: true, VIEWER: false },
    [PERMISSIONS.edit_all_action_items]: { ADMIN: true, MEMBER: false, VIEWER: false },
    [PERMISSIONS.delete_action_items]: { ADMIN: true, MEMBER: false, VIEWER: false },
    [PERMISSIONS.assign_action_items]: { ADMIN: true, MEMBER: true, VIEWER: false },
    [PERMISSIONS.create_announcements]: { ADMIN: true, MEMBER: true, VIEWER: false },
    [PERMISSIONS.edit_all_announcements]: { ADMIN: true, MEMBER: false, VIEWER: false },
    [PERMISSIONS.delete_announcements]: { ADMIN: true, MEMBER: false, VIEWER: false },
    [PERMISSIONS.pin_announcements]: { ADMIN: true, MEMBER: false, VIEWER: false },
    [PERMISSIONS.comment_on_announcements]: { ADMIN: true, MEMBER: true, VIEWER: true },
    [PERMISSIONS.react_to_announcements]: { ADMIN: true, MEMBER: true, VIEWER: true },
    [PERMISSIONS.view_audit_logs]: { ADMIN: true, MEMBER: false, VIEWER: false },
    [PERMISSIONS.export_workspace_data]: { ADMIN: true, MEMBER: false, VIEWER: false },
};

// Locked permissions that cannot be changed for certain roles
const LOCKED_PERMISSIONS = {
    ADMIN: {
        // Admins must always have these permissions
        [PERMISSIONS.edit_workspace_settings]: true,
        [PERMISSIONS.change_roles]: true,
        [PERMISSIONS.remove_members]: true,
    },
    VIEWER: {
        // Viewers cannot have these permissions
        [PERMISSIONS.edit_workspace_settings]: false,
        [PERMISSIONS.delete_workspace]: false,
        [PERMISSIONS.invite_members]: false,
        [PERMISSIONS.remove_members]: false,
        [PERMISSIONS.change_roles]: false,
        [PERMISSIONS.create_goals]: false,
        [PERMISSIONS.edit_all_goals]: false,
        [PERMISSIONS.delete_goals]: false,
        [PERMISSIONS.assign_goals]: false,
        [PERMISSIONS.create_action_items]: false,
        [PERMISSIONS.edit_all_action_items]: false,
        [PERMISSIONS.delete_action_items]: false,
        [PERMISSIONS.assign_action_items]: false,
        [PERMISSIONS.create_announcements]: false,
        [PERMISSIONS.edit_all_announcements]: false,
        [PERMISSIONS.delete_announcements]: false,
        [PERMISSIONS.pin_announcements]: false,
        [PERMISSIONS.view_audit_logs]: false,
        [PERMISSIONS.export_workspace_data]: false,
    }
};

// Check if a role has a specific permission
export const hasPermission = (permissionMatrix, role, permission) => {
    return permissionMatrix[permission]?.[role] || false;
};

// Check if a permission is locked for a role
export const isPermissionLocked = (permission, role) => {
    return LOCKED_PERMISSIONS[role]?.[permission] !== undefined;
};

// Get the locked value for a permission
export const getLockedValue = (permission, role) => {
    return LOCKED_PERMISSIONS[role]?.[permission];
};

// Validate permission matrix
export const validatePermissionMatrix = (matrix) => {
    const errors = [];

    // Check that all permissions are present
    Object.values(PERMISSIONS).forEach(permission => {
        if (!matrix[permission]) {
            errors.push(`Missing permission: ${permission}`);
        } else {
            // Check that all roles are present for each permission
            ['ADMIN', 'MEMBER', 'VIEWER'].forEach(role => {
                if (matrix[permission][role] === undefined) {
                    errors.push(`Missing role ${role} for permission ${permission}`);
                }
            });
        }
    });

    // Check locked permissions
    Object.entries(LOCKED_PERMISSIONS).forEach(([role, lockedPerms]) => {
        Object.entries(lockedPerms).forEach(([permission, requiredValue]) => {
            if (matrix[permission]?.[role] !== requiredValue) {
                errors.push(`Permission ${permission} for role ${role} must be ${requiredValue}`);
            }
        });
    });

    return errors;
};