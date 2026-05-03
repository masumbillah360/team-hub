'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import useStore, { Page } from '@/lib/store';
import { usePermissions } from '@/lib/hooks/usePermissions';
import WorkspaceSelector from './WorkspaceSelector';
import {
    LayoutDashboard,
    Target,
    Megaphone,
    CheckSquare,
    BarChart3,
    Settings,
    FileText,
    ChevronDown,
    Plus,
    Users,
    Zap,
    Pencil,
    Trash2,
    AlertTriangle,
} from 'lucide-react';
import { workspacesAPI } from '@/lib/api/workspaces';

export default function Sidebar() {
    const {
        currentPage,
        setPage,
        currentWorkspaceId,
        setCurrentWorkspace,
        currentUser,
        onlineUsers,
        setCurrentWorkspaceRole,
        showWorkspaceSelector,
        setShowWorkspaceSelector,
        workspacesVersion,
    } = useStore();

    const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState(null);
    const [newWsName, setNewWsName] = useState('');
    const [newWsDesc, setNewWsDesc] = useState('');
    const [newWsColor, setNewWsColor] = useState('#6366f1');
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    // Ref for the workspace dropdown container
    const workspaceDropdownRef = useRef(null);

    // ✅ Derive role values without useState — compute directly from data
    // This eliminates the need for a separate useEffect to sync them
    const currentWorkspace = workspaces?.find(
        (w) => w?.id === currentWorkspaceId,
    );
    const workspaceMembers = currentWorkspace?.members || [];
    const workspaceRole = workspaceMembers.find(
        (m) => m.user?.id === currentUser?.id,
    )?.role;
    const globalRole = currentUser?.role;
    const effectiveRole = workspaceRole || globalRole || 'VIEWER';

    // ✅ All hooks above ALL early returns
    const { canViewAuditLog, canViewWorkspaceSettings } =
        usePermissions(effectiveRole);

    // ✅ Fetch workspaces on mount
    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            const res = await workspacesAPI.list();
            setWorkspaces(res.data || []);
        } catch (err) {
            console.error('Failed to fetch workspaces:', err);
            setError('Failed to load workspaces');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, [workspacesVersion]);

    // Handle click outside to close workspace dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(event.target)) {
                setShowWorkspaceDropdown(false);
            }
        };

        if (showWorkspaceDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showWorkspaceDropdown]);

    // ✅ Sync role to store — also above early returns
    useEffect(() => {
        setCurrentWorkspaceRole(effectiveRole);
    }, [effectiveRole, setCurrentWorkspaceRole]);

    // ✅ Now safe to early return — all hooks already called above
    if (loading) {
        return (
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </aside>
        );
    }

    if (!workspaces?.length) {
        return (
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                            TeamHub
                        </span>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            No workspace found
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
                            Create Workspace
                        </button>
                    </div>
                </div>

                {/* ✅ Modal still works even in the empty state */}
                {showCreateModal && (
                    <CreateWorkspaceModal
                        editingWorkspace={editingWorkspace}
                        newWsName={newWsName}
                        setNewWsName={setNewWsName}
                        newWsDesc={newWsDesc}
                        setNewWsDesc={setNewWsDesc}
                        newWsColor={newWsColor}
                        setNewWsColor={setNewWsColor}
                        error={error}
                        actionLoading={actionLoading}
                        onSubmit={handleCreateWorkspace}
                        onClose={() => {
                            setShowCreateModal(false);
                            setEditingWorkspace(null);
                        }}
                    />
                )}
            </aside>
        );
    }

    const navItems = [
        { id: Page.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
        { id: Page.GOALS, label: 'Goals', icon: Target },
        { id: Page.ANNOUNCEMENTS, label: 'Announcements', icon: Megaphone },
        { id: Page.ACTION_ITEMS, label: 'Action Items', icon: CheckSquare },
        { id: Page.ANALYTICS, label: 'Analytics', icon: BarChart3 },
        ...(canViewAuditLog
            ? [{ id: Page.AUDIT_LOG, label: 'Audit Log', icon: FileText }]
            : []),
        ...(canViewWorkspaceSettings
            ? [
                  {
                      id: Page.WORKSPACE_SETTINGS,
                      label: 'Settings',
                      icon: Settings,
                  },
              ]
            : []),
    ];

    const routeMap = {
        [Page.DASHBOARD]: '/dashboard',
        [Page.GOALS]: '/goals',
        [Page.ANNOUNCEMENTS]: '/announcements',
        [Page.ACTION_ITEMS]: '/action-items',
        [Page.ANALYTICS]: '/analytics',
        [Page.AUDIT_LOG]: '/audit-log',
        [Page.WORKSPACE_SETTINGS]: '/workspace-settings',
    };

    const handleCreateWorkspace = async () => {
        if (!newWsName.trim()) return;
        try {
            setActionLoading(true);
            if (editingWorkspace) {
                await workspacesAPI.update(editingWorkspace.id, {
                    name: newWsName,
                    description: newWsDesc,
                    accentColor: newWsColor,
                });
                const res = await workspacesAPI.list();
                setWorkspaces(res.data || []);
                // Trigger global refresh for other components
                // refreshWorkspaces();
            } else {
                const res = await workspacesAPI.create({
                    name: newWsName,
                    description: newWsDesc,
                    accentColor: newWsColor,
                });
                setCurrentWorkspace(res.id);
            }
            const res = await workspacesAPI.list();
            setWorkspaces(res.data || []);
            // Trigger global refresh for other components
            // refreshWorkspaces();
            setShowCreateModal(false);
            setEditingWorkspace(null);
            setNewWsName('');
            setNewWsDesc('');
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteWorkspace = async () => {
        try {
            setActionLoading(true);
            await workspacesAPI.delete(currentWorkspaceId);
            const res = await workspacesAPI.list();
            setWorkspaces(res.data || []);
            // Trigger global refresh for other components
            // refreshWorkspaces();
            setCurrentWorkspace(null);
            localStorage.removeItem('lastWorkspaceId');
            setShowDeleteConfirm(false);
        } catch (err) {
            console.log('error', err);
            setError(err.response?.data?.message || 'Delete failed');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                        TeamHub
                    </span>
                </div>
            </div>

            {/* Workspace Selector */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <div className="relative" ref={workspaceDropdownRef}>
                    <button
                        onClick={() =>
                            setShowWorkspaceDropdown(!showWorkspaceDropdown)
                        }
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left">
                        <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{
                                backgroundColor:
                                    currentWorkspace?.accentColor || '#6366f1',
                            }}>
                            {currentWorkspace?.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
                            {currentWorkspace?.name}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    </button>

                    {showWorkspaceDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 animate-scaleIn">
                            {workspaces?.map((ws) => (
                                <div
                                    key={ws.id}
                                    className={`group relative flex items-center gap-2 px-3 py-2 first:rounded-t-lg last:rounded-b-lg ${ws.id === currentWorkspaceId ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                                    <button
                                        onClick={() => {
                                            setCurrentWorkspace(ws.id);
                                            setShowWorkspaceDropdown(false);
                                        }}
                                        className="flex-1 flex items-center gap-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition rounded px-1 py-1 -mx-1">
                                        <div
                                            className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
                                            style={{
                                                backgroundColor: ws.accentColor,
                                            }}>
                                            {ws.name.charAt(0)}
                                        </div>
                                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                                            {ws.name}
                                        </span>
                                    </button>
                                    {ws.id === currentWorkspaceId && (
                                        <div className="hidden group-hover:flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditingWorkspace(ws);
                                                    setNewWsName(ws.name);
                                                    setNewWsDesc(
                                                        ws.description || '',
                                                    );
                                                    setNewWsColor(
                                                        ws.accentColor ||
                                                            '#6366f1',
                                                    );
                                                    setShowCreateModal(true);
                                                    setShowWorkspaceDropdown(
                                                        false,
                                                    );
                                                }}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                title="Edit">
                                                <Pencil className="w-3 h-3 text-gray-500" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDeleteConfirm(true);
                                                    setShowWorkspaceDropdown(
                                                        false,
                                                    );
                                                }}
                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                                title="Delete">
                                                <Trash2 className="w-3 h-3 text-red-500" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    setShowCreateModal(true);
                                    setShowWorkspaceDropdown(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition border-t border-gray-100 dark:border-gray-600 rounded-b-lg">
                                <Plus className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                                    New Workspace
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    const route = routeMap[item.id];
                    return route ? (
                        <Link
                            key={item.id}
                            href={route}
                            onClick={() => setPage(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    ) : (
                        <button
                            key={item.id}
                            onClick={() => setPage(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Online Members */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Online ({onlineUsers?.length ?? 0})
                    </span>
                </div>
                <div className="space-y-1">
                    {workspaceMembers
                        .filter((m) => onlineUsers?.includes(m.user?.id))
                        .slice(0, 5)
                        .map((member) => (
                            <div
                                key={member.user?.id}
                                className="flex items-center gap-2 px-2 py-1">
                                <div className="relative">
                                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                        {member.user?.name?.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                    {member.user?.name}
                                </span>
                            </div>
                        ))}
                </div>
            </div>

            {/* User Profile */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                <Link
                    href="/profile"
                    onClick={() => setPage(Page.PROFILE)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {currentUser?.name?.charAt(0) || '?'}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {currentUser?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {currentUser?.email || ''}
                        </p>
                    </div>
                </Link>
            </div>

            {/* Create/Edit Workspace Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4"
                    onClick={() => {
                        setShowCreateModal(false);
                        setEditingWorkspace(null);
                    }}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {editingWorkspace
                                ? 'Edit Workspace'
                                : 'Create Workspace'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={newWsName}
                                    onChange={(e) =>
                                        setNewWsName(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newWsDesc}
                                    onChange={(e) =>
                                        setNewWsDesc(e.target.value)
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Accent Color
                                </label>
                                <div className="flex gap-2">
                                    {[
                                        '#6366f1',
                                        '#10b981',
                                        '#f59e0b',
                                        '#ef4444',
                                        '#8b5cf6',
                                        '#ec4899',
                                    ].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setNewWsColor(color)}
                                            className={`w-8 h-8 rounded-full transition ${newWsColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingWorkspace(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateWorkspace}
                                    disabled={
                                        actionLoading || !newWsName.trim()
                                    }
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50">
                                    {actionLoading
                                        ? 'Loading...'
                                        : editingWorkspace
                                          ? 'Save'
                                          : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Workspace Confirmation Modal */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4"
                    onClick={() => setShowDeleteConfirm(false)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Delete Workspace?
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            This will permanently delete "
                            {currentWorkspace?.name}" and all its data. This
                            action cannot be undone.
                        </p>
                        {error && (
                            <p className="text-sm text-red-500 mb-4">{error}</p>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteWorkspace}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                                {actionLoading ? (
                                    'Deleting...'
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
