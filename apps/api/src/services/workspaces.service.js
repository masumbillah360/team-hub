import prisma from "@repo/database";

export const getWorkspaces = async ({ userId, page, limit, search }) => {
    const where = {
        members: { some: { userId } },
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [workspaces, total] = await Promise.all([
        prisma.workspace.findMany({
            where,
            include: { members: { include: { user: true } } },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.workspace.count({ where }),
    ]);

    return {
        data: workspaces,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};

export const createWorkspace = async ({ name, description, accentColor, userId }) => {
    const workspace = await prisma.workspace.create({
        data: {
            name,
            description,
            accentColor: accentColor || '#6366f1',
            members: { create: { userId, role: 'ADMIN' } },
        },
        include: { members: { include: { user: true } } },
    });

    await prisma.auditLog.create({
        data: {
            action: 'workspace.created',
            userId,
            details: `Created workspace "${name}"`,
            workspaceId: workspace.id,
        },
    });

    return workspace;
};

export const inviteMember = async ({ workspaceId, email, role, invitedById }) => {
    const userToInvite = await prisma.user.findUnique({ where: { email } });
    if (!userToInvite) throw new Error('User not found');

    const existing = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: userToInvite.id } },
    });

    if (existing) throw new Error('User already a member');

    await prisma.workspaceMember.create({
        data: { workspaceId, userId: userToInvite.id, role: role || 'MEMBER' },
    });

    await prisma.notification.create({
        data: {
            type: 'INVITE',
            message: `You were invited to a workspace`,
            recipientId: userToInvite.id,
            workspaceId,
        },
    });
};

export const updateMemberRole = async ({ workspaceId, userId, role, updatedById }) => {
    const member = await prisma.workspaceMember.update({
        where: { workspaceId_userId: { workspaceId, userId } },
        data: { role },
        include: { user: true },
    });

    await prisma.auditLog.create({
        data: {
            action: 'workspace.member_role_changed',
            userId: updatedById,
            details: `Changed role for ${member.user.name} to ${role}`,
            workspaceId,
        },
    });

    return member;
};

export const removeMember = async ({ workspaceId, userId, removedById }) => {
    const member = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
        include: { user: true },
    });

    await prisma.workspaceMember.delete({
        where: { workspaceId_userId: { workspaceId, userId } },
    });

    await prisma.auditLog.create({
        data: {
            action: 'workspace.member_removed',
            userId: removedById,
            details: `Removed ${member?.user?.name || 'user'} from workspace`,
            workspaceId,
        },
    });
};

export const updateWorkspace = async ({ workspaceId, name, description, accentColor, updatedById }) => {
    const updated = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(accentColor && { accentColor }),
        },
    });

    await prisma.auditLog.create({
        data: {
            action: 'workspace.updated',
            userId: updatedById,
            details: `Updated workspace settings`,
            workspaceId,
        },
    });

    return updated;
};

export const deleteWorkspace = async ({ workspaceId, deletedById }) => {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (!workspace) throw new Error('Workspace not found');

    await prisma.workspace.delete({
        where: { id: workspaceId },
    });

    await prisma.auditLog.create({
        data: {
            action: 'workspace.deleted',
            userId: deletedById,
            details: `Deleted workspace "${workspace.name}"`,
            workspaceId,
        },
    });
};