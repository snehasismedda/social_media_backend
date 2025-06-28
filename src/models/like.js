const { query } = require("../utils/database");

/**
 * Like model for managing post likes
 */

// Like a post (user can only like once per post)
async function likePost(userId, postId) {
const result = await query(
	'INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
	[userId, postId]
);
return result.rows[0];
}

// Unlike a post
async function unlikePost(userId, postId) {
const result = await query(
	'DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING *',
	[userId, postId]
);
return result.rows[0];
}

// Get the total number of likes for a post
async function getPostLikes(postId) {
const result = await query(
	'SELECT COUNT(*) FROM likes WHERE post_id = $1',
	[postId]
);
return parseInt(result.rows[0].count, 10);
}

// Get all post IDs liked by a user
async function getUserLikes(userId) {
const result = await query(
	'SELECT post_id FROM likes WHERE user_id = $1',
	[userId]
);
return result.rows.map(row => row.post_id);
}

// Check if a user has liked a specific post
async function hasUserLikedPost(userId, postId) {
const result = await query(
	'SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2',
	[userId, postId]
);
return result.rowCount > 0;
}

module.exports = {
likePost,
unlikePost,
getPostLikes,
getUserLikes,
hasUserLikedPost,
};
