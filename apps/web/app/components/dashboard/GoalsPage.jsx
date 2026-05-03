'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import useStore from '@/lib/store';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { validationRules, validateForm } from '@/lib/validations';
import { GoalSkeleton } from './LoadingSkeleton';
import {
    Plus,
    Target,
    Clock,
    ChevronRight,
    Search,
    Check,
    ChevronDown,
} from 'lucide-react';
import { goalsAPI } from '@/lib/api/goals';

const statusMap = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
};

const statusColors = {
    NOT_STARTED:
        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    IN_PROGRESS:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ON_HOLD:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    COMPLETED:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'];

const createGoalValidationRules = {
    title: [validationRules.required, validationRules.maxLength(200)],
    description: [validationRules.maxLength(1000)],
    dueDate: [validationRules.date],
};

// ✅ StatusDropdown as a proper component
function StatusDropdown({
    goal,
    statusDropdownOpen,
    setStatusDropdownOpen,
    onUpdateStatus,
    canUpdate,
}) {
    if (!canUpdate) {
        return (
            <span
                className={`text-xs px-2 py-0.5 rounded-full ${statusColors[goal.status]}`}>
                {statusMap[goal.status]}
            </span>
        );
    }

    const isOpen = statusDropdownOpen === goal.id;

    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setStatusDropdownOpen(isOpen ? null : goal.id);
                }}
                className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${statusColors[goal.status]} hover:shadow-sm`}>
                {statusMap[goal.status]}
                <ChevronDown className="w-3 h-3" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={(e) => {
                            e.stopPropagation();
                            setStatusDropdownOpen(null);
                        }}
                    />
                    <div className="absolute z-20 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                        {STATUSES.map((status) => (
                            <button
                                key={status}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onUpdateStatus(goal.id, status);
                                    setStatusDropdownOpen(null);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                    goal.status === status
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium'
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-2 h-2 rounded-full ${
                                            status === 'NOT_STARTED'
                                                ? 'bg-gray-400'
                                                : status === 'IN_PROGRESS'
                                                  ? 'bg-blue-500'
                                                  : status === 'ON_HOLD'
                                                    ? 'bg-amber-500'
                                                    : 'bg-green-500'
                                        }`}
                                    />
                                    {statusMap[status]}
                                    {status === goal.status && (
                                        <Check className="w-3 h-3 ml-auto" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function GoalsPage() {
    const {
        currentWorkspaceId,
        currentUser,
        setShowWorkspaceSelector,
        addToast,
    } = useStore();
    const permissions = usePermissions(currentUser?.role);

    const [showCreate, setShowCreate] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        dueDate: '',
        status: 'NOT_STARTED',
    });
    const [createErrors, setCreateErrors] = useState({});
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Data states
    const [goals, setGoals] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Action loading states
    const [creatingGoal, setCreatingGoal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    // Debounce search
    const debouncedSearchFn = useCallback(
        ((func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(null, args), delay);
            };
        })((value) => {
            setDebouncedSearch(value);
            setCurrentPage(1);
        }, 300),
        [],
    );

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        debouncedSearchFn(e.target.value);
    };

    // Fetch goals
    const fetchGoals = useCallback(async () => {
        if (!currentWorkspaceId) return;

        try {
            setLoading(true);
            setError(null);

            const result = await goalsAPI.list({
                workspaceId: currentWorkspaceId,
                status: filterStatus === 'All' ? undefined : filterStatus,
                search: debouncedSearch || undefined,
                page: currentPage,
                limit: 20,
            });

            setGoals(result.data || []);
            setPagination({
                page: result.page || 1,
                total: result.total || 0,
                totalPages: result.totalPages || 0,
            });
        } catch (err) {
            console.error('Failed to fetch goals:', err);
            setError(err.response?.data?.message || 'Failed to load goals');
            setGoals([]);
        } finally {
            setLoading(false);
        }
    }, [currentWorkspaceId, filterStatus, debouncedSearch, currentPage]);

    // Fetch on mount and when dependencies change
    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    // Create goal with optimistic update
    const handleCreate = async () => {
        const errors = validateForm(newGoal, createGoalValidationRules);
        if (Object.keys(errors).length > 0) {
            setCreateErrors(errors);
            return;
        }

        setCreateErrors({});

        const optimisticGoal = {
            id: 'temp-' + Date.now(),
            ...newGoal,
            workspaceId: currentWorkspaceId,
            owner: {
                name: currentUser?.name || 'You',
                id: currentUser?.id,
            },
            milestones: [],
            updates: [],
            createdAt: new Date().toISOString(),
            _optimistic: true,
        };

        // Optimistic update
        setGoals((prev) => [optimisticGoal, ...prev]);
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
        setShowCreate(false);
        setNewGoal({
            title: '',
            description: '',
            dueDate: '',
            status: 'NOT_STARTED',
        });

        try {
            setCreatingGoal(true);
            const result = await goalsAPI.create({
                ...newGoal,
                workspaceId: currentWorkspaceId,
            });

            // Replace optimistic goal with real one
            setGoals((prev) =>
                prev.map((g) => (g.id === optimisticGoal.id ? result.data : g)),
            );

            addToast({
                title: 'Goal Created',
                description: `"${result.data.title}" has been created successfully.`,
                type: 'success',
            });
        } catch (err) {
            console.error('Failed to create goal:', err);

            // Remove optimistic goal on error
            setGoals((prev) => prev.filter((g) => g.id !== optimisticGoal.id));
            setPagination((prev) => ({ ...prev, total: prev.total - 1 }));

            addToast({
                title: 'Creation Failed',
                description:
                    err.response?.data?.message || 'Failed to create goal',
                type: 'error',
            });

            // Reopen modal with data
            setShowCreate(true);
            setNewGoal(newGoal);
        } finally {
            setCreatingGoal(false);
        }
    };

    // Update goal status with optimistic update
    const handleStatusChange = async (goalId, newStatus) => {
        const previousGoals = [...goals];

        // Optimistic update
        setGoals((prev) =>
            prev.map((g) =>
                g.id === goalId ? { ...g, status: newStatus } : g,
            ),
        );

        try {
            setUpdatingStatus(goalId);
            await goalsAPI.update(goalId, { status: newStatus });

            addToast({
                title: 'Status Updated',
                description: `Goal status changed to ${statusMap[newStatus]}.`,
                type: 'success',
            });
        } catch (err) {
            console.error('Failed to update goal status:', err);

            // Revert on error
            setGoals(previousGoals);

            addToast({
                title: 'Update Failed',
                description:
                    err.response?.data?.message ||
                    'Failed to update goal status',
                type: 'error',
            });
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Early returns after all hooks
    if (!currentWorkspaceId) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
                        <Target className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Select a Workspace
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Please select or create a workspace to start creating
                        goals.
                    </p>
                    <button
                        onClick={() => setShowWorkspaceSelector(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Select Workspace
                    </button>
                </div>
            </div>
        );
    }

    if (loading && goals.length === 0) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <GoalSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (error && goals.length === 0) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                        <Target className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Failed to Load Goals
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">{error}</p>
                    <button
                        onClick={fetchGoals}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Goals & Milestones
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {pagination.total} goal
                        {pagination.total !== 1 ? 's' : ''}
                    </p>
                </div>
                
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2 self-start">
                        <Plus className="w-4 h-4" /> New Goal
                    </button>
                
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder="Search goals..."
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {['All', ...STATUSES].map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setFilterStatus(status);
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                filterStatus === status
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}>
                            {status === 'All' ? 'All' : statusMap[status]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal, i) => {
                    const totalProgress =
                        goal.milestones?.length > 0
                            ? Math.round(
                                  goal.milestones.reduce(
                                      (a, m) => a + m.progress,
                                      0,
                                  ) / goal.milestones.length,
                              )
                            : 0;

                    return (
                        <Link
                            key={goal.id}
                            href={`/goals/${goal.id}`}
                            className={`block text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition group animate-slideUp ${
                                goal._optimistic ? 'opacity-70' : ''
                            }`}
                            style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {goal.title}
                                    </h3>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition shrink-0" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                {goal.description || 'No description'}
                            </p>

                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 bg-indigo-500"
                                        style={{ width: `${totalProgress}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
                                    {totalProgress}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div
                                    className="flex items-center gap-2"
                                    onClick={(e) => e.preventDefault()}>
                                    <StatusDropdown
                                        goal={goal}
                                        statusDropdownOpen={statusDropdownOpen}
                                        setStatusDropdownOpen={
                                            setStatusDropdownOpen
                                        }
                                        onUpdateStatus={handleStatusChange}
                                        canUpdate={
                                            permissions.canUpdateGoals &&
                                            !goal._optimistic
                                        }
                                    />
                                    <span className="text-xs text-gray-400">
                                        {goal.milestones?.length || 0} milestone
                                        {goal.milestones?.length !== 1
                                            ? 's'
                                            : ''}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {goal.dueDate
                                        ? new Date(
                                              goal.dueDate,
                                          ).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                          })
                                        : 'No date'}
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                        {goal.owner?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || '?'}
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {goal.owner?.name || 'Unknown'}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {goal.updates?.length || 0} update
                                    {goal.updates?.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {!loading && goals.length === 0 && (
                <div className="text-center py-16">
                    <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery || filterStatus !== 'All'
                            ? 'No goals match your search criteria'
                            : 'No goals found'}
                    </p>
                    {permissions.canCreateGoals &&
                        !searchQuery &&
                        filterStatus === 'All' && (
                            <button
                                onClick={() => setShowCreate(true)}
                                className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                Create your first goal
                            </button>
                        )}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage <= 1 || loading}
                        className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Previous
                    </button>
                    {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                            let page;
                            if (pagination.totalPages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (
                                currentPage >=
                                pagination.totalPages - 2
                            ) {
                                page = pagination.totalPages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    disabled={loading}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                        currentPage === page
                                            ? 'bg-indigo-600 text-white'
                                            : 'border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}>
                                    {page}
                                </button>
                            );
                        },
                    )}
                    <button
                        onClick={() =>
                            setCurrentPage((p) =>
                                Math.min(pagination.totalPages, p + 1),
                            )
                        }
                        disabled={
                            currentPage >= pagination.totalPages || loading
                        }
                        className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Next
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setShowCreate(false);
                        setCreateErrors({});
                    }}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Create New Goal
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Title{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newGoal.title}
                                    onChange={(e) => {
                                        setNewGoal({
                                            ...newGoal,
                                            title: e.target.value,
                                        });
                                        if (createErrors.title)
                                            setCreateErrors({
                                                ...createErrors,
                                                title: null,
                                            });
                                    }}
                                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none ${
                                        createErrors.title
                                            ? 'border-red-500'
                                            : 'border-gray-200 dark:border-gray-600'
                                    }`}
                                    placeholder="e.g., Launch new feature"
                                    autoFocus
                                />
                                {createErrors.title && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {createErrors.title}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newGoal.description}
                                    onChange={(e) => {
                                        setNewGoal({
                                            ...newGoal,
                                            description: e.target.value,
                                        });
                                        if (createErrors.description)
                                            setCreateErrors({
                                                ...createErrors,
                                                description: null,
                                            });
                                    }}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none ${
                                        createErrors.description
                                            ? 'border-red-500'
                                            : 'border-gray-200 dark:border-gray-600'
                                    }`}
                                    placeholder="Describe the goal..."
                                />
                                {createErrors.description && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {createErrors.description}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newGoal.dueDate}
                                        onChange={(e) => {
                                            setNewGoal({
                                                ...newGoal,
                                                dueDate: e.target.value,
                                            });
                                            if (createErrors.dueDate)
                                                setCreateErrors({
                                                    ...createErrors,
                                                    dueDate: null,
                                                });
                                        }}
                                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none ${
                                            createErrors.dueDate
                                                ? 'border-red-500'
                                                : 'border-gray-200 dark:border-gray-600'
                                        }`}
                                    />
                                    {createErrors.dueDate && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {createErrors.dueDate}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={newGoal.status}
                                        onChange={(e) =>
                                            setNewGoal({
                                                ...newGoal,
                                                status: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="NOT_STARTED">
                                            Not Started
                                        </option>
                                        <option value="IN_PROGRESS">
                                            In Progress
                                        </option>
                                        <option value="ON_HOLD">On Hold</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowCreate(false);
                                        setCreateErrors({});
                                    }}
                                    disabled={creatingGoal}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={
                                        !newGoal.title.trim() || creatingGoal
                                    }
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    {creatingGoal
                                        ? 'Creating...'
                                        : 'Create Goal'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
