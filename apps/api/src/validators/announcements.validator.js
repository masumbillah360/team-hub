import { z } from 'zod';

export const createAnnouncementSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    content: z.string().min(1, 'Content is required').max(5000),
    workspaceId: z.string().optional(), // ✅ Added workspaceId
});

export const pinAnnouncementSchema = z.object({
    // No body needed for toggle pin
});

export const reactionSchema = z.object({
    emoji: z.string().min(1).max(20),
});

export const commentSchema = z.object({
    text: z.string().min(1, 'Comment cannot be empty').max(1000),
});