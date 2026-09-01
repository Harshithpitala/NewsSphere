import { io } from '../server.js';

export const socketEmitter = {
  /**
   * Emit Breaking News Published event to all connected clients
   */
  emitBreakingNews: (article) => {
    if (!io) return;
    io.emit('breaking_news_published', {
      _id: article._id,
      title: article.title,
      slug: article.slug,
      summary: article.summary || article.title,
      category: article.category,
      publishedAt: article.publishedAt || new Date(),
    });
  },

  /**
   * Emit Article Published event
   */
  emitArticlePublished: (article) => {
    if (!io) return;
    io.emit('article_published', {
      _id: article._id,
      title: article.title,
      slug: article.slug,
      category: article.category,
      publishedAt: article.publishedAt || new Date(),
    });
  },

  /**
   * Emit New Comment event to article room & clients
   */
  emitCommentAdded: (articleId, comment) => {
    if (!io) return;
    const roomName = `article:${articleId}`;
    io.to(roomName).emit('comment_added', { articleId, comment });
    io.emit('comment_added', { articleId, comment });
  },

  /**
   * Emit Reaction Updated event to article room
   */
  emitReactionUpdated: (articleId, countsByType, totalReactions) => {
    if (!io) return;
    const roomName = `article:${articleId}`;
    io.to(roomName).emit('reaction_updated', {
      articleId,
      countsByType,
      totalReactions,
    });
  },
};
