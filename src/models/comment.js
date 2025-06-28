const { query } = require("../utils/database");

/**
 * Comment model for managing post comments
 */

// Create a new comment
async function createComment(userId, postId, content) {
  const result = await query(
    `INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *`,
    [userId, postId, content]
  );
  return result.rows[0];
}

// Update an existing comment (only if owned by user and not deleted)
async function updateComment(commentId, userId, newContent) {
  const result = await query(
    `UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 AND user_id = $3 AND is_deleted = FALSE RETURNING *`,
    [newContent, commentId, userId]
  );
  return result.rows[0];
}

// Soft delete a comment (only if owned by user)
async function deleteComment(commentId, userId) {
  const result = await query(
    `UPDATE comments SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [commentId, userId]
  );
  return result.rows[0];
}

// Get all comments for a post (excluding deleted), ordered by creation time
async function getPostComments(postId) {
  const result = await query(
    `SELECT * FROM comments WHERE post_id = $1 AND is_deleted = FALSE ORDER BY created_at ASC`,
    [postId]
  );
  return result.rows;
}

// Get a single comment by its ID
async function getCommentById(commentId) {
  const result = await query(
    `SELECT * FROM comments WHERE id = $1 AND is_deleted = FALSE`,
    [commentId]
  );
  return result.rows[0];
}

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getCommentById,
};
