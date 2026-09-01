import { Article } from '../models/Article.js';
import { AuditLog } from '../models/AuditLog.js';
import { ARTICLE_STATUS } from '../constants/enums.js';
import { socketEmitter } from './socket.service.js';

/**
 * Scheduled Publishing Background Worker
 * Periodically checks for approved articles whose scheduled publish timestamp has arrived.
 */
export const startScheduledPublisher = () => {
  console.log('⏰ Scheduled Publishing Worker initialized (polling interval: 60s)');

  const checkScheduledArticles = async () => {
    try {
      const now = new Date();
      const scheduledArticles = await Article.find({
        status: ARTICLE_STATUS.APPROVED,
        scheduledPublishAt: { $lte: now },
      });

      if (scheduledArticles.length > 0) {
        console.log(`[Scheduled Publisher] Found ${scheduledArticles.length} scheduled article(s) ready to publish.`);

        for (const article of scheduledArticles) {
          article.status = ARTICLE_STATUS.PUBLISHED;
          article.publishedAt = now;
          await article.save();

          // Broadcast real-time Socket.IO events
          socketEmitter.emitArticlePublished(article);
          if (article.isBreaking) {
            socketEmitter.emitBreakingNews(article);
          }

          await AuditLog.create({
            actor: article.editor || article.author,
            action: 'ARTICLE_PUBLISH',
            targetEntity: 'Article',
            targetId: article._id,
            metadata: { title: article.title, publishType: 'SCHEDULED' },
          });

          console.log(`  ✓ Published scheduled article: "${article.title}" (${article._id})`);
        }
      }
    } catch (error) {
      console.error('[Scheduled Publisher Error]:', error.message);
    }
  };

  // Run initial check and set interval
  checkScheduledArticles();
  setInterval(checkScheduledArticles, 60000);
};
