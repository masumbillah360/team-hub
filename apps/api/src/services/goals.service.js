import { entityType } from "../validators/workspace.validator.js";
import prisma from "@repo/database";

export const getGoals = async ({ workspaceId, status, search, page, limit }) => {
    const where = {
        workspaceId,
        ...(status && status !== 'All' && { status }),
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
    };

    const [goals, total] = await Promise.all([
        prisma.goal.findMany({
            where,
            include: {
                owner: { select: { id: true, name: true, email: true } },
                milestones: true,
                updates: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.goal.count({ where }),
    ]);

    return {
        data: goals,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};

export const createGoal = async ({ title, description, dueDate, status, workspaceId, userId }) => {
    const goal = await prisma.goal.create({
        data: {
            title,
            description,
            owner: { connect: { id: userId } },
            dueDate: dueDate ? new Date(dueDate) : null,
            status: status || 'NOT_STARTED',
            workspace: { connect: { id: workspaceId } },
        },
        include: {
            owner: { select: { id: true, name: true, email: true } },
            milestones: true,
            updates: {
                include: { user: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' }
            }
        },
    });

    await prisma.auditLog.create({
        data: {
            action: 'goal.created',
            userId,
            details: `Created goal "${title}"`,
            workspaceId,
            entityId: goal.id,
            entityType: entityType.Values.Goal
        },
    });

    return goal;
};

export const addMilestone = async ({ goalId, title, progress, userId }) => {
    const milestone = await prisma.milestone.create({
        data: {
            title,
            progress: progress || 0,
            goalId
        },
    });

    // Create activity update
    await prisma.goalUpdate.create({
        data: {
            text: `Added milestone "${title}"${progress ? ` (${progress}% complete)` : ''}`,
            goalId,
            userId,
        },
    });

    return milestone;
};

export const updateMilestone = async ({ goalId, milestoneId, progress, userId }) => {
    const milestone = await prisma.milestone.update({
        where: { id: milestoneId },
        data: { progress },
    });

    // Create activity update
    await prisma.goalUpdate.create({
        data: {
            text: `Updated milestone "${milestone.title}" progress to ${progress}%`,
            goalId,
            userId,
        },
    });

    return milestone;
};

export const addGoalUpdate = async ({ goalId, text, userId }) => {
    const update = await prisma.goalUpdate.create({
        data: { text, goalId, userId },
        include: {
            user: { select: { id: true, name: true } }
        },
    });

    return update;
};

export const getGoal = async (goalId) => {
    const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: {
            owner: { select: { id: true, name: true, email: true } },
            milestones: { orderBy: { createdAt: 'asc' } },
            updates: {
                include: { user: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' }
            }
        },
    });

    return goal;
};

export const deleteGoal = async ({ goalId, userId }) => {
    const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: { workspace: true }
    });

    if (!goal) {
        throw new Error('Goal not found');
    }

    // ✅ Fixed: Delete related records first, then delete the goal
    // Delete in correct order due to foreign key constraints
    await prisma.$transaction([
        // Delete goal updates
        prisma.goalUpdate.deleteMany({
            where: { goalId }
        }),
        // Delete milestones
        prisma.milestone.deleteMany({
            where: { goalId }
        }),
        // Delete action items if they exist
        prisma.actionItem.deleteMany({
            where: { goalId }
        }),
        // Finally delete the goal
        prisma.goal.delete({
            where: { id: goalId }
        })
    ]);

    // Optional: Create audit log
    await prisma.auditLog.create({
        data: {
            action: 'goal.deleted',
            userId,
            details: `Deleted goal "${goal.title}"`,
            workspaceId: goal.workspaceId,
            entityId: goalId,
            entityType: entityType.Values.Goal
        },
    });

    return goal;
};

export const updateGoal = async ({ goalId, title, description, status, dueDate, userId }) => {
    const goal = await prisma.goal.update({
        where: { id: goalId },
        data: {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(status && { status }),
            ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        },
        include: {
            owner: { select: { id: true, name: true, email: true } },
            milestones: { orderBy: { createdAt: 'asc' } },
            updates: {
                include: { user: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' }
            }
        },
    });

    // Optional: Create audit log for status changes
    if (status) {
        await prisma.auditLog.create({
            data: {
                action: 'goal.updated',
                userId,
                details: `Updated goal "${goal.title}" status to ${status}`,
                workspaceId: goal.workspaceId,
                entityId: goalId,
                entityType: entityType.Values.Goal
            },
        });
    }

    return goal;
};