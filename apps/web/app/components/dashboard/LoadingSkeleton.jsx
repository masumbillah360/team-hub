'use client';

// Loading skeleton for Goal cards
export function GoalSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </div>
        </div>
    );
}

// Loading skeleton for Action Item cards
export function ActionItemSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 p-4 animate-pulse">
            <div className="flex items-start justify-between mb-2">
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex gap-1">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </div>
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="flex items-center justify-between">
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </div>
        </div>
    );
}

// Loading skeleton for Announcement cards
export function AnnouncementSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
            <div className="flex items-start justify-between mb-3">
                <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
    );
}

// Generic table row skeleton
export function TableRowSkeleton({ cols = 6 }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </td>
            ))}
        </tr>
    );
}
