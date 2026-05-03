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

    res.status(201).json({ data: goal });
});

export const addMilestone = asyncHandler(async (req, res) => {
    const milestone = await goalService.addMilestone({
        goalId: req.params.id,
        ...req.body,
        userId: req.user.userId,
    });

    // ✅ Fixed: Wrap in { data }
    res.status(201).json({ data: milestone });
});

export const updateMilestone = asyncHandler(async (req, res) => {
    const milestone = await goalService.updateMilestone({
        goalId: req.params.id,
        milestoneId: req.params.milestoneId,
        ...req.body,
        userId: req.user.userId,
    });

    // ✅ Fixed: Wrap in { data }
    res.json({ data: milestone });
});

export const addGoalUpdate = asyncHandler(async (req, res) => {
    const update = await goalService.addGoalUpdate({
        goalId: req.params.id,
        ...req.body,
        userId: req.user.userId,
    });

    // ✅ Fixed: Wrap in { data }
    res.status(201).json({ data: update });
});

export const getGoal = asyncHandler(async (req, res) => {
    const goal = await goalService.getGoal(req.params.id);

    if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ data: goal });
});

export const deleteGoal = asyncHandler(async (req, res) => {
    await goalService.deleteGoal({
        goalId: req.params.id,
        userId: req.user.userId,
    });

    res.json({ message: 'Goal deleted successfully' });
});

export const updateGoal = asyncHandler(async (req, res) => {
    const goal = await goalService.updateGoal({
        goalId: req.params.id,
        ...req.body,
        userId: req.user.userId,
    });

    // ✅ Fixed: Wrap in { data }
    res.json({ data: goal });
});