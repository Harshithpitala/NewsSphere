import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { History, Shield, FileText, UserCheck, MessageSquare, Lock } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: logsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-audit-logs', page, actionFilter],
    queryFn: () => adminService.getAuditLogs({ page, limit: 15, action: actionFilter }),
  });

  const logs = logsData?.data || [];
  const pagination = logsData?.pagination;

  const actions = [
    { label: 'All Log Actions', value: '' },
    { label: 'Role Changes', value: 'ROLE_CHANGE' },
    { label: 'User Suspensions', value: 'USER_SUSPEND' },
    { label: 'Article Created', value: 'ARTICLE_CREATE' },
    { label: 'Article Submitted', value: 'ARTICLE_SUBMIT' },
    { label: 'Article Review', value: 'ARTICLE_UNDER_REVIEW' },
    { label: 'Article Approved', value: 'ARTICLE_APPROVE' },
    { label: 'Article Rejected', value: 'ARTICLE_REJECT' },
    { label: 'Article Published', value: 'ARTICLE_PUBLISH' },
    { label: 'Article Deleted', value: 'ARTICLE_DELETE' },
    { label: 'Comment Moderation', value: 'COMMENT_MODERATE' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">Security & Compliance</span>
        <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
          <History className="w-8 h-8 text-purple-600 dark:text-purple-400" /> Immutable Audit Logs
        </h1>
        <p className="text-xs text-editorial-muted mt-1">Read-only system activity log tracking administrative & editorial operations</p>
      </div>

      {/* Action Filter Toolbar */}
      <div className="flex flex-wrap gap-1.5 p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl shadow-xs">
        {actions.map((act) => (
          <button
            key={act.value}
            onClick={() => {
              setActionFilter(act.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              actionFilter === act.value
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border hover:border-purple-600'
            }`}
          >
            {act.label}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      {isLoading && <ArticleSkeleton count={6} />}
      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && logs.length === 0 && (
        <EmptyState title="No Audit Logs Found" description="No system activity matches your action filter." />
      )}

      {!isLoading && !error && logs.length > 0 && (
        <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-editorial-bg dark:bg-darkEditorial-bg border-b border-editorial-border text-editorial-muted uppercase font-mono font-bold text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Safe Metadata Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <td className="p-4 font-mono text-[11px] text-editorial-muted whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-mono font-bold">
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-bold">
                      {log.actor?.name || 'System Auto'} ({log.actor?.role || 'SYSTEM'})
                    </td>
                    <td className="p-4 font-mono text-editorial-muted">
                      {log.targetEntity} #{log.targetId ? String(log.targetId).slice(-6) : ''}
                    </td>
                    <td className="p-4 font-mono text-[11px] max-w-xs truncate text-editorial-muted">
                      {JSON.stringify(log.metadata || {})}
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
