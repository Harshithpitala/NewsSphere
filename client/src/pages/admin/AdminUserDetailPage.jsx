import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import ErrorState from '../../components/common/ErrorState';
import { ArrowLeft, User, Mail, Calendar, Shield, ShieldAlert, FileText, MessageSquare, Bookmark, History } from 'lucide-react';

export default function AdminUserDetailPage() {
  const { id } = useParams();

  const { data: userData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: () => adminService.getUserById(id),
  });

  const user = userData?.data?.user;
  const stats = userData?.data?.stats || { articlesCount: 0, commentsCount: 0, bookmarksCount: 0, historyCount: 0 };

  if (isLoading) return <ArticleSkeleton count={3} />;
  if (error || !user) return <ErrorState message={error?.message || 'User not found'} onRetry={refetch} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-editorial-border dark:border-darkEditorial-border">
        <Link
          to="/admin/users"
          className="p-2 rounded-lg border border-editorial-border hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">User Profile Record</span>
          <h1 className="text-2xl font-bold font-serif">{user.name}</h1>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-2xl space-y-6 shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-purple-600 text-white font-bold text-2xl flex items-center justify-center uppercase">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-serif">{user.name}</h2>
            <p className="text-xs text-editorial-muted font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-purple-500/10 text-purple-600 border border-purple-500/20">
                {user.role}
              </span>
              {user.isSuspended ? (
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  SUSPENDED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  ACTIVE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="p-4 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-xl text-xs leading-relaxed italic">
            "{user.bio}"
          </div>
        )}

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-4 border-t border-editorial-border">
          <div>
            <span className="text-editorial-muted block">Registered Date:</span>
            <span className="font-bold">{new Date(user.createdAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-editorial-muted block">Last Account Login:</span>
            <span className="font-bold">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Activity Stats Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Articles Authored</span>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.articlesCount}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Comments</span>
            <MessageSquare className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.commentsCount}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Bookmarks</span>
            <Bookmark className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.bookmarksCount}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Read Stories</span>
            <History className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.historyCount}</p>
        </div>
      </div>
    </div>
  );
}
