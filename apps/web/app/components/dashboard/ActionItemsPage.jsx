'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import useStore from '@/lib/store';
import { actionItemsAPI } from '@/lib/api/actionItems';
import { goalsAPI } from '@/lib/api/goals';

import {
    Plus,
    LayoutGrid,
    List,
    Clock,
    GripVertical,
    Trash2,
    Edit2,
    X,
    ChevronDown,
    Check,
    Flag,
    CheckSquare,
} from 'lucide-react';

const statusColumns = [
    {
        key: 'TODO',
        label: 'To Do',
        icon: '📋',
        color: 'from-gray-400 to-gray-500',
        lightColor: 'bg-gray-50 dark:bg-gray-900/50',
        borderColor: 'border-gray-200 dark:border-gray-700',
    },
    {
        key: 'IN_PROGRESS',
        label: 'In Progress',
        icon: '⚡',
        color: 'from-blue-400 to-blue-600',
        lightColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
        key: 'IN_REVIEW',
        label: 'Review',
        icon: '👀',
        color: 'from-amber-400 to-amber-600',
        lightColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
    },
    {
        key: 'DONE',
        label: 'Done',
        icon: '✅',
        color: 'from-green-400 to-green-600',
        lightColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
    },
];

const priorities = [
    {
        key: 'LOW',
        label: 'Low',
        icon: Flag,
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-100 dark:bg-gray-700/50',
        border: 'border-gray-200 dark:border-gray-600',
    },
    {
        key: 'MEDIUM',
        label: 'Medium',
        icon: Flag,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-700',
    },
    {
        key: 'HIGH',
        label: 'High',
        icon: Flag,
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        border: 'border-orange-200 dark:border-orange-700',
    },
    {
        key: 'URGENT',
        label: 'Urgent',
        icon: Flag,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/30',
        border: 'border-red-200 dark:border-red-700',
    },
];

const avatarColors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-600',
    'from-amber-500 to-orange-600',
];

const getAvatarColor = (name = '') =>
    avatarColors[(name?.charCodeAt?.(0) || 0) % avatarColors.length];

const getInitials = (name = '') =>
    name
        ?.split(' ')
        ?.map((n) => n?.[0])
        ?.join('')
        ?.toUpperCase()
        ?.slice(0, 2) || '?';

const formatDateForInput = (date) => {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
};

