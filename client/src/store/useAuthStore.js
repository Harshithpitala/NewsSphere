import { create } from 'zustand';
import { authService } from '../services/auth.service';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.getMe();
      if (response.success && response.user) {
        set({ user: response.user, isAuthenticated: true, isLoading: false });
      } else {
        localStorage.removeItem('newssphere_token');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      localStorage.removeItem('newssphere_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      if (response.success && response.user) {
        if (response.token) {
          localStorage.setItem('newssphere_token', response.token);
        }
        set({ user: response.user, isAuthenticated: true, isLoading: false });
        return { success: true, message: response.message, user: response.user };
      }
    } catch (err) {
      const errMsg = err.message || 'Login failed';
      set({ isLoading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      if (response.success && response.user) {
        if (response.token) {
          localStorage.setItem('newssphere_token', response.token);
        }
        set({ user: response.user, isAuthenticated: true, isLoading: false });
        return { success: true, message: response.message };
      }
    } catch (err) {
      const errMsg = err.message || 'Registration failed';
      set({ isLoading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('newssphere_token');
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success && response.user) {
        set((state) => ({
          user: { ...state.user, ...response.user },
          isLoading: false,
        }));
        return { success: true, message: response.message };
      }
    } catch (err) {
      const errMsg = err.message || 'Profile update failed';
      set({ isLoading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  changePassword: async (passData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.changePassword(passData);
      return { success: true, message: response.message };
    } catch (err) {
      const errMsg = err.message || 'Password change failed';
      set({ isLoading: false, error: errMsg });
      return { success: false, message: errMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  forgotPassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.forgotPassword(data);
      return { success: true, message: response.message, devOTP: response.devOTP, devResetToken: response.devResetToken };
    } catch (err) {
      const errMsg = err.message || 'Request failed';
      set({ isLoading: false, error: errMsg });
      return { success: false, message: errMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOTP: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.verifyOTP(data);
      return { success: true, message: response.message, token: response.token };
    } catch (err) {
      const errMsg = err.message || 'OTP verification failed';
      set({ isLoading: false, error: errMsg });
      return { success: false, message: errMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.resetPassword(data);
      if (response.success && response.user) {
        set({ user: response.user, isAuthenticated: true, isLoading: false });
      }
      return { success: true, message: response.message };
    } catch (err) {
      const errMsg = err.message || 'Reset failed';
      set({ isLoading: false, error: errMsg });
      return { success: false, message: errMsg };
    } finally {
      set({ isLoading: false });
    }
  },
}));
