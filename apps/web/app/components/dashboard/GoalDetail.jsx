'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ArrowLeft,
    Target,
    Clock,
    Plus,
    Send,
    Edit2,
    Trash2,
    CheckCircle2,
} from 'lucide-react';

export default function GoalDetail() {
    const params = useParams();
    const goalId = params.id;

    // Mock Goal Data
    const [goal, setGoal] = useState({
        id: goalId,
        title: 'Launch Q3 Marketing Campaign',
        description:
            'Create and execute a comprehensive multi-channel marketing strategy for our flagship product launch.',
        status: 'IN_PROGRESS',
        dueDate: '2026-06-15',
        owner: { name: 'Alex Chen' },
        milestones: [
            { id: 'm1', title: 'Create campaign assets', progress: 85 },
            { id: 'm2', title: 'Set up landing page', progress: 100 },
            { id: 'm3', title: 'Run A/B tests', progress: 40 },
            {
                id: 'm4',
                title: 'Final approval from stakeholders',
                progress: 10,
            },
        ],
        updates: [
            {
                id: 'u1',
                user: { name: 'Alex Chen' },
                text: 'Completed landing page and started running initial ads.',
                createdAt: '2026-05-01T10:30:00Z',
            },
            {
                id: 'u2',
                user: { name: 'Sarah Khan' },
                text: 'Got approval for the new campaign visuals.',
                createdAt: '2026-05-02T14:15:00Z',
            },
        ],
    });

    const [newMilestone, setNewMilestone] = useState('');
    const [newUpdate, setNewUpdate] = useState('');
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(goal.title);
    const [editDesc, setEditDesc] = useState(goal.description);
    const [editStatus, setEditStatus] = useState(goal.status);
    const [editingMilestoneId, setEditingMilestoneId] = useState(null);
    const [editProgress, setEditProgress] = useState(0);

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

    const totalProgress =
        goal.milestones.length > 0
            ? Math.round(
                  goal.milestones.reduce((sum, m) => sum + m.progress, 0) /
                      goal.milestones.length,
              )
            : 0;

    // Update Goal Status
    const updateGoalStatus = (newStatus) => {
        setGoal((prev) => ({ ...prev, status: newStatus }));
    };

    // Add New Milestone
    const handleAddMilestone = () => {
        if (!newMilestone.trim()) return;

        const newMilestoneObj = {
            id: 'm-' + Date.now(),
            title: newMilestone,
            progress: 0,
        };

        setGoal((prev) => ({
            ...prev,
            milestones: [...prev.milestones, newMilestoneObj],
        }));
        setNewMilestone('');
    };

    // Update Milestone Progress
    const updateMilestoneProgress = (milestoneId, newProgress) => {
        setGoal((prev) => ({
            ...prev,
            milestones: prev.milestones.map((m) =>
                m.id === milestoneId ? { ...m, progress: newProgress } : m,
            ),
        }));
        setEditingMilestoneId(null);
    };

    // Add Activity Update
    const handleAddUpdate = () => {
        if (!newUpdate.trim()) return;

        const newUpdateObj = {
            id: 'u-' + Date.now(),
            user: { name: 'You' },
            text: newUpdate,
            createdAt: new Date().toISOString(),
        };

        setGoal((prev) => ({
            ...prev,
            updates: [newUpdateObj, ...prev.updates],
        }));
        setNewUpdate('');
    };

    // Save Goal Edit
    const saveEdit = () => {
        setGoal((prev) => ({
            ...prev,
            title: editTitle,
            description: editDesc,
            status: editStatus,
        }));
        setEditing(false);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Link
                href="/goals"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Goals
            </Link>

            {/* Goal Header */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 mb-6">
                {editing ? (
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full text-3xl font-bold px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700"
                        />
                        <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full h-28 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700"
                        />
                        <div className="flex gap-3">
                            <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="px-4 py-3 border rounded-2xl">
                                {Object.entries(statusMap).map(
                                    ([key, label]) => (
                                        <option key={key} value={key}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                            <button
                                onClick={saveEdit}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl">
                                Save Changes
                            </button>
                            <button
                                onClick={() => setEditing(false)}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl">
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <Target className="w-8 h-8 text-indigo-600" />
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {goal.title}
                                </h1>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                {goal.description}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-6">
                                <button
                                    onClick={() =>
                                        updateGoalStatus(goal.status)
                                    }
                                    className={`px-5 py-2 rounded-2xl text-sm font-medium ${statusColors[goal.status]}`}>
                                    {statusMap[goal.status]}
                                </button>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    Due{' '}
                                    {new Date(goal.dueDate).toLocaleDateString(
                                        'en-US',
                                        {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        },
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Owner:{' '}
                                    <span className="font-medium">
                                        {goal.owner.name}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditing(true)}
                                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl">
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <button className="p-3 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-2xl">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mt-8">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Overall Progress</span>
                        <span className="font-bold text-indigo-600">
                            {totalProgress}%
                        </span>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-700"
                            style={{ width: `${totalProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Milestones Section */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />{' '}
                        Milestones
                    </h3>

                    <div className="flex-1 space-y-4 overflow-auto">
                        {goal.milestones.map((milestone) => (
                            <div
                                key={milestone.id}
                                className="p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 transition group">
                                <div className="flex justify-between items-start">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {milestone.title}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setEditingMilestoneId(milestone.id);
                                            setEditProgress(milestone.progress);
                                        }}
                                        className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
                                        {milestone.progress}%
                                    </button>
                                </div>
                                <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{
                                            width: `${milestone.progress}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Milestone */}
                    <div className="mt-6 flex gap-3">
                        <input
                            type="text"
                            value={newMilestone}
                            onChange={(e) => setNewMilestone(e.target.value)}
                            placeholder="Add new milestone..."
                            className="flex-1 px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={handleAddMilestone}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col">
                    <h3 className="text-xl font-semibold mb-6">
                        Activity Feed
                    </h3>

                    <div className="flex-1 space-y-4 overflow-auto">
                        {goal.updates.map((update) => (
                            <div
                                key={update.id}
                                className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="font-medium">
                                        {update.user.name}
                                    </span>
                                    <span className="text-gray-500">
                                        {new Date(
                                            update.createdAt,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {update.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Add Update */}
                    <div className="mt-6 flex gap-3">
                        <input
                            type="text"
                            value={newUpdate}
                            onChange={(e) => setNewUpdate(e.target.value)}
                            placeholder="Write an update..."
                            className="flex-1 px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={handleAddUpdate}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Milestone Progress Edit Modal */}
            {editingMilestoneId && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md">
                        <h3 className="text-2xl font-semibold mb-6">
                            Update Progress
                        </h3>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={editProgress}
                            onChange={(e) =>
                                setEditProgress(Number(e.target.value))
                            }
                            className="w-full accent-indigo-600"
                        />
                        <div className="text-center text-5xl font-bold text-indigo-600 my-6">
                            {editProgress}%
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setEditingMilestoneId(null)}
                                className="flex-1 py-4 border rounded-2xl">
                                Cancel
                            </button>
                            <button
                                onClick={() =>
                                    updateMilestoneProgress(
                                        editingMilestoneId,
                                        editProgress,
                                    )
                                }
                                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl">
                                Save Progress
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
