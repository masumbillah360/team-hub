'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Plus,
    Target,
    Clock,
    ChevronRight,
    Search,
    ChevronDown,
} from 'lucide-react';

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

export default function GoalsPage() {
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
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);
    const [errors, setErrors] = useState({});

    // Mock Goals Data
    const [goals, setGoals] = useState([
        {
            id: '1',
            title: 'Launch Q3 Marketing Campaign',
            description:
                'Create and execute a comprehensive marketing strategy for product launch.',
            status: 'IN_PROGRESS',
            dueDate: '2026-06-15',
            owner: { name: 'Alex Chen' },
            milestones: [{ progress: 70 }, { progress: 45 }],
            updates: [{}, {}],
        },
        {
            id: '2',
            title: 'Improve User Onboarding Experience',
            description:
                'Reduce drop-off rate during first 7 days of user journey.',
            status: 'IN_PROGRESS',
            dueDate: '2026-05-30',
            owner: { name: 'Sarah Khan' },
            milestones: [{ progress: 90 }, { progress: 30 }],
            updates: [{}],
        },
        {
            id: '3',
            title: 'Complete Security Audit',
            description: 'Third-party security review and penetration testing.',
            status: 'ON_HOLD',
            dueDate: '2026-06-10',
            owner: { name: 'Marcus Okoro' },
            milestones: [{ progress: 20 }],
            updates: [],
        },
        {
            id: '4',
            title: 'Migrate to New Database',
            description: 'Migrate all data to PostgreSQL with zero downtime.',
            status: 'COMPLETED',
            dueDate: '2026-05-05',
            owner: { name: 'Priya Sharma' },
            milestones: [{ progress: 100 }],
            updates: [{}, {}, {}],
        },
    ]);

    // Debounced Search
    const debouncedSearchFn = useCallback((value) => {
        const timeout = setTimeout(() => setDebouncedSearch(value), 300);
        return () => clearTimeout(timeout);
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        debouncedSearchFn(e.target.value);
    };

    // Filter Goals
    const filteredGoals = goals.filter((goal) => {
        const matchesSearch =
            goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            goal.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterStatus === 'All' || goal.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Create Goal
    const handleCreate = () => {
        if (!newGoal.title.trim()) return;

        const newGoalObj = {
            id: 'goal-' + Date.now(),
            ...newGoal,
            owner: { name: 'You' },
            milestones: [],
            updates: [],
        };

        setGoals([newGoalObj, ...goals]);
        setShowCreate(false);
        setNewGoal({
            title: '',
            description: '',
            dueDate: '',
            status: 'NOT_STARTED',
        });
        setErrors({});
    };

    const updateGoalStatus = (goalId, newStatus) => {
        setGoals((prev) =>
            prev.map((g) =>
                g.id === goalId ? { ...g, status: newStatus } : g,
            ),
        );
        setStatusDropdownOpen(null);
    };

    const StatusDropdown = ({ goal }) => {
        const isOpen = statusDropdownOpen === goal.id;
        const statuses = ['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'];

        return (
            <div className="relative">
                <button
                    onClick={() =>
                        setStatusDropdownOpen(isOpen ? null : goal.id)
                    }
                    className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 transition-all ${statusColors[goal.status]}`}>
                    {statusMap[goal.status]}
                    <ChevronDown className="w-3 h-3" />
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setStatusDropdownOpen(null)}
                        />
                        <div className="absolute z-20 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                            {statuses.map((status) => (
                                <button
                                    key={status}
                                    onClick={() =>
                                        updateGoalStatus(goal.id, status)
                                    }
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${goal.status === status ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium' : ''}`}>
                                    {statusMap[status]}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Goals
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {filteredGoals.length} goals
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center gap-2 transition">
                    <Plus className="w-5 h-5" /> New Goal
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Search goals..."
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {[
                        'All',
                        'NOT_STARTED',
                        'IN_PROGRESS',
                        'ON_HOLD',
                        'COMPLETED',
                    ].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition ${
                                filterStatus === status
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                            }`}>
                            {status === 'All' ? 'All' : statusMap[status]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredGoals.map((goal, i) => {
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
                            className="group bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Target className="w-6 h-6 text-indigo-500" />
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">
                                        {goal.title}
                                    </h3>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition" />
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-5">
                                {goal.description}
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-gray-500">
                                            Progress
                                        </span>
                                        <span className="font-medium">
                                            {totalProgress}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full transition-all"
                                            style={{
                                                width: `${totalProgress}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <StatusDropdown goal={goal} />
                                        <span className="text-xs text-gray-500">
                                            {goal.milestones?.length || 0}{' '}
                                            milestones
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        {goal.dueDate
                                            ? new Date(
                                                  goal.dueDate,
                                              ).toLocaleDateString()
                                            : 'No due date'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                                        {goal.owner.name?.[0]}
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {goal.owner.name}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {goal.updates?.length || 0} updates
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {filteredGoals.length === 0 && (
                <div className="text-center py-20">
                    <Target className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500">No goals found</p>
                </div>
            )}

            {/* Create Goal Modal */}
            {showCreate && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowCreate(false)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-lg"
                        onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-semibold mb-6">
                            Create New Goal
                        </h2>
                        {/* Form fields here (similar to your original) */}
                        <div className="space-y-5">
                            <input
                                type="text"
                                placeholder="Goal title"
                                value={newGoal.title}
                                onChange={(e) =>
                                    setNewGoal({
                                        ...newGoal,
                                        title: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl"
                            />
                            <textarea
                                placeholder="Description"
                                value={newGoal.description}
                                onChange={(e) =>
                                    setNewGoal({
                                        ...newGoal,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl h-28 resize-y"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    value={newGoal.dueDate}
                                    onChange={(e) =>
                                        setNewGoal({
                                            ...newGoal,
                                            dueDate: e.target.value,
                                        })
                                    }
                                    className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl"
                                />
                                <select
                                    value={newGoal.status}
                                    onChange={(e) =>
                                        setNewGoal({
                                            ...newGoal,
                                            status: e.target.value,
                                        })
                                    }
                                    className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl">
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

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-2xl">
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700">
                                Create Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
