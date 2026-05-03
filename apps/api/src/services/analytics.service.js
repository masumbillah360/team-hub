import prisma from '@repo/database';

export const getStats = async (workspaceId) => {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
        totalGoals,
        completedGoals,
        totalActionItems,
        completedItems,
        overdueCount,
        completedThisWeek,
        inProgressItems,
        todoItems,
        inReviewItems,
    ] = await Promise.all([
        // Goals
        prisma.goal.count({ where: { workspaceId } }),
        prisma.goal.count({ where: { workspaceId, status: 'COMPLETED' } }),

        // Action items counts
        prisma.actionItem.count({ where: { workspaceId } }),
        prisma.actionItem.count({ where: { workspaceId, status: 'DONE' } }),

        // Overdue items (not done and past due date)
        prisma.actionItem.count({
            where: {
                workspaceId,
                status: { not: 'DONE' },
                dueDate: { lt: now },
            },
        }),

        // Completed this week
        prisma.actionItem.count({
            where: {
                workspaceId,
                status: 'DONE',
                updatedAt: { gte: weekAgo },
            },
        }),

        // Status breakdown
        prisma.actionItem.count({ where: { workspaceId, status: 'IN_PROGRESS' } }),
        prisma.actionItem.count({ where: { workspaceId, status: 'TODO' } }),
        prisma.actionItem.count({ where: { workspaceId, status: 'IN_REVIEW' } }),
    ]);

    // Completion rate
    const completionRate =
        totalActionItems > 0
            ? Math.round((completedItems / totalActionItems) * 100)
            : 0;

    return {
        // Goals
        totalGoals,
        completedGoals,
        inProgressGoals: 0, // calculated below

        // Action items
        totalActionItems,
        completedItems,
        completedThisWeek,
        overdueCount,
        completionRate,

        // Action item status breakdown
        statusBreakdown: {
            TODO: todoItems,
            IN_PROGRESS: inProgressItems,
            IN_REVIEW: inReviewItems,
            DONE: completedItems,
        },
    };
};

export const getGoalsCompletion = async (workspaceId) => {
    const goals = await prisma.goal.findMany({
        where: { workspaceId },
        include: {
            milestones: {
                select: {
                    id: true,
                    progress: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Always return data even if empty
    if (goals.length === 0) {
        return {
            data: [],
            summary: {
                total: 0,
                notStarted: 0,
                inProgress: 0,
                onHold: 0,
                completed: 0,
                averageProgress: 0,
            },
        };
    }

    const chartData = goals.map((g) => {
        const avgProgress =
            g.milestones.length > 0
                ? Math.round(
                    g.milestones.reduce((acc, m) => acc + m.progress, 0) /
                    g.milestones.length,
                )
                : 0;

        return {
            goalId: g.id,
            title:
                g.title.length > 20
                    ? g.title.slice(0, 20) + '...'
                    : g.title,
            fullTitle: g.title,
            progress: avgProgress,
            status: g.status,
            milestoneCount: g.milestones.length,
        };
    });

    const summary = {
        total: goals.length,
        notStarted: goals.filter((g) => g.status === 'NOT_STARTED').length,
        inProgress: goals.filter((g) => g.status === 'IN_PROGRESS').length,
        onHold: goals.filter((g) => g.status === 'ON_HOLD').length,
        completed: goals.filter((g) => g.status === 'COMPLETED').length,
        averageProgress:
            chartData.length > 0
                ? Math.round(
                    chartData.reduce((acc, g) => acc + g.progress, 0) /
                    chartData.length,
                )
                : 0,
    };

    return { data: chartData, summary };
};

export const getActivityOverview = async (workspaceId) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get daily completed items for the last 30 days
    const completedItems = await prisma.actionItem.findMany({
        where: {
            workspaceId,
            status: 'DONE',
            updatedAt: { gte: thirtyDaysAgo },
        },
        select: {
            updatedAt: true,
        },
        orderBy: { updatedAt: 'asc' },
    });

    // Group by day
    const dailyMap = {};
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().slice(0, 10);
        dailyMap[key] = 0;
    }

    completedItems.forEach((item) => {
        const key = new Date(item.updatedAt).toISOString().slice(0, 10);
        if (dailyMap[key] !== undefined) {
            dailyMap[key]++;
        }
    });

    const activityData = Object.entries(dailyMap).map(([date, count]) => ({
        date,
        label: new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        }),
        completed: count,
    }));

    return activityData;
};

export const exportWorkspaceData = async (workspaceId) => {
    const [goals, actionItems, announcements] = await Promise.all([
        prisma.goal.findMany({
            where: { workspaceId },
            include: {
                owner: { select: { name: true } },
                milestones: { select: { title: true, progress: true } },
            },
        }),
        prisma.actionItem.findMany({
            where: { workspaceId },
            include: {
                assignee: { select: { name: true } },
            },
        }),
        prisma.announcement.findMany({
            where: { workspaceId },
            include: {
                author: { select: { name: true } },
            },
        }),
    ]);

    // Build CSV with more detail
    const rows = [
        ['Type', 'Title', 'Status', 'Owner/Author/Assignee', 'Created At', 'Extra Info'],
    ];

    goals.forEach((g) => {
        const avgProgress =
            g.milestones.length > 0
                ? Math.round(
                    g.milestones.reduce((acc, m) => acc + m.progress, 0) /
                    g.milestones.length,
                )
                : 0;
        rows.push([
            'Goal',
            `"${g.title.replace(/"/g, '""')}"`,
            g.status,
            g.owner?.name || 'Unknown',
            new Date(g.createdAt).toLocaleDateString(),
            `Progress: ${avgProgress}%`,
        ]);
    });

    actionItems.forEach((i) => {
        rows.push([
            'Action Item',
            `"${i.title.replace(/"/g, '""')}"`,
            i.status,
            i.assignee?.name || 'Unassigned',
            new Date(i.createdAt).toLocaleDateString(),
            `Priority: ${i.priority}`,
        ]);
    });

    announcements.forEach((a) => {
        rows.push([
            'Announcement',
            `"${a.title.replace(/"/g, '""')}"`,
            'Published',
            a.author?.name || 'Unknown',
            new Date(a.createdAt).toLocaleDateString(),
            a.pinned ? 'Pinned' : '',
        ]);
    });

    const csv = rows.map((row) => row.join(',')).join('\n');
    return csv;
};