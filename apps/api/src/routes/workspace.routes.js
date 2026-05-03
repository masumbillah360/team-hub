import express from 'express';

import { protect, requireWorkspacePermission } from '../shared/middleware/protect.js';
import * as workspaceController from '../controllers/workspaces.controller.js';
import validate from '../shared/middleware/validate.js';
import * as validationSchema from '../validators/workspace.validator.js'

const router = express.Router();

// GET /api/workspaces
router.get('/', protect(), workspaceController.getWorkspaces);

// GET /api/workspace
router.get('/:id', protect(), workspaceController.getWorkspace);

// POST /api/workspaces
router.post(
    '/',
    protect(),
    validate(validationSchema.createWorkspaceSchema),
    workspaceController.createWorkspace
);

// POST /api/workspaces/:id/invite
router.post(
    '/:id/invite',
    protect(),
    requireWorkspacePermission('workspace:invite'),
    validate(validationSchema.inviteMemberSchema),
    workspaceController.inviteMember
);

// PUT /api/workspaces/:id/members/:userId/role
router.put(
    '/:id/members/:userId/role',
    protect(),
    requireWorkspacePermission('workspace:change_role'),
    validate(validationSchema.updateMemberRoleSchema),
    workspaceController.updateMemberRole
);

// DELETE /api/workspaces/:id/members/:userId
router.delete(
    '/:id/members/:userId',
    protect(),
    requireWorkspacePermission('workspace:remove_member'),
    workspaceController.removeMember
);

// PUT /api/workspaces/:id
router.put(
    '/:id',
    protect(),
    requireWorkspacePermission('workspace:update'),
    validate(validationSchema.updateWorkspaceSchema),
    workspaceController.updateWorkspace
);

// DELETE /api/workspaces/:id
router.delete(
    '/:id',
    protect(),
    requireWorkspacePermission('workspace:delete'),
    workspaceController.deleteWorkspace
);

export default router;