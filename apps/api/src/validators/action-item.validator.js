import { z } from 'zod';

export const createActionItemSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
    assigneeId: z.string().optional(),
    assigneeIds: z.array(z.string()).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
    goalId: z.string().optional(),
    workspaceId: z.string().min(1, 'Workspace ID is required'),
});

export const updateActionItemSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    assigneeId: z.string().optional(),
    assigneeIds: z.array(z.string()).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: z.string().optional().nullable(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
    goalId: z.string().optional().nullable(),
});