const { query } = require('../utils/database');

// Create a scheduled post
async function createScheduledPost({ user_id, content, media_url, scheduled_time }) {
  const result = await query(
    `INSERT INTO scheduled_posts (user_id, content, media_url, scheduled_time)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user_id, content, media_url, scheduled_time]
  );
  return result.rows[0];
}

// Get all scheduled posts for a user
async function getScheduledPostsByUser(user_id) {
  const result = await query(
    `SELECT * FROM scheduled_posts WHERE user_id = $1 ORDER BY scheduled_time ASC`,
    [user_id]
  );
  return result.rows;
}

// Get and mark as published (for manual publish)
async function publishScheduledPostById(id, user_id) {
  const result = await query(
    `UPDATE scheduled_posts SET status = 'published', updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND status = 'pending'
     RETURNING *`,
    [id, user_id]
  );
  return result.rows[0];
}

// Get all due scheduled posts (pending and scheduled_time <= now)
async function getDueScheduledPosts() {
  const result = await query(
    `SELECT * FROM scheduled_posts WHERE status = 'pending' AND scheduled_time <= NOW()`
  );
  return result.rows;
}

// Mark scheduled post as published (for automatic/cron publishing)
async function markScheduledPostPublished(id) {
  await query(
    `UPDATE scheduled_posts SET status = 'published', updated_at = NOW() WHERE id = $1`,
    [id]
  );
}

module.exports = {
  createScheduledPost,
  getScheduledPostsByUser,
  publishScheduledPostById,
  getDueScheduledPosts,
  markScheduledPostPublished,
};
