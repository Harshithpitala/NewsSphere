import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import StatusBadge from '../../components/cms/StatusBadge';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Search, Trash2, Eye, AlertTriangle, X } from 'lucide-react';

export default function AdminArticlesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalArticle, setDeleteModalArticle] = useState(null);

  const queryClient = useQueryClient();

  const { data: articlesData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-articles', page, statusFilter, search],
    queryFn: () => adminService.getArticles({ page, limit: 12, status: statusFilter, search }),
  });

  const articles = articlesData?.data || [];
  const pagination = articlesData?.pagination;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteArticle(id),
    onSuccess: () => {
      setDeleteModalArticle(null);
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const statuses = [
    { label: 'All Statuses', value: '' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Drafts', value: 'DRAFT' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">Content Administration</span>
        <h1 className="text-3xl font-bold font-serif">Article Moderation</h1>
        <p className="text-xs text-editorial-muted mt-1">Review, delete, or inspect published and editorial news stories</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl shadow-xs">
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
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border hover:border-purple-600'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

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
            className="w-full pl-9 pr-3 py-1.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading && <ArticleSkeleton count={6} />}
      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && articles.length === 0 && (
        <EmptyState title="No Articles Found" description="No articles match your current search or status filter." />
      )}

      {!isLoading && !error && articles.length > 0 && (
        <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-editorial-bg dark:bg-darkEditorial-bg border-b border-editorial-border text-editorial-muted uppercase font-mono font-bold text-[10px]">
                <tr>
                  <th className="p-4">Article Headline</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                {articles.map((art) => (
                  <tr key={art._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <td className="p-4 font-bold font-serif max-w-xs truncate">{art.title}</td>
                    <td className="p-4 font-medium">{art.author?.name}</td>
                    <td className="p-4 font-medium">{art.category?.name}</td>
                    <td className="p-4">
                      <StatusBadge status={art.status} scheduledPublishAt={art.scheduledPublishAt} />
                    </td>
                    <td className="p-4 font-mono text-[11px] text-editorial-muted">
                      {new Date(art.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/article/${art.slug}`}
                        className="p-1.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 inline-block align-middle"
                        title="View Article"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteModalArticle(art)}
                        className="p-1.5 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 inline-block align-middle"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

      {/* Delete Modal */}
      {deleteModalArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h4 className="text-base font-bold font-serif text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Delete Article Permanently
              </h4>
              <button onClick={() => setDeleteModalArticle(null)} className="p-1 hover:bg-black/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-editorial-muted">
              Are you sure you want to permanently delete <strong className="text-editorial-text">"{deleteModalArticle.title}"</strong>? This will remove all associated comments.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setDeleteModalArticle(null)} className="px-4 py-2 text-editorial-muted">Cancel</button>
              <button
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteModalArticle._id)}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