const formatDisplayDate = (date) => {
    if (!date) return '-';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

const getPriority = (priorityKey) =>
    priorities.find((p) => p.key === priorityKey) || priorities[1];

// ─── MultiSelectDropdown ───────────────────────────────────────────────────────

function MultiSelectDropdown({ label, options = [], selected = [], onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {selected?.length === 0 ? (
                        <span className="text-gray-400 text-sm">
                            Select assignees...
                        </span>
                    ) : (
                        <div className="flex -space-x-2">
                            {selected?.slice(0, 3)?.map((userId) => {
                                const user = options?.find(
                                    (u) => u?.id === userId,
                                );
                                if (!user) return null;
                                return (
                                    <div
                                        key={userId}
                                        className={`w-6 h-6 rounded-full bg-linear-to-br ${getAvatarColor(user?.name)} flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-50 dark:border-gray-700`}>
                                        {getInitials(user?.name)}
                                    </div>
                                );
                            })}
                            {selected?.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-semibold border-2 border-gray-50 dark:border-gray-700">
                                    +{selected?.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                        <div className="p-2 space-y-1">
                            {options?.map((user) => {
                                const isSelected = selected?.includes(user?.id);
                                return (
                                    <button
                                        key={user?.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(
                                                isSelected
                                                    ? selected?.filter(
                                                          (id) =>
                                                              id !== user?.id,
                                                      )
                                                    : [...selected, user?.id],
                                            );
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                                            isSelected
                                                ? 'bg-indigo-50 dark:bg-indigo-900/30'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}>
                                        <div
                                            className={`w-8 h-8 rounded-full bg-linear-to-br ${getAvatarColor(user?.name)} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                                            {getInitials(user?.name)}
                                        </div>
                                        <span className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-white">
                                            {user?.name}
                                        </span>
                                        {isSelected && (
                                            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        )}
                                    </button>
                                );
                            })}
                            {options?.length === 0 && (
                                <div className="px-3 py-4 text-sm text-gray-400 text-center">
                                    No users found
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ActionItemsPage() {
    const {
        currentWorkspaceId,
        allUsers,
        currentUser,
        setShowWorkspaceSelector,
        addToast,
    } = useStore();

    const [actionItemView, setActionItemView] = useState('kanban');

    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const dragItemRef = useRef(null);
    const dragNodeRef = useRef(null);

    // ─── Data states ───────────────────────────────────────────────────────────

    const [actionItems, setActionItems] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [goalsLoading, setGoalsLoading] = useState(false);
    const [error, setError] = useState(null);
    console.log('actionItems', actionItems);
    // Action loading states
    const [creatingItem, setCreatingItem] = useState(false);
    const [updatingItem, setUpdatingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);

    // ─── New item form state ───────────────────────────────────────────────────

    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        assigneeIds: [],
        priority: 'MEDIUM',
        dueDate: '',
        status: 'TODO',
        goalId: '',
    });

    // ─── Fetch action items ────────────────────────────────────────────────────

    const fetchActionItems = useCallback(async () => {
        if (!currentWorkspaceId) return;

        try {
            setLoading(true);
            setError(null);

            const result = await actionItemsAPI.list({
                workspaceId: currentWorkspaceId,
                page: 1,
                limit: 100,
            });

            setActionItems(result.data || []);
        } catch (err) {
            console.error('Failed to fetch action items:', err);
            setError(
                err.response?.data?.message || 'Failed to load action items',
            );
            setActionItems([]);
        } finally {
            setLoading(false);
        }
    }, [currentWorkspaceId]);

    // ─── Fetch goals ───────────────────────────────────────────────────────────

    const fetchGoals = useCallback(async () => {
        if (!currentWorkspaceId) return;

        try {
            setGoalsLoading(true);

            const result = await goalsAPI.list({
                workspaceId: currentWorkspaceId,
                page: 1,
                limit: 100,
            });

            setGoals(result.data || []);
        } catch (err) {
            console.error('Failed to fetch goals:', err);
            setGoals([]);
        } finally {
            setGoalsLoading(false);
        }
    }, [currentWorkspaceId]);

    useEffect(() => {
        fetchActionItems();
        fetchGoals();
    }, [fetchActionItems, fetchGoals]);

    // ─── Helper functions ──────────────────────────────────────────────────────

    const getUser = (id) => allUsers?.find((u) => u?.id === id);

    const getAssigneeIds = (item) => {
        if (Array.isArray(item?.assigneeIds)) return item.assigneeIds;
        if (Array.isArray(item?.assignees))
            return item.assignees?.map((u) => u?.id)?.filter(Boolean);
        if (item?.assigneeId) return [item.assigneeId];
        if (item?.assignee?.id) return [item.assignee.id];
        return [];
    };

    const getAssignees = (item) => {
        const ids = getAssigneeIds(item);
        const usersFromIds = ids?.map((id) => getUser(id))?.filter(Boolean);
        if (usersFromIds?.length > 0) return usersFromIds;
        if (Array.isArray(item?.assignees)) return item.assignees;
        if (item?.assignee) return [item.assignee];
        return [];
    };

    const buildPayload = (item) => {
        const assigneeIds = item?.assigneeIds || [];
        const assigneeId =
            assigneeIds?.[0] || item?.assigneeId || currentUser?.id || null;

        return {
            title: item?.title?.trim?.() || '',
            description: item?.description || '',
            priority: item?.priority || 'MEDIUM',
            dueDate: item?.dueDate || null,
            status: item?.status || 'TODO',
            goalId: item?.goalId || null,
            workspaceId: currentWorkspaceId,
            assigneeId,
            assigneeIds:
                assigneeIds?.length > 0
                    ? assigneeIds
                    : assigneeId
                      ? [assigneeId]
                      : [],
        };
    };

    // ─── CRUD handlers ─────────────────────────────────────────────────────────

    const handleCreate = async () => {
        if (!newItem?.title?.trim()) return;

        const payload = buildPayload(newItem);

        const optimisticItem = {
            id: `temp-${Date.now()}`,
            ...payload,
            assignee:
                allUsers?.find((u) => u?.id === payload?.assigneeId) || null,
            goal: goals?.find((g) => g?.id === payload?.goalId) || null,
            createdAt: new Date().toISOString(),
            _optimistic: true,
        };

        // Optimistic update
        setActionItems((prev) => [optimisticItem, ...prev]);
        setShowCreate(false);
        setNewItem({
            title: '',
            description: '',
            assigneeIds: [],
            priority: 'MEDIUM',
            dueDate: '',
            status: 'TODO',
            goalId: '',
        });

        try {
            setCreatingItem(true);
            const result = await actionItemsAPI.create(payload);

            // Replace optimistic item with real one
            setActionItems((prev) =>
                prev.map((item) =>
                    item.id === optimisticItem.id ? result.data : item,
                ),
            );

            addToast({
                title: 'Item Created',
                description: `"${result.data.title}" has been created.`,
                type: 'success',
            });
        } catch (err) {
            console.error('Failed to create action item:', err);

            // Revert optimistic update
            setActionItems((prev) =>
                prev.filter((item) => item.id !== optimisticItem.id),
            );

            setShowCreate(true);
            setNewItem(newItem);

            addToast({
                title: 'Creation Failed',
                description:
                    err.response?.data?.message || 'Failed to create item',
                type: 'error',
            });
        } finally {
            setCreatingItem(false);
        }
    };

    const handleUpdate = async (id, data) => {
        const currentItem = actionItems?.find((item) => item?.id === id);
        if (!currentItem) return;

        const payload = buildPayload({ ...currentItem, ...data });
        const previousItems = [...actionItems];

        // Optimistic update
        setActionItems((prev) =>
            prev.map((item) =>
                item?.id === id
                    ? {
                          ...item,
                          ...data,
                          assignee:
                              allUsers?.find(
                                  (u) => u?.id === payload?.assigneeId,
                              ) ||
                              item?.assignee ||
                              null,
                      }
                    : item,
            ),
        );

        try {
            setUpdatingItem(id);
            const result = await actionItemsAPI.update(id, payload);

            // Replace with server response
            setActionItems((prev) =>
                prev.map((item) => (item?.id === id ? result.data : item)),
            );
        } catch (err) {
            console.error('Failed to update action item:', err);

            // Revert on error
            setActionItems(previousItems);

            addToast({
                title: 'Update Failed',
                description:
                    err.response?.data?.message || 'Failed to update item',
                type: 'error',
            });
        } finally {
            setUpdatingItem(null);
        }
    };

    const handleDelete = async (id) => {
        if (!id) return;

        const previousItems = [...actionItems];

        // Optimistic update
        setActionItems((prev) => prev.filter((item) => item?.id !== id));

        try {
            setDeletingItem(id);
            await actionItemsAPI.delete(id);

            addToast({
                title: 'Item Deleted',
                description: 'Action item has been deleted.',
                type: 'success',
            });
        } catch (err) {
            console.error('Failed to delete action item:', err);

            // Revert on error
            setActionItems(previousItems);

            addToast({
                title: 'Delete Failed',
                description:
                    err.response?.data?.message || 'Failed to delete item',
                type: 'error',
            });
        } finally {
            setDeletingItem(null);
        }
    };

    // ─── Drag and Drop handlers ────────────────────────────────────────────────

    const handleDragStart = (e, itemId) => {
        dragItemRef.current = itemId;
        dragNodeRef.current = e?.target;
        dragNodeRef.current?.addEventListener?.('dragend', handleDragEnd);
        setTimeout(() => {
            setDraggedItem(itemId);
        }, 0);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverColumn(null);
        dragItemRef.current = null;
        if (dragNodeRef.current) {
            dragNodeRef.current?.removeEventListener?.(
                'dragend',
                handleDragEnd,
            );
            dragNodeRef.current = null;
        }
    };

    const handleDragOver = (e, status) => {
        e.preventDefault();
        if (dragItemRef.current) {
            setDragOverColumn(status);
        }
    };

    const handleDragEnter = (e, status) => {
        if (dragItemRef.current) {
            setDragOverColumn(status);
        }
    };

    const handleDragLeave = (e) => {
        if (e.currentTarget === e.target) {
            setDragOverColumn(null);
        }
    };

    const handleDrop = (e, status) => {
        e.preventDefault();
        if (dragItemRef.current) {
            handleUpdate(dragItemRef.current, { status });
        }
        setDraggedItem(null);
        setDragOverColumn(null);
        dragItemRef.current = null;
    };

    // ─── ItemCard component ────────────────────────────────────────────────────

    const ItemCard = ({ item }) => {
        const priority = getPriority(item?.priority);
        const assignees = getAssignees(item);
        const isDragging = draggedItem === item?.id;
        const PriorityIcon = priority?.icon;
        const isDeleting = deletingItem === item?.id;

        return (
            <div
                draggable={!item._optimistic}
                onDragStart={(e) => handleDragStart(e, item?.id)}
                className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-4 transition-all duration-200 cursor-move group relative ${
                    priority?.border
                } ${
                    isDragging
                        ? 'opacity-40 scale-95 rotate-2'
                        : isDeleting
                          ? 'opacity-50'
                          : 'opacity-100 scale-100 hover:shadow-lg'
                } ${item._optimistic ? 'animate-pulse' : ''}`}>
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <GripVertical className="w-4 h-4 text-gray-300" />
                </div>

                <div className="flex items-center justify-between mb-3">
                    <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${priority?.bg} ${priority?.color} border ${priority?.border}`}>
                        <PriorityIcon className="w-3 h-3" />
                        {priority?.label}
                    </div>
                    {!item._optimistic && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(item?.id);
                                }}
                                disabled={updatingItem === item?.id}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition disabled:opacity-50">
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                        confirm(
                                            'Are you sure you want to delete this item?',
                                        )
                                    ) {
                                        handleDelete(item?.id);
                                    }
                                }}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition disabled:opacity-50">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 leading-snug">
                    {item?.title}
                </h4>

                {item?.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {item?.description}
                    </p>
                )}

                {item?.goalId && (
                    <div className="mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                            🎯{' '}
                            {goals
                                ?.find((g) => g?.id === item?.goalId)
                                ?.title?.slice(0, 25) ||
                                item?.goal?.title?.slice(0, 25) ||
                                'Goal'}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex -space-x-2">
                        {assignees?.slice(0, 3)?.map((user) => (
                            <div
                                key={user?.id}
                                title={user?.name}
                                className={`w-7 h-7 rounded-full bg-linear-to-br ${getAvatarColor(user?.name)} flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800 shadow-sm`}>
                                {getInitials(user?.name)}
                            </div>
                        ))}
                        {assignees?.length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-semibold border-2 border-white dark:border-gray-800">
                                +{assignees?.length - 3}
                            </div>
                        )}
                    </div>
                    {item?.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatDisplayDate(item?.dueDate)}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ─── Early returns ─────────────────────────────────────────────────────────

    if (!currentWorkspaceId) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
                        <CheckSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Select a Workspace
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Please select or create a workspace to start creating
                        action items.
                    </p>
                    <button
                        onClick={() => setShowWorkspaceSelector(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Select Workspace
                    </button>
                </div>
            </div>
        );
    }

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                            <LayoutGrid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                                Action Items
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {actionItems?.length || 0} total items
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                            <button
                                onClick={() => setActionItemView('kanban')}
                                className={`p-2 rounded-lg transition ${
                                    actionItemView === 'kanban'
                                        ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}>
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setActionItemView('list')}
                                className={`p-2 rounded-lg transition ${
                                    actionItemView === 'list'
                                        ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}>
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm">
                            <Plus className="w-4 h-4" />
                            New Item
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        Loading action items...
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && !loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <p className="text-sm text-red-500">{error}</p>
                        <button
                            onClick={fetchActionItems}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition">
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Kanban View */}
            {!loading && !error && actionItemView === 'kanban' && (
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                    <div className="h-full flex gap-4 min-w-max">
                        {statusColumns?.map((col) => {
                            const colItems = actionItems?.filter(
                                (ai) => ai?.status === col?.key,
                            );
                            const isDragOver = dragOverColumn === col?.key;

                            return (
                                <div
                                    key={col?.key}
                                    onDragOver={(e) =>
                                        handleDragOver(e, col?.key)
                                    }
                                    onDragEnter={(e) =>
                                        handleDragEnter(e, col?.key)
                                    }
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, col?.key)}
                                    className={`flex-1 min-w-[320px] flex flex-col rounded-2xl transition-all duration-200 ${
                                        col?.lightColor
                                    } border-2 ${
                                        isDragOver
                                            ? `${col?.borderColor} scale-[1.02] shadow-lg`
                                            : 'border-transparent'
                                    }`}>
                                    <div className="shrink-0 p-4 pb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">
                                                    {col?.icon}
                                                </span>
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {col?.label}
                                                </h3>
                                            </div>
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-linear-to-r ${col?.color} text-white shadow-sm`}>
                                                {colItems?.length || 0}
                                            </span>
                                        </div>
                                        {isDragOver && (
                                            <div className="mt-2 py-3 border-2 border-dashed border-current rounded-lg text-center text-xs font-medium opacity-60 bg-white/50 dark:bg-gray-800/50">
                                                ✨ Drop here
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                                        {colItems?.map((item) => (
                                            <ItemCard
                                                key={item?.id}
                                                item={item}
                                            />
                                        ))}
                                        {colItems?.length === 0 &&
                                            !isDragOver && (
                                                <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3">
                                                        <span className="text-2xl">
                                                            {col?.icon}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        No items
                                                    </p>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* List View */}
            {!loading && !error && actionItemView === 'list' && (
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                            <div className="col-span-4">Task</div>
                            <div className="col-span-2">Assignees</div>
                            <div className="col-span-2">Priority</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-1">Due</div>
                            <div className="col-span-1 text-right">Actions</div>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {actionItems?.map((item) => {
                                const priority = getPriority(item?.priority);
                                const assignees = getAssignees(item);
                                const PriorityIcon = priority?.icon;
                                const isUpdating = updatingItem === item?.id;
                                const isDeleting = deletingItem === item?.id;

                                return (
                                    <div
                                        key={item?.id}
                                        className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition items-center group ${
                                            item._optimistic || isDeleting
                                                ? 'opacity-60'
                                                : ''
                                        }`}>
                                        <div className="col-span-4">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                        {item?.title}
                                                    </p>
                                                    {item?.description && (
                                                        <p className="text-xs text-gray-400 truncate">
                                                            {item?.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex -space-x-2">
                                                {assignees
                                                    ?.slice(0, 3)
                                                    ?.map((user) => (
                                                        <div
                                                            key={user?.id}
                                                            title={user?.name}
                                                            className={`w-7 h-7 rounded-full bg-linear-to-br ${getAvatarColor(user?.name)} flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800`}>
                                                            {getInitials(
                                                                user?.name,
                                                            )}
                                                        </div>
                                                    ))}
                                                {assignees?.length > 3 && (
                                                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-semibold border-2 border-white dark:border-gray-800">
                                                        +{assignees?.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${priority?.bg} ${priority?.color} border ${priority?.border}`}>
                                                <PriorityIcon className="w-3 h-3" />
                                                {priority?.label}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <select
                                                value={item?.status}
                                                onChange={(e) =>
                                                    handleUpdate(item?.id, {
                                                        status: e?.target
                                                            ?.value,
                                                    })
                                                }
                                                disabled={
                                                    isUpdating ||
                                                    item._optimistic
                                                }
                                                className="w-full text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50">
                                                {statusColumns?.map((col) => (
                                                    <option
                                                        key={col?.key}
                                                        value={col?.key}>
                                                        {col?.icon} {col?.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-1 text-xs text-gray-500 dark:text-gray-400">
                                            {formatDisplayDate(item?.dueDate)}
                                        </div>
                                        <div className="col-span-1 flex justify-end gap-1">
                                            <button
                                                onClick={() =>
                                                    setEditingId(item?.id)
                                                }
                                                disabled={
                                                    item._optimistic ||
                                                    isDeleting
                                                }
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition disabled:opacity-50">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            'Delete this item?',
                                                        )
                                                    ) {
                                                        handleDelete(item?.id);
                                                    }
                                                }}
                                                disabled={
                                                    isDeleting ||
                                                    item._optimistic
                                                }
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {actionItems?.length === 0 && (
                                <div className="px-6 py-12 text-center">
                                    <CheckSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-sm text-gray-400">
                                        No action items found.
                                    </p>
                                    <button
                                        onClick={() => setShowCreate(true)}
                                        className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                        Create your first item
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowCreate(false)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Plus className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">
                                            New Action Item
                                        </h3>
                                        <p className="text-xs text-indigo-200">
                                            Create a new task
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-5 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newItem?.title}
                                    onChange={(e) =>
                                        setNewItem({
                                            ...newItem,
                                            title: e?.target?.value,
                                        })
                                    }
                                    autoFocus
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleCreate()
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 outline-none transition text-sm font-medium"
                                    placeholder="e.g., Implement user authentication"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newItem?.description}
                                    onChange={(e) =>
                                        setNewItem({
                                            ...newItem,
                                            description: e?.target?.value,
                                        })
                                    }
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 outline-none resize-none transition text-sm"
                                    placeholder="Add more details..."
                                />
                            </div>

                            <MultiSelectDropdown
                                label="Assignees"
                                options={allUsers || []}
                                selected={newItem?.assigneeIds || []}
                                onChange={(ids) =>
                                    setNewItem({ ...newItem, assigneeIds: ids })
                                }
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Priority
                                    </label>
                                    <select
                                        value={newItem?.priority}
                                        onChange={(e) =>
                                            setNewItem({
                                                ...newItem,
                                                priority: e?.target?.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-medium">
                                        {priorities?.map((p) => (
                                            <option key={p?.key} value={p?.key}>
                                                {p?.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newItem?.dueDate}
                                        onChange={(e) =>
                                            setNewItem({
                                                ...newItem,
                                                dueDate: e?.target?.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Initial Status
                                </label>
                                <select
                                    value={newItem?.status}
                                    onChange={(e) =>
                                        setNewItem({
                                            ...newItem,
                                            status: e?.target?.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-medium">
                                    {statusColumns?.map((col) => (
                                        <option key={col?.key} value={col?.key}>
                                            {col?.icon} {col?.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Link to Goal (Optional)
                                </label>
                                <select
                                    value={newItem?.goalId}
                                    onChange={(e) =>
                                        setNewItem({
                                            ...newItem,
                                            goalId: e?.target?.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm">
                                    <option value="">No goal linked</option>
                                    {goals?.map((g) => (
                                        <option key={g?.id} value={g?.id}>
                                            🎯 {g?.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => setShowCreate(false)}
                                disabled={creatingItem}
                                className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium disabled:opacity-50">
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={
                                    !newItem?.title?.trim() || creatingItem
                                }
                                className="px-5 py-2 text-sm bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition font-semibold flex items-center gap-2 shadow-sm">
                                <Plus className="w-4 h-4" />
                                {creatingItem ? 'Creating...' : 'Create Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingId &&
                (() => {
                    const item = actionItems?.find(
                        (ai) => ai?.id === editingId,
                    );
                    if (!item) return null;
                    const isUpdating = updatingItem === item?.id;

                    return (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setEditingId(null)}>
                            <div
                                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}>
                                <div className="bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                                <Edit2 className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-white">
                                                    Edit Action Item
                                                </h3>
                                                <p className="text-xs text-indigo-200">
                                                    Update task details
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="px-6 py-5 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={item?.title}
                                            onChange={(e) =>
                                                handleUpdate(item?.id, {
                                                    title: e?.target?.value,
                                                })
                                            }
                                            disabled={isUpdating}
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition text-sm font-medium disabled:opacity-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            defaultValue={item?.description}
                                            onChange={(e) =>
                                                handleUpdate(item?.id, {
                                                    description:
                                                        e?.target?.value,
                                                })
                                            }
                                            disabled={isUpdating}
                                            rows={3}
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none transition text-sm disabled:opacity-50"
                                        />
                                    </div>

                                    <MultiSelectDropdown
                                        label="Assignees"
                                        options={allUsers || []}
                                        selected={getAssigneeIds(item)}
                                        onChange={(ids) =>
                                            handleUpdate(item?.id, {
                                                assigneeIds: ids,
                                                assigneeId:
                                                    ids?.[0] ||
                                                    item?.assigneeId ||
                                                    item?.assignee?.id ||
                                                    null,
                                            })
                                        }
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                Priority
                                            </label>
                                            <select
                                                defaultValue={item?.priority}
                                                onChange={(e) =>
                                                    handleUpdate(item?.id, {
                                                        priority:
                                                            e?.target?.value,
                                                    })
                                                }
                                                disabled={isUpdating}
                                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-medium disabled:opacity-50">
                                                {priorities?.map((p) => (
                                                    <option
                                                        key={p?.key}
                                                        value={p?.key}>
                                                        {p?.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                Status
                                            </label>
                                            <select
                                                defaultValue={item?.status}
                                                onChange={(e) =>
                                                    handleUpdate(item?.id, {
                                                        status: e?.target
                                                            ?.value,
                                                    })
                                                }
                                                disabled={isUpdating}
                                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-medium disabled:opacity-50">
                                                {statusColumns?.map((col) => (
                                                    <option
                                                        key={col?.key}
                                                        value={col?.key}>
                                                        {col?.icon} {col?.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            defaultValue={formatDateForInput(
                                                item?.dueDate,
                                            )}
                                            onChange={(e) =>
                                                handleUpdate(item?.id, {
                                                    dueDate:
                                                        e?.target?.value ||
                                                        null,
                                                })
                                            }
                                            disabled={isUpdating}
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm disabled:opacity-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Link to Goal
                                        </label>
                                        <select
                                            defaultValue={item?.goalId || ''}
                                            onChange={(e) =>
                                                handleUpdate(item?.id, {
                                                    goalId:
                                                        e?.target?.value ||
                                                        null,
                                                })
                                            }
                                            disabled={isUpdating}
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm disabled:opacity-50">
                                            <option value="">
                                                No goal linked
                                            </option>
                                            {goals?.map((g) => (
                                                <option
                                                    key={g?.id}
                                                    value={g?.id}>
                                                    🎯 {g?.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="px-5 py-2 text-sm bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl transition font-semibold shadow-sm">
                                        {isUpdating ? 'Saving...' : 'Done'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
        </div>
    );
}
