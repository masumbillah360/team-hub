import { asyncHandler } from '../shared/utils/asyncHandler.js';
import * as workspaceService from '../services/workspaces.service.js';

export const getWorkspaces = asyncHandler(async (req, res) => {
    const result = await workspaceService.getWorkspaces({
        userId: req.user.userId,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search || '',
    });

    res.json(result);
});

export const createWorkspace = asyncHandler(async (req, res) => {
    const workspace = await workspaceService.createWorkspace({
        ...req.body,
        userId: req.user.userId,
    });

    res.status(201).json(workspace);
});

export const inviteMember = asyncHandler(async (req, res) => {
    await workspaceService.inviteMember({
        workspaceId: req.params.id,
        ...req.body,
        invitedById: req.user.userId,
    });

    res.json({ message: 'Member invited successfully' });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
    const member = await workspaceService.updateMemberRole({
        workspaceId: req.params.id,
        userId: req.params.userId,
        ...req.body,
        updatedById: req.user.userId,
    });

    res.json(member);
});

export const removeMember = asyncHandler(async (req, res) => {
    await workspaceService.removeMember({
        workspaceId: req.params.id,
        userId: req.params.userId,
        removedById: req.user.userId,
    });

    res.json({ message: 'Member removed successfully' });
});

export const updateWorkspace = asyncHandler(async (req, res) => {
    const updated = await workspaceService.updateWorkspace({
        workspaceId: req.params.id,
        ...req.body,
        updatedById: req.user.userId,
    });

    res.json(updated);
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
    await workspaceService.deleteWorkspace({
        workspaceId: req.params.id,
        deletedById: req.user.userId,
    });

    res.json({ message: 'Workspace deleted successfully' });
});