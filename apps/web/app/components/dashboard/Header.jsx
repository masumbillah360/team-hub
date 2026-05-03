'use client';

import { useState, useRef, useEffect } from 'react';
import useStore, { Page } from '@/lib/store';
import { useTheme } from 'next-themes';
import { Bell, Search, Sun, Moon, Command } from 'lucide-react';

export default function Header() {
    const { theme, setTheme } = useTheme();
    const { setCommandPaletteOpen, currentPage } = useStore();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    // Mock notifications data - replace with API call when notifications API is ready
    const notifications = [];
    const unreadCount = 0;

    const pageLabels = {
        [Page.DASHBOARD]: 'Dashboard',
        [Page.GOALS]: 'Goals & Milestones',
        [Page.GOAL_DETAIL]: 'Goal Detail',
        [Page.ANNOUNCEMENTS]: 'Announcements',
        [Page.ACTION_ITEMS]: 'Action Items',
        [Page.ANALYTICS]: 'Analytics',
        [Page.WORKSPACE_SETTINGS]: 'Workspace Settings',
        [Page.PROFILE]: 'My Profile',
        [Page.AUDIT_LOG]: 'Audit Log',
    };

    useEffect(() => {
        const handler = (e) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(true);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [setCommandPaletteOpen]);

    const notificationIcons = {
        MENTION: '💬',
        REACTION: '❤️',
        INVITE: '✉️',
        STATUS_CHANGE: '🔄',
        NEW_POST: '📢',
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    return (
        <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pageLabels[currentPage] || 'Dashboard'}
                </h2>
            </div>

            <div className="flex items-center gap-2">
                {/* Command Palette Trigger */}
                <button
                    onClick={() => setCommandPaletteOpen(true)}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <Search className="w-3.5 h-3.5" />
                    <span>Search...</span>
                    <kbd className="flex items-center gap-0.5 text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                        <Command className="w-3 h-3" />K
                    </kbd>
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={() =>
                        setTheme(theme === 'light' ? 'dark' : 'light')
                    }
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    {theme === 'light' ? (
                        <Moon className="w-4 h-4" />
                    ) : (
                        <Sun className="w-4 h-4" />
                    )}
                </button>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 animate-scaleIn">
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Notifications
                                </h3>
                                <button
                                    onClick={() => {
                                        // TODO: Implement with notifications API when ready
                                        console.log('Mark all read');
                                    }}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                                    Mark all read
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                        No notifications
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            onClick={() => {
                                                // TODO: Implement with notifications API when ready
                                                console.log('Mark read', notification.id);
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${!notification.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                                            <div className="flex items-start gap-3">
                                                <span className="text-lg mt-0.5">
                                                    {notificationIcons[
                                                        notification.type
                                                    ] || '📌'}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={`text-sm ${!notification.read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatTime(
                                                            notification.createdAt,
                                                        )}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0" />
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
