import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Search, Trash2, MessageSquare, AlertTriangle, X } from 'lucide-react';

export default function AdminCommentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalComment, setDeleteModalComment] = useState(null);

  const queryClient = useQueryClient();

  const { data: commentsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-comments', page, search],
    queryFn: () => adminService.getComments({ page, limit: 10, search }),
  });

  const comments = commentsData?.data || [];
  const pagination = commentsData?.pagination;

  // Delete Comment Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteComment(id),
    onSuccess: () => {
      setDeleteModalComment(null);
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">Community Safety</span>
        <h1 className="text-3xl font-bold font-serif">Comment Moderation</h1>
        <p className="text-xs text-editorial-muted mt-1">Review community discussion threads and remove inappropriate content</p>
      </div>

      {/* Search Toolbar */}
      <div className="flex justify-between items-center p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl shadow-xs">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-editorial-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search comment content..."
            className="w-full pl-9 pr-3 py-1.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Comments List */}
      {isLoading && <ArticleSkeleton count={5} />}
      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && comments.length === 0 && (
        <EmptyState title="No Comments Found" description="No comments match your search filter." />
      )}

      {!isLoading && !error && comments.length > 0 && (
        <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-editorial-bg dark:bg-darkEditorial-bg border-b border-editorial-border text-editorial-muted uppercase font-mono font-bold text-[10px]">
                <tr>
                  <th className="p-4">Comment Text</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Article</th>
                  <th className="p-4">Posted Date</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                {comments.map((c) => (
                  <tr key={c._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <td className="p-4 font-serif font-medium max-w-sm">"{c.content}"</td>
                    <td className="p-4 font-bold">{c.user?.name || 'Anonymous'}</td>
                    <td className="p-4 max-w-xs truncate text-editorial-muted">{c.article?.title}</td>
                    <td className="p-4 font-mono text-[11px] text-editorial-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setDeleteModalComment(c)}
                        className="px-2.5 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold rounded text-[11px] inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
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

      {/* Confirmation Modal */}
      {deleteModalComment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h4 className="text-base font-bold font-serif text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Remove Comment
              </h4>
              <button onClick={() => setDeleteModalComment(null)} className="p-1 hover:bg-black/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-editorial-muted">
              Are you sure you want to remove comment <strong className="text-editorial-text">"{deleteModalComment.content}"</strong> by {deleteModalComment.user?.name}?
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setDeleteModalComment(null)} className="px-4 py-2 text-editorial-muted">Cancel</button>
              <button
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteModalComment._id)}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition"
              >
                Delete Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
