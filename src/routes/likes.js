const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes
} = require('../controllers/likes');

const router = express.Router();

/**
 * Likes routes
 */

// Like a post
// POST /api/likes/:postId
router.post('/:postId', authenticateToken, likePost);

// Unlike a post
// DELETE /api/likes/:postId
router.delete('/:postId', authenticateToken, unlikePost);

// Get likes for a post
// GET /api/likes/post/:postId
router.get('/post/:postId', authenticateToken, getPostLikes);

// Get posts liked by a user
// GET /api/likes/user/:userId
router.get('/user/:userId', authenticateToken, getUserLikes);

module.exports = router;