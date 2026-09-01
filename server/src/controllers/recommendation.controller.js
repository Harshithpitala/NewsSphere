import { recommendationService } from '../services/recommendation.service.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { APIError } from '../utils/APIError.js';
import { analyticsService } from '../services/analytics.service.js';

// @desc    Get personalized article recommendations (Security: User strictly derived from req.user)
// @route   GET /api/v1/recommendations
// @access  Public / Optional Auth
export const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;
  const result = await recommendationService.getPersonalizedRecommendations(userId, req.query);

  if (userId) {
    analyticsService.logEvent({
      event: 'CATEGORY_INTERACTION',
      userId,
      metadata: { action: 'RECOMMENDATIONS_VIEWED' },
    });
  }

  res.status(200).json({
    success: true,
    ...result,
  });
});

// @desc    Get user personalization preferences & available categories
// @route   GET /api/v1/recommendations/preferences
// @access  Private
export const getUserPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('interests', 'name slug icon description').lean();
  const availableCategories = await Category.find().select('name slug icon description').lean();

  res.status(200).json({
    success: true,
    data: {
      interests: user.interests || [],
      personalizedFeedEnabled: user.preferences?.personalizedFeedEnabled ?? true,
      availableCategories,
    },
  });
});

// @desc    Update user interests & personalization toggle
// @route   PUT /api/v1/recommendations/preferences
// @access  Private
export const updateUserPreferences = asyncHandler(async (req, res) => {
  const { interestIds, personalizedFeedEnabled } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new APIError(404, 'User not found');

  if (Array.isArray(interestIds)) {
    user.interests = interestIds;
  }

  if (typeof personalizedFeedEnabled === 'boolean') {
    user.preferences = {
      ...user.preferences,
      personalizedFeedEnabled,
    };
  }

  await user.save();
  await user.populate('interests', 'name slug icon');

  res.status(200).json({
    success: true,
    message: 'Personalization preferences updated successfully',
    data: {
      interests: user.interests,
      personalizedFeedEnabled: user.preferences.personalizedFeedEnabled,
    },
  });
});

// @desc    Dismiss article from recommendations ("Not interested")
// @route   POST /api/v1/recommendations/dismiss/:articleId
// @access  Private
export const dismissRecommendation = asyncHandler(async (req, res) => {
  const { articleId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) throw new APIError(404, 'User not found');

  if (!user.preferences) {
    user.preferences = { personalizedFeedEnabled: true, dismissedArticles: [] };
  }

  if (!user.preferences.dismissedArticles.includes(articleId)) {
    user.preferences.dismissedArticles.push(articleId);
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: 'Article dismissed from recommendations',
  });
});
