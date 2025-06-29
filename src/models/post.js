const { query } = require("../utils/database");

/**
 * Post model for database operations
 */

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
const createPost = async ({
  user_id,
  content,
  media_url,
  comments_enabled = true,
}) => {
  const result = await query(
    `INSERT INTO posts (user_id, content, media_url, comments_enabled, created_at, is_deleted)
     VALUES ($1, $2, $3, $4, NOW(), false)
     RETURNING id, user_id, content, media_url, comments_enabled, created_at`,
    [user_id, content, media_url, comments_enabled],
  );

  return result.rows[0];
};

/**
 * Get post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object|null>} Post object or null
 */
const getPostById = async (postId) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [postId],
  );

  return result.rows[0] || null;
};

/**
 * Get posts by user ID
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const getPostsByUserId = async (userId, limit = 20, offset = 0, is_deleted) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1 AND p.is_deleted = $2
      ORDER BY p.created_at DESC
      LIMIT $3 OFFSET $4`,
    [userId, is_deleted, limit, offset],
  );

  return result.rows;
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} Success status
 */
const deletePost = async (postId, userId) => {
  const result = await query(
    "UPDATE posts SET is_deleted = true WHERE id = $1 AND user_id = $2",
    [postId, userId],
  );

  return result.rowCount > 0;
};

// TODO: Implement getFeedPosts function that returns posts from followed users
const getFeedPosts = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN follows f ON p.user_id = f.following_id
      WHERE f.follower_id = $1 AND p.is_deleted = false
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};


// TODO: Implement updatePost function for editing posts

const updatePost = async (postId, userId, { content, media_url, comments_enabled }) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (content !== undefined) {
    fields.push(`content = $${idx++}`);
    values.push(content);
  }
  if (media_url !== undefined) {
    fields.push(`media_url = $${idx++}`);
    values.push(media_url);
  }
  if (comments_enabled !== undefined) {
    fields.push(`comments_enabled = $${idx++}`);
    values.push(comments_enabled);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(postId);
  values.push(userId);

  const sql = `UPDATE posts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`;

  const result = await query(sql, values);
  return result.rows[0];
};


// TODO: Implement searchPosts function for content search

const searchPosts = async (searchTerm, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.content ILIKE '%' || $1 || '%' AND p.is_deleted = false
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
    [searchTerm, limit, offset]
  );
  return result.rows;
};


module.exports = {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  getFeedPosts,
  updatePost,
  searchPosts,
};

