'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '@/lib/store';
import { validationRules, validateForm } from '@/lib/validations';
import {
    ArrowLeft,
    Target,
    Clock,
    Plus,
    Send,
    Edit2,
    Trash2,
} from 'lucide-react';
import { goalsAPI } from '@/lib/api/goals';

const STATUS_MAP = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
};

const STATUS_COLORS = {
    NOT_STARTED:
        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    IN_PROGRESS:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ON_HOLD:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    COMPLETED:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const GOAL_EDIT_RULES = {
    title: [validationRules.required, validationRules.maxLength(100)],
    description: [validationRules.maxLength(500)],
};

const MILESTONE_RULES = {
    title: [validationRules.required, validationRules.maxLength(100)],
};

const UPDATE_RULES = {
    text: [validationRules.required, validationRules.maxLength(500)],
};

export default function GoalDetail() {
    const params = useParams();
    const router = useRouter();
    const { currentWorkspaceId, currentUser, addToast } = useStore();

    const activityFeedRef = useRef(null);
    const milestonesRef = useRef(null);

    const goalId = params.id;

    // Data state
    const [goal, setGoal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit goal state
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editStatus, setEditStatus] = useState('NOT_STARTED');
    const [goalEditErrors, setGoalEditErrors] = useState({});

    // Milestone state
    const [newMilestone, setNewMilestone] = useState('');
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [editProgress, setEditProgress] = useState(0);
    const [milestoneErrors, setMilestoneErrors] = useState({});

    // Update/activity state
    const [newUpdate, setNewUpdate] = useState('');
    const [updateErrors, setUpdateErrors] = useState({});

    // Loading flags
    const [updatingGoal, setUpdatingGoal] = useState(false);
    const [deletingGoal, setDeletingGoal] = useState(false);
    const [creatingMilestone, setCreatingMilestone] = useState(false);
    const [updatingMilestone, setUpdatingMilestone] = useState(false);
    const [creatingUpdate, setCreatingUpdate] = useState(false);

    // Fetch goal
    const fetchGoal = async () => {
        if (!goalId || !currentWorkspaceId) return;

        try {
            setLoading(true);
            setError(null);
            const result = await goalsAPI.getById(goalId);
            setGoal(result.data);
        } catch (err) {
            console.error('Failed to fetch goal:', err);
            setError(err.response?.data?.message || 'Failed to load goal');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoal();
    }, [goalId, currentWorkspaceId]);

    // Sync edit fields when goal loads
    useEffect(() => {
        if (goal) {
            setEditTitle(goal.title || '');
            setEditDesc(goal.description || '');
            setEditStatus(goal.status || 'NOT_STARTED');
            setGoalEditErrors({});
        }
    }, [goal?.id]);

    // Calculate total progress
    const totalProgress =
        goal?.milestones?.length > 0
            ? Math.round(
                  goal?.milestones.reduce((a, m) => a + m?.progress, 0) /
                      goal.milestones.length,
              )
            : 0;

    // Auto-update goal status based on milestone progress
    const checkAndUpdateStatus = async (milestones) => {
        if (!goal) return;

        const progress =
            milestones?.length > 0
                ? Math.round(
                      milestones.reduce((a, m) => a + m.progress, 0) /
                          milestones.length,
                  )
                : 0;

        let newStatus = goal.status;

        if (progress === 100 && goal.status !== 'COMPLETED') {
            newStatus = 'COMPLETED';
        } else if (
            progress > 0 &&
            progress < 100 &&
            goal.status === 'NOT_STARTED'
        ) {
            newStatus = 'IN_PROGRESS';
        }

        if (newStatus !== goal.status) {
            try {
                await goalsAPI.update(goalId, { status: newStatus });
                setGoal((prev) => ({ ...prev, status: newStatus }));
                addToast({
                    title: 'Status Auto-Updated',
                    description: `Goal status changed to ${STATUS_MAP[newStatus]}.`,
                    type: 'success',
                });
            } catch (err) {
                console.error('Failed to auto-update status:', err);
            }
        }
    };

    // Update goal
    const handleUpdateGoal = async () => {
        const errors = validateForm(
            { title: editTitle.trim(), description: editDesc.trim() },
            GOAL_EDIT_RULES,
        );
        if (Object.keys(errors).length > 0) {
            setGoalEditErrors(errors);
            return;
        }

        setGoalEditErrors({});

        try {
            setUpdatingGoal(true);
            const result = await goalsAPI.update(goalId, {
                title: editTitle.trim(),
                description: editDesc.trim(),
                status: editStatus,
            });
            setGoal((prev) => ({ ...prev, ...result.data }));
            setEditing(false);
            addToast({
                title: 'Goal Updated',
                description: 'Goal updated successfully.',
                type: 'success',
            });
        } catch (err) {
            console.error('Failed to update goal:', err);
            addToast({
                title: 'Update Failed',
                description:
                    err.response?.data?.message || 'Failed to update goal',
                type: 'error',
            });
        } finally {
            setUpdatingGoal(false);
        }
    };

    // Update status
    const handleStatusChange = async (newStatus) => {
        try {
            setUpdatingGoal(true);
            const result = await goalsAPI.update(goalId, { status: newStatus });
            setGoal((prev) => ({ ...prev, ...result.data }));
            addToast({
                title: 'Status Updated',
                description: `Status changed to ${STATUS_MAP[newStatus]}.`,
                type: 'success',
            });
        } catch (err) {
            console.error('Failed to update status:', err);
            addToast({
                title: 'Update Failed',
                description:
                    err.response?.data?.message || 'Failed to update status',
                type: 'error',
            });
        } finally {
            setUpdatingGoal(false);
        }
    };

    // Delete goal
    const handleDeleteGoal = async () => {
        if (
            !confirm(
                'Are you sure you want to delete this goal? This cannot be undone.',
            )
        )
            return;

        try {
            setDeletingGoal(true);
            await goalsAPI.delete(goalId);
            addToast({
                title: 'Goal Deleted',
                description: `"${goal.title}" has been deleted.`,
                type: 'success',
            });
            router.push('/goals');
        } catch (err) {
            console.error('Failed to delete goal:', err);
            addToast({
                title: 'Delete Failed',
                description:
                    err.response?.data?.message || 'Failed to delete goal',
                type: 'error',
            });
            setDeletingGoal(false);
        }
    };

    // Add milestone
    const handleAddMilestone = async () => {
        const errors = validateForm(
            { title: newMilestone.trim() },
            MILESTONE_RULES,
        );
        if (Object.keys(errors).length > 0) {
            setMilestoneErrors(errors);
            return;
        }

        setMilestoneErrors({});

        try {
            setCreatingMilestone(true);
            const result = await goalsAPI.addMilestone(goalId, {
                title: newMilestone.trim(),
            });
            setGoal((prev) => ({
                ...prev,
                milestones: [...(prev?.milestones || []), result.data],
            }));
            setNewMilestone('');
            addToast({
                title: 'Milestone Added',
                description: `"${newMilestone}" added.`,
                type: 'success',
            });
            setTimeout(
                () =>
                    milestonesRef.current?.scrollTo(
                        0,
                        milestonesRef.current.scrollHeight,
                    ),
                50,
            );
        } catch (err) {
            console.error('Failed to add milestone:', err);
            addToast({
                title: 'Add Failed',
                description:
                    err.response?.data?.message || 'Failed to add milestone',
                type: 'error',
            });
        } finally {
            setCreatingMilestone(false);
        }
    };

    // Update milestone
    const handleUpdateMilestone = async () => {
        if (!editingMilestone) return;

        try {
            setUpdatingMilestone(true);
            const result = await goalsAPI.updateMilestone(
                goalId,
                editingMilestone,
                { progress: editProgress },
            );

            const updatedMilestones = goal.milestones.map((m) =>
                m.id === editingMilestone ? result.data : m,
            );

            setGoal((prev) => ({
                ...prev,
                milestones: updatedMilestones,
            }));

            setEditingMilestone(null);

            addToast({
                title: 'Progress Updated',
                description: `Milestone progress set to ${editProgress}%.`,
                type: 'success',
            });

            // Check if we need to auto-update goal status
            await checkAndUpdateStatus(updatedMilestones);
        } catch (err) {
            console.error('Failed to update milestone:', err);
            addToast({
                title: 'Update Failed',
                description:
                    err.response?.data?.message || 'Failed to update milestone',
                type: 'error',
            });
        } finally {
            setUpdatingMilestone(false);
        }
    };

    // Add update
    const handleAddUpdate = async () => {
        const errors = validateForm({ text: newUpdate.trim() }, UPDATE_RULES);
        if (Object.keys(errors).length > 0) {
            setUpdateErrors(errors);
            return;
        }

        setUpdateErrors({});

        try {
            setCreatingUpdate(true);
            const result = await goalsAPI.addUpdate(goalId, {
                text: newUpdate.trim(),
            });
            setGoal((prev) => ({
                ...prev,
                updates: [result.data, ...(prev?.updates || [])],
            }));
            setNewUpdate('');
            addToast({
                title: 'Update Posted',
                description: 'Your update has been posted.',
                type: 'success',
            });
            setTimeout(() => activityFeedRef.current?.scrollTo(0, 0), 50);
        } catch (err) {
            console.error('Failed to add update:', err);
            addToast({
                title: 'Post Failed',
                description:
                    err.response?.data?.message || 'Failed to post update',
                type: 'error',
            });
        } finally {
            setCreatingUpdate(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 animate-pulse" />
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                        <Target className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Failed to Load Goal
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">{error}</p>
                    <button
                        onClick={fetchGoal}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
                        Try Again
                    </button>
                    <Link
                        href="/goals"
                        className="block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        Back to Goals
                    </Link>
                </div>
            </div>
        );
    }

    // Not found state
    if (!goal) {
        return (
            <div className="p-6 text-center py-16">
                <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                    Goal not found
                </p>
                <Link
                    href="/goals"
                    className="mt-2 inline-block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    Back to Goals
                </Link>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col p-6 gap-4 overflow-hidden">
            <Link
                href="/goals"
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition text-sm shrink-0">
                <ArrowLeft className="w-4 h-4" /> Back to Goals
            </Link>

            {/* Goal Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shrink-0">
                {editing ? (
                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => {
                                    setEditTitle(e.target.value);
                                    if (goalEditErrors.title)
                                        setGoalEditErrors((prev) => ({
                                            ...prev,
                                            title: null,
                                        }));
                                }}
                                className={`w-full text-xl font-bold px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none ${
                                    goalEditErrors.title
                                        ? 'border-red-500'
                                        : 'border-gray-200 dark:border-gray-600'
                                }`}
                            />
                            {goalEditErrors.title && (
                                <p className="text-red-500 text-sm mt-1">
                                    {goalEditErrors.title}
                                </p>
                            )}
                        </div>
                        <div>
                            <textarea
                                value={editDesc}
                                onChange={(e) => {
                                    setEditDesc(e.target.value);
                                    if (goalEditErrors.description)
                                        setGoalEditErrors((prev) => ({
                                            ...prev,
                                            description: null,
                                        }));
                                }}
                                rows={2}
                                className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none ${
                                    goalEditErrors.description
                                        ? 'border-red-500'
                                        : 'border-gray-200 dark:border-gray-600'
                                }`}
                            />
                            {goalEditErrors.description && (
                                <p className="text-red-500 text-sm mt-1">
                                    {goalEditErrors.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white">
                                {Object.entries(STATUS_MAP).map(
                                    ([key, label]) => (
                                        <option key={key} value={key}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                            <button
                                onClick={handleUpdateGoal}
                                disabled={updatingGoal}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg">
                                {updatingGoal ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    setGoalEditErrors({});
                                }}
                                className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-5 h-5 text-indigo-500" />
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {goal.title}
                                </h1>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {goal.description}
                            </p>
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                                <select
                                    value={goal.status}
                                    onChange={(e) =>
                                        handleStatusChange(e.target.value)
                                    }
                                    disabled={updatingGoal}
                                    className={`text-xs px-2 py-0.5 rounded-full border-0 transition-all ${STATUS_COLORS[goal.status]} cursor-pointer hover:shadow-sm disabled:opacity-50`}>
                                    {Object.entries(STATUS_MAP).map(
                                        ([key, label]) => (
                                            <option
                                                key={key}
                                                value={key}
                                                className="bg-white dark:bg-gray-800">
                                                {label}
                                            </option>
                                        ),
                                    )}
                                </select>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {goal.dueDate
                                        ? new Date(
                                              goal.dueDate,
                                          ).toLocaleDateString()
                                        : 'No date'}
                                </span>
                                <span className="text-xs text-gray-400">
                                    Owner: {goal.owner?.name || 'Unknown'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setEditing(true)}
                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <button
                                onClick={handleDeleteGoal}
                                disabled={deletingGoal}
                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50">
                                <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Progress
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {totalProgress}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${totalProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                {/* Milestones */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 overflow-hidden flex flex-col">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 shrink-0">
                        Milestones ({goal.milestones?.length || 0})
                    </h3>

                    <div
                        ref={milestonesRef}
                        className="flex-1 overflow-y-auto space-y-2">
                        {goal.milestones?.length > 0 ? (
                            goal.milestones.map((m) => (
                                <div
                                    key={m?.id}
                                    className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition group">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {m?.title}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setEditingMilestone(m.id);
                                                setEditProgress(m?.progress);
                                            }}
                                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition">
                                            {m?.progress}%
                                            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                                        </button>
                                    </div>
                                    <div
                                        onClick={() => {
                                            setEditingMilestone(m.id);
                                            setEditProgress(m.progress);
                                        }}
                                        className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-300 transition">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                            style={{ width: `${m.progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition">
                                        Click to update progress
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Target className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No milestones yet
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Break down your goal into measurable
                                    milestones
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 pt-3 border-t border-gray-100 dark:border-gray-700 mt-3">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={newMilestone}
                                    onChange={(e) => {
                                        setNewMilestone(e.target.value);
                                        if (milestoneErrors.title)
                                            setMilestoneErrors((prev) => ({
                                                ...prev,
                                                title: null,
                                            }));
                                    }}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' &&
                                        handleAddMilestone()
                                    }
                                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none ${
                                        milestoneErrors.title
                                            ? 'border-red-500'
                                            : 'border-gray-200 dark:border-gray-600'
                                    }`}
                                    placeholder="New milestone..."
                                />
                                {milestoneErrors.title && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {milestoneErrors.title}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={handleAddMilestone}
                                disabled={
                                    creatingMilestone || !newMilestone.trim()
                                }
                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg shrink-0">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 overflow-hidden flex flex-col">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 shrink-0">
                        Activity Feed ({goal.updates?.length || 0})
                    </h3>

                    <div
                        ref={activityFeedRef}
                        className="flex-1 overflow-y-auto space-y-3">
                        {goal.updates?.length > 0 ? (
                            goal.updates.map((update) => (
                                <div
                                    key={update.id}
                                    className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {update.user?.name || 'Unknown'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(
                                                update.createdAt,
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {update.text}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Send className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No updates yet
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Post updates to keep stakeholders informed
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 pt-3 border-t border-gray-100 dark:border-gray-700 mt-3">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={newUpdate}
                                    onChange={(e) => {
                                        setNewUpdate(e.target.value);
                                        if (updateErrors.text)
                                            setUpdateErrors((prev) => ({
                                                ...prev,
                                                text: null,
                                            }));
                                    }}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleAddUpdate()
                                    }
                                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none ${
                                        updateErrors.text
                                            ? 'border-red-500'
                                            : 'border-gray-200 dark:border-gray-600'
                                    }`}
                                    placeholder="Post an update..."
                                />
                                {updateErrors.text && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {updateErrors.text}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={handleAddUpdate}
                                disabled={creatingUpdate || !newUpdate.trim()}
                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg shrink-0">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Milestone Progress Modal */}
            {editingMilestone && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setEditingMilestone(null)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Update Milestone Progress
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Progress ({editProgress}%)
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={editProgress}
                                    onChange={(e) =>
                                        setEditProgress(
                                            parseInt(e.target.value),
                                        )
                                    }
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                                <div className="text-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                                    {editProgress}%
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setEditingMilestone(null)}
                                    disabled={updatingMilestone}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateMilestone}
                                    disabled={updatingMilestone}
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg">
                                    {updatingMilestone ? 'Updating...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
