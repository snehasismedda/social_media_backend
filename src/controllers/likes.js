const {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes
} = require('../models/like');
const logger = require('../utils/logger');

/**
 * Like a post
 */
const likePostController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const like = await likePost(userId, postId);

    if (!like) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    logger.verbose(`User ${userId} liked post ${postId}`);

    res.status(201).json({ message: 'Post liked successfully', like });
  } catch (error) {
    logger.critical('Like post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Unlike a post
 */
const unlikePostController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const unlike = await unlikePost(userId, postId);

    if (!unlike) {
      return res.status(404).json({ error: 'Like not found' });
    }

    logger.verbose(`User ${userId} unliked post ${postId}`);

    res.json({ message: 'Post unliked successfully', unlike });
  } catch (error) {
    logger.critical('Unlike post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get total likes for a post
 */
const getPostLikesController = async (req, res) => {
  try {
    const { postId } = req.params;

    const count = await getPostLikes(postId);

    res.json({ postId, likesCount: count });
  } catch (error) {
    logger.critical('Get post likes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get posts liked by a user
 */
const getUserLikesController = async (req, res) => {
  try {
    const userId = req.user.id;

    const likedPosts = await getUserLikes(userId);

    res.json({ userId, likedPosts });
  } catch (error) {
    logger.critical('Get user likes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  likePost: likePostController,
  unlikePost: unlikePostController,
  getPostLikes: getPostLikesController,
  getUserLikes: getUserLikesController,
};
