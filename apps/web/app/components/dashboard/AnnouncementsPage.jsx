'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';
import useStore from '@/lib/store';
import { usePermissions } from '@/lib/hooks/usePermissions';
import {
    Plus,
    Pin,
    SmilePlus,
    Megaphone,
    X,
    MessageCircle,
    Search,
} from 'lucide-react';
import { announcementsAPI } from '@/lib/api/announcements';

const extensions = [StarterKit];

export default function AnnouncementsPage() {
    const { currentWorkspaceId, currentUser, addToast } = useStore();
    const permissions = usePermissions(currentUser?.role);

    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [expandedComments, setExpandedComments] = useState({});
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [newComment, setNewComment] = useState('');

    // Data states
    const [announcements, setAnnouncements] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Action loading states
    const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
    const [togglingPin, setTogglingPin] = useState(null);
    const [addingReaction, setAddingReaction] = useState(null);
    const [addingComment, setAddingComment] = useState(null);

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
        }, 300),
        [],
    );

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedSearchFn(e.target.value);
    };

    // Fetch announcements
    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await announcementsAPI.list({
                workspaceId: currentWorkspaceId || undefined,
                pinned: filter === 'pinned' ? true : undefined,
                search: debouncedSearch || undefined,
                page: 1,
                limit: 20,
            });

            setAnnouncements(result.data || []);
            setPagination({
                page: result.page || 1,
                total: result.total || 0,
                totalPages: result.totalPages || 0,
            });
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
            setError(
                err.response?.data?.message || 'Failed to load announcements',
            );
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    }, [currentWorkspaceId, filter, debouncedSearch]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    // Socket.io for real-time updates
    useEffect(() => {
        const getToken = () => {
            if (typeof document === 'undefined') return null;
            const match = document.cookie.match(/accessToken=([^;]+)/);
            return match?.[1] || null;
        };

        const socket = io(
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005',
            {
                auth: { token: getToken() },
            },
        );

        socket.on('connect', () => {
            console.log('Socket connected for announcements');
            if (currentWorkspaceId) {
                socket.emit('join-workspace', currentWorkspaceId);
            }
        });

        socket.on('new-announcement', (data) => {
            setAnnouncements((prev) => {
                if (prev.some((a) => a.id === data.announcement.id))
                    return prev;
                return [data.announcement, ...prev];
            });
        });

        socket.on('announcement-updated', (data) => {
            setAnnouncements((prev) =>
                prev.map((a) =>
                    a.id === data.announcementId
                        ? { ...a, ...data.announcement }
                        : a,
                ),
            );
        });

        socket.on('reaction-update', (data) => {
            setAnnouncements((prev) =>
                prev.map((a) =>
                    a.id === data.announcementId
                        ? { ...a, reactions: data.reactions }
                        : a,
                ),
            );
        });

        socket.on('new-comment', (data) => {
            setAnnouncements((prev) =>
                prev.map((a) => {
                    if (a.id === data.announcementId) {
                        const existingIds = a.comments?.map((c) => c.id) || [];
                        if (existingIds.includes(data.comment.id)) return a;
                        return {
                            ...a,
                            comments: [...(a.comments || []), data.comment],
                        };
                    }
                    return a;
                }),
            );
        });

        return () => {
            socket.disconnect();
        };
    }, [currentWorkspaceId]);

    // TipTap editor
    const editor = useEditor({
        extensions,
        content: newContent,
        immediatelyRender: false,
        onUpdate: ({ editor }) => setNewContent(editor.getHTML()),
    });

    // Create announcement
    const handleCreate = async () => {
        const content = editor?.getHTML()?.trim();
        if (!newTitle.trim() || !content || content === '<p></p>') {
            addToast({
                title: 'Validation Error',
                description: 'Please provide both title and content',
                type: 'error',
            });
            return;
        }

        const optimisticAnnouncement = {
            id: 'temp-' + Date.now(),
            title: newTitle,
            content,
            pinned: false,
            authorId: currentUser?.id,
            author: currentUser,
            reactions: [],
            comments: [],
            createdAt: new Date().toISOString(),
            _optimistic: true,
        };

        setAnnouncements((prev) => [optimisticAnnouncement, ...prev]);
        setShowCreate(false);

        try {
            setCreatingAnnouncement(true);
            const result = await announcementsAPI.create({
                title: newTitle,
                content,
                workspaceId: currentWorkspaceId,
            });

            setAnnouncements((prev) =>
                prev.map((a) =>
                    a.id === optimisticAnnouncement.id ? result.data : a,
                ),
            );

            setNewTitle('');
            setNewContent('');
            editor?.commands.clearContent();

            addToast({
                title: 'Announcement Created',
                description: 'Your announcement has been posted',
                type: 'success',
            });
        } catch (err) {
            console.error('Failed to create announcement:', err);
            setAnnouncements((prev) =>
                prev.filter((a) => a.id !== optimisticAnnouncement.id),
            );
            setShowCreate(true);

            addToast({
                title: 'Creation Failed',
                description:
                    err.response?.data?.message ||
                    'Failed to create announcement',
                type: 'error',
            });
        } finally {
            setCreatingAnnouncement(false);
        }
    };

    // Toggle pin
    const handleTogglePin = async (announcementId) => {
        const previousAnnouncements = [...announcements];

        setAnnouncements((prev) =>
            prev.map((a) =>
                a.id === announcementId ? { ...a, pinned: !a.pinned } : a,
            ),
        );

        try {
            setTogglingPin(announcementId);
            const result = await announcementsAPI.togglePin(announcementId);

            setAnnouncements((prev) =>
                prev.map((a) => (a.id === announcementId ? result.data : a)),
            );
        } catch (err) {
            console.error('Failed to toggle pin:', err);
            setAnnouncements(previousAnnouncements);

            addToast({
                title: 'Update Failed',
                description:
                    err.response?.data?.message || 'Failed to pin announcement',
                type: 'error',
            });
        } finally {
            setTogglingPin(null);
        }
    };

    // Add reaction
    const handleAddReaction = async (announcementId, emoji) => {
        const previousAnnouncements = [...announcements];

        setAnnouncements((prev) =>
            prev.map((a) => {
                if (a.id === announcementId) {
                    const hasReacted = a.reactions?.some(
                        (r) =>
                            r.emoji === emoji && r.userId === currentUser?.id,
                    );
                    const newReactions = hasReacted
                        ? a.reactions.filter(
                              (r) =>
                                  !(
                                      r.emoji === emoji &&
                                      r.userId === currentUser?.id
                                  ),
                          )
                        : [
                              ...(a.reactions || []),
                              {
                                  emoji,
                                  userId: currentUser?.id,
                                  user: currentUser,
                              },
                          ];
                    return { ...a, reactions: newReactions };
                }
                return a;
            }),
        );

        try {
            setAddingReaction(announcementId);
            const result = await announcementsAPI.addReaction(announcementId, {
                emoji,
            });

            setAnnouncements((prev) =>
                prev.map((a) =>
                    a.id === announcementId
                        ? { ...a, reactions: result.data }
                        : a,
                ),
            );
        } catch (err) {
            console.error('Failed to add reaction:', err);
            setAnnouncements(previousAnnouncements);

            addToast({
                title: 'Reaction Failed',
                description:
                    err.response?.data?.message || 'Failed to add reaction',
                type: 'error',
            });
        } finally {
            setAddingReaction(null);
        }
    };

    // Add comment
    const handleAddComment = async (announcementId, text) => {
        if (!text.trim()) return;

        const previousAnnouncements = [...announcements];
        const optimisticComment = {
            id: 'temp-' + Date.now(),
            text,
            userId: currentUser?.id,
            user: currentUser,
            createdAt: new Date().toISOString(),
        };

        setAnnouncements((prev) =>
            prev.map((a) =>
                a.id === announcementId
                    ? {
                          ...a,
                          comments: [...(a.comments || []), optimisticComment],
                      }
                    : a,
            ),
        );
        setNewComment('');

        try {
            setAddingComment(announcementId);
            const result = await announcementsAPI.addComment(announcementId, {
                text,
            });

            setAnnouncements((prev) =>
                prev.map((a) => {
                    if (a.id === announcementId) {
                        return {
                            ...a,
                            comments: [
                                ...(a.comments || []).filter(
                                    (c) => c.id !== optimisticComment.id,
                                ),
                                result.data,
                            ],
                        };
                    }
                    return a;
                }),
            );
        } catch (err) {
            console.error('Failed to add comment:', err);
            setAnnouncements(previousAnnouncements);
            setNewComment(text);

            addToast({
                title: 'Comment Failed',
                description:
                    err.response?.data?.message || 'Failed to add comment',
                type: 'error',
            });
        } finally {
            setAddingComment(null);
        }
    };

    const pinnedCount = announcements.filter((a) => a.pinned).length;
    const totalReactions = announcements.reduce(
        (sum, a) => sum + (a.reactions?.length || 0),
        0,
    );
    const totalComments = announcements.reduce(
        (sum, a) => sum + (a.comments?.length || 0),
        0,
    );

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
            <div className="shrink-0 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-600 px-8 py-8">
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                                <Megaphone className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Announcements
                            </h1>
                        </div>
                        <p className="text-indigo-200 text-sm ml-12">
                            Keep your team informed and aligned
                        </p>
                        <div className="flex items-center gap-2 mt-4 ml-12 flex-wrap">
                            {[
                                {
                                    label: `${announcements.length} posts`,
                                    emoji: '📢',
                                },
                                { label: `${pinnedCount} pinned`, emoji: '📌' },
                                {
                                    label: `${totalReactions} reactions`,
                                    emoji: '✨',
                                },
                                {
                                    label: `${totalComments} comments`,
                                    emoji: '💬',
                                },
                            ].map(({ label, emoji }) => (
                                <span
                                    key={label}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs text-white font-medium border border-white/20">
                                    <span>{emoji}</span>
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold text-sm rounded-xl transition shadow-lg shadow-indigo-900/20">
                        <Plus className="w-4 h-4" /> New Announcement
                    </button>
                </div>

                <div className="relative mt-6 flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-white/15 backdrop-blur border border-white/25 rounded-xl px-4 py-2.5 focus-within:bg-white/25 transition">
                        <Search className="w-4 h-4 text-white/70 shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search announcements..."
                            className="flex-1 bg-transparent text-white placeholder-white/60 text-sm outline-none"
                        />
                        {search && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setDebouncedSearch('');
                                }}
                                className="text-white/60 hover:text-white transition">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-1 bg-white/15 backdrop-blur border border-white/25 rounded-xl p-1">
                        {['all', 'pinned'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/80 hover:text-white'}`}>
                                {f === 'pinned' ? '📌 Pinned' : '📋 All'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-5">
                    {loading ? (
                        <div className="space-y-5">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 animate-pulse">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-5">
                                <Megaphone className="w-9 h-9 text-red-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                                Failed to Load
                            </p>
                            <p className="text-sm text-gray-400 mb-6">
                                {error}
                            </p>
                            <button
                                onClick={fetchAnnouncements}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition">
                                Try Again
                            </button>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center mb-5">
                                <Megaphone className="w-9 h-9 text-indigo-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                                {search
                                    ? 'No results found'
                                    : 'Nothing here yet'}
                            </p>
                            <p className="text-sm text-gray-400 mb-6">
                                {search
                                    ? `No announcements match "${search}"`
                                    : 'Be the first to post an announcement'}
                            </p>
                            {!search && permissions.canCreateAnnouncement && (
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition inline-flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Create
                                    Announcement
                                </button>
                            )}
                        </div>
                    ) : (
                        announcements.map((ann) => (
                            <div
                                key={ann.id}
                                className={`group bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden hover:shadow-lg hover:shadow-gray-100 dark:hover:shadow-gray-900/50 hover:-translate-y-0.5 transition-all duration-200 ${ann._optimistic ? 'opacity-70' : ''}`}>
                                {ann.pinned && (
                                    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                                )}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                                                {ann.author?.name?.charAt(0) ||
                                                    '?'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {ann.author?.name ||
                                                            'Unknown'}
                                                    </p>
                                                    {ann.pinned && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
                                                            📌 Pinned
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                    {new Date(
                                                        ann.createdAt,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {permissions.canPinAnnouncement &&
                                            !ann._optimistic && (
                                                <button
                                                    onClick={() =>
                                                        handleTogglePin(ann.id)
                                                    }
                                                    disabled={
                                                        togglingPin === ann.id
                                                    }
                                                    className={`opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all disabled:opacity-50 ${
                                                        ann.pinned
                                                            ? 'opacity-100 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                                                            : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                                                    }`}>
                                                    <Pin className="w-4 h-4" />
                                                </button>
                                            )}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                                        {ann.title}
                                    </h3>
                                    <div
                                        className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed [&>p]:mb-1.5 mb-5"
                                        dangerouslySetInnerHTML={{
                                            __html: ann.content,
                                        }}
                                    />
                                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/60">
                                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <SmilePlus className="w-3.5 h-3.5" />
                                            {ann.reactions?.length || 0}{' '}
                                            reactions
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            {ann.comments?.length || 0} comments
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                                        {(() => {
                                            const reactionGroups = {};
                                            ann.reactions?.forEach(
                                                (reaction) => {
                                                    if (
                                                        !reactionGroups[
                                                            reaction.emoji
                                                        ]
                                                    ) {
                                                        reactionGroups[
                                                            reaction.emoji
                                                        ] = [];
                                                    }
                                                    reactionGroups[
                                                        reaction.emoji
                                                    ].push(reaction);
                                                },
                                            );

                                            return (
                                                <>
                                                    {Object.entries(
                                                        reactionGroups,
                                                    ).map(
                                                        ([
                                                            emoji,
                                                            reactions,
                                                        ]) => {
                                                            const hasUserReacted =
                                                                reactions.some(
                                                                    (r) =>
                                                                        r.userId ===
                                                                        currentUser?.id,
                                                                );
                                                            return (
                                                                <button
                                                                    key={emoji}
                                                                    onClick={() =>
                                                                        // permissions.canReact &&
                                                                        // !ann._optimistic &&
                                                                        handleAddReaction(
                                                                            ann.id,
                                                                            emoji,
                                                                        )
                                                                    }
                                                                    // disabled={
                                                                    //     !permissions.canReact ||
                                                                    //     ann._optimistic
                                                                    // }
                                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition ${
                                                                        hasUserReacted
                                                                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                                    }`}>
                                                                    <span>
                                                                        {emoji}
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            reactions.length
                                                                        }
                                                                    </span>
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                    {
                                                        // permissions.canReact &&
                                                        //     !ann._optimistic &&
                                                        Object.keys(
                                                            reactionGroups,
                                                        ).length === 0 && (
                                                            <div className="flex gap-1">
                                                                {[
                                                                    '👍',
                                                                    '❤️',
                                                                    '😂',
                                                                    '😮',
                                                                    '😢',
                                                                    '😡',
                                                                ].map(
                                                                    (emoji) => (
                                                                        <button
                                                                            key={
                                                                                emoji
                                                                            }
                                                                            onClick={() =>
                                                                                handleAddReaction(
                                                                                    ann.id,
                                                                                    emoji,
                                                                                )
                                                                            }
                                                                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-sm transition">
                                                                            {
                                                                                emoji
                                                                            }
                                                                        </button>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )
                                                    }
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <div className="space-y-3">
                                        {ann.comments &&
                                            ann.comments.length > 0 && (
                                                <div className="space-y-2">
                                                    {ann.comments
                                                        .slice(
                                                            0,
                                                            expandedComments[
                                                                ann.id
                                                            ]
                                                                ? undefined
                                                                : 2,
                                                        )
                                                        .map((comment) => (
                                                            <div
                                                                key={comment.id}
                                                                className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-medium text-indigo-600 dark:text-indigo-400 shrink-0">
                                                                    {comment.user?.name?.charAt(
                                                                        0,
                                                                    ) || '?'}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                            {comment
                                                                                .user
                                                                                ?.name ||
                                                                                'Unknown'}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">
                                                                            {new Date(
                                                                                comment.createdAt,
                                                                            ).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                        {
                                                                            comment.text
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    {ann.comments.length >
                                                        2 && (
                                                        <button
                                                            onClick={() =>
                                                                setExpandedComments(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [ann.id]:
                                                                            !prev[
                                                                                ann
                                                                                    .id
                                                                            ],
                                                                    }),
                                                                )
                                                            }
                                                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                                                            {expandedComments[
                                                                ann.id
                                                            ]
                                                                ? 'Show less'
                                                                : `Show ${ann.comments.length - 2} more comments`}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        {
                                            // permissions.canComment &&
                                            //     !ann._optimistic &&
                                            <div className="flex gap-3 pt-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-medium text-indigo-600 dark:text-indigo-400 shrink-0">
                                                    {currentUser?.name?.charAt(
                                                        0,
                                                    ) || '?'}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Write a comment..."
                                                        value={newComment}
                                                        onChange={(e) =>
                                                            setNewComment(
                                                                e.target.value,
                                                            )
                                                        }
                                                        onKeyPress={(e) => {
                                                            if (
                                                                e.key ===
                                                                    'Enter' &&
                                                                newComment.trim()
                                                            ) {
                                                                handleAddComment(
                                                                    ann.id,
                                                                    newComment.trim(),
                                                                );
                                                            }
                                                        }}
                                                        // disabled={
                                                        //     addingComment ===
                                                        //     ann.id
                                                        // }
                                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowCreate(false)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Megaphone className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">
                                            New Announcement
                                        </h3>
                                        <p className="text-xs text-indigo-200">
                                            Broadcast to your entire team
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) =>
                                        setNewTitle(e.target.value)
                                    }
                                    autoFocus
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 dark:focus:border-indigo-600 outline-none transition text-sm font-medium"
                                    placeholder="e.g. Q4 Product Launch Update"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Content
                                </label>
                                {editor && (
                                    <div className="border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 overflow-hidden">
                                        <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-600">
                                            <button
                                                onClick={() =>
                                                    editor
                                                        .chain()
                                                        .toggleBold()
                                                        .run()
                                                }
                                                className={`p-1 rounded ${editor.isActive('bold') ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                                                <b>B</b>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    editor
                                                        .chain()
                                                        .toggleItalic()
                                                        .run()
                                                }
                                                className={`p-1 rounded ${editor.isActive('italic') ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                                                <i>I</i>
                                            </button>
                                        </div>
                                        <EditorContent
                                            editor={editor}
                                            className="p-4 min-h-[200px] text-sm text-gray-900 dark:text-white outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-400">
                                Visible to all workspace members
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowCreate(false)}
                                    // disabled={creatingAnnouncement}
                                    className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium disabled:opacity-50">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    // disabled={
                                    //     creatingAnnouncement ||
                                    //     !newTitle.trim() ||
                                    //     !editor?.getHTML()?.trim()
                                    // }
                                    className="px-5 py-2 text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition font-semibold flex items-center gap-2">
                                    <Megaphone className="w-4 h-4" />
                                    {creatingAnnouncement
                                        ? 'Publishing...'
                                        : 'Publish'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
