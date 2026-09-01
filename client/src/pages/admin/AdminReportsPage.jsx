import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Flag, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: reportsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-reports', page, statusFilter],
    queryFn: () => adminService.getReports({ page, limit: 10, status: statusFilter }),
  });

  const reports = reportsData?.data || [];
  const pagination = reportsData?.pagination;

  // Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.updateReportStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const statuses = [
    { label: 'All Reports', value: '' },
    { label: 'Pending Review', value: 'PENDING' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Dismissed', value: 'DISMISSED' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">Content Quality</span>
        <h1 className="text-3xl font-bold font-serif">Content Reports</h1>
        <p className="text-xs text-editorial-muted mt-1">Review flagged comments and take appropriate moderation actions</p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap gap-1.5 p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl shadow-xs">
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

      {/* Reports Table */}
      {isLoading && <ArticleSkeleton count={5} />}
      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && reports.length === 0 && (
        <EmptyState title="No Reports Found" description="No content reports match your current filter." />
      )}

      {!isLoading && !error && reports.length > 0 && (
        <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-editorial-bg dark:bg-darkEditorial-bg border-b border-editorial-border text-editorial-muted uppercase font-mono font-bold text-[10px]">
                <tr>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reported Date</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <td className="p-4 font-bold">{r.reporter?.name || 'Anonymous'}</td>
                    <td className="p-4 font-mono font-bold text-rose-500">{r.reason}</td>
                    <td className="p-4 max-w-xs truncate">{r.details || 'No details provided'}</td>
                    <td className="p-4 font-mono font-bold text-[10px]">
                      {r.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-amber-500">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                      {r.status === 'RESOLVED' && (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle className="w-3 h-3" /> RESOLVED
                        </span>
                      )}
                      {r.status === 'DISMISSED' && (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <XCircle className="w-3 h-3" /> DISMISSED
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-editorial-muted">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {r.status === 'PENDING' && (
                        <>
                          <button
                            disabled={updateStatusMutation.isPending}
                            onClick={() => updateStatusMutation.mutate({ id: r._id, status: 'RESOLVED' })}
                            className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-[11px] hover:bg-emerald-700 transition inline-block"
                          >
                            Resolve
                          </button>
                          <button
                            disabled={updateStatusMutation.isPending}
                            onClick={() => updateStatusMutation.mutate({ id: r._id, status: 'DISMISSED' })}
                            className="px-2.5 py-1 bg-slate-500 text-white font-bold rounded text-[11px] hover:bg-slate-600 transition inline-block"
                          >
                            Dismiss
                          </button>
                        </>
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
    </div>
  );
}
