const cron = require('node-cron');
const { getDueScheduledPosts, markScheduledPostPublished } = require('../models/scheduledPost');
const { createPost } = require('../models/post');
const logger = require('./logger');

// Run every minute
cron.schedule('* * * * *', async () => {
  try {
    const duePosts = await getDueScheduledPosts();
    for (const scheduled of duePosts) {
      // Publish to main posts table
      await createPost({
        user_id: scheduled.user_id,
        content: scheduled.content,
        media_url: scheduled.media_url,
        comments_enabled: true,
      });
      // Mark as published in scheduled_posts
      await markScheduledPostPublished(scheduled.id);
      logger.verbose(`Published scheduled post ID ${scheduled.id} for user ${scheduled.user_id}`);
    }
  } catch (err) {
    logger.critical('Scheduled post publishing error:', err);
  }
});

module.exports = {};
