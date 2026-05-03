import express from 'express';
import { protect, requireWorkspacePermission } from '../shared/middleware/protect.js';
import * as auditLogsController from '../controllers/audit-logs.controller.js';

const router = express.Router();

// GET /api/audit-logs
router.get(
    '/',
    protect(),
    // requireWorkspacePermission('canViewAuditLog'),
    auditLogsController.getAuditLogs,
);

export default router;