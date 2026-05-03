import prisma from "@repo/database";

export const getActionItems = async ({
    workspaceId,
    status,
    assigneeId,
    search,
    page,
    limit
}) => {
    const where = {
        workspaceId,
        ...(status && status !== 'All' && { status }),
        ...(assigneeId && { assigneeId }),
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
    };

    const [items, total] = await Promise.all([
        prisma.actionItem.findMany({
            where,
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                goal: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                    }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.actionItem.count({ where }),
    ]);

    return {
        data: items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};

export const getKanbanItems = async (workspaceId) => {
    const items = await prisma.actionItem.findMany({
        where: { workspaceId },
        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
            goal: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' },
    });

    return {
        TODO: items.filter((i) => i.status === 'TODO'),
        IN_PROGRESS: items.filter((i) => i.status === 'IN_PROGRESS'),
        IN_REVIEW: items.filter((i) => i.status === 'IN_REVIEW'),
        DONE: items.filter((i) => i.status === 'DONE'),
    };
};

export const createActionItem = async ({
    title,
    description,
    assigneeId,
    assigneeIds,
    priority,
    dueDate,
    status,
    goalId,
    workspaceId,
}) => {
    // Use first assigneeId from array if available, otherwise use assigneeId
    const finalAssigneeId = assigneeIds?.[0] || assigneeId || null;

    const item = await prisma.actionItem.create({
        data: {
            title,
            description: description || null,
            assigneeId: finalAssigneeId,
            priority: priority?.toUpperCase() || 'MEDIUM',
            dueDate: dueDate ? new Date(dueDate) : null,
            status: status?.toUpperCase() || 'TODO',
            goalId: goalId || null,
            workspaceId,
        },
        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
            goal: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                }
            }
        },
    });

    return item;
};

export const updateActionItem = async (id, updateData) => {
    const {
        title,
        description,
        assigneeId,
        assigneeIds,
        priority,
        dueDate,
        status,
        goalId,
    } = updateData;

    // Use first assigneeId from array if available
    const finalAssigneeId = assigneeIds?.[0] || assigneeId;

    const item = await prisma.actionItem.update({
        where: { id },
        data: {
            ...(title && { title }),
            ...(description !== undefined && { description: description || null }),
            ...(finalAssigneeId !== undefined && { assigneeId: finalAssigneeId }),
            ...(priority && { priority: priority.toUpperCase() }),
            ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
            ...(status && { status }),
            ...(goalId !== undefined && { goalId: goalId || null }),
        },
        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
            goal: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                }
            }
        },
    });

    return item;
};

export const deleteActionItem = async (id) => {
    await prisma.actionItem.delete({
        where: { id },
    });
};

export const getActionItem = async (id) => {
    const item = await prisma.actionItem.findUnique({
        where: { id },
        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
            goal: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                }
            }
        },
    });

    return item;
};