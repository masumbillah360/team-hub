import { z } from 'zod';

export const workspaceQuerySchema = z.object({
    workspaceId: z.string().min(1, 'Workspace ID is required'),
});