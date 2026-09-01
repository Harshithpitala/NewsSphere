import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarkService } from '../services/bookmark.service';
import ArticleCard from '../components/article/ArticleCard';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { Bookmark, Trash2 } from 'lucide-react';

export default function BookmarksPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: bookmarksData, isLoading, error, refetch } = useQuery({
    queryKey: ['user-bookmarks', page],
    queryFn: () => bookmarkService.getUserBookmarks({ page, limit: 12 }),
  });

  const articles = bookmarksData?.data || [];
  const pagination = bookmarksData?.pagination;

  const removeMutation = useMutation({
    mutationFn: (articleId) => bookmarkService.removeBookmark(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks'] });
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <div className="mb-8 pb-6 border-b border-editorial-border dark:border-darkEditorial-border flex items-center space-x-3">
        <div className="p-3 bg-editorial-accent/10 text-editorial-accent rounded-xl">
          <Bookmark className="w-6 h-6 fill-current" />
        </div>
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-editorial-accent">Saved Reading List</span>
          <h1 className="text-3xl font-bold font-serif">My Saved Bookmarks</h1>
          <p className="text-xs text-editorial-muted mt-1">Articles you have saved to read later</p>
        </div>
      </div>

      {isLoading && <ArticleSkeleton count={6} />}

      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && articles.length === 0 && (
        <EmptyState
          title="No Bookmarks Saved Yet"
          description="Click 'Save Story' on any article to build your personalized reading list."
        />
      )}

      {!isLoading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div key={art._id} className="relative group">
              <button
                onClick={() => removeMutation.mutate(art._id)}
                className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-black/60 text-white hover:bg-red-600 transition"
                title="Remove Bookmark"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ArticleCard article={art} />
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12 pt-6 flex items-center justify-between border-t border-editorial-border">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-editorial-card border rounded-lg text-xs font-semibold disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-editorial-muted font-mono">
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
