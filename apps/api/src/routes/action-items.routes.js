import express from 'express';
import validate from '../shared/middleware/validate.js';
import { protect } from '../shared/middleware/protect.js';
import * as actionItemsController from '../controllers/action-items.controller.js';
import { createActionItemSchema, updateActionItemSchema } from '../validators/action-item.validator.js';

const router = express.Router();

// GET /api/action-items — list with pagination + search
router.get('/', protect(), actionItemsController.getActionItems);

// GET /api/action-items/kanban — grouped by status for Kanban board
router.get('/kanban', protect(), actionItemsController.getKanbanItems);

// GET /api/action-items/:id — get single action item
router.get('/:id', protect(), actionItemsController.getActionItem);

// POST /api/action-items — create action item
router.post(
    '/',
    protect(),
    validate(createActionItemSchema),
    actionItemsController.createActionItem,
);

// PUT /api/action-items/:id — update action item
router.put(
    '/:id',
    protect(),
    validate(updateActionItemSchema),
    actionItemsController.updateActionItem,
);

// DELETE /api/action-items/:id — delete action item
router.delete('/:id', protect(), actionItemsController.deleteActionItem);

export default router;