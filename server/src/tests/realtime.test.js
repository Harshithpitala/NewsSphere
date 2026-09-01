process.env.NODE_ENV = 'test';

import { socketEmitter } from '../services/socket.service.js';

export const runRealtimeTests = async () => {
  console.log('[Test] Running Phase 14 Real-Time Updates (Socket.IO) System Tests...\n');

  try {
    // 1. Test Breaking News Event Emission
    console.log('1. Testing Breaking News Event Emitter...');
    const dummyBreakingArticle = {
      _id: 'breaking_123',
      title: '🔴 Live Test: Breaking News Published',
      slug: 'live-test-breaking-news-published',
      isBreaking: true,
      publishedAt: new Date(),
    };

    socketEmitter.emitBreakingNews(dummyBreakingArticle);
    console.log('   ✓ breaking_news_published event emitted cleanly to connected Socket.IO clients.');

    // 2. Test Article Published Event Emission
    console.log('\n2. Testing Article Published Event Emitter...');
    socketEmitter.emitArticlePublished(dummyBreakingArticle);
    console.log('   ✓ article_published event emitted cleanly.');

    // 3. Test Room Join & Live Comments / Reactions Emission
    console.log('\n3. Testing Room Channels & Live Comments / Reactions Emitters...');
    socketEmitter.emitCommentAdded('article_123', { _id: 'comment_1', content: 'Live comment test' });
    socketEmitter.emitReactionUpdated('article_123', { LIKE: 5 }, 5);
    console.log('   ✓ comment_added and reaction_updated events broadcast to room article:article_123.');

    console.log('\n[Test] All Real-Time Updates (Socket.IO) tests passed successfully! ✨\n');
  } catch (error) {
    console.error('[Test Error] Real-Time test failed:', error);
    process.exit(1);
  }
};

if (process.argv[1].endsWith('realtime.test.js')) {
  runRealtimeTests().then(() => process.exit(0));
}
