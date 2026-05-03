import express from 'express';
import validate from '../shared/middleware/validate.js'
import { protect } from '../shared/middleware/protect.js'
import * as goalController from '../controllers/goals.controller.js';

import {
    createGoalSchema,
    createMilestoneSchema,
    updateMilestoneSchema,
    createGoalUpdateSchema,
    updateGoalSchema,
} from '../validators/goals.validator.js';


const router = express.Router();

// GET /api/goals
router.get('/', protect(), goalController.getGoals);

// GET /api/goals/:id
router.get('/:id', protect(), goalController.getGoal);

// POST /api/goals
router.post(
    '/',
    protect(),
    validate(createGoalSchema),
    goalController.createGoal
);

// POST /api/goals/:id/milestones
router.post(
    '/:id/milestones',
    protect(),
    validate(createMilestoneSchema),
    goalController.addMilestone
);

// PUT /api/goals/:id/milestones/:milestoneId
router.put(
    '/:id/milestones/:milestoneId',
    protect(),
    validate(updateMilestoneSchema),
    goalController.updateMilestone
);

// POST /api/goals/:id/updates
router.post(
    '/:id/updates',
    protect(),
    validate(createGoalUpdateSchema),
    goalController.addGoalUpdate
);

// PUT /api/goals/:id
router.put(
    '/:id',
    protect(),
    validate(updateGoalSchema),
    goalController.updateGoal
);

// DELETE /api/goals/:id
router.delete('/:id', protect(), goalController.deleteGoal);

export default router;