const express = require("express");
const { validateRequest, createPostSchema, updatePostSchema } = require("../utils/validation");
const {
	create,
	getById,
	getUserPosts,
	getMyPosts,
	remove,
	getFeed,
	update,
	search,
} = require("../controllers/posts");
const { authenticateToken, optionalAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * Posts routes
 */

// Create a new post
// POST /api/posts
router.post("/", authenticateToken, validateRequest(createPostSchema), create);

// Get current user's posts
// GET /api/posts/my
router.get("/my", authenticateToken, getMyPosts);

// Get posts by a specific user
// GET /api/posts/user/:user_id
router.get("/user/:user_id", optionalAuth, getUserPosts);

// Get content feed (posts from followed users)
// GET /api/posts/feed
router.get("/feed", authenticateToken, getFeed);

// Delete a post
// DELETE /api/posts/:post_id
router.delete("/:post_id", authenticateToken, remove);

// Update a post
// PUT /api/posts/:post_id
router.put("/:post_id", authenticateToken, validateRequest(updatePostSchema), update);

// Get a single post by ID
// GET /api/posts/:post_id
router.get("/:post_id", optionalAuth, getById);

module.exports = router;
