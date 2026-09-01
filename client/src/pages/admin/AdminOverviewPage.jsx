import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import ErrorState from '../../components/common/ErrorState';
import { Users, FileText, MessageSquare, Flag, FolderTree, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminOverviewPage() {
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminService.getDashboard(),
  });

  const stats = dashboardData?.data || {
    users: { total: 0, active: 0, suspended: 0, roles: {} },
    articles: { total: 0, published: 0, draft: 0, underReview: 0 },
    comments: { total: 0 },
    reports: { total: 0, pending: 0 },
    system: { categories: 0, tags: 0 },
  };

  if (isLoading) return <ArticleSkeleton count={4} />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">System Dashboard</span>
        <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
          <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" /> Platform Overview
        </h1>
        <p className="text-xs text-editorial-muted mt-1">Real-time administrative metrics, user accounts, and moderation queues</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-editorial-muted">Total Users</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono">{stats.users.total}</p>
          <div className="flex items-center space-x-3 text-xs text-editorial-muted font-mono pt-2 border-t border-editorial-border">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.users.active} Active</span>
            <span>•</span>
            <span className="text-rose-500 font-bold">{stats.users.suspended} Suspended</span>
          </div>
        </div>

        {/* Total Articles */}
        <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-editorial-muted">Total Articles</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono">{stats.articles.total}</p>
          <div className="flex items-center space-x-3 text-xs text-editorial-muted font-mono pt-2 border-t border-editorial-border">
            <span className="text-purple-600 dark:text-purple-400 font-bold">{stats.articles.published} Live</span>
            <span>•</span>
            <span className="text-amber-500 font-bold">{stats.articles.underReview} In Review</span>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-editorial-muted">Pending Reports</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
              <Flag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono">{stats.reports.pending}</p>
          <div className="flex items-center space-x-3 text-xs text-editorial-muted font-mono pt-2 border-t border-editorial-border">
            <span>{stats.reports.total} Total Reports</span>
          </div>
        </div>

        {/* Total Comments */}
        <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-editorial-muted">Total Comments</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono">{stats.comments.total}</p>
          <div className="flex items-center space-x-3 text-xs text-editorial-muted font-mono pt-2 border-t border-editorial-border">
            <span>Community Threads</span>
          </div>
        </div>
      </div>

      {/* User Role Distribution Summary */}
      <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-2xl space-y-4 shadow-xs">
        <h3 className="text-base font-bold font-serif">Account Roles Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl border border-editorial-border">
            <span className="text-editorial-muted font-bold block mb-1">Admins</span>
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.users.roles?.admin || 0}</span>
          </div>

          <div className="p-4 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl border border-editorial-border">
            <span className="text-editorial-muted font-bold block mb-1">Editors</span>
            <span className="text-xl font-bold text-amber-500">{stats.users.roles?.editor || 0}</span>
          </div>

          <div className="p-4 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl border border-editorial-border">
            <span className="text-editorial-muted font-bold block mb-1">Journalists</span>
            <span className="text-xl font-bold text-editorial-accent">{stats.users.roles?.journalist || 0}</span>
          </div>

          <div className="p-4 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl border border-editorial-border">
            <span className="text-editorial-muted font-bold block mb-1">Readers (Users)</span>
            <span className="text-xl font-bold">{stats.users.roles?.user || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
