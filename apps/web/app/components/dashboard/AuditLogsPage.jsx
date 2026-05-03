'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useStore from '@/lib/store';
import { auditLogsAPI } from '@/lib/api/auditLogs';
import {
    Download,
    Filter,
    Search,
    Clock,
    FileText,
    ShieldX,
    RefreshCw,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────────────────────────

const actionTypes = [
    'All',
    'goal',
    'action_item',
    'announcement',
    'member',
    'workspace',
];

const actionIcons = {
    'goal.created': '🎯',
    'goal.updated': '✏️',
    'goal.deleted': '🗑️',
    'goal.status_changed': '🔄',
    'action_item.created': '📋',
    'action_item.updated': '✏️',
    'action_item.assigned': '👤',
    'announcement.created': '📢',
    'announcement.pinned': '📌',
    'member.invited': '✉️',
    'member.removed': '👋',
    'member.role_changed': '🛡️',
    'workspace.created': '🏗️',
    'workspace.updated': '⚙️',
};

const actionLabels = {
    'goal.created': 'Goal Created',
    'goal.updated': 'Goal Updated',
    'goal.deleted': 'Goal Deleted',
    'goal.status_changed': 'Status Changed',
    'action_item.created': 'Item Created',
    'action_item.updated': 'Item Updated',
    'action_item.assigned': 'Item Assigned',
    'announcement.created': 'Announcement',
    'announcement.pinned': 'Pinned',
    'member.invited': 'Member Invited',
    'member.removed': 'Member Removed',
    'member.role_changed': 'Role Changed',
    'workspace.created': 'Workspace Created',
    'workspace.updated': 'Settings Updated',
};

const actionColors = {
    'goal.created':
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    'goal.updated':
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'goal.deleted':
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'goal.status_changed':
        'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    'action_item.created':
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'action_item.updated':
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'action_item.assigned':
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'announcement.created':
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'announcement.pinned':
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'member.invited':
        'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    'member.removed':
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'member.role_changed':
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'workspace.created':
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'workspace.updated':
        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getActionColor = (action) =>
    actionColors[action] ||
    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AuditLogPage() {
    const { currentWorkspaceId, addToast } = useStore();

    const [filterAction, setFilterAction] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Data states
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 0,
        limit: 20,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [forbidden, setForbidden] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Debounce ref
    const debounceRef = useRef(null);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(value);
            setCurrentPage(1);
        }, 300);
    };

    // ─── Fetch logs ──────────────────────────────────────────────────────────────

    const fetchLogs = useCallback(async () => {
        if (!currentWorkspaceId) return;

        try {
            setLoading(true);
            setError(null);
            setForbidden(false);

            const result = await auditLogsAPI.list({
                workspaceId: currentWorkspaceId,
                action: filterAction !== 'All' ? filterAction : undefined,
                search: debouncedSearch || undefined,
                page: currentPage,
                limit: 20,
            });

            setLogs(result.data || []);
            setPagination({
                page: result.page || 1,
                total: result.total || 0,
                totalPages: result.totalPages || 0,
                limit: result.limit || 20,
            });
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);

            if (err.response?.status === 403) {
                setForbidden(true);
                return;
            }

            setError(
                err.response?.data?.message || 'Failed to load audit logs',
            );
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [currentWorkspaceId, filterAction, debouncedSearch, currentPage]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterAction]);

    // ─── Export CSV ──────────────────────────────────────────────────────────────

    const handleExportCsv = async () => {
        if (!currentWorkspaceId) return;

        try {
            setExporting(true);

            const blob = await auditLogsAPI.exportCsv({
                workspaceId: currentWorkspaceId,
                action: filterAction !== 'All' ? filterAction : undefined,
                search: debouncedSearch || undefined,
            });

            const url = window.URL.createObjectURL(
                new Blob([blob], { type: 'text/csv' }),
            );
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `audit-log-${new Date().toISOString().slice(0, 10)}.csv`,
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            addToast({
                title: 'Export Successful',
                description: 'Audit log has been exported to CSV.',
                type: 'success',
            });
        } catch (err) {
            console.error('Failed to export CSV:', err);
            addToast({
                title: 'Export Failed',
                description:
                    err.response?.data?.message || 'Failed to export audit log',
                type: 'error',
            });
        } finally {
            setExporting(false);
        }
    };

    // ─── Permission denied ────────────────────────────────────────────────────────

    if (forbidden) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                        <ShieldX className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Access Denied
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        You don't have permission to view audit logs. Contact
                        your workspace admin for access.
                    </p>
                </div>
            </div>
        );
    }

    // ─── Loading skeleton ──────────────────────────────────────────────────────────

    if (loading && logs.length === 0) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="flex items-start gap-4 animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────────

    return (
        <div className="p-6 space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Audit Log
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Immutable record of all workspace changes
                        {pagination.total > 0 && (
                            <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                {pagination.total} entries
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start">
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                        <RefreshCw
                            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                        />
                    </button>
                    <button
                        onClick={handleExportCsv}
                        disabled={exporting}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 disabled:opacity-50">
                        <Download className="w-4 h-4" />
                        {exporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                    <button
                        onClick={fetchLogs}
                        className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline">
                        Retry
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder="Search by details, user or action..."
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setDebouncedSearch('');
                                setCurrentPage(1);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                    {actionTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => {
                                setFilterAction(type);
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                                filterAction === type
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}>
                            {type === 'All' ? 'All' : type.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                {logs.length > 0 ? (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-700" />

                        <div className="space-y-6">
                            {logs.map((entry, i) => (
                                <div
                                    key={entry.id}
                                    className="relative flex items-start gap-4 animate-slideUp"
                                    style={{
                                        animationDelay: `${Math.min(i * 30, 300)}ms`,
                                    }}>
                                    {/* Timeline dot */}
                                    <div className="relative z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-base shrink-0">
                                        {actionIcons[entry.action] || '📝'}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pb-2 min-w-0">
                                        <div className="flex items-start justify-between gap-2 flex-wrap">
                                            <div className="flex-1 min-w-0">
                                                <span
                                                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${getActionColor(entry.action)}`}>
                                                    {actionLabels[
                                                        entry.action
                                                    ] || entry.action}
                                                </span>
                                                <p className="text-sm text-gray-900 dark:text-white mt-1.5 leading-relaxed">
                                                    {typeof entry.details === 'string'
                                                        ? entry.details
                                                        : entry.details?.message ||
                                                          'No details provided'}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                        <div className="w-5 h-5 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                                            {(
                                                                entry.user
                                                                    ?.name ||
                                                                'U'
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <span className="font-medium">
                                                            {entry.user?.name ||
                                                                'Unknown'}
                                                        </span>
                                                    </span>
                                                    <span className="text-gray-300 dark:text-gray-600">
                                                        •
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(
                                                            entry.createdAt,
                                                        )}
                                                    </span>
                                                    {entry.entityType && (
                                                        <>
                                                            <span className="text-gray-300 dark:text-gray-600">
                                                                •
                                                            </span>
                                                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                                {
                                                                    entry.entityType
                                                                }
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            No audit log entries found
                        </p>
                        {(searchQuery || filterAction !== 'All') && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Try adjusting your search or filters
                            </p>
                        )}
                        {(searchQuery || filterAction !== 'All') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setDebouncedSearch('');
                                    setFilterAction('All');
                                    setCurrentPage(1);
                                }}
                                className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                            {(pagination.page - 1) * pagination.limit + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                            {Math.min(
                                pagination.page * pagination.limit,
                                pagination.total,
                            )}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                            {pagination.total}
                        </span>{' '}
                        entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage <= 1 || loading}
                            className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <ChevronLeft className="w-4 h-4" />
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
                                        className={`w-9 h-9 rounded-lg text-sm transition ${
                                            currentPage === page
                                                ? 'bg-indigo-600 text-white'
                                                : 'border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
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
                            className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
