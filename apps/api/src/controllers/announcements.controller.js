import { asyncHandler } from '../shared/utils/asyncHandler.js';
import * as announcementService from '../services/announcements.service.js';

export const getAnnouncements = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // const workspaceId = req.query.workspaceId;
    const pinned = req.query.pinned === 'true';
    const search = req.query.search || '';

    const result = await announcementService.getAnnouncements({
        // workspaceId,
        page,
        limit,
        pinned,
        search,
    });

    res.json(result);
});

export const createAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await announcementService.createAnnouncement({
        ...req.body,
        authorId: req.user.userId,
        workspaceId: req.body.workspaceId,
    });

    // ✅ Fixed: Wrap in { data }
    res.status(201).json({ data: announcement });
});

export const togglePin = asyncHandler(async (req, res) => {
    const announcement = await announcementService.togglePin({
        announcementId: req.params.id,
        userId: req.user.userId,
    });

    // ✅ Fixed: Wrap in { data }
    res.json({ data: announcement });
});

export const addReaction = asyncHandler(async (req, res) => {
    const result = await announcementService.addReaction({
        announcementId: req.params.id,
        emoji: req.body.emoji,
        userId: req.user.userId,
    });

    // ✅ Fixed: Wrap in { data }
    res.json({ data: result });
});

export const addComment = asyncHandler(async (req, res) => {
    const comment = await announcementService.addComment({
        announcementId: req.params.id,
        text: req.body.text,
        userId: req.user.userId,
    });

    // ✅ Fixed: Wrap in { data }
    res.status(201).json({ data: comment });
});

// ✅ New: Get single announcement
export const getAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await announcementService.getAnnouncement(req.params.id);

    if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ data: announcement });
});

// ✅ New: Delete announcement
export const deleteAnnouncement = asyncHandler(async (req, res) => {
    await announcementService.deleteAnnouncement({
        announcementId: req.params.id,
        userId: req.user.userId,
    });

    res.json({ message: 'Announcement deleted successfully' });
});