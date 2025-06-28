const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  follow,
  unfollow,
  getMyFollowing,
  getMyFollowers,
  getFollowStats,
  searchUsers, // You should implement this in your user controller
} = require("../controllers/users");

const router = express.Router();

/**
 * User-related routes
 */

// Follow a user
// POST /api/users/follow/:userId
router.post("/follow/:userId", authenticateToken, follow);

// Unfollow a user
// DELETE /api/users/unfollow/:userId
router.delete("/unfollow/:userId", authenticateToken, unfollow);

// Get users that the current user follows
// GET /api/users/following
router.get("/following", authenticateToken, getMyFollowing);

// Get users that follow the current user
// GET /api/users/followers
router.get("/followers", authenticateToken, getMyFollowers);

// Get follow stats (followers/following count) for any user (default: current user)
// GET /api/users/stats/:userId?
router.get("/stats/:userId?", authenticateToken, getFollowStats);

// Search users by name
// POST /api/users/search
router.post("/search", authenticateToken, searchUsers);

module.exports = router;
