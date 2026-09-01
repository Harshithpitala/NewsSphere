import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { cmsService } from '../../services/cms.service';
import StatusBadge from '../../components/cms/StatusBadge';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import ErrorState from '../../components/common/ErrorState';
import { FileEdit, Send, Eye, CheckCircle2, XCircle, Globe, Plus, ArrowRight } from 'lucide-react';

export default function JournalistDashboardPage() {
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['journalist-dashboard'],
    queryFn: () => cmsService.getJournalistDashboard(),
  });

  const stats = dashboardData?.data?.stats || {
    totalDrafts: 0,
    totalSubmitted: 0,
    totalUnderReview: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalPublished: 0,
  };

  const recentArticles = dashboardData?.data?.recentArticles || [];

  if (isLoading) return <ArticleSkeleton count={4} />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-editorial-accent">Newsroom Portal</span>
          <h1 className="text-3xl font-bold font-serif">Journalist Desk</h1>
          <p className="text-xs text-editorial-muted mt-1">Manage your drafts, submissions, and published stories</p>
        </div>
        <Link
          to="/journalist/articles/new"
          className="px-4 py-2 bg-editorial-accent text-white font-bold rounded-xl hover:bg-red-700 transition text-xs flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Story
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Drafts</span>
            <FileEdit className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.totalDrafts}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Submitted</span>
            <Send className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.totalSubmitted}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Under Review</span>
            <Eye className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.totalUnderReview}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Approved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.totalApproved}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Rejected</span>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.totalRejected}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Published</span>
            <Globe className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.totalPublished}</p>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-serif">Recent Submissions</h3>
          <Link to="/journalist/articles" className="text-xs font-bold text-editorial-accent hover:underline flex items-center gap-1">
            View All ({stats.totalArticles || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentArticles.length === 0 ? (
          <div className="p-8 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl text-center text-xs text-editorial-muted">
            You haven't created any articles yet. Click 'Create New Story' to write your first article draft!
          </div>
        ) : (
          <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-editorial-bg dark:bg-darkEditorial-bg border-b border-editorial-border dark:border-darkEditorial-border text-editorial-muted uppercase font-mono font-bold text-[10px]">
                  <tr>
                    <th className="p-3.5">Headline</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Last Updated</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                  {recentArticles.map((article) => (
                    <tr key={article._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                      <td className="p-3.5 font-bold font-serif max-w-xs truncate">
                        <Link to={`/journalist/articles/edit/${article._id}`} className="hover:text-editorial-accent">
                          {article.title}
                        </Link>
                      </td>
                      <td className="p-3.5 font-medium">{article.category?.name}</td>
                      <td className="p-3.5">
                        <StatusBadge status={article.status} scheduledPublishAt={article.scheduledPublishAt} />
                      </td>
                      <td className="p-3.5 font-mono text-editorial-muted text-[11px]">
                        {new Date(article.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {['DRAFT', 'REJECTED'].includes(article.status) ? (
                          <Link
                            to={`/journalist/articles/edit/${article._id}`}
                            className="px-2.5 py-1 bg-editorial-accent text-white font-semibold rounded text-[11px] hover:bg-red-700 transition inline-block"
                          >
                            Edit
                          </Link>
                        ) : article.status === 'PUBLISHED' ? (
                          <Link
                            to={`/article/${article.slug}`}
                            className="px-2.5 py-1 bg-black/10 dark:bg-white/10 font-semibold rounded text-[11px] hover:bg-black/20 transition inline-block"
                          >
                            View Live
                          </Link>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 font-semibold rounded text-[11px] inline-block font-mono">
                            In Review
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
