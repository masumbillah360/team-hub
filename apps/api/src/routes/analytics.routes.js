import express from 'express';
import validate from '../shared/middleware/validate.js';
import { protect } from '../shared/middleware/protect.js';
import { workspaceQuerySchema } from '../validators/analytics.validator.js';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = express.Router();

// GET /api/analytics/stats
router.get(
    '/stats',
    protect(),
    analyticsController.getStats,
);

// GET /api/analytics/goals-completion
router.get(
    '/goals-completion',
    protect(),
    analyticsController.getGoalsCompletion,
);

// GET /api/analytics/activity
router.get(
    '/activity',
    protect(),
    analyticsController.getActivityOverview,
);

// GET /api/analytics/export
router.get(
    '/export',
    protect(),
    analyticsController.exportWorkspaceData,
);

export default router;