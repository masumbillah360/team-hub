'use client';

import React, { useState, useEffect } from 'react';
import useStore from '@/lib/store';
import { workspacesAPI } from '@/lib/api/workspaces';
import {
    Save,
    UserPlus,
    Shield,
    ShieldCheck,
    Trash2,
    Eye,
    AlertTriangle,
    CheckCircle2,
    Info,
    Lock,
    ChevronDown,
    ChevronRight,
    Users,
    Settings,
    Activity,
    Loader2,
} from 'lucide-react';
import {
    DEFAULT_PERMISSION_MATRIX,
    PERMISSION_GROUPS,
    PERMISSION_LABELS,
    hasPermission,
    isPermissionLocked,
    getLockedValue,
} from '@/lib/rbac';

const ACCENT_COLORS = [
    { value: '#6366f1', label: 'Indigo' },
    { value: '#10b981', label: 'Emerald' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#ef4444', label: 'Red' },
    { value: '#8b5cf6', label: 'Violet' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#14b8a6', label: 'Teal' },
    { value: '#f97316', label: 'Orange' },
];

const ROLES = ['ADMIN', 'MEMBER', 'VIEWER'];
const ROLE_CONFIG = {
    ADMIN: {
        icon: ShieldCheck,
        color: 'text-violet-600 dark:text-violet-400',
        badge: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:ring-violet-800',
    },
    MEMBER: {
        icon: Shield,
        color: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800',
    },
    VIEWER: {
        icon: Eye,
        color: 'text-gray-500 dark:text-gray-400',
        badge: 'bg-gray-50 text-gray-600 ring-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:ring-gray-600',
    },
};

function StatusBanner({ type, message, onDismiss }) {
    const config = {
        success: {
            wrapper:
                'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400',
            Icon: CheckCircle2,
        },
        warning: {
            wrapper:
                'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400',
            Icon: AlertTriangle,
        },
        info: {
            wrapper:
                'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
            Icon: Info,
        },
    };
    const { wrapper, Icon } = config[type];
    return (
        <div
            className={`flex items-start gap-2.5 px-3.5 py-3 rounded-lg border text-sm ${wrapper}`}>
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="flex-1">{message}</span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="ml-2 text-current opacity-60 hover:opacity-100">
                    ✕
                </button>
            )}
        </div>
    );
}

