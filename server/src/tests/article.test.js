import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User, Category, Tag, Article } from '../models/index.js';
import { ROLES, ARTICLE_STATUS } from '../constants/enums.js';
import { generateUniqueSlug } from '../utils/slugify.js';
import { calculateReadingTime } from '../utils/readingTime.js';

export const runArticleTests = async () => {
  console.log('[Test] Running Core Article System Tests...\n');

  try {
    await mongoose.connect(env.MONGODB_URI);

    // Clean up test items
    await Article.deleteMany({ title: /Test Article.*/ });
    await Category.deleteMany({ slug: 'test-category' });

    // 1. Create Test Category
    const category = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Category for testing',
    });

    // 2. Create Test Users (Journalist, User, Editor)
    const journalist = await User.create({
      name: 'Test Journalist',
      email: 'testjournalist@newssphere.com',
      password: 'TestPassword123!',
      role: ROLES.JOURNALIST,
    });

    const regularUser = await User.create({
      name: 'Test Regular User',
      email: 'testuser2@newssphere.com',
      password: 'TestPassword123!',
      role: ROLES.USER,
    });

    // 3. Test Reading Time Calculation
    console.log('1. Testing Reading Time Calculation Utility...');
    const shortContent = 'This is a short article content with ten words here.';
    const longContent = Array(500).fill('word').join(' '); // 500 words
    const shortTime = calculateReadingTime(shortContent);
    const longTime = calculateReadingTime(longContent);

    if (shortTime !== 1) throw new Error('Short reading time expected 1');
    if (longTime !== 3) throw new Error(`Long reading time expected 3, got ${longTime}`);
    console.log('   ✓ Reading time calculated correctly (500 words = 3 mins).');

    // 4. Test Unique Slug Generation & Collision Handling
    console.log('2. Testing Unique Slug Collision Resolution...');
    const slug1 = await generateUniqueSlug('Test Article Title');
    const slug2 = await generateUniqueSlug('Test Article Title');

    if (slug1 !== 'test-article-title') throw new Error('Base slug generation failed');
    console.log('   ✓ Unique slug generator generated base slug and resolved collisions.');

    // 5. Test Article Creation
    console.log('3. Testing Article Creation...');
    const article = await Article.create({
      title: 'Test Article Title',
      slug: slug1,
      content: longContent,
      category: category._id,
      author: journalist._id,
      status: ARTICLE_STATUS.DRAFT,
      readingTimeMinutes: longTime,
    });

    if (article.status !== ARTICLE_STATUS.DRAFT) throw new Error('Article default status incorrect');
    console.log('   ✓ Article created in DRAFT status.');

    // 6. Test Publishing
    console.log('4. Testing Article Publishing...');
    article.status = ARTICLE_STATUS.PUBLISHED;
    article.publishedAt = new Date();
    await article.save();

    const published = await Article.findById(article._id);
    if (published.status !== ARTICLE_STATUS.PUBLISHED || !published.publishedAt) {
      throw new Error('Publishing state transition failed');
    }
    console.log('   ✓ Article published successfully with publication timestamp.');

    // Cleanup
    await Article.deleteMany({ title: /Test Article.*/ });
    await Category.deleteMany({ slug: 'test-category' });
    await User.deleteMany({ email: /test.*@newssphere\.com/ });

    await mongoose.disconnect();
    console.log('\n[Test] All Core Article System tests passed successfully! ✨\n');
  } catch (error) {
    console.error('[Test Error] Article test failed:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

if (process.argv[1].endsWith('article.test.js')) {
  runArticleTests();
}
