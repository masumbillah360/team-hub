'use client';

import { useState, useEffect, useCallback } from 'react';
import useStore from '@/lib/store';
import {
    BarChart3,
    TrendingUp,
    CheckCircle2,
    AlertTriangle,
    Download,
    Target,
    Activity,
    RefreshCw,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from 'recharts';
import { analyticsAPI } from '@/lib/api/analytics';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const STATUS_COLORS = {
    NOT_STARTED: '#9ca3af',
    IN_PROGRESS: '#6366f1',
    ON_HOLD: '#f59e0b',
    COMPLETED: '#10b981',
};

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyChart({ message = 'No data available', subMessage }) {
    return (
        <div className="flex items-center justify-center h-[250px] text-gray-400 dark:text-gray-500">
            <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">{message}</p>
                {subMessage && (
                    <p className="text-xs mt-1 opacity-70">{subMessage}</p>
                )}
            </div>
        </div>
    );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, delay = 0, suffix = '' }) {
    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg transition animate-slideUp"
            style={{ animationDelay: `${delay}ms` }}>
            <div
                className={`w-12 h-12 bg-linear-to-br ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {value}
                {suffix}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {label}
            </p>
        </div>
    );
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomBarTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {payload[0]?.payload?.fullTitle || label}
                </p>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {payload[0]?.value}% complete
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Status: {payload[0]?.payload?.status?.replace(/_/g, ' ')}
                </p>
            </div>
        );
    }
    return null;
}

function CustomLineTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </p>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {payload[0]?.value} completed
                </p>
            </div>
        );
    }
    return null;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
    const { currentWorkspaceId, addToast } = useStore();

    // Data states
    const [stats, setStats] = useState(null);
    const [goalsData, setGoalsData] = useState(null);
    const [activityData, setActivityData] = useState([]);

    // Loading states
    const [statsLoading, setStatsLoading] = useState(false);
    const [chartLoading, setChartLoading] = useState(false);
    const [activityLoading, setActivityLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Error states
    const [statsError, setStatsError] = useState(null);
    const [chartError, setChartError] = useState(null);

    // ─── Fetch data ──────────────────────────────────────────────────────────────

    const fetchStats = useCallback(async () => {
        if (!currentWorkspaceId) return;

        try {
            setStatsLoading(true);
            setStatsError(null);

            const result = await analyticsAPI.stats({
                workspaceId: currentWorkspaceId,
            });

            setStats(result.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setStatsError(
                err.response?.data?.message || 'Failed to load stats',
            );
            // Set default empty stats so UI doesn't break
            setStats({
                totalGoals: 0,
                completedGoals: 0,
                totalActionItems: 0,
                completedItems: 0,
                completedThisWeek: 0,
                overdueCount: 0,
                completionRate: 0,
                statusBreakdown: {
                    TODO: 0,
                    IN_PROGRESS: 0,
                    IN_REVIEW: 0,
                    DONE: 0,
                },
            });
        } finally {
            setStatsLoading(false);
        }
    }, [currentWorkspaceId]);

    const fetchGoalsCompletion = useCallback(async () => {
        if (!currentWorkspaceId) return;

        try {
            setChartLoading(true);
            setChartError(null);

            const result = await analyticsAPI.goalsCompletion({
                workspaceId: currentWorkspaceId,
            });

            setGoalsData(result.data);
        } catch (err) {
            console.error('Failed to fetch goals completion:', err);
            setChartError(
                err.response?.data?.message || 'Failed to load chart data',
            );
            // Default empty data
            setGoalsData({
                data: [],
                summary: {
                    total: 0,
                    notStarted: 0,
                    inProgress: 0,
                    onHold: 0,
                    completed: 0,
                    averageProgress: 0,
                },
            });
        } finally {
            setChartLoading(false);
        }
    }, [currentWorkspaceId]);

    const fetchActivity = useCallback(async () => {
        if (!currentWorkspaceId) return;

        try {
            setActivityLoading(true);

            const result = await analyticsAPI.activityOverview({
                workspaceId: currentWorkspaceId,
            });

            setActivityData(result.data || []);
        } catch (err) {
            console.error('Failed to fetch activity:', err);
            setActivityData([]);
        } finally {
            setActivityLoading(false);
        }
    }, [currentWorkspaceId]);

    useEffect(() => {
        fetchStats();
        fetchGoalsCompletion();
        fetchActivity();
    }, [fetchStats, fetchGoalsCompletion, fetchActivity]);

    // ─── Export handler ───────────────────────────────────────────────────────────

    const handleExport = async () => {
        if (!currentWorkspaceId) return;

        try {
            setExporting(true);
            const blob = await analyticsAPI.exportData({
                workspaceId: currentWorkspaceId,
            });

            const url = window.URL.createObjectURL(
                new Blob([blob], { type: 'text/csv' }),
            );
            const a = document.createElement('a');
            a.href = url;
            a.download = `workspace-export-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            addToast({
                title: 'Export Successful',
                description: 'Your data has been exported to CSV.',
                type: 'success',
            });
        } catch (err) {
            console.error('Export failed:', err);
            addToast({
                title: 'Export Failed',
                description:
                    err.response?.data?.message || 'Failed to export data',
                type: 'error',
            });
        } finally {
            setExporting(false);
        }
    };

    const handleRefresh = () => {
        fetchStats();
        fetchGoalsCompletion();
        fetchActivity();
    };

    // ─── Derived data ─────────────────────────────────────────────────────────────

    const chartItems = goalsData?.data || [];
    const summary = goalsData?.summary || {
        total: 0,
        notStarted: 0,
        inProgress: 0,
        onHold: 0,
        completed: 0,
        averageProgress: 0,
    };

    const pieData = [
        { name: 'Not Started', value: summary.notStarted || 0 },
        { name: 'In Progress', value: summary.inProgress || 0 },
        { name: 'On Hold', value: summary.onHold || 0 },
        { name: 'Completed', value: summary.completed || 0 },
    ];

    const actionItemPieData = [
        { name: 'To Do', value: stats?.statusBreakdown?.TODO || 0 },
        {
            name: 'In Progress',
            value: stats?.statusBreakdown?.IN_PROGRESS || 0,
        },
        { name: 'In Review', value: stats?.statusBreakdown?.IN_REVIEW || 0 },
        { name: 'Done', value: stats?.statusBreakdown?.DONE || 0 },
    ];

    const statsCards = [
        {
            label: 'Total Goals',
            value: stats?.totalGoals ?? 0,
            icon: Target,
            color: 'from-indigo-500 to-indigo-600',
            delay: 0,
        },
        {
            label: 'Items Completed',
            value: stats?.completedItems ?? 0,
            icon: CheckCircle2,
            color: 'from-emerald-500 to-emerald-600',
            delay: 100,
        },
        {
            label: 'Completed This Week',
            value: stats?.completedThisWeek ?? 0,
            icon: TrendingUp,
            color: 'from-blue-500 to-blue-600',
            delay: 200,
        },
        {
            label: 'Overdue Items',
            value: stats?.overdueCount ?? 0,
            icon: AlertTriangle,
            color: 'from-red-500 to-red-600',
            delay: 300,
        },
        {
            label: 'Completion Rate',
            value: stats?.completionRate ?? 0,
            icon: BarChart3,
            color: 'from-violet-500 to-violet-600',
            delay: 400,
            suffix: '%',
        },
        {
            label: 'Total Action Items',
            value: stats?.totalActionItems ?? 0,
            icon: Activity,
            color: 'from-amber-500 to-amber-600',
            delay: 500,
        },
    ];

    const isLoading = statsLoading || chartLoading;

    // ─── No workspace ──────────────────────────────────────────────────────────────

    if (!currentWorkspaceId) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
                        <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Select a Workspace
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Please select a workspace to view analytics.
                    </p>
                </div>
            </div>
        );
    }

    // ─── Loading skeleton ──────────────────────────────────────────────────────────

    if (isLoading && !stats) {
        return (
            <div className="p-6 space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-72 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    // ─── Render ────────────────────────────────────────────────────────────────────

    return (
        <div className="p-6 space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Analytics
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Track your team's progress and performance
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                        <RefreshCw
                            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                        <Download className="w-4 h-4" />
                        {exporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {(statsError || chartError) && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {statsError || chartError}
                    </p>
                    <button
                        onClick={handleRefresh}
                        className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline">
                        Retry
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statsCards.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Summary Banner */}
            {summary.total > 0 && (
                <div className="bg-linear-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-6">
                        <div>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                                Average Goal Progress
                            </p>
                            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                                {summary.averageProgress}%
                            </p>
                        </div>
                        <div className="flex-1 h-3 bg-indigo-100 dark:bg-indigo-800 rounded-full overflow-hidden min-w-[100px]">
                            <div
                                className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                                style={{ width: `${summary.averageProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                            Across {summary.total} goals
                        </p>
                    </div>
                </div>
            )}

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Goals Completion Bar Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Goals Completion
                        </h3>
                        {chartItems.length > 0 && (
                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {chartItems.length} goals
                            </span>
                        )}
                    </div>
                    {chartLoading ? (
                        <div className="h-[250px] bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse" />
                    ) : chartItems.length === 0 ? (
                        <EmptyChart
                            message="No goals data available"
                            subMessage="Create some goals to see progress charts"
                        />
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={chartItems}
                                margin={{
                                    top: 5,
                                    right: 5,
                                    left: -20,
                                    bottom: 5,
                                }}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                    className="dark:stroke-gray-700"
                                />
                                <XAxis
                                    dataKey="title"
                                    tick={{ fontSize: 10 }}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomBarTooltip />} />
                                <Bar
                                    dataKey="progress"
                                    fill="#6366f1"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={60}>
                                    {chartItems.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                STATUS_COLORS[entry.status] ||
                                                '#6366f1'
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Goals Status Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Goals by Status
                    </h3>
                    {chartLoading ? (
                        <div className="h-[250px] bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse" />
                    ) : summary.total === 0 ? (
                        <EmptyChart
                            message="No goals data available"
                            subMessage="Create some goals to see status distribution"
                        />
                    ) : (
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="60%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                                {pieData.map((entry, index) => (
                                    <div
                                        key={entry.name}
                                        className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ],
                                                }}
                                            />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                {entry.name}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {entry.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Line Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Activity (Last 30 Days)
                    </h3>
                    {activityLoading ? (
                        <div className="h-[250px] bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse" />
                    ) : activityData.every((d) => d.completed === 0) ? (
                        <EmptyChart
                            message="No activity yet"
                            subMessage="Complete some action items to see activity"
                        />
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart
                                data={activityData}
                                margin={{
                                    top: 5,
                                    right: 5,
                                    left: -20,
                                    bottom: 5,
                                }}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                    className="dark:stroke-gray-700"
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 9 }}
                                    tickLine={false}
                                    interval={6}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<CustomLineTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Action Items Status Pie */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Action Items by Status
                    </h3>
                    {statsLoading ? (
                        <div className="h-[250px] bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse" />
                    ) : (stats?.totalActionItems || 0) === 0 ? (
                        <EmptyChart
                            message="No action items yet"
                            subMessage="Create some action items to see distribution"
                        />
                    ) : (
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="60%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={actionItemPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value">
                                        {actionItemPieData.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ]
                                                    }
                                                />
                                            ),
                                        )}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                                {actionItemPieData.map((entry, index) => (
                                    <div
                                        key={entry.name}
                                        className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ],
                                                }}
                                            />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                {entry.name}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {entry.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
