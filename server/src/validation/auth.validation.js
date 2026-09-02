import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: z.string().email('Please provide a valid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'New password must contain at least one letter and one number'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address').toLowerCase().trim(),
});

export const verifyOTPSchema = z.object({
  email: z.string().email('Please provide a valid email address').toLowerCase().trim(),
  otp: z.string().length(6, 'OTP must be a 6-digit code'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'New password must contain at least one letter and one number'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim().optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  avatar: z.string().optional(),
  interests: z.array(z.string()).optional(),
});
