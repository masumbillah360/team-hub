import { asyncHandler } from '../shared/utils/asyncHandler.js';
import * as analyticsService from '../services/analytics.service.js';

export const getStats = asyncHandler(async (req, res) => {
    const { workspaceId } = req.query;

    const stats = await analyticsService.getStats(workspaceId);

    res.json({ data: stats });
});

export const getGoalsCompletion = asyncHandler(async (req, res) => {
    const { workspaceId } = req.query;

    const result = await analyticsService.getGoalsCompletion(workspaceId);

    res.json({ data: result });
});

export const getActivityOverview = asyncHandler(async (req, res) => {
    const { workspaceId } = req.query;

    const activityData = await analyticsService.getActivityOverview(workspaceId);

    res.json({ data: activityData });
});

export const exportWorkspaceData = asyncHandler(async (req, res) => {
    const { workspaceId } = req.query;

    const csv = await analyticsService.exportWorkspaceData(workspaceId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
        'Content-Disposition',
        'attachment; filename="workspace-export.csv"',
    );
    res.send(csv);
});