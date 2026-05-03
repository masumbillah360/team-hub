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
            include: { owner: true, milestones: true, updates: true },
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
        include: { owner: true, milestones: true },
    });

    await prisma.auditLog.create({
        data: {
            action: 'goal.created',
            userId,
            details: `Created goal "${title}"`,
            workspaceId,
        },
    });

    return goal;
};

export const addMilestone = async ({ goalId, title, progress, userId }) => {
    const milestone = await prisma.milestone.create({
        data: { title, progress: progress || 0, goalId },
    });

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
    return prisma.goalUpdate.create({
        data: { text, goalId, userId },
        include: { user: true },
    });
};

export const updateGoal = async ({ goalId, title, description, status, dueDate, userId }) => {
    return prisma.goal.update({
        where: { id: goalId },
        data: {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(status && { status }),
            ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        },
        include: { owner: true, milestones: true },
    });
};