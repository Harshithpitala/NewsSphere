import { Article } from '../models/Article.js';
import { User } from '../models/User.js';
import { Bookmark } from '../models/Bookmark.js';
import { Reaction } from '../models/Reaction.js';
import { ReadingHistory } from '../models/ReadingHistory.js';
import { Comment } from '../models/Comment.js';
import { AnalyticsLog } from '../models/AnalyticsLog.js';
import { calculateTrendingScore } from '../utils/decayCalculator.js';
import { ARTICLE_STATUS } from '../constants/enums.js';

export const recommendationService = {
  /**
   * Calculate User Interest Profile (Affinity Scores) from Real Signals
   */
  getUserInterestProfile: async (userId) => {
    if (!userId) {
      return { categoryScores: {}, topTagIds: [], explicitInterests: [] };
    }

    const user = await User.findById(userId).select('interests preferences').lean();
    const explicitInterests = user?.interests ? user.interests.map((i) => i.toString()) : [];

    // Fetch user activity across engagement models concurrently
    const [bookmarks, reactions, history, comments, searches] = await Promise.all([
      Bookmark.find({ user: userId }).populate('article', 'category tags').lean(),
      Reaction.find({ user: userId }).populate('article', 'category tags').lean(),
      ReadingHistory.find({ user: userId }).populate('article', 'category tags').lean(),
      Comment.find({ user: userId }).populate('article', 'category tags').lean(),
      AnalyticsLog.find({ user: userId, event: 'SEARCH' }).select('searchQuery').lean(),
    ]);

    const categoryWeights = {};
    const tagWeights = {};

    const addSignal = (catId, tagIds, weight) => {
      if (catId) {
        const cStr = catId.toString();
        categoryWeights[cStr] = (categoryWeights[cStr] || 0) + weight;
      }
      if (Array.isArray(tagIds)) {
        tagIds.forEach((tId) => {
          const tStr = (tId._id || tId).toString();
          tagWeights[tStr] = (tagWeights[tStr] || 0) + weight;
        });
      }
    };

    // 1. Explicit Onboarding Interests (Weight: 6.0)
    explicitInterests.forEach((catId) => {
      categoryWeights[catId] = (categoryWeights[catId] || 0) + 6.0;
    });

    // 2. Bookmarks (Weight: 5.0)
    bookmarks.forEach((b) => {
      if (b.article) addSignal(b.article.category, b.article.tags, 5.0);
    });

    // 3. Reactions (Weight: 4.0)
    reactions.forEach((r) => {
      if (r.article) addSignal(r.article.category, r.article.tags, 4.0);
    });

    // 4. Reading History (Weight: 3.5 for completed, 2.0 for partial)
    history.forEach((h) => {
      if (h.article) {
        const w = h.progressPercent >= 80 ? 3.5 : 2.0;
        addSignal(h.article.category, h.article.tags, w);
      }
    });

    // 5. Comments (Weight: 3.0)
    comments.forEach((c) => {
      if (c.article) addSignal(c.article.category, c.article.tags, 3.0);
    });

    // Normalize category scores (scale 0.0 to 1.0)
    const maxCatWeight = Math.max(...Object.values(categoryWeights), 1);
    const categoryScores = {};
    Object.keys(categoryWeights).forEach((catId) => {
      categoryScores[catId] = Number((categoryWeights[catId] / maxCatWeight).toFixed(3));
    });

    // Top Tag IDs sorted by weight
    const topTagIds = Object.keys(tagWeights)
      .sort((a, b) => tagWeights[b] - tagWeights[a])
      .slice(0, 10);

    return {
      categoryScores,
      topTagIds,
      explicitInterests,
      hasActivity: Object.keys(categoryWeights).length > 0,
    };
  },

  /**
   * Generate Personalized Recommendations with Diversity & Cold-Start Fallbacks
   */
  getPersonalizedRecommendations: async (userId = null, options = {}) => {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(options.limit, 10) || 10));
    const skip = (page - 1) * limit;

    let userPreferences = { personalizedFeedEnabled: true, dismissedArticles: [] };
    let profile = { categoryScores: {}, topTagIds: [], hasActivity: false };

    if (userId) {
      const user = await User.findById(userId).select('preferences').lean();
      if (user?.preferences) {
        userPreferences = { ...userPreferences, ...user.preferences };
      }
      profile = await recommendationService.getUserInterestProfile(userId);
    }

    // If personalization disabled or Cold-Start user without activity: return Trending/Featured Discovery
    if (!userPreferences.personalizedFeedEnabled || !profile.hasActivity) {
      return recommendationService.getDiscoveryFallback(page, limit, !userPreferences.personalizedFeedEnabled);
    }

    // Collect consumed article IDs to apply exclusion penalty
    const [history, bookmarks] = await Promise.all([
      ReadingHistory.find({ user: userId }).select('article').lean(),
      Bookmark.find({ user: userId }).select('article').lean(),
    ]);

    const consumedArticleIds = new Set([
      ...history.map((h) => h.article?.toString()),
      ...bookmarks.map((b) => b.article?.toString()),
      ...userPreferences.dismissedArticles.map((d) => d.toString()),
    ].filter(Boolean));

    // Candidate Generation: Fetch recent candidate articles
    const topCategoryIds = Object.keys(profile.categoryScores);
    const candidateQuery = {
      status: ARTICLE_STATUS.PUBLISHED,
    };

    if (options.category) {
      candidateQuery.category = options.category;
    }

    const candidates = await Article.find(candidateQuery)
      .populate('author', 'name avatar bio role')
      .populate('category', 'name slug icon')
      .populate('tags', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(80)
      .lean();

    const now = new Date().getTime();

    // Candidate Scoring Engine
    const scoredCandidates = candidates.map((art) => {
      const catIdStr = art.category?._id?.toString() || art.category?.toString();
      const catAffinity = profile.categoryScores[catIdStr] || 0;

      // Tag Affinity
      let tagMatchCount = 0;
      if (Array.isArray(art.tags)) {
        art.tags.forEach((t) => {
          const tId = (t._id || t).toString();
          if (profile.topTagIds.includes(tId)) tagMatchCount += 1;
        });
      }
      const tagAffinity = Math.min(1.0, tagMatchCount * 0.4);

      // Recency Score (Decay over 72 hours)
      const ageInHours = Math.max(0, (now - new Date(art.publishedAt || art.createdAt).getTime()) / (1000 * 3600));
      const recencyScore = Math.exp(-ageInHours / 72) * 3.0;

      // Popularity Score (Log scale)
      const popularityScore = Math.min(2.0, Math.log10((art.viewsCount || 0) + (art.likesCount || 0) + 1));

      // Already Consumed Penalty (-10.0)
      const isConsumed = consumedArticleIds.has(art._id.toString());
      const exclusionPenalty = isConsumed ? 10.0 : 0;

      const recommendationScore = Number(
        (catAffinity * 4.0 + tagAffinity * 2.5 + recencyScore + popularityScore - exclusionPenalty).toFixed(2)
      );

      // Human-readable Explanation Reason
      let recommendationReason = 'Popular & Trending Story';
      if (catAffinity > 0.5) {
        recommendationReason = `Because you read ${art.category?.name || 'this topic'} stories`;
      } else if (tagAffinity > 0.3) {
        recommendationReason = 'Matches your topic interests';
      } else if (isConsumed) {
        recommendationReason = 'Recently viewed story';
      }

      return {
        ...art,
        recommendationScore,
        recommendationReason,
      };
    });

    // Sort by recommendationScore DESC
    scoredCandidates.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Category Diversity Guard (max 40% per category to prevent echo chamber)
    const categoryCount = {};
    const diverseArticles = [];

    scoredCandidates.forEach((art) => {
      const cId = art.category?._id?.toString() || 'other';
      categoryCount[cId] = (categoryCount[cId] || 0) + 1;

      if (categoryCount[cId] <= Math.ceil(limit * 0.4) || diverseArticles.length < limit / 2) {
        diverseArticles.push(art);
      }
    });

    // Fallback if diversity filtering trimmed too aggressively
    const finalFeed = diverseArticles.length >= limit ? diverseArticles : scoredCandidates;

    const totalItems = finalFeed.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const paginatedData = finalFeed.slice(skip, skip + limit);

    return {
      data: paginatedData,
      isPersonalized: true,
      explanation: 'Personalized recommendations based on your reading history & interactions',
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Cold-Start & Unauthenticated Discovery Fallback Strategy
   */
  getDiscoveryFallback: async (page = 1, limit = 10, isDisabled = false) => {
    const skip = (page - 1) * limit;

    const candidates = await Article.find({ status: ARTICLE_STATUS.PUBLISHED })
      .populate('author', 'name avatar bio role')
      .populate('category', 'name slug icon')
      .populate('tags', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(30)
      .lean();

    const scored = candidates.map((art) => ({
      ...art,
      trendingScore: calculateTrendingScore(art),
      recommendationReason: art.isFeatured ? 'Featured Headline' : 'Popular & Trending Story',
    }));

    scored.sort((a, b) => b.trendingScore - a.trendingScore);

    const totalItems = scored.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const paginated = scored.slice(skip, skip + limit);

    return {
      data: paginated,
      isPersonalized: false,
      explanation: isDisabled
        ? 'Personalized recommendations are turned off. Showing trending news.'
        : 'Explore popular & trending stories to personalize your feed',
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },
};
