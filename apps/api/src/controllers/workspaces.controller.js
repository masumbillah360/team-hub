import * as workspaceService from '../services/workspaces.service.js';
import * as validationSchema from '../validators/workspace.validator.js';

export const getWorkspaces = async (req, res) => {
    try {
        const { page, limit, search } = validationSchema.workspaceQuerySchema.parse(req.query);

        const result = await workspaceService.getWorkspaces({
            userId: req.user.userId,
            page,
            limit,
            search,
        });
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const workspace = await workspaceService.getWorkspaceById({
            workspaceId: id,
            userId: req.user.userId,
        });
        res.json({ data: workspace });
    } catch (error) {
        res.status(error.message.includes('not found') ? 404 : 400)
            .json({ message: error.message });
    }
};

export const createWorkspace = async (req, res) => {
    try {
        const validatedData = validationSchema.createWorkspaceSchema.parse(req.body);
        const workspace = await workspaceService.createWorkspace({
            ...validatedData,
            userId: req.user.userId,
        });
        res.status(201).json(workspace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const inviteMember = async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = validationSchema.inviteMemberSchema.parse(req.body);
        await workspaceService.inviteMember({
            workspaceId: id,
            ...validatedData,
            invitedById: req.user.userId,
        });
        res.json({ message: 'Invitation sent successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateMemberRole = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const validatedData = validationSchema.updateMemberRoleSchema.parse(req.body);
        const member = await workspaceService.updateMemberRole({
            workspaceId: id,
            userId,
            role: validatedData.role,
            updatedById: req.user.id,
        });
        res.json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { id, userId } = req.params;
        await workspaceService.removeMember({
            workspaceId: id,
            userId,
            removedById: req.user.userId,
        });
        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = validationSchema.updateWorkspaceSchema.parse(req.body);

        // Handle permission matrix update separately if provided
        if (validatedData.permissionMatrix) {
            await workspaceService.updatePermissionMatrix(id, validatedData.permissionMatrix.matrix);
            delete validatedData.permissionMatrix;
        }

        const workspace = await workspaceService.updateWorkspace({
            workspaceId: id,
            ...validatedData,
            updatedById: req.user.userId,
        });
        res.json(workspace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        await workspaceService.deleteWorkspace({
            workspaceId: id,
            deletedById: req.user.userId,
        });
        res.json({ message: 'Workspace deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};