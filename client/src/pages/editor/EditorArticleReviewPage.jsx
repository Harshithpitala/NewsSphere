import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService } from '../../services/cms.service';
import StatusBadge from '../../components/cms/StatusBadge';
import ArticleContentSanitizer from '../../components/article/ArticleContentSanitizer';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import ErrorState from '../../components/common/ErrorState';
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  Globe,
  Clock,
  Star,
  Zap,
  History,
  AlertCircle,
  Calendar,
  User,
  X,
} from 'lucide-react';

export default function EditorArticleReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  // Fetch Article Details & Audit Log History
  const { data: reviewData, isLoading, error, refetch } = useQuery({
    queryKey: ['editor-submission-review', id],
    queryFn: () => cmsService.getEditorSubmissionById(id),
  });

  const article = reviewData?.data?.article;
  const auditLogs = reviewData?.data?.auditLogs || [];

  // Review Mutations
  const reviewMutation = useMutation({
    mutationFn: () => cmsService.startReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['editor-submission-review', id] }),
  });

  const approveMutation = useMutation({
    mutationFn: () => cmsService.approveArticle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['editor-submission-review', id] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason) => cmsService.rejectArticle(id, reason),
    onSuccess: () => {
      setRejectModalOpen(false);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['editor-submission-review', id] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => cmsService.publishArticle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['editor-submission-review', id] }),
  });

  const scheduleMutation = useMutation({
    mutationFn: (date) => cmsService.scheduleArticle(id, date),
    onSuccess: () => {
      setScheduleModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['editor-submission-review', id] });
    },
  });

  const featuredMutation = useMutation({
    mutationFn: () => cmsService.toggleFeatured(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['editor-submission-review', id] }),
  });

  const breakingMutation = useMutation({
    mutationFn: () => cmsService.toggleBreaking(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['editor-submission-review', id] }),
  });

  if (isLoading) return <ArticleSkeleton count={4} />;
  if (error || !article) return <ErrorState message={error?.message || 'Submission not found'} onRetry={refetch} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-8">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <div className="flex items-center space-x-3">
          <Link
            to="/editor/submissions"
            className="p-2 rounded-lg border border-editorial-border dark:border-darkEditorial-border hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Editorial Review Console</span>
            <h1 className="text-2xl font-bold font-serif leading-tight">{article.title}</h1>
          </div>
        </div>
        <StatusBadge status={article.status} scheduledPublishAt={article.scheduledPublishAt} />
      </div>

      {/* Editor Action Controls Toolbar */}
      <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-16 z-30">
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {article.status === 'SUBMITTED' && (
            <button
              disabled={reviewMutation.isPending}
              onClick={() => reviewMutation.mutate()}
              className="px-4 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition flex items-center gap-1.5 shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" /> Start Review
            </button>
          )}

          {['SUBMITTED', 'UNDER_REVIEW'].includes(article.status) && (
            <>
              <button
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate()}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </button>

              <button
                onClick={() => setRejectModalOpen(true)}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition flex items-center gap-1.5 shadow-xs"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject with Feedback
              </button>
            </>
          )}

          {['APPROVED', 'UNDER_REVIEW', 'SUBMITTED'].includes(article.status) && (
            <>
              <button
                disabled={publishMutation.isPending}
                onClick={() => publishMutation.mutate()}
                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition flex items-center gap-1.5 shadow-xs"
              >
                <Globe className="w-3.5 h-3.5" /> Publish Now
              </button>

              <button
                onClick={() => setScheduleModalOpen(true)}
                className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition flex items-center gap-1.5 shadow-xs"
              >
                <Clock className="w-3.5 h-3.5" /> Schedule Publish
              </button>
            </>
          )}
        </div>

        {/* Feature / Breaking Flags */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => featuredMutation.mutate()}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition ${
              article.isFeatured
                ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : 'border-editorial-border hover:border-amber-500'
            }`}
          >
            <Star className="w-3.5 h-3.5" /> {article.isFeatured ? 'Featured ⭐' : 'Make Featured'}
          </button>

          <button
            onClick={() => breakingMutation.mutate()}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition ${
              article.isBreaking
                ? 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400 font-bold'
                : 'border-editorial-border hover:border-red-500'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> {article.isBreaking ? 'Breaking ⚡' : 'Make Breaking'}
          </button>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Article Content Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-6 shadow-xs">
            {article.coverImage && (
              <div className="rounded-xl overflow-hidden max-h-96">
                <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <span className="text-xs uppercase font-bold text-editorial-accent">{article.category?.name}</span>
              <h2 className="text-3xl font-bold font-serif leading-tight mt-1">{article.title}</h2>
              {article.subtitle && <p className="text-lg text-editorial-muted font-serif mt-2">{article.subtitle}</p>}
            </div>

            <div className="py-4 border-t border-editorial-border dark:border-darkEditorial-border">
              <ArticleContentSanitizer content={article.content} />
            </div>
          </div>
        </div>

        {/* Sidebar: Author Meta & Audit History */}
        <div className="space-y-6">
          {/* Author Card */}
          <div className="p-5 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-editorial-muted">Author Information</h4>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-editorial-accent text-white font-bold flex items-center justify-center uppercase">
                {article.author?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-sm font-bold">{article.author?.name}</p>
                <p className="text-xs text-editorial-muted">{article.author?.email}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-editorial-bg border border-editorial-border uppercase font-mono mt-1 inline-block">
                  {article.author?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Trail History */}
          <div className="p-5 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-editorial-muted flex items-center gap-1.5">
              <History className="w-4 h-4" /> Editorial Audit Trail
            </h4>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-editorial-muted italic">No audit history recorded yet.</p>
            ) : (
              <div className="space-y-3 border-l-2 border-editorial-border dark:border-darkEditorial-border pl-3">
                {auditLogs.map((log) => (
                  <div key={log._id} className="text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono text-[10px] text-editorial-muted">
                      <span className="font-bold text-amber-500">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-editorial-text font-semibold">By: {log.actor?.name} ({log.actor?.role})</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h4 className="text-base font-bold font-serif text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Reject Submission with Notes
              </h4>
              <button onClick={() => setRejectModalOpen(false)} className="p-1 hover:bg-black/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Rejection Reason & Required Revisions *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Explain required writing corrections or factual updates for the journalist..."
                className="w-full p-3 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-xl text-xs focus:outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 text-editorial-muted">Cancel</button>
              <button
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                onClick={() => rejectMutation.mutate(rejectionReason)}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition"
              >
                Send Rejection Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h4 className="text-base font-bold font-serif text-cyan-600 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Schedule Future Publication
              </h4>
              <button onClick={() => setScheduleModalOpen(false)} className="p-1 hover:bg-black/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Publication Date & Time *
              </label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full p-3 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-xl text-xs focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setScheduleModalOpen(false)} className="px-4 py-2 text-editorial-muted">Cancel</button>
              <button
                disabled={!scheduleDate || scheduleMutation.isPending}
                onClick={() => scheduleMutation.mutate(scheduleDate)}
                className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition"
              >
                Schedule Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
