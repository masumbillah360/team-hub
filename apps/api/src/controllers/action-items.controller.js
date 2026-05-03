import { asyncHandler } from '../shared/utils/asyncHandler.js';
import * as actionItemsService from '../services/action-items.service.js';

export const getActionItems = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const workspaceId = req.query.workspaceId;
    const status = req.query.status;
    const assigneeId = req.query.assigneeId;
    const search = req.query.search || '';

    const result = await actionItemsService.getActionItems({
        workspaceId,
        status,
        assigneeId,
        search,
        page,
        limit,
    });

    res.json(result);
});

export const getKanbanItems = asyncHandler(async (req, res) => {
    const workspaceId = req.query.workspaceId;

    const kanban = await actionItemsService.getKanbanItems(workspaceId);

    res.json({ data: kanban });
});

export const createActionItem = asyncHandler(async (req, res) => {
    const item = await actionItemsService.createActionItem({
        ...req.body,
        userId: req.user.userId,
    });

    res.status(201).json({ data: item });
});

export const updateActionItem = asyncHandler(async (req, res) => {
    const item = await actionItemsService.updateActionItem(
        req.params.id,
        req.body,
    );

    res.json({ data: item });
});

export const deleteActionItem = asyncHandler(async (req, res) => {
    await actionItemsService.deleteActionItem(req.params.id);

    res.json({ message: 'Action item deleted successfully' });
});

export const getActionItem = asyncHandler(async (req, res) => {
    const item = await actionItemsService.getActionItem(req.params.id);

    if (!item) {
        return res.status(404).json({ message: 'Action item not found' });
    }

    res.json({ data: item });
});