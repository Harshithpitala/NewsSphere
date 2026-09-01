import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { cmsService } from '../../services/cms.service';
import StatusBadge from '../../components/cms/StatusBadge';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Search, Eye, Filter } from 'lucide-react';

export default function EditorSubmissionsQueuePage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: queueData, isLoading, error, refetch } = useQuery({
    queryKey: ['editor-submissions', page, statusFilter, search],
    queryFn: () => cmsService.getEditorSubmissions({ page, limit: 12, status: statusFilter, search }),
  });

  const submissions = queueData?.data || [];
  const pagination = queueData?.pagination;

  const statuses = [
    { label: 'All Submissions', value: '' },
    { label: 'Submitted (Pending)', value: 'SUBMITTED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Published', value: 'PUBLISHED' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-500">Editorial Submissions Queue</span>
        <h1 className="text-3xl font-bold font-serif">Editorial Queue & Approvals</h1>
        <p className="text-xs text-editorial-muted mt-1">Review journalist submissions, claim stories, approve, or reject with feedback</p>
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
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border hover:border-amber-500'
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
            placeholder="Search submission headline..."
            className="w-full pl-9 pr-3 py-1.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading && <ArticleSkeleton count={6} />}
      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && submissions.length === 0 && (
        <EmptyState
          title="No Submissions Found"
          description="There are no articles matching your current queue filters."
        />
      )}

      {!isLoading && !error && submissions.length > 0 && (
        <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-editorial-bg dark:bg-darkEditorial-bg border-b border-editorial-border dark:border-darkEditorial-border text-editorial-muted uppercase font-mono font-bold text-[10px]">
                <tr>
                  <th className="p-4">Submission Headline</th>
                  <th className="p-4">Author / Journalist</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reviewer</th>
                  <th className="p-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                {submissions.map((art) => (
                  <tr key={art._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <td className="p-4 font-bold font-serif max-w-xs truncate">
                      <Link to={`/editor/submissions/${art._id}`} className="hover:text-amber-500">
                        {art.title}
                      </Link>
                    </td>
                    <td className="p-4 font-medium">{art.author?.name}</td>
                    <td className="p-4 font-medium">{art.category?.name}</td>
                    <td className="p-4">
                      <StatusBadge status={art.status} scheduledPublishAt={art.scheduledPublishAt} />
                    </td>
                    <td className="p-4 font-mono text-[11px] text-editorial-muted">
                      {art.editor?.name || 'Unassigned'}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/editor/submissions/${art._id}`}
                        className="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs hover:bg-amber-600 transition inline-flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review Submission
                      </Link>
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
    </div>
  );
}
