import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { cmsService } from '../../services/cms.service';
import StatusBadge from '../../components/cms/StatusBadge';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import ErrorState from '../../components/common/ErrorState';
import { Send, Eye, CheckCircle2, XCircle, Globe, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function EditorDashboardPage() {
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['editor-dashboard'],
    queryFn: () => cmsService.getEditorDashboard(),
  });

  const stats = dashboardData?.data?.stats || {
    pendingSubmissions: 0,
    underReview: 0,
    recentlyApproved: 0,
    recentlyRejected: 0,
    totalPublished: 0,
    scheduledCount: 0,
  };

  const queue = dashboardData?.data?.queue || [];

  if (isLoading) return <ArticleSkeleton count={4} />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Editorial Operations</span>
          <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-amber-500" /> Editor Newsroom Portal
          </h1>
          <p className="text-xs text-editorial-muted mt-1">Review pending submissions, manage publishing queue, and enforce quality standards</p>
        </div>
        <Link
          to="/editor/submissions"
          className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition text-xs flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          View Full Queue ({stats.pendingSubmissions + stats.underReview})
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Pending</span>
            <Send className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.pendingSubmissions}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Under Review</span>
            <Eye className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.underReview}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Approved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.recentlyApproved}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Rejected</span>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.recentlyRejected}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Scheduled</span>
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.scheduledCount}</p>
        </div>

        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Published</span>
            <Globe className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.totalPublished}</p>
        </div>
      </div>

      {/* Active Review Queue Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-serif">Submissions Awaiting Review</h3>
          <Link to="/editor/submissions" className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1">
            Manage All Submissions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {queue.length === 0 ? (
          <div className="p-8 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl text-center text-xs text-editorial-muted">
            The editorial queue is clean! No pending submissions require review right now.
          </div>
        ) : (
          <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-editorial-bg dark:bg-darkEditorial-bg border-b border-editorial-border dark:border-darkEditorial-border text-editorial-muted uppercase font-mono font-bold text-[10px]">
                  <tr>
                    <th className="p-3.5">Headline</th>
                    <th className="p-3.5">Journalist</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                  {queue.map((article) => (
                    <tr key={article._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                      <td className="p-3.5 font-bold font-serif max-w-xs truncate">
                        <Link to={`/editor/submissions/${article._id}`} className="hover:text-amber-500">
                          {article.title}
                        </Link>
                      </td>
                      <td className="p-3.5 font-medium">{article.author?.name}</td>
                      <td className="p-3.5 font-medium">{article.category?.name}</td>
                      <td className="p-3.5">
                        <StatusBadge status={article.status} scheduledPublishAt={article.scheduledPublishAt} />
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/editor/submissions/${article._id}`}
                          className="px-3 py-1 bg-amber-500 text-white font-bold rounded-lg text-xs hover:bg-amber-600 transition inline-block shadow-xs"
                        >
                          Review Submission
                        </Link>
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
