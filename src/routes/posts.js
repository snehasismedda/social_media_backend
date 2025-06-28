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

// Get a single post by ID
// GET /api/posts/:post_id
router.get("/:post_id", optionalAuth, getById);

// Get posts by a specific user
// GET /api/posts/user/:user_id
router.get("/user/:user_id", optionalAuth, getUserPosts);

// Delete a post
// DELETE /api/posts/:post_id
router.delete("/:post_id", authenticateToken, remove);

// Get content feed (posts from followed users)
// GET /api/posts/feed
router.get("/feed", authenticateToken, getFeed);

// Update a post
// PUT /api/posts/:post_id
router.put("/:post_id", authenticateToken, validateRequest(updatePostSchema), update);

// Search posts by content (optional, if you implemented search)
// GET /api/posts/search?q=term
router.get("/search", optionalAuth, search);

module.exports = router;
