// export type Role = 'Admin' | 'Member' | 'Viewer';

// export type Permission =
//     | 'create_goals'
//     | 'edit_goals'
//     | 'delete_goals'
//     | 'post_announcements'
//     | 'pin_announcements'
//     | 'invite_members'
//     | 'remove_members'
//     | 'change_roles'
//     | 'create_action_items'
//     | 'edit_action_items'
//     | 'delete_action_items'
//     | 'export_data'
//     | 'view_audit_log'
//     | 'edit_workspace_settings';

// export type PermissionMatrix = Record<Permission, Record<Role, boolean>>;

export const PERMISSION_LABELS = {
    create_goals: 'Create Goals',
    edit_goals: 'Edit Goals',
    delete_goals: 'Delete Goals',
    post_announcements: 'Post Announcements',
    pin_announcements: 'Pin Announcements',
    invite_members: 'Invite Members',
    remove_members: 'Remove Members',
    change_roles: 'Change Roles',
    create_action_items: 'Create Action Items',
    edit_action_items: 'Edit Action Items',
    delete_action_items: 'Delete Action Items',
    export_data: 'Export Data',
    view_audit_log: 'View Audit Log',
    edit_workspace_settings: 'Edit Workspace Settings',
};

export const PERMISSION_GROUPS = [
    {
        label: 'Goals',
        permissions: ['create_goals', 'edit_goals', 'delete_goals'],
    },
    {
        label: 'Announcements',
        permissions: ['post_announcements', 'pin_announcements'],
    },
    {
        label: 'Members',
        permissions: ['invite_members', 'remove_members', 'change_roles'],
    },
    {
        label: 'Action Items',
        permissions: [
            'create_action_items',
            'edit_action_items',
            'delete_action_items',
        ],
    },
    {
        label: 'Workspace',
        permissions: ['export_data', 'view_audit_log', 'edit_workspace_settings'],
    },
];

// Immutable permissions — Admin always has these, Viewer never does
export const LOCKED_PERMISSIONS = {
    edit_workspace_settings: { Admin: true, Viewer: false },
    change_roles: { Admin: true, Viewer: false },
    remove_members: { Admin: true, Viewer: false },
    view_audit_log: { Viewer: false },
};

export const DEFAULT_PERMISSION_MATRIX = {
    create_goals: { Admin: true, Member: false, Viewer: false },
    edit_goals: { Admin: true, Member: true, Viewer: false },
    delete_goals: { Admin: true, Member: false, Viewer: false },
    post_announcements: { Admin: true, Member: false, Viewer: false },
    pin_announcements: { Admin: true, Member: false, Viewer: false },
    invite_members: { Admin: true, Member: false, Viewer: false },
    remove_members: { Admin: true, Member: false, Viewer: false },
    change_roles: { Admin: true, Member: false, Viewer: false },
    create_action_items: { Admin: true, Member: true, Viewer: false },
    edit_action_items: { Admin: true, Member: true, Viewer: false },
    delete_action_items: { Admin: true, Member: false, Viewer: false },
    export_data: { Admin: true, Member: true, Viewer: true },
    view_audit_log: { Admin: true, Member: false, Viewer: false },
    edit_workspace_settings: { Admin: true, Member: false, Viewer: false },
};

export function hasPermission(
    matrix,
    role,
    permission,
) {
    return matrix[permission]?.[role] ?? false;
}

export function isPermissionLocked(
    permission,
    role,
) {
    return LOCKED_PERMISSIONS[permission]?.[role] !== undefined;
}

export function getLockedValue(
    permission,
    role,
) {
    return LOCKED_PERMISSIONS[permission]?.[role];
}