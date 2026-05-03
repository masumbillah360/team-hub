import { z } from 'zod';

export const createGoalSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
    ownerId: z.string().optional(),
    dueDate: z.string().datetime().optional().or(z.literal('')),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED']).optional(),
    workspaceId: z.string().min(1, 'Workspace ID is required'),
});

export const createMilestoneSchema = z.object({
    title: z.string().min(1, 'Milestone title is required').max(200),
    progress: z.number().min(0).max(100).optional().default(0),
});

export const updateMilestoneSchema = z.object({
    progress: z.number().min(0).max(100),
});

export const createGoalUpdateSchema = z.object({
    text: z.string().min(1, 'Update text is required').max(500),
});

export const updateGoalSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED']).optional(),
    dueDate: z.string().datetime().optional().or(z.literal('')),
});