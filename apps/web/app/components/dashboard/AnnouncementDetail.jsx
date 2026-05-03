'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/lib/store';
import { announcementsAPI } from '@/lib/api/announcements';
import { io } from 'socket.io-client';
import {
    Send,
    SmilePlus,
    X,
    ChevronDown,
    ChevronUp,
    MessageCircle,
} from 'lucide-react';

let socket;

export default function AnnouncementDetail({ announcementId }) {
    const { currentUser, currentWorkspaceId, addToast } = useStore();
    const router = useRouter();
    const [newComment, setNewComment] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const commentsEndRef = useRef(null);

    // Data states
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Action loading states
    const [addingComment, setAddingComment] = useState(false);
    const [addingReaction, setAddingReaction] = useState(false);

    // Fetch announcement
    const fetchAnnouncement = async () => {
        if (!announcementId) return;

        try {
            setLoading(true);
            setError(null);

            // Try to get single announcement first, fallback to list
            let result;
            try {
                result = await announcementsAPI.getById(announcementId);
            } catch (err) {
                // Fallback to fetching from list if getById doesn't exist
                const listResult = await announcementsAPI.list({
                    workspaceId: currentWorkspaceId,
                });
                const announcements = listResult.data || [];
                const found = announcements.find(
                    (a) => a.id === announcementId,
                );
                if (found) {
                    result = { data: found };
                } else {
                    throw new Error('Announcement not found');
                }
            }

            setAnnouncement(result.data);
        } catch (err) {
            console.error('Failed to fetch announcement:', err);
            setError(
                err.response?.data?.message || 'Failed to load announcement',
            );
            setAnnouncement(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncement();
    }, [announcementId, currentWorkspaceId]);

    // Socket.io for real-time updates
    useEffect(() => {
        const getToken = () => {
            if (typeof document === 'undefined') return null;
            const match = document.cookie.match(/accessToken=([^;]+)/);
            return match?.[1] || null;
        };

        socket = io(
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005',
            {
                auth: { token: getToken() },
            },
        );

        socket.on('connect', () => {
            console.log('Socket connected for announcement detail');
            if (currentWorkspaceId) {
                socket.emit('join-workspace', currentWorkspaceId);
            }
        });

        socket.on('new-comment', (data) => {
            if (data.announcementId === announcementId) {
                setAnnouncement((prev) => {
                    if (!prev) return prev;
                    // Avoid duplicates
                    const exists = prev.comments?.some(
                        (c) => c.id === data.comment.id,
                    );
                    if (exists) return prev;
                    return {
                        ...prev,
                        comments: [...(prev.comments || []), data.comment],
                    };
                });
            }
        });

        socket.on('reaction-update', (data) => {
            if (data.announcementId === announcementId) {
                setAnnouncement((prev) => {
                    if (!prev) return prev;
                    return { ...prev, reactions: data.reactions };
                });
            }
        });

        socket.on('announcement-updated', (data) => {
            if (data.announcementId === announcementId) {
                setAnnouncement((prev) => {
                    if (!prev) return prev;
                    return { ...prev, ...data.announcement };
                });
            }
        });

        return () => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [currentWorkspaceId, announcementId]);

    // Add comment with optimistic update
    const handleAddComment = async () => {
        if (!newComment.trim() || addingComment) return;

        const previousComments = announcement?.comments || [];
        const optimisticComment = {
            id: 'temp-' + Date.now(),
            text: newComment.trim(),
            userId: currentUser?.id,
            user: currentUser,
            createdAt: new Date().toISOString(),
            _optimistic: true,
        };

        // Optimistic update
        setAnnouncement((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                comments: [...(prev.comments || []), optimisticComment],
            };
        });

        setNewComment('');

        try {
            setAddingComment(true);
            const result = await announcementsAPI.addComment(announcementId, {
                text: newComment.trim(),
            });

            // Replace optimistic comment with real one
            setAnnouncement((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    comments: [
                        ...(prev.comments || []).filter(
                            (c) => c.id !== optimisticComment.id,
                        ),
                        result.data,
                    ],
                };
            });

            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            console.error('Failed to add comment:', err);

            // Revert on error
            setAnnouncement((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    comments: previousComments,
                };
            });

            addToast({
                title: 'Comment Failed',
                description:
                    err.response?.data?.message || 'Failed to add comment',
                type: 'error',
            });
        } finally {
            setAddingComment(false);
        }
    };

    // Add reaction with optimistic update
    const handleAddReaction = async (emoji) => {
        if (addingReaction) return;

        const previousReactions = announcement?.reactions || [];
        const hasReacted = previousReactions.some(
            (r) => r.emoji === emoji && r.userId === currentUser?.id,
        );

        // Optimistic update
        const newReactions = hasReacted
            ? previousReactions.filter(
                  (r) => !(r.emoji === emoji && r.userId === currentUser?.id),
              )
            : [
                  ...previousReactions,
                  { emoji, userId: currentUser?.id, user: currentUser },
              ];

        setAnnouncement((prev) => {
            if (!prev) return prev;
            return { ...prev, reactions: newReactions };
        });

        try {
            setAddingReaction(true);
            const result = await announcementsAPI.addReaction(announcementId, {
                emoji,
            });

            // Update with server response
            setAnnouncement((prev) => {
                if (!prev) return prev;
                return { ...prev, reactions: result.data };
            });
        } catch (err) {
            console.error('Failed to add reaction:', err);

            // Revert on error
            setAnnouncement((prev) => {
                if (!prev) return prev;
                return { ...prev, reactions: previousReactions };
            });

            addToast({
                title: 'Reaction Failed',
                description:
                    err.response?.data?.message || 'Failed to add reaction',
                type: 'error',
            });
        } finally {
            setAddingReaction(false);
            setShowEmojiPicker(false);
        }
    };

    // Group reactions by emoji
    const getReactionGroups = () => {
        if (!announcement?.reactions) return {};
        return announcement.reactions.reduce((acc, reaction) => {
            if (!acc[reaction.emoji]) acc[reaction.emoji] = [];
            acc[reaction.emoji].push(reaction.userId);
            return acc;
        }, {});
    };

    const emojis = ['👍', '❤️', '🎉', '🚀', '🔥', '👏', '💪', '😊', '🤔'];
    const reactionGroups = getReactionGroups();

    if (loading) {
        return (
            <div className="p-6 animate-pulse">
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
            </div>
        );
    }

    if (error || !announcement) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {error || 'Announcement not found'}
                    </h2>
                    <button
                        onClick={() => router.push('/announcements')}
                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
                        Back to Announcements
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {announcement.pinned && (
                    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                )}

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {announcement.author?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {announcement.author?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {new Date(
                                    announcement.createdAt,
                                ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                        {announcement.pinned && (
                            <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
                                📌 Pinned
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {announcement.title}
                    </h1>
                    <div
                        className="prose dark:prose-invert max-w-none mb-6 text-gray-600 dark:text-gray-300"
                        dangerouslySetInnerHTML={{
                            __html: announcement.content,
                        }}
                    />

                    {/* Reactions */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {Object.entries(reactionGroups).map(
                            ([emoji, users]) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleAddReaction(emoji)}
                                    disabled={addingReaction}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition-all disabled:opacity-50 ${
                                        users.includes(currentUser?.id)
                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                            : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}>
                                    <span>{emoji}</span>
                                    <span className="text-xs font-medium">
                                        {users.length}
                                    </span>
                                </button>
                            ),
                        )}

                        <div className="relative">
                            <button
                                onClick={() =>
                                    setShowEmojiPicker(!showEmojiPicker)
                                }
                                disabled={addingReaction}
                                className="p-1.5 border border-gray-200 dark:border-gray-600 rounded-full hover:border-indigo-300 dark:hover:border-indigo-500 disabled:opacity-50 transition">
                                <SmilePlus className="w-4 h-4 text-gray-400" />
                            </button>
                            {showEmojiPicker && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 z-20 flex flex-wrap gap-1 shadow-lg">
                                    {emojis.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() =>
                                                handleAddReaction(emoji)
                                            }
                                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-lg transition">
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" /> Comments (
                            {announcement.comments?.length || 0})
                        </h3>

                        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                            {announcement.comments?.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">
                                    No comments yet. Be the first to comment!
                                </p>
                            )}
                            {announcement.comments?.map((comment) => (
                                <div
                                    key={comment.id}
                                    className={`flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl ${
                                        comment._optimistic ? 'opacity-70' : ''
                                    }`}>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {comment.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-gray-900 dark:text-white">
                                                {comment.user?.name ||
                                                    'Unknown'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(
                                                    comment.createdAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {comment.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={commentsEndRef} />
                        </div>

                        {/* Add Comment */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleAddComment()
                                }
                                placeholder="Write a comment..."
                                disabled={addingComment}
                                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment.trim() || addingComment}
                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
