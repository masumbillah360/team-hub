import prisma from "@repo/database";

export const getAnnouncements = async ({ workspaceId, page, limit, pinned, search }) => {
    const where = {
        // ✅ Fixed: Add workspaceId filter
        ...(workspaceId && { workspaceId }),
        ...(pinned && { pinned: true }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                reactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        }),
        prisma.announcement.count({ where }),
    ]);

    return {
        data: announcements,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};

export const createAnnouncement = async ({ title, content, authorId, workspaceId }) => {
    const announcement = await prisma.announcement.create({
        data: {
            title,
            content,
            authorId,
            workspaceId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            reactions: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'asc' }
            },
        },
    });

    return announcement;
};

export const togglePin = async ({ announcementId, userId }) => {
    const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        select: { id: true, pinned: true, authorId: true },
    });

    if (!announcement) {
        throw new Error('Announcement not found');
    }

    // Only author can pin
    if (announcement.authorId !== userId) {
        throw new Error('Only the author can pin this announcement');
    }

    const updated = await prisma.announcement.update({
        where: { id: announcementId },
        data: { pinned: !announcement.pinned },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            reactions: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'asc' }
            },
        },
    });

    return updated;
};

export const addReaction = async ({ announcementId, emoji, userId }) => {
    // Check if reaction already exists
    const existing = await prisma.reaction.findFirst({
        where: {
            announcementId,
            userId,
            emoji
        },
    });

    if (existing) {
        // Remove reaction (toggle off)
        await prisma.reaction.delete({
            where: { id: existing.id }
        });
    } else {
        // Add reaction
        await prisma.reaction.create({
            data: { emoji, announcementId, userId },
        });
    }

    // Return updated reactions list
    const reactions = await prisma.reaction.findMany({
        where: { announcementId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
    });

    return reactions;
};

export const addComment = async ({ announcementId, text, userId }) => {
    const comment = await prisma.comment.create({
        data: { text, announcementId, userId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
    });

    return comment;
};

// ✅ New: Get single announcement
export const getAnnouncement = async (announcementId) => {
    const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            reactions: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'asc' }
            },
        },
    });

    return announcement;
};

// ✅ New: Delete announcement
export const deleteAnnouncement = async ({ announcementId, userId }) => {
    const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        select: { id: true, authorId: true, workspaceId: true, title: true },
    });

    if (!announcement) {
        throw new Error('Announcement not found');
    }

    // Only author can delete
    if (announcement.authorId !== userId) {
        throw new Error('Only the author can delete this announcement');
    }

    // Delete in transaction
    await prisma.$transaction([
        // Delete comments
        prisma.comment.deleteMany({
            where: { announcementId }
        }),
        // Delete reactions
        prisma.reaction.deleteMany({
            where: { announcementId }
        }),
        // Delete announcement
        prisma.announcement.delete({
            where: { id: announcementId }
        })
    ]);

    return announcement;
};