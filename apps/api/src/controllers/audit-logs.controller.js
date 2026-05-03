import { asyncHandler } from '../shared/utils/asyncHandler.js';
import * as auditLogsService from '../services/audit-logs.service.js';

export const getAuditLogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    // const workspaceId = req.query.workspaceId;
    const action = req.query.action;
    const search = req.query.search;
    const exportCsv = req.query.export === 'csv';

    // Handle CSV export
    if (exportCsv) {
        const csv = await auditLogsService.exportAuditLogsCsv({
            // workspaceId,
            action,
            search,
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
        );
        return res.send(csv);
    }

    const result = await auditLogsService.getAuditLogs({
        // workspaceId,
        page,
        limit,
        action,
        search,
    });

    res.json(result);
});