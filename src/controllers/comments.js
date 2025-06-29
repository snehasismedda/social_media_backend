const {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getCommentById,
} = require("../models/comment");
const { getPostById } = require('../models/post');
const logger = require("../utils/logger");

/**
 * Create a comment on a post
 */
const createCommentController = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const comment = await createComment(userId, postId, content);

    logger.verbose(`User ${userId} commented on post ${postId}`);

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    logger.critical("Create comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update (edit) user's own comment
 */
const updateCommentController = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    // Check if comment exists and belongs to user
    const existing = await getCommentById(commentId);
    if (!existing || existing.user_id !== userId) {
      return res.status(403).json({ error: "Not authorized to edit this comment" });
    }

    const updated = await updateComment(commentId, userId, content);
    if (!updated) {
      return res.status(404).json({ error: "Comment not found or already deleted" });
    }

    logger.verbose(`User ${userId} updated comment ${commentId}`);

    res.json({
      message: "Comment updated successfully",
      comment: updated,
    });
  } catch (error) {
    logger.critical("Update comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete (soft delete) user's own comment
 */
const deleteCommentController = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Check if comment exists, belongs to user, and is not already deleted
    const existing = await getCommentById(commentId);
    if (!existing || existing.user_id !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }
    if (existing.is_deleted) {
      return res.status(404).json({ error: "Comment not found or already deleted" });
    }

    const deleted = await deleteComment(commentId, userId);
    if (!deleted) {
      return res.status(404).json({ error: "Comment not found" });
    }

    logger.verbose(`User ${userId} deleted comment ${commentId}`);

    res.json({
      message: "Comment deleted successfully",
      comment: deleted,
    });
  } catch (error) {
    logger.critical("Delete comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get comments for a post (with pagination)
 */

const getPostCommentsController = async (req, res) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    // Check if the post exists and is not deleted
    const post = await getPostById(postId);
    if (!post || post.is_deleted) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = await getPostComments(postId, limit, offset);

    res.json({
      postId,
      comments,
      limit,
      offset,
      count: comments.length,
    });
  } catch (error) {
    logger.critical("Get post comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  createComment: createCommentController,
  updateComment: updateCommentController,
  deleteComment: deleteCommentController,
  getPostComments: getPostCommentsController,
};
