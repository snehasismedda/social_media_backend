const {
  createScheduledPost,
  getScheduledPostsByUser,
  publishScheduledPostById,
  moveScheduledToPosts,
} = require('../models/scheduledPost');
const { createPost } = require('../models/post');

/**
 * Schedule a new post
 */
const schedulePost = async (req, res) => {
  try {
    const { content, media_url, scheduled_time } = req.body;
    const user_id = req.user.id;

    if (!content || !scheduled_time) {
      return res.status(400).json({ error: "Content and scheduled_time are required" });
    }

    const scheduled = await createScheduledPost({
      user_id,
      content,
      media_url,
      scheduled_time,
    });

    res.status(201).json({ message: "Post scheduled", post: scheduled });
  } catch (error) {
    console.error("Schedule post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all scheduled posts for the current user
 */
const getScheduledPosts = async (req, res) => {
  try {
    const user_id = req.user.id;
    const posts = await getScheduledPostsByUser(user_id);
    res.json({ posts });
  } catch (error) {
    console.error("Get scheduled posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Manually publish a scheduled post (moves it to the main posts table)
 */
const publishScheduledPost = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    // Fetch the scheduled post and check ownership
    const scheduled = await publishScheduledPostById(id, user_id);
    if (!scheduled) {
      return res.status(404).json({ error: "Scheduled post not found or not yours" });
    }

    // Move to main posts table
    const published = await createPost({
      user_id: scheduled.user_id,
      content: scheduled.content,
      media_url: scheduled.media_url,
      comments_enabled: true,
    });

    res.json({ message: "Post published", post: published });
  } catch (error) {
    console.error("Publish scheduled post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  schedulePost,
  getScheduledPosts,
  publishScheduledPost,
};
