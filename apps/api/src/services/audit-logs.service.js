import prisma from '@repo/database';

export const getAuditLogs = async ({
    workspaceId,
    page,
    limit,
    action,
    search,
}) => {
    const where = {
        workspaceId,
        ...(action &&
            action !== 'All' && {
            action: { contains: action, mode: 'insensitive' },
        }),
        ...(search && {
            OR: [
                { details: { contains: search, mode: 'insensitive' } },
                {
                    user: {
                        name: { contains: search, mode: 'insensitive' },
                    },
                },
                { action: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.auditLog.count({ where }),
    ]);

    return {
        data: logs,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};

export const exportAuditLogsCsv = async ({ workspaceId, action, search }) => {
    const where = {
        workspaceId,
        ...(action &&
            action !== 'All' && {
            action: { contains: action, mode: 'insensitive' },
        }),
        ...(search && {
            OR: [
                { details: { contains: search, mode: 'insensitive' } },
                { action: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    const logs = await prisma.auditLog.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    const rows = [
        ['Action', 'User', 'Email', 'Details', 'Entity Type', 'Date'],
    ];

    logs.forEach((log) => {
        rows.push([
            log.action,
            `"${(log.user?.name || 'Unknown').replace(/"/g, '""')}"`,
            log.user?.email || 'Unknown',
            `"${(log.details || '').replace(/"/g, '""')}"`,
            log.entityType || '',
            new Date(log.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
        ]);
    });

    return rows.map((row) => row.join(',')).join('\n');
};