const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
} = require("../controllers/comments");

const router = express.Router();

/**
 * Comments routes
 */

// Create a comment on a post
// POST /api/comments/post/:postId
router.post("/post/:postId", authenticateToken, createComment);

// Update a comment
// PUT /api/comments/:commentId
router.put("/:commentId", authenticateToken, updateComment);

// Delete a comment
// DELETE /api/comments/:commentId
router.delete("/:commentId", authenticateToken, deleteComment);

// Get comments for a post (with pagination via query params: ?limit=20&offset=0)
// GET /api/comments/post/:postId
router.get("/post/:postId", authenticateToken, getPostComments);

module.exports = router;
