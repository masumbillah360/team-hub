import * as goalService from '../services/goals.service.js';
import { asyncHandler } from '../shared/utils/asyncHandler.js';

export const getGoals = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const workspaceId = req.query.workspaceId;
    const status = req.query.status;
    const search = req.query.search || '';

    const result = await goalService.getGoals({
        workspaceId,
        status,
        search,
        page,
        limit,
    });

    res.json(result);
});

export const createGoal = asyncHandler(async (req, res) => {
    const goal = await goalService.createGoal({
        ...req.body,
        userId: req.user.userId,
    });

    res.status(201).json(goal);
});

export const addMilestone = asyncHandler(async (req, res) => {
    const milestone = await goalService.addMilestone({
        goalId: req.params.id,
        ...req.body,
        userId: req.user.userId,
    });

    res.status(201).json(milestone);
});

export const updateMilestone = asyncHandler(async (req, res) => {
    const milestone = await goalService.updateMilestone({
        goalId: req.params.id,
        milestoneId: req.params.milestoneId,
        ...req.body,
        userId: req.user.userId,
    });

    res.json(milestone);
});

export const addGoalUpdate = asyncHandler(async (req, res) => {
    const update = await goalService.addGoalUpdate({
        goalId: req.params.id,
        ...req.body,
        userId: req.user.userId,
    });

    res.status(201).json(update);
});

export const updateGoal = asyncHandler(async (req, res) => {
    const goal = await goalService.updateGoal({
        goalId: req.params.id,
        ...req.body,
        userId: req.user.userId,
    });

    res.json(goal);
});