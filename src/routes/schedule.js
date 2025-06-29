const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
    schedulePost,
    getScheduledPosts,
    publishScheduledPost,
} = require('../controllers/scheduledPost');

const router = express.Router();

/**
 * Scheduled posts routes
 */

// Schedule a new post
// POST /api/scheduler/posts/schedule
router.post('/schedule', authenticateToken, schedulePost);

// List scheduled posts for the current user
// GET /api/scheduler/posts/scheduled
router.get('/scheduled', authenticateToken, getScheduledPosts);

// (Optional) Manually publish or cancel a scheduled post
// PATCH /api/scheduler/posts/scheduled/:id/publish
router.patch('/scheduled/:id/publish', authenticateToken, publishScheduledPost);

module.exports = router;
