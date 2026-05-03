'use client';

import Link from 'next/link';
import {
    Target,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    Clock,
    Users,
    Activity,
    ArrowUpRight,
} from 'lucide-react';

export default function Dashboard() {
    // Mock Data
    const currentWorkspace = {
        id: '1',
        name: 'Growth Team',
        accentColor: '#6366f1',
        members: [
            { id: '1', user: { id: 'u1', name: 'Alex Chen', online: true } },
            { id: '2', user: { id: 'u2', name: 'Sarah Khan', online: true } },
            {
                id: '3',
                user: { id: 'u3', name: 'Marcus Okoro', online: false },
            },
            { id: '4', user: { id: 'u4', name: 'Priya Sharma', online: true } },
        ],
    };

    const stats = [
        {
            label: 'Total Goals',
            value: 24,
            icon: Target,
            color: 'bg-indigo-500',
            lightBg: 'bg-indigo-50 dark:bg-indigo-900/30',
            textColor: 'text-indigo-600 dark:text-indigo-400',
        },
        {
            label: 'Completed',
            value: 17,
            icon: CheckCircle2,
            color: 'bg-emerald-500',
            lightBg: 'bg-emerald-50 dark:bg-emerald-900/30',
            textColor: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'In Progress',
            value: 5,
            icon: TrendingUp,
            color: 'bg-blue-500',
            lightBg: 'bg-blue-50 dark:bg-blue-900/30',
            textColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            label: 'Overdue',
            value: 2,
            icon: AlertTriangle,
            color: 'bg-red-500',
            lightBg: 'bg-red-50 dark:bg-red-900/30',
            textColor: 'text-red-600 dark:text-red-400',
        },
    ];

    const activeGoals = [
        {
            id: '1',
            title: 'Launch new marketing campaign',
            status: 'IN_PROGRESS',
            progress: 65,
            owner: 'Alex Chen',
            dueDate: '2026-05-20',
        },
        {
            id: '2',
            title: 'Improve user onboarding flow',
            status: 'IN_PROGRESS',
            progress: 40,
            owner: 'Sarah Khan',
            dueDate: '2026-05-15',
        },
        {
            id: '3',
            title: 'Complete Q2 financial audit',
            status: 'ON_HOLD',
            progress: 25,
            owner: 'Marcus Okoro',
            dueDate: '2026-05-10',
        },
    ];

    const pinnedAnnouncements = [
        {
            id: '1',
            title: 'Team Offsite Planning - May 2026',
            author: 'Alex Chen',
            reactions: 12,
            comments: 8,
        },
        {
            id: '2',
            title: 'New Company Values & Vision',
            author: 'Sarah Khan',
            reactions: 24,
            comments: 15,
        },
    ];

    const upcomingActionItems = [
        {
            id: '1',
            title: 'Finalize pricing strategy document',
            assignee: 'Priya Sharma',
            dueDate: '2026-05-08',
            priority: 'HIGH',
        },
        {
            id: '2',
            title: 'Prepare investor update deck',
            assignee: 'Alex Chen',
            dueDate: '2026-05-09',
            priority: 'URGENT',
        },
        {
            id: '3',
            title: 'Review mobile app feedback',
            assignee: 'Marcus Okoro',
            dueDate: '2026-05-12',
            priority: 'MEDIUM',
        },
    ];

    return (
        <div className="p-6 space-y-6 animate-fadeIn">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back! 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Here's what's happening in{' '}
                        <span
                            className="font-medium"
                            style={{ color: currentWorkspace.accentColor }}>
                            {currentWorkspace.name}
                        </span>
                    </p>
                </div>
                <Link
                    href="/goals"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2 w-fit">
                    <Target className="w-4 h-4" /> View All Goals
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={i}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div
                                    className={`w-14 h-14 ${stat.lightBg} rounded-xl flex items-center justify-center`}>
                                    <Icon
                                        className={`w-8 h-8 ${stat.textColor}`}
                                    />
                                </div>

                                <div className="text-right">
                                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                                        {stat.value}
                                    </h2>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Team Members */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-500" />
                        Team Members ({currentWorkspace.members.length})
                    </h3>
                    <Link
                        href="/workspace-settings"
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        Manage Team
                    </Link>
                </div>
                <div className="flex flex-wrap gap-3">
                    {currentWorkspace.members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                    {member.user.name.charAt(0)}
                                </div>
                                {member.user.online && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-700" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {member.user.name}
                                </p>
                                <p className="text-xs text-gray-400">Member</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Goals */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-500" />{' '}
                            Active Goals
                        </h3>
                        <Link
                            href="/goals"
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            View all
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {activeGoals.map((goal) => (
                            <Link
                                key={goal.id}
                                href={`/goals/${goal.id}`}
                                className="block p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {goal.title}
                                    </h4>
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                                        {goal.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full"
                                            style={{
                                                width: `${goal.progress}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 w-10">
                                        {goal.progress}%
                                    </span>
                                </div>

                                <div className="flex justify-between text-xs text-gray-500 mt-3">
                                    <span>{goal.owner}</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(
                                            goal.dueDate,
                                        ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-indigo-500" /> Recent
                        Activity
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm py-8 text-center">
                        No recent activity yet
                    </p>
                </div>
            </div>

            {/* Announcements & Action Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pinned Announcements */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            📌 Pinned Announcements
                        </h3>
                        <Link
                            href="/announcements"
                            className="text-sm text-indigo-600 hover:text-indigo-700">
                            View all
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {pinnedAnnouncements.map((ann) => (
                            <div
                                key={ann.id}
                                className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                    {ann.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-2">
                                    By {ann.author} • {ann.reactions} reactions
                                    • {ann.comments} comments
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Action Items */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            ⚡ Upcoming Action Items
                        </h3>
                        <Link
                            href="/action-items"
                            className="text-sm text-indigo-600 hover:text-indigo-700">
                            View all
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {upcomingActionItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        item.priority === 'URGENT'
                                            ? 'bg-red-500 animate-pulse'
                                            : item.priority === 'HIGH'
                                              ? 'bg-orange-500'
                                              : 'bg-blue-500'
                                    }`}
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.assignee} • Due{' '}
                                        {new Date(
                                            item.dueDate,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs px-3 py-1 rounded-full ${
                                        item.priority === 'URGENT'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            : item.priority === 'HIGH'
                                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {item.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
