const {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
} = require("../models/follow");
const { getUserById, findUsersByName } = require("../models/user");
const logger = require("../utils/logger");

/**
 * Follow another user
 */
const follow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;

    if (parseInt(followerId) === parseInt(followingId)) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    // Check if the user to follow exists
    const user = await getUserById(followingId);
    if (!user) {
      return res.status(404).json({ error: "User to follow not found" });
    }

    const followResult = await followUser(followerId, followingId);

    if (!followResult) {
      return res.status(400).json({ error: "Already following this user" });
    }

    logger.verbose(`User ${followerId} followed user ${followingId}`);

    res.status(201).json({
      message: "User followed successfully",
      follow: followResult,
    });
  } catch (error) {
    logger.critical("Follow user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Unfollow a user
 */
const unfollow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;

    const unfollowResult = await unfollowUser(followerId, followingId);

    if (!unfollowResult) {
      return res.status(404).json({ error: "Not following this user" });
    }

    logger.verbose(`User ${followerId} unfollowed user ${followingId}`);

    res.json({
      message: "User unfollowed successfully",
      unfollow: unfollowResult,
    });
  } catch (error) {
    logger.critical("Unfollow user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users the current user is following
 */
const getMyFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    const following = await getFollowing(userId);

    res.json({
      userId,
      following,
      count: following.length,
    });
  } catch (error) {
    logger.critical("Get following error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users who follow the current user
 */
const getMyFollowers = async (req, res) => {
  try {
    const userId = req.user.id;
    const followers = await getFollowers(userId);

    res.json({
      userId,
      followers,
      count: followers.length,
    });
  } catch (error) {
    logger.critical("Get followers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get follower and following counts for a user
 */
const getFollowStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await getFollowCounts(userId);

    res.json({
      userId,
      followers: stats.followers,
      following: stats.following,
    });
  } catch (error) {
    logger.critical("Get follow stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * Search users by name (username or full_name, case-insensitive, paginated)
 */
const searchUsers = async (req, res) => {
  try {
    const { name, limit = 20, offset = 0 } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Search term is required" });
    }
    const users = await findUsersByName(name, limit, offset);
    res.json({ users });
  } catch (error) {
    logger.critical("User search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  follow,
  unfollow,
  getMyFollowing,
  getMyFollowers,
  getFollowStats,
  searchUsers
};
