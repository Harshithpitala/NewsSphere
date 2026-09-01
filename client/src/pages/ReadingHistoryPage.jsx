import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { historyService } from '../services/history.service';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { History, CheckCircle, Clock, Trash2 } from 'lucide-react';

export default function ReadingHistoryPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: historyData, isLoading, error, refetch } = useQuery({
    queryKey: ['user-history', page],
    queryFn: () => historyService.getUserHistory({ page, limit: 12 }),
  });

  const historyEntries = historyData?.data || [];
  const pagination = historyData?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (articleId) => historyService.deleteHistoryEntry(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-history'] });
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <div className="mb-8 pb-6 border-b border-editorial-border dark:border-darkEditorial-border flex items-center space-x-3">
        <div className="p-3 bg-brand-600/10 text-brand-600 dark:text-brand-400 rounded-xl">
          <History className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-brand-600 dark:text-brand-400">Activity Log</span>
          <h1 className="text-3xl font-bold font-serif">Reading History</h1>
          <p className="text-xs text-editorial-muted mt-1">Track your reading progress, completion status, and time spent</p>
        </div>
      </div>

      {isLoading && <ArticleSkeleton count={6} />}

      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && historyEntries.length === 0 && (
        <EmptyState
          title="No Reading History Yet"
          description="Articles you read will automatically appear here with progress tracking."
        />
      )}

      {!isLoading && !error && historyEntries.length > 0 && (
        <div className="space-y-4">
          {historyEntries.map((entry) => {
            const art = entry.article;
            if (!art) return null;
            return (
              <div
                key={entry._id}
                className="p-5 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-editorial-bg dark:bg-darkEditorial-bg">
                    <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-editorial-accent block mb-1">
                      {art.category?.name || 'News'}
                    </span>
                    <Link to={`/article/${art.slug}`}>
                      <h3 className="text-base font-bold font-serif hover:text-editorial-accent transition line-clamp-1">
                        {art.title}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-3 text-xs text-editorial-muted mt-1 font-mono">
                      <span>Last read: {new Date(entry.lastReadAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {Math.round(entry.readingTimeSeconds / 60)} min read
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  {/* Progress Bar */}
                  <div className="w-32 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono font-bold">
                      <span>Progress</span>
                      <span>{entry.readingProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-full overflow-hidden">
                      <div className="h-full bg-editorial-accent rounded-full" style={{ width: `${entry.readingProgress}%` }} />
                    </div>
                  </div>

                  {entry.completed ? (
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 text-xs font-bold">In Progress</span>
                  )}

                  <button
                    onClick={() => deleteMutation.mutate(art._id)}
                    className="p-2 rounded-lg text-editorial-muted hover:text-red-600 hover:bg-red-500/10 transition"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
