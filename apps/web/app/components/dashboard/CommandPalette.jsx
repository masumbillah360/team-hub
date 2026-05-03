'use client';

import { useState, useEffect, useRef } from 'react';
import useStore, { Page } from '@/lib/store';
import useAuthStore from '@/lib/store/authStore';
import { useTheme } from 'next-themes';
import {
    Search,
    LayoutDashboard,
    Target,
    Megaphone,
    CheckSquare,
    BarChart3,
    Settings,
    User,
    FileText,
    Sun,
    Moon,
    LogOut,
    X,
} from 'lucide-react';

export default function CommandPalette() {
    const { theme, setTheme } = useTheme();
    const {
        commandPaletteOpen,
        setCommandPaletteOpen,
        setPage,
        goals,
        currentWorkspaceId,
        setSelectedGoalId,
    } = useStore();
    const logout = useAuthStore((state) => state.logout);
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (commandPaletteOpen) {
            setQuery('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [commandPaletteOpen]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') setCommandPaletteOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [setCommandPaletteOpen]);

    if (!commandPaletteOpen) return null;

    const commands = [
        {
            id: 'dashboard',
            label: 'Go to Dashboard',
            icon: LayoutDashboard,
            action: () => {
                setPage(Page.DASHBOARD);
                setCommandPaletteOpen(false);
                window.location.href = '/dashboard';
            },
        },
        {
            id: 'goals',
            label: 'Go to Goals',
            icon: Target,
            action: () => {
                setPage(Page.GOALS);
                setCommandPaletteOpen(false);
                window.location.href = '/goals';
            },
        },
        {
            id: 'announcements',
            label: 'Go to Announcements',
            icon: Megaphone,
            action: () => {
                setPage(Page.ANNOUNCEMENTS);
                setCommandPaletteOpen(false);
                window.location.href = '/announcements';
            },
        },
        {
            id: 'action-items',
            label: 'Go to Action Items',
            icon: CheckSquare,
            action: () => {
                setPage(Page.ACTION_ITEMS);
                setCommandPaletteOpen(false);
                window.location.href = '/action-items';
            },
        },
        {
            id: 'analytics',
            label: 'Go to Analytics',
            icon: BarChart3,
            action: () => {
                setPage(Page.ANALYTICS);
                setCommandPaletteOpen(false);
                window.location.href = '/analytics';
            },
        },
        {
            id: 'audit-log',
            label: 'Go to Audit Log',
            icon: FileText,
            action: () => {
                setPage(Page.AUDIT_LOG);
                setCommandPaletteOpen(false);
                window.location.href = '/audit-log';
            },
        },
        {
            id: 'settings',
            label: 'Workspace Settings',
            icon: Settings,
            action: () => {
                setPage(Page.WORKSPACE_SETTINGS);
                setCommandPaletteOpen(false);
                window.location.href = '/workspace-settings';
            },
        },
        {
            id: 'profile',
            label: 'My Profile',
            icon: User,
            action: () => {
                setPage(Page.PROFILE);
                setCommandPaletteOpen(false);
                window.location.href = '/profile';
            },
        },
        {
            id: 'theme',
            label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`,
            icon: theme === 'light' ? Moon : Sun,
            action: () => {
                setTheme(theme === 'light' ? 'dark' : 'light');
                setCommandPaletteOpen(false);
            },
        },
        {
            id: 'logout',
            label: 'Sign Out',
            icon: LogOut,
            action: () => {
                logout();
                setCommandPaletteOpen(false);
                window.location.href = '/login';
            },
        },
    ];

    const goalCommands = goals
        ?.filter((g) => g.workspaceId === currentWorkspaceId)
        ?.map((g) => ({
            id: `goal-${g.id}`,
            label: `Goal: ${g.title}`,
            icon: Target,
            action: () => {
                setSelectedGoalId(g.id);
                setCommandPaletteOpen(false);
                window.location.href = `/goals/${g.id}`;
            },
        }));

    console.log('goalCommands', goalCommands);
    const filteredCommands = goalCommands ? goalCommands : [];
    const allCommands = [...commands, ...filteredCommands];
    const filtered = query
        ? allCommands.filter((c) =>
              c.label.toLowerCase().includes(query.toLowerCase()),
          )
        : allCommands;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[20vh] z-200 p-4"
            onClick={() => setCommandPaletteOpen(false)}>
            <div
                className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-scaleIn overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent text-gray-900 dark:text-white outline-none text-sm placeholder-gray-400"
                        placeholder="Type a command or search..."
                    />
                    <kbd className="hidden sm:flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">
                        ESC
                    </kbd>
                    <button
                        onClick={() => setCommandPaletteOpen(false)}
                        className="p-1 text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                    {filtered.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            No results found for "{query}"
                        </div>
                    ) : (
                        filtered.map((cmd, index) => {
                            const Icon = cmd.icon;
                            return (
                                <button
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
                                        index === 0
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}>
                                    <Icon className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-200 flex-1">
                                        {cmd.label}
                                    </span>
                                    {index === 0 && (
                                        <kbd className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                                            ↵
                                        </kbd>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-400">
                    <span>↑↓ Navigate</span>
                    <span>↵ Select</span>
                    <span>Esc Close</span>
                </div>
            </div>
        </div>
    );
}
