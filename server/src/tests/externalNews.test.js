import { fetchExternalLatestNews } from '../services/news/externalNews.service.js';
import { memoryCache } from '../utils/cache.js';

export const runExternalNewsTests = async () => {
  console.log('[Test] Running External News API Integration & Normalization Tests...\n');

  try {
    // 1. Test Fetching Normalized External News (Fallback / Provider Mode)
    console.log('1. Testing External News Normalization & Schema Validation...');
    const result = await fetchExternalLatestNews({ page: 1, limit: 5 });

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('External news result structure invalid');
    }

    const first = result.data[0];
    if (!first.title || !first.url || !first.sourceName || first.isExternal !== true) {
      throw new Error('Normalized external news article missing mandatory fields');
    }

    console.log(`   ✓ Successfully fetched ${result.data.length} normalized external stories from ${result.provider}.`);
    console.log(`   ✓ Verified external item: "${first.title.substring(0, 50)}..." [Source: ${first.sourceName}]`);

    // 2. Test In-Memory TTL Cache
    console.log('2. Testing In-Memory TTL Caching Mechanism...');
    memoryCache.set('test_key', { cached: true }, 60); // 60 sec TTL
    const cachedItem = memoryCache.get('test_key');
    if (!cachedItem || !cachedItem.cached) {
      throw new Error('In-memory TTL cache get failed');
    }
    console.log('   ✓ In-memory TTL cache verified.');

    console.log('\n[Test] All External News API Integration tests passed successfully! ✨\n');
  } catch (error) {
    console.error('[Test Error] External news test failed:', error);
    process.exit(1);
  }
};

if (process.argv[1].endsWith('externalNews.test.js')) {
  runExternalNewsTests();
}
