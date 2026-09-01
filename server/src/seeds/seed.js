import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { ROLES, ARTICLE_STATUS } from '../constants/enums.js';
import {
  User,
  Category,
  Tag,
  Article,
  Comment,
  NewsletterSubscriber,
} from '../models/index.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed] Connected. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Tag.deleteMany({}),
      Article.deleteMany({}),
      Comment.deleteMany({}),
      NewsletterSubscriber.deleteMany({}),
    ]);

    console.log('[Seed] Creating Categories...');
    const categories = await Category.insertMany([
      { name: 'Technology', slug: 'technology', description: 'Tech news, AI, startups & gadgets', icon: 'cpu', order: 1 },
      { name: 'India', slug: 'india', description: 'National news, politics & developments', icon: 'flag', order: 2 },
      { name: 'World', slug: 'world', description: 'Global affairs & international news', icon: 'globe', order: 3 },
      { name: 'Business', slug: 'business', description: 'Markets, economy & finance', icon: 'trending-up', order: 4 },
      { name: 'Science', slug: 'science', description: 'Space exploration, research & discovery', icon: 'flask', order: 5 },
    ]);

    console.log('[Seed] Creating Tags...');
    const tags = await Tag.insertMany([
      { name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
      { name: 'Startups', slug: 'startups' },
      { name: 'Economy', slug: 'economy' },
      { name: 'Space', slug: 'space' },
    ]);

    console.log('[Seed] Creating Development Users (Development Passwords Hashed)...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@newssphere.com',
      password: 'DevPassword123!',
      role: ROLES.ADMIN,
      bio: 'Lead System Administrator at NewsSphere',
    });

    const editor = await User.create({
      name: 'Chief Editor',
      email: 'editor@newssphere.com',
      password: 'DevPassword123!',
      role: ROLES.EDITOR,
      bio: 'Senior Editorial Director',
    });

    const journalist = await User.create({
      name: 'Priya Sharma',
      email: 'priya@newssphere.com',
      password: 'DevPassword123!',
      role: ROLES.JOURNALIST,
      bio: 'Tech & Innovation Senior Correspondent',
    });

    const user = await User.create({
      name: 'Harshith Reader',
      email: 'user@newssphere.com',
      password: 'DevPassword123!',
      role: ROLES.USER,
      interests: [categories[0]._id, categories[3]._id],
      bio: 'Avid tech and business reader',
    });

    console.log('[Seed] Creating Sample Published Articles...');
    const techCategory = categories.find((c) => c.slug === 'technology');
    const aiTag = tags.find((t) => t.slug === 'artificial-intelligence');

    const article1 = await Article.create({
      title: 'The Rise of Autonomous AI Agents in Modern Enterprise Workflows',
      subtitle: 'How next-generation LLM orchestration is transforming software development and operations.',
      slug: 'rise-of-autonomous-ai-agents-modern-enterprise',
      content: '<p>Autonomous AI agents are shifting from speculative research projects to enterprise production systems. By integrating reasoning loops, tool-calling, and dynamic context windows, modern software architectures are experiencing a paradigm shift.</p><p>As organizations deploy multi-agent systems, security, observability, and deterministic governance remain critical pillars for sustained reliability.</p>',
      summary: 'An in-depth analysis of how autonomous AI agents are reshaping software engineering, enterprise automation, and workflow orchestration.',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      author: journalist._id,
      editor: editor._id,
      category: techCategory._id,
      tags: [aiTag._id],
      status: ARTICLE_STATUS.PUBLISHED,
      isFeatured: true,
      isBreaking: true,
      publishedAt: new Date(),
      viewsCount: 1420,
      likesCount: 88,
      bookmarksCount: 34,
      commentsCount: 2,
      readingTimeMinutes: 4,
      trendingScore: 95.5,
      aiMetadata: {
        aiSummary: 'Autonomous AI agents integrate tool-calling and reasoning to automate enterprise workflows, requiring robust security and governance.',
        aiExplainSimply: 'Think of AI agents as smart digital assistants that can run commands, write code, and fix errors automatically.',
        aiKeyPoints: [
          'Multi-agent systems perform complex multi-step reasoning',
          'Enterprise adoption requires security, monitoring, and human oversight',
          'Developer productivity increases substantially with pair-agent setups',
        ],
      },
    });

    console.log('[Seed] Creating Sample Comments...');
    await Comment.create([
      {
        article: article1._id,
        user: user._id,
        content: 'Fascinating read! The tool-calling safety mechanisms mentioned in the article are crucial for production deployment.',
      },
      {
        article: article1._id,
        user: editor._id,
        content: 'Great overview Priya. Looking forward to your follow-up piece on vector indexing safety.',
      },
    ]);

    console.log('[Seed] Database seed completed successfully!');
    console.log('--------------------------------------------------');
    console.log('DEV CREDENTIALS (DEVELOPMENT ONLY):');
    console.log('ADMIN:      admin@newssphere.com     / DevPassword123!');
    console.log('EDITOR:     editor@newssphere.com    / DevPassword123!');
    console.log('JOURNALIST: priya@newssphere.com     / DevPassword123!');
    console.log('USER:       user@newssphere.com      / DevPassword123!');
    console.log('--------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
