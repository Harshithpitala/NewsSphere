import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import { categoryService } from './services/category.service';

// Header & Footer Layout Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import BreakingNewsBanner from './components/common/BreakingNewsBanner';

// Common Components & Protected Routes
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleProtectedRoute } from './components/common/RoleProtectedRoute';

// Public News Pages
import HomePage from './pages/HomePage';
import LatestNewsPage from './pages/LatestNewsPage';
import CategoryNewsPage from './pages/CategoryNewsPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import AuthorPage from './pages/AuthorPage';
import ExternalNewsPage from './pages/ExternalNewsPage';
import SearchPage from './pages/SearchPage';
import TrendingPage from './pages/TrendingPage';
import NotFoundPage from './pages/NotFoundPage';

// Phase 13 Personalization Pages
import ForYouPage from './pages/ForYouPage';
import DiscoverPage from './pages/DiscoverPage';
import InterestOnboardingPage from './pages/InterestOnboardingPage';
import InterestsSettingsPage from './pages/InterestsSettingsPage';

// Auth & User Engagement Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import BookmarksPage from './pages/BookmarksPage';
import ReadingHistoryPage from './pages/ReadingHistoryPage';
import LikedArticlesPage from './pages/LikedArticlesPage';
import MyCommentsPage from './pages/MyCommentsPage';

// Phase 9 CMS Newsroom Pages
import JournalistDashboardPage from './pages/journalist/JournalistDashboardPage';
import JournalistArticlesPage from './pages/journalist/JournalistArticlesPage';
import JournalistArticleEditorPage from './pages/journalist/JournalistArticleEditorPage';
import EditorDashboardPage from './pages/editor/EditorDashboardPage';
import EditorSubmissionsQueuePage from './pages/editor/EditorSubmissionsQueuePage';
import EditorArticleReviewPage from './pages/editor/EditorArticleReviewPage';

// Phase 10 Admin Dashboard & Moderation Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminArticlesPage from './pages/admin/AdminArticlesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminTagsPage from './pages/admin/AdminTagsPage';
import AdminCommentsPage from './pages/admin/AdminCommentsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Phase 11 Analytics & Insights Page
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

// Phase 15 Media Library Page
import AdminMediaLibraryPage from './pages/admin/AdminMediaLibraryPage';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch categories for Footer links
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  const categories = categoriesData?.data || [];

  return (
    <div className="min-h-screen flex flex-col bg-editorial-bg dark:bg-darkEditorial-bg text-editorial-text dark:text-darkEditorial-text transition-colors duration-200">
      {/* Real-time Breaking News Banner */}
      <BreakingNewsBanner />

      {/* Editorial Header Navigation */}
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Route Definitions */}
      <Routes>
        {/* Core Public News Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/latest" element={<LatestNewsPage />} />
        <Route path="/category/:slug" element={<CategoryNewsPage />} />
        <Route path="/article/:slug" element={<ArticleDetailPage />} />
        <Route path="/author/:id" element={<AuthorPage />} />
        <Route path="/external-news" element={<ExternalNewsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/trending" element={<TrendingPage />} />

        {/* Phase 13 Personalization Routes */}
        <Route path="/for-you" element={<ForYouPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route
          path="/onboarding/interests"
          element={
            <ProtectedRoute>
              <InterestOnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/interests"
          element={
            <ProtectedRoute>
              <InterestsSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Authenticated User Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reading-history"
          element={
            <ProtectedRoute>
              <ReadingHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/liked-articles"
          element={
            <ProtectedRoute>
              <LikedArticlesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-comments"
          element={
            <ProtectedRoute>
              <MyCommentsPage />
            </ProtectedRoute>
          }
        />

        {/* Phase 9 Journalist CMS Routes */}
        <Route
          path="/journalist"
          element={
            <RoleProtectedRoute allowedRoles={['JOURNALIST', 'EDITOR', 'ADMIN']}>
              <JournalistDashboardPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/journalist/articles"
          element={
            <RoleProtectedRoute allowedRoles={['JOURNALIST', 'EDITOR', 'ADMIN']}>
              <JournalistArticlesPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/journalist/articles/new"
          element={
            <RoleProtectedRoute allowedRoles={['JOURNALIST', 'EDITOR', 'ADMIN']}>
              <JournalistArticleEditorPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/journalist/articles/edit/:id"
          element={
            <RoleProtectedRoute allowedRoles={['JOURNALIST', 'EDITOR', 'ADMIN']}>
              <JournalistArticleEditorPage />
            </RoleProtectedRoute>
          }
        />

        {/* Phase 9 Editor CMS Routes */}
        <Route
          path="/editor"
          element={
            <RoleProtectedRoute allowedRoles={['EDITOR', 'ADMIN']}>
              <EditorDashboardPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/editor/submissions"
          element={
            <RoleProtectedRoute allowedRoles={['EDITOR', 'ADMIN']}>
              <EditorSubmissionsQueuePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/editor/submissions/:id"
          element={
            <RoleProtectedRoute allowedRoles={['EDITOR', 'ADMIN']}>
              <EditorArticleReviewPage />
            </RoleProtectedRoute>
          }
        />

        {/* Phase 10 Admin Dashboard & Moderation Suite */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="media" element={<AdminMediaLibraryPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:id" element={<AdminUserDetailPage />} />
          <Route path="articles" element={<AdminArticlesPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="tags" element={<AdminTagsPage />} />
          <Route path="comments" element={<AdminCommentsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Editorial Footer */}
      <Footer categories={categories} />
    </div>
  );
}
