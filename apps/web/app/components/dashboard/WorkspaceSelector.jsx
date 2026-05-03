'use client';

import { useState, useEffect } from 'react';
import useStore from '@/lib/store';
import { workspacesAPI } from '@/lib/api/workspaces';
import { CheckSquare, Target, Plus, Check, Loader2 } from 'lucide-react';

export default function WorkspaceSelector({ isOpen, onClose }) {
    const { setCurrentWorkspace, setShowWorkspaceSelector, refreshWorkspaces } = useStore();
    const [newWsName, setNewWsName] = useState('');
    const [newWsDesc, setNewWsDesc] = useState('');
    const [newWsColor, setNewWsColor] = useState('#6366f1');
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch workspaces when modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchWorkspaces = async () => {
                try {
                    setLoading(true);
                    const res = await workspacesAPI.list();
                    setWorkspaces(res.data || []);
                } catch (err) {
                    console.error('Failed to fetch workspaces:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchWorkspaces();
        }
    }, [isOpen]);

    // Determine if we should show create form (when no workspaces exist)
    const showCreateForm = workspaces.length === 0;

    const handleSelect = (workspaceId) => {
        setCurrentWorkspace(workspaceId);
        setShowWorkspaceSelector(false);
    };

    const handleCreate = async () => {
        if (!newWsName.trim()) return;

        try {
            setActionLoading(true);
            setError(null);
            const res = await workspacesAPI.create({
                name: newWsName,
                description: newWsDesc,
                accentColor: newWsColor,
            });
            setCurrentWorkspace(res.id);
            setShowWorkspaceSelector(false);
            setNewWsName('');
            setNewWsDesc('');
            // Refresh workspace data globally
            refreshWorkspaces();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create workspace');
        } finally {
            setActionLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4"
            onClick={() => setShowWorkspaceSelector(false)}>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md animate-scaleIn"
                onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {showCreateForm ? 'Create Your First Workspace' : 'Select Workspace'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {showCreateForm
                        ? 'Set up your workspace to start collaborating with your team'
                        : 'Choose a workspace to continue'}
                </p>

                {!showCreateForm && (
                    <>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                            </div>
                        ) : (
                            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                                {workspaces.map((ws) => (
                                    <button
                                        key={ws.id}
                                        onClick={() => handleSelect(ws.id)}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                                            style={{
                                                backgroundColor:
                                                    ws.accentColor || '#6366f1',
                                            }}>
                                            {ws.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {ws.name}
                                            </p>
                                            {ws.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {ws.description}
                                                </p>
                                            )}
                                        </div>
                                        <Check className="w-4 h-4 text-gray-300" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition text-left">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                Create New Workspace
                            </span>
                        </button>
                    </>
                )}

                {showCreateForm && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={newWsName}
                                onChange={(e) => setNewWsName(e.target.value)}
                                placeholder="My Workspace"
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={newWsDesc}
                                onChange={(e) => setNewWsDesc(e.target.value)}
                                rows={3}
                                placeholder="Optional description..."
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                                        className={`w-8 h-8 rounded-full transition ${
                                            newWsColor === color
                                                ? 'ring-2 ring-offset-2 ring-indigo-500'
                                                : ''
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}

                        <div className={`flex gap-3 pt-2 ${showCreateForm && workspaces.length === 0 ? 'justify-center' : ''}`}>
                            {!(showCreateForm && workspaces.length === 0) && (
                                <button
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewWsName('');
                                        setNewWsDesc('');
                                        setError(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleCreate}
                                disabled={
                                    !newWsName.trim() ||
                                    actionLoading
                                }
                                className={`${showCreateForm && workspaces.length === 0 ? 'w-full' : 'flex-1'} px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2`}>
                                {actionLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                                Create Workspace
                            </button>
                        </div>
                    </div>
                )}

                {!(showCreateForm && workspaces.length === 0) && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => setShowWorkspaceSelector(false)}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition">
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
