import { z } from 'zod';

export const createWorkspaceSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    accentColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color hex code')
        .optional(),
});

export const inviteMemberSchema = z.object({
    email: z.string().email('Valid email is required'),
    role: z.enum(['ADMIN', 'MEMBER']).optional().default('MEMBER'),
});

export const updateMemberRoleSchema = z.object({
    role: z.enum(['ADMIN', 'MEMBER']),
});

export const updateWorkspaceSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100).optional(),
    description: z.string().max(500).optional(),
    accentColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
});

export const workspaceQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    search: z.string().optional(),
});

export const entityType = z.enum([
    'Goal',
    'ActionItem',
    'Announcement',
    'Milestone',
    'WorkspaceMember',
    'Workspace',
]);
export const entityAction = z.enum([
    'CREATE',
    'UPDATE',
    'DELETE',
    'STATUS_CHANGE',
    'ASSIGN',
    'INVITE',
    'ROLE_CHANGE',
]);
