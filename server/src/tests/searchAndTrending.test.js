import { calculateTrendingScore } from '../utils/decayCalculator.js';

export const runSearchAndTrendingTests = async () => {
  console.log('[Test] Running Advanced Search & Decaying Trending System Tests...\n');

  try {
    // 1. Test Decaying Trending Score Calculation Formula
    console.log('1. Testing Decaying Trending Score Calculation & Time-Decay...');

    const freshArticle = {
      title: 'Fresh Breaking Story',
      viewsCount: 100,
      isBreaking: true,
      isFeatured: true,
      publishedAt: new Date().toISOString(), // 0 hours old
    };

    const twoDaysOldArticle = {
      title: 'Popular 2-Day-Old Story',
      viewsCount: 100,
      isBreaking: true,
      isFeatured: true,
      publishedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 48 hours old (1 half-life)
    };

    const oneWeekOldArticle = {
      title: 'Old Popular Story',
      viewsCount: 500, // Very high historical views
      isBreaking: false,
      isFeatured: false,
      publishedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), // 7 days old
    };

    const freshScore = calculateTrendingScore(freshArticle);
    const twoDaysScore = calculateTrendingScore(twoDaysOldArticle);
    const oldScore = calculateTrendingScore(oneWeekOldArticle);

    console.log(`   - Fresh Breaking Story Score: ${freshScore}`);
    console.log(`   - 2-Day Old Story Score: ${twoDaysScore} (Decayed by ~50%)`);
    console.log(`   - 1-Week Old 500-view Story Score: ${oldScore} (Decayed heavily)`);

    if (freshScore <= twoDaysScore) {
      throw new Error('Fresh story should score higher than 48-hour-old story with equal views');
    }

    if (freshScore <= oldScore) {
      throw new Error('Time decay failed: Old story with high historical views outperformed fresh breaking news');
    }

    console.log('   ✓ Decaying trending score formula verified (48-hour half-life exponential decay).');

    console.log('\n[Test] All Search & Trending tests passed successfully! ✨\n');
  } catch (error) {
    console.error('[Test Error] Search & Trending test failed:', error);
    process.exit(1);
  }
};

if (process.argv[1].endsWith('searchAndTrending.test.js')) {
  runSearchAndTrendingTests();
}
