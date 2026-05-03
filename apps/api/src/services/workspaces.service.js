import { entityType } from "../validators/workspace.validator.js";
import prisma from "@repo/database";
import { DEFAULT_PERMISSION_MATRIX, validatePermissionMatrix } from "../shared/config/rbac.js";

export const getWorkspaces = async ({ userId, page, limit, search }) => {
    const where = {
        members: { some: { userId } },
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [workspaces, total] = await Promise.all([
        prisma.workspace.findMany({
            where,
            include: {
                members: { include: { user: true } },
                permissionMatrix: true,
                _count: {
                    select: {
                        goals: true,
                        actionItems: true,
                        announcements: true,
                    }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { updatedAt: 'desc' }
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

export const getWorkspaceById = async ({ workspaceId, userId }) => {
    const workspace = await prisma.workspace.findFirst({
        where: {
            id: workspaceId,
            members: { some: { userId } }
        },
        include: {
            members: {
                include: { user: true },
                orderBy: { createdAt: 'asc' }
            },
            permissionMatrix: true,
            _count: {
                select: {
                    goals: true,
                    actionItems: true,
                    announcements: true,
                }
            }
        }
    });

    if (!workspace) {
        throw new Error('Workspace not found or access denied');
    }

    return workspace;
};

export const createWorkspace = async ({ name, description, accentColor, userId }) => {
    const workspace = await prisma.workspace.create({
        data: {
            name,
            description,
            accentColor: accentColor || '#6366f1',
            members: { create: { userId, role: 'ADMIN' } },
            permissionMatrix: {
                create: {
                    permissions: DEFAULT_PERMISSION_MATRIX
                }
            }
        },
        include: {
            members: { include: { user: true } },
            permissionMatrix: true
        },
    });

    await prisma.auditLog.create({
        data: {
            action: 'CREATE',
            userId,
            details: { message: `Created workspace "${name}"` },
            workspaceId: workspace.id,
            entityId: workspace.id,
            entityType: entityType.Enum.Workspace,
        },
    });

    return workspace;
};

export const inviteMember = async ({ workspaceId, email, role, invitedById }) => {
    // Check if workspace exists and user has permission
    const workspace = await prisma.workspace.findFirst({
        where: {
            id: workspaceId,
            members: { some: { userId: invitedById } }
        }
    });

    if (!workspace) {
        throw new Error('Workspace not found');
    }

    const userToInvite = await prisma.user.findUnique({ where: { email } });
    if (!userToInvite) {
        throw new Error('User not found with this email address');
    }

    const existing = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: userToInvite.id } },
    });

    if (existing) {
        throw new Error('User is already a member of this workspace');
    }

    const member = await prisma.workspaceMember.create({
        data: { workspaceId, userId: userToInvite.id, role: role || 'MEMBER' },
        include: { user: true }
    });

    await Promise.all([
        prisma.notification.create({
            data: {
                type: 'INVITE',
                message: `You were invited to join ${workspace.name}`,
                recipientId: userToInvite.id,
                senderId: invitedById,
                workspaceId,
                entityType: 'Workspace',
                entityId: workspaceId,
            },
        }),
        prisma.auditLog.create({
            data: {
                action: 'INVITE',
                userId: invitedById,
                details: { message: `Invited ${userToInvite.name} to workspace`, email, role },
                workspaceId,
                entityType: entityType.Enum.WorkspaceMember,
                entityId: member.id,
            },
        })
    ]);

    return member;
};

export const updateMemberRole = async ({ workspaceId, userId, role, updatedById }) => {
    // Check if this would remove the last admin
    if (role !== 'ADMIN') {
        const adminCount = await prisma.workspaceMember.count({
            where: { workspaceId, role: 'ADMIN' }
        });

        const currentMember = await prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } }
        });

        if (adminCount === 1 && currentMember?.role === 'ADMIN') {
            throw new Error('Cannot remove the last admin from the workspace');
        }
    }

    const member = await prisma.workspaceMember.update({
        where: { workspaceId_userId: { workspaceId, userId } },
        data: { role },
        include: { user: true },
    });

    await prisma.auditLog.create({
        data: {
            action: 'ROLE_CHANGE',
            userId: updatedById,
            details: { message: `Changed role for ${member.user.name} to ${role}`, newRole: role },
            workspaceId,
            entityType: entityType.Enum.WorkspaceMember,
            entityId: member.id,
        },
    });

    return member;
};

export const removeMember = async ({ workspaceId, userId, removedById }) => {
    // Prevent removing yourself if you're the last admin
    const adminCount = await prisma.workspaceMember.count({
        where: { workspaceId, role: 'ADMIN' }
    });

    const memberToRemove = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
        include: { user: true },
    });

    if (!memberToRemove) {
        throw new Error('Member not found');
    }

    if (adminCount === 1 && memberToRemove.role === 'ADMIN') {
        throw new Error('Cannot remove the last admin from the workspace');
    }

    await prisma.workspaceMember.delete({
        where: { workspaceId_userId: { workspaceId, userId } },
    });

    await prisma.auditLog.create({
        data: {
            action: 'DELETE',
            userId: removedById,
            details: { message: `Removed ${memberToRemove.user.name} from workspace` },
            workspaceId,
            entityType: entityType.Enum.WorkspaceMember,
            entityId: memberToRemove.id,
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

    // await prisma.auditLog.create({
    //     data: {
    //         action: 'UPDATE',
    //         userId: updatedById,
    //         details: { message: 'Updated workspace settings', changes: { name, description, accentColor } },
    //         workspaceId,
    //         entityId: updated.id,
    //         entityType: entityType.Enum.Workspace,
    //     },
    // });

    return updated;
};

export const deleteWorkspace = async ({ workspaceId, deletedById }) => {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (!workspace) {
        throw new Error('Workspace not found');
    }

    await prisma.workspace.delete({
        where: { id: workspaceId },
    });

    // Note: Due to cascade deletes, all related data will be automatically deleted
};

export const updatePermissionMatrix = async (workspaceId, matrix) => {
    const parsedMatrix = JSON.parse(matrix);

    // Always start with default matrix as base
    const baseMatrix = { ...DEFAULT_PERMISSION_MATRIX };

    // Merge provided matrix on top
    Object.keys(parsedMatrix).forEach(permission => {
        if (parsedMatrix[permission]) {
            baseMatrix[permission] = { ...baseMatrix[permission], ...parsedMatrix[permission] };
        }
    });

    // Validate the matrix
    const errors = validatePermissionMatrix(baseMatrix);
    if (errors.length > 0) {
        throw new Error(`Invalid permission matrix: ${errors.join(', ')}`);
    }

    return prisma.permissionMatrix.upsert({
        where: { workspaceId },
        update: { permissions: baseMatrix },
        create: {
            workspaceId,
            permissions: baseMatrix,
        },
    });
};