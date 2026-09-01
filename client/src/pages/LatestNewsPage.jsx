import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { articleService } from '../services/article.service';
import ArticleCard from '../components/article/ArticleCard';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import { Newspaper } from 'lucide-react';

export default function LatestNewsPage() {
  const [page, setPage] = useState(1);

  const { data: articlesData, isLoading, error } = useQuery({
    queryKey: ['latest-articles-page', page],
    queryFn: () => articleService.getArticles({ page, limit: 12 }),
  });

  const articles = articlesData?.data || [];
  const pagination = articlesData?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-editorial-border dark:border-darkEditorial-border">
        <div className="p-3 bg-editorial-accent/10 text-editorial-accent rounded-xl">
          <Newspaper className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-serif">Latest News</h1>
          <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted mt-0.5">
            Chronological stream of published editorial stories
          </p>
        </div>
      </div>

      {isLoading && <ArticleSkeleton count={6} />}

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-red-600 dark:text-red-400">
          Failed to load stories.
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12 pt-6 flex items-center justify-between border-t border-editorial-border dark:border-darkEditorial-border">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold disabled:opacity-40 hover:border-editorial-accent transition"
          >
            Previous
          </button>
          <span className="text-xs text-editorial-muted dark:text-darkEditorial-muted font-mono">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold disabled:opacity-40 hover:border-editorial-accent transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