function RoleBadge({ role }) {
    const { icon: Icon, badge } = ROLE_CONFIG[role] ?? ROLE_CONFIG.VIEWER;
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${badge}`}>
            <Icon className="w-3 h-3" />
            {role}
        </span>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );
}

export default function WorkspaceSettings() {
    const { currentWorkspaceId, currentUser, addToast } = useStore();

    const [ws, setWs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');

    // General settings state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [accentColor, setAccentColor] = useState('#6366f1');

    // Member management state
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('MEMBER');

    // Permission matrix state
    const [matrix, setMatrix] = useState(DEFAULT_PERMISSION_MATRIX);
    const [expandedGroups, setExpandedGroups] = useState(
        new Set(PERMISSION_GROUPS.map((g) => g.label)),
    );

    // UI state
    const [hasUnsavedMatrix, setHasUnsavedMatrix] = useState(false);
    const [savingGeneral, setSavingGeneral] = useState(false);
    const [savingMatrix, setSavingMatrix] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [statusBanner, setStatusBanner] = useState(null);

    // Fetch workspace data
    const fetchWorkspace = async () => {
        if (!currentWorkspaceId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await workspacesAPI.getWorkspace(currentWorkspaceId);

            // FIX: Access the nested data property
            const workspace = res.data.data; // Changed from res.data to res.data.data

            // Set workspace data
            setWs(workspace);

            // Set form states
            setName(workspace?.name || '');
            setDescription(workspace?.description || '');
            setAccentColor(workspace?.accentColor || '#6366f1');
            setMatrix(
                workspace?.permissionMatrix?.permissions ||
                    DEFAULT_PERMISSION_MATRIX,
            );
        } catch (err) {
            console.error('Error fetching workspace:', err);
            addToast({
                title: 'Error',
                description: 'Failed to load workspace settings',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspace();
    }, [currentWorkspaceId]);

    const currentMember = ws?.members?.find(
        (m) => m.user?.id === currentUser?.id,
    );
    const currentRole = currentMember?.role || 'VIEWER';

    // Permission checks
    const canEditSettings = hasPermission(
        matrix,
        currentRole,
        'edit_workspace_settings',
    );
    const canInvite = hasPermission(matrix, currentRole, 'invite_members');
    const canChangeRoles = hasPermission(matrix, currentRole, 'change_roles');
    const canRemoveMembers = hasPermission(
        matrix,
        currentRole,
        'remove_members',
    );

    // Save General Settings
    const handleSaveGeneral = async () => {
        if (!ws?.id) {
            return;
        }
        if (!canEditSettings) {
            addToast({
                title: 'Permission Denied',
                description:
                    'You do not have permission to edit workspace settings',
                type: 'error',
            });
            return;
        }

        try {
            setSavingGeneral(true);
            await workspacesAPI.update(ws.id, {
                name,
                description,
                accentColor,
            });
            setStatusBanner({
                type: 'success',
                message: 'Workspace settings saved successfully!',
            });
            fetchWorkspace();
        } catch (err) {
            addToast({
                title: 'Error',
                description:
                    err.response?.data?.message || 'Failed to save settings',
                type: 'error',
            });
        } finally {
            setSavingGeneral(false);
        }
    };

    // Invite Member
    const handleInvite = async (e) => {
        e.preventDefault();
        if (!ws?.id) {
            return;
        }
        if (!inviteEmail.trim()) {
            addToast({
                title: 'Validation Error',
                description: 'Please enter a valid email address',
                type: 'error',
            });
            return;
        }

        try {
            setInviting(true);
            await workspacesAPI.inviteMember(ws.id, {
                email: inviteEmail,
                role: inviteRole,
            });
            setStatusBanner({
                type: 'success',
                message: `Invitation sent to ${inviteEmail}! They'll receive a notification to join.`,
            });
            setInviteEmail('');
            fetchWorkspace();
        } catch (err) {
            addToast({
                title: 'Invitation Failed',
                description:
                    err.response?.data?.message || 'Failed to send invitation',
                type: 'error',
            });
        } finally {
            setInviting(false);
        }
    };

    // Change Role
    const handleRoleChange = async (userId, newRole) => {
        if (!ws?.id) {
            return;
        }
        if (!canChangeRoles) {
            addToast({
                title: 'Permission Denied',
                description:
                    'You do not have permission to change member roles',
                type: 'error',
            });
            return;
        }

        try {
            await workspacesAPI.updateMemberRole(ws.id, userId, {
                role: newRole,
            });
            setStatusBanner({
                type: 'success',
                message: 'Member role updated successfully!',
            });
            fetchWorkspace();
        } catch (err) {
            addToast({
                title: 'Error',
                description:
                    err.response?.data?.message || 'Failed to update role',
                type: 'error',
            });
        }
    };

    // Remove Member
    const handleRemoveMember = async (userId, userName) => {
        if (!ws?.id) {
            return;
        }
        if (!canRemoveMembers) {
            addToast({
                title: 'Permission Denied',
                description: 'You do not have permission to remove members',
                type: 'error',
            });
            return;
        }

        if (
            !confirm(
                `Are you sure you want to remove ${userName} from this workspace? This action cannot be undone.`,
            )
        ) {
            return;
        }

        try {
            await workspacesAPI.removeMember(ws.id, userId);
            setStatusBanner({
                type: 'success',
                message: `${userName} has been removed from the workspace.`,
            });
            fetchWorkspace();
        } catch (err) {
            addToast({
                title: 'Error',
                description:
                    err.response?.data?.message || 'Failed to remove member',
                type: 'error',
            });
        }
    };

    // Permission Matrix Functions
    const toggleGroup = (groupLabel) => {
        setExpandedGroups((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(groupLabel)) {
                newSet.delete(groupLabel);
            } else {
                newSet.add(groupLabel);
            }
            return newSet;
        });
    };

    const handlePermissionToggle = (permission, role, value) => {
        if (isPermissionLocked(permission, role)) return;

        setMatrix((prev) => ({
            ...prev,
            [permission]: { ...prev[permission], [role]: value },
        }));
        setHasUnsavedMatrix(true);
    };

    const handleSaveMatrix = async () => {
        if (!ws?.id) {
            return;
        }
        try {
            setSavingMatrix(true);
            await workspacesAPI.update(ws.id, {
                permissionMatrix: { matrix: JSON.stringify(matrix) },
            });
            setHasUnsavedMatrix(false);
            setStatusBanner({
                type: 'success',
                message: 'Permission matrix saved successfully!',
            });
        } catch (err) {
            addToast({
                title: 'Error',
                description:
                    err.response?.data?.message || 'Failed to save permissions',
                type: 'error',
            });
        } finally {
            setSavingMatrix(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <LoadingSpinner />
            </div>
        );
    }

    // Show error if no workspace after loading
    if (!ws || !ws.id) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Workspace Not Found
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        The workspace could not be loaded or you don't have
                        access to it.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'members', label: 'Members', icon: Users },
        { id: 'permissions', label: 'Permissions', icon: Shield },
    ];

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Status Banner */}
            {statusBanner && (
                <StatusBanner
                    type={statusBanner.type}
                    message={statusBanner.message}
                    onDismiss={() => setStatusBanner(null)}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Workspace Settings
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your workspace settings, members, and permissions
                    </p>
                </div>
                <RoleBadge role={currentRole} />
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}>
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'general' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
                            General Settings
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Workspace Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        disabled={!canEditSettings}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-600 disabled:text-gray-500"
                                        placeholder="Enter workspace name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        disabled={!canEditSettings}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-600 disabled:text-gray-500 resize-none"
                                        placeholder="Describe your workspace..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Accent Color
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {ACCENT_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() =>
                                                canEditSettings &&
                                                setAccentColor(color.value)
                                            }
                                            disabled={!canEditSettings}
                                            className={`w-12 h-12 rounded-lg transition-all ${
                                                accentColor === color.value
                                                    ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-800'
                                                    : ''
                                            } ${!canEditSettings ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                                            style={{
                                                backgroundColor: color.value,
                                            }}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {canEditSettings && (
                            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={handleSaveGeneral}
                                    disabled={savingGeneral}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                                    {savingGeneral ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {savingGeneral
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="space-y-6">
                        {/* Invite Members */}
                        {canInvite && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <UserPlus className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Invite Members
                                    </h2>
                                </div>

                                <form
                                    onSubmit={handleInvite}
                                    className="flex gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) =>
                                                setInviteEmail(e.target.value)
                                            }
                                            placeholder="teammate@company.com"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <select
                                            value={inviteRole}
                                            onChange={(e) =>
                                                setInviteRole(e.target.value)
                                            }
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                            <option value="VIEWER">
                                                Viewer
                                            </option>
                                            <option value="MEMBER">
                                                Member
                                            </option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={
                                            inviting || !inviteEmail.trim()
                                        }
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                                        {inviting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="w-4 h-4" />
                                        )}
                                        {inviting ? 'Inviting...' : 'Invite'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Members List */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                Members ({ws.members?.length || 0})
                            </h2>

                            <div className="space-y-4">
                                {ws.members?.map((member) => {
                                    const isCurrent =
                                        member.user?.id === currentUser?.id;
                                    const isLastAdmin =
                                        member.role === 'ADMIN' &&
                                        ws.members.filter(
                                            (m) => m.role === 'ADMIN',
                                        ).length === 1;

                                    return (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {member.user?.name?.[0]?.toUpperCase() ||
                                                        '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {member.user?.name}
                                                        {isCurrent && (
                                                            <span className="text-xs text-indigo-500 ml-2">
                                                                (you)
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {member.user?.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {canChangeRoles &&
                                                !isLastAdmin ? (
                                                    <select
                                                        value={member.role}
                                                        onChange={(e) =>
                                                            handleRoleChange(
                                                                member.userId,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                        {ROLES.map((role) => (
                                                            <option
                                                                key={role}
                                                                value={role}>
                                                                {role}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <RoleBadge
                                                        role={member.role}
                                                    />
                                                )}

                                                {canRemoveMembers &&
                                                    !isCurrent &&
                                                    !isLastAdmin && (
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveMember(
                                                                    member.userId,
                                                                    member.user
                                                                        ?.name,
                                                                )
                                                            }
                                                            className="text-red-500 hover:text-red-600 p-1 rounded transition-colors"
                                                            title="Remove member">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'permissions' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Permission Matrix
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Configure what each role can do in this
                                    workspace
                                </p>
                            </div>
                            {hasUnsavedMatrix && (
                                <button
                                    onClick={handleSaveMatrix}
                                    disabled={savingMatrix}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg font-medium flex items-center gap-2 transition-colors">
                                    {savingMatrix ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {savingMatrix
                                        ? 'Saving...'
                                        : 'Save Permissions'}
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-white">
                                            Permission
                                        </th>
                                        {ROLES.map((role) => (
                                            <th
                                                key={role}
                                                className="text-center px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                {role}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {PERMISSION_GROUPS.map((group) => (
                                        <React.Fragment key={group.label}>
                                            <tr
                                                className="bg-gray-50 dark:bg-gray-700/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                                onClick={() =>
                                                    toggleGroup(group.label)
                                                }>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-3 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        {expandedGroups.has(
                                                            group.label,
                                                        ) ? (
                                                            <ChevronDown className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4" />
                                                        )}
                                                        {group.label}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedGroups.has(group.label) &&
                                                group.permissions.map(
                                                    (perm) => (
                                                        <tr
                                                            key={perm}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 pl-8">
                                                                {
                                                                    PERMISSION_LABELS[
                                                                        perm
                                                                    ]
                                                                }
                                                            </td>
                                                            {ROLES.map(
                                                                (role) => {
                                                                    const locked =
                                                                        isPermissionLocked(
                                                                            perm,
                                                                            role,
                                                                        );
                                                                    const value =
                                                                        locked
                                                                            ? getLockedValue(
                                                                                  perm,
                                                                                  role,
                                                                              )
                                                                            : matrix[
                                                                                  perm
                                                                              ]?.[
                                                                                  role
                                                                              ];
                                                                    return (
                                                                        <td
                                                                            key={
                                                                                role
                                                                            }
                                                                            className="text-center px-4 py-3">
                                                                            <div className="flex items-center justify-center gap-1">
                                                                                <button
                                                                                    disabled={
                                                                                        locked
                                                                                    }
                                                                                    onClick={() =>
                                                                                        !locked &&
                                                                                        handlePermissionToggle(
                                                                                            perm,
                                                                                            role,
                                                                                            !value,
                                                                                        )
                                                                                    }
                                                                                    className={`w-9 h-5 rounded-full relative transition-all ${
                                                                                        value
                                                                                            ? 'bg-indigo-500'
                                                                                            : 'bg-gray-200 dark:bg-gray-600'
                                                                                    } ${
                                                                                        locked
                                                                                            ? 'opacity-50 cursor-not-allowed'
                                                                                            : 'hover:shadow-sm'
                                                                                    }`}>
                                                                                    <span
                                                                                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                                                                                            value
                                                                                                ? 'left-4'
                                                                                                : 'left-0.5'
                                                                                        }`}
                                                                                    />
                                                                                </button>
                                                                                {locked && (
                                                                                    <Lock className="w-3 h-3 text-gray-400 ml-1" />
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                },
                                                            )}
                                                        </tr>
                                                    ),
                                                )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {hasUnsavedMatrix && (
                            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    You have unsaved changes to the permission
                                    matrix. Don't forget to save your changes!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
