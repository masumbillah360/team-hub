import express from 'express';
import validate from '../shared/middleware/validate.js'
import { protect } from '../shared/middleware/protect.js'
import * as announcementController from '../controllers/announcements.controller.js';

import {
    createAnnouncementSchema,
    reactionSchema,
    commentSchema,
} from '../validators/announcements.validator.js';

const router = express.Router();

// GET /api/announcements
router.get('/', protect(), announcementController.getAnnouncements);

// ✅ New: GET single announcement
router.get('/:id', protect(), announcementController.getAnnouncement);

// POST /api/announcements
router.post(
    '/',
    protect(),
    validate(createAnnouncementSchema),
    announcementController.createAnnouncement
);

// PUT /api/announcements/:id/pin
router.put(
    '/:id/pin',
    protect(),
    announcementController.togglePin
);

// POST /api/announcements/:id/reactions
router.post(
    '/:id/reactions',
    protect(),
    validate(reactionSchema),
    announcementController.addReaction
);

// POST /api/announcements/:id/comments
router.post(
    '/:id/comments',
    protect(),
    validate(commentSchema),
    announcementController.addComment
);

// ✅ New: DELETE announcement
router.delete(
    '/:id',
    protect(),
    announcementController.deleteAnnouncement
);

export default router;