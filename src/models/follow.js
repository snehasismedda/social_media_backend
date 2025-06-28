const { query } = require("../utils/database");

/**
 * Follow model for managing user relationships
 */

// Follow a user
async function followUser(followerId, followingId) {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself.');
  }
  const result = await query(
    `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
    [followerId, followingId]
  );
  return result.rows[0];
}

// Unfollow a user
async function unfollowUser(followerId, followingId) {
  const result = await query(
    `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING *`,
    [followerId, followingId]
  );
  return result.rows[0];
}

// Get list of user IDs this user is following
async function getFollowing(userId) {
  const result = await query(
    `SELECT following_id FROM follows WHERE follower_id = $1`,
    [userId]
  );
  return result.rows.map(row => row.following_id);
}

// Get list of user IDs who follow this user
async function getFollowers(userId) {
  const result = await query(
    `SELECT follower_id FROM follows WHERE following_id = $1`,
    [userId]
  );
  return result.rows.map(row => row.follower_id);
}

// Get counts of followers and following for a user
async function getFollowCounts(userId) {
  const followersResult = await query(
    `SELECT COUNT(*) FROM follows WHERE following_id = $1`,
    [userId]
  );
  const followingResult = await query(
    `SELECT COUNT(*) FROM follows WHERE follower_id = $1`,
    [userId]
  );
  return {
    followers: parseInt(followersResult.rows[0].count, 10),
    following: parseInt(followingResult.rows[0].count, 10),
  };
}

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
};
