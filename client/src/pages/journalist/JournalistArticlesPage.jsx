import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { cmsService } from '../../services/cms.service';
import StatusBadge from '../../components/cms/StatusBadge';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Search, Plus, Send, Edit, Eye, AlertCircle, X, Check } from 'lucide-react';

export default function JournalistArticlesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedFeedbackArticle, setSelectedFeedbackArticle] = useState(null);

  const queryClient = useQueryClient();

  const { data: articlesData, isLoading, error, refetch } = useQuery({
    queryKey: ['journalist-articles', page, statusFilter, search],
    queryFn: () => cmsService.getJournalistArticles({ page, limit: 10, status: statusFilter, search }),
  });

  const articles = articlesData?.data || [];
  const pagination = articlesData?.pagination;

  const submitMutation = useMutation({
    mutationFn: (id) => cmsService.submitArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalist-articles'] });
      queryClient.invalidateQueries({ queryKey: ['journalist-dashboard'] });
    },
  });

  const statuses = [
    { label: 'All Statuses', value: '' },
    { label: 'Drafts', value: 'DRAFT' },
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Published', value: 'PUBLISHED' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-editorial-accent">Editorial Management</span>
          <h1 className="text-3xl font-bold font-serif">My Articles & Submissions</h1>
          <p className="text-xs text-editorial-muted mt-1">Review status, editorial feedback, and edit drafts</p>
        </div>
        <Link
          to="/journalist/articles/new"
          className="px-4 py-2 bg-editorial-accent text-white font-bold rounded-xl hover:bg-red-700 transition text-xs flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Story
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl shadow-xs">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => {
                setStatusFilter(st.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st.value
                  ? 'bg-editorial-accent text-white font-bold shadow-xs'
                  : 'bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border hover:border-editorial-accent'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-editorial-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search headline..."
            className="w-full pl-9 pr-3 py-1.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-editorial-accent"
          />
        </div>
      </div>

      {/* Articles Table */}
      {isLoading && <ArticleSkeleton count={5} />}
      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && articles.length === 0 && (
        <EmptyState
          title="No Articles Found"
          description="No articles match your current status or search filter."
        />
      )}

      {!isLoading && !error && articles.length > 0 && (
        <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-editorial-bg dark:bg-darkEditorial-bg border-b border-editorial-border dark:border-darkEditorial-border text-editorial-muted uppercase font-mono font-bold text-[10px]">
                <tr>
                  <th className="p-4">Article Headline</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reviewer</th>
                  <th className="p-4">Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                {articles.map((art) => (
                  <tr key={art._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <td className="p-4 font-bold font-serif max-w-sm">
                      <div className="space-y-1">
                        <span className="block truncate hover:text-editorial-accent transition">{art.title}</span>
                        {art.rejectionReason && (
                          <button
                            onClick={() => setSelectedFeedbackArticle(art)}
                            className="text-[10px] text-red-500 font-sans font-semibold underline flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" /> View Editorial Feedback
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{art.category?.name}</td>
                    <td className="p-4">
                      <StatusBadge status={art.status} scheduledPublishAt={art.scheduledPublishAt} />
                    </td>
                    <td className="p-4 font-mono text-[11px]">{art.editor?.name || 'Unassigned'}</td>
                    <td className="p-4 font-mono text-[11px] text-editorial-muted">
                      {new Date(art.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {['DRAFT', 'REJECTED'].includes(art.status) ? (
                        <>
                          <Link
                            to={`/journalist/articles/edit/${art._id}`}
                            className="px-2.5 py-1.5 bg-editorial-accent text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition inline-flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </Link>
                          <button
                            disabled={submitMutation.isPending}
                            onClick={() => submitMutation.mutate(art._id)}
                            className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Submit
                          </button>
                        </>
                      ) : art.status === 'PUBLISHED' ? (
                        <Link
                          to={`/article/${art.slug}`}
                          className="px-2.5 py-1.5 bg-black/10 dark:bg-white/10 font-semibold rounded-lg text-xs hover:bg-black/20 transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View Live
                        </Link>
                      ) : (
                        <span className="px-2.5 py-1.5 bg-amber-500/10 text-amber-600 font-semibold rounded-lg text-xs font-mono inline-block">
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-editorial-border">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-editorial-card border rounded-lg text-xs font-semibold disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-editorial-muted">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-editorial-card border rounded-lg text-xs font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Feedback Modal */}
      {selectedFeedbackArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h4 className="text-base font-bold font-serif text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Editorial Rejection Notes
              </h4>
              <button onClick={() => setSelectedFeedbackArticle(null)} className="p-1 hover:bg-black/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-bold font-serif">{selectedFeedbackArticle.title}</p>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-editorial-text dark:text-darkEditorial-text leading-relaxed">
              "{selectedFeedbackArticle.rejectionReason}"
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <Link
                to={`/journalist/articles/edit/${selectedFeedbackArticle._id}`}
                onClick={() => setSelectedFeedbackArticle(null)}
                className="px-4 py-2 bg-editorial-accent text-white font-bold rounded-lg hover:bg-red-700 transition"
              >
                Edit Story Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
