import { User } from '../models/User.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get user profile
// @route   GET /api/v1/users/me
// @access  Private
export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('interests', 'name slug icon');
  if (!user) {
    return next(new APIError(404, 'User not found'));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/users/me
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, bio, avatar, interests } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new APIError(404, 'User not found'));
  }

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (interests !== undefined) user.interests = interests;

  // Explicitly prevent role mutation via profile update endpoint
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      interests: user.interests,
    },
  });
});
