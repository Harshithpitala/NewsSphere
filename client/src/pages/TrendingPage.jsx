import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { articleService } from '../services/article.service';
import { categoryService } from '../services/category.service';
import ArticleCard from '../components/article/ArticleCard';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { Flame, TrendingUp, Sparkles } from 'lucide-react';

export default function TrendingPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);

  // Fetch Categories for Filter
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  const categories = categoriesData?.data || [];

  // Fetch Decaying Trending Stories
  const { data: trendingData, isLoading, error, refetch } = useQuery({
    queryKey: ['trending-page', selectedCategory, page],
    queryFn: () => articleService.getTrendingArticles({ category: selectedCategory, page, limit: 12 }),
  });

  const articles = trendingData?.data || [];
  const pagination = trendingData?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-editorial-border dark:border-darkEditorial-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Flame className="w-7 h-7 fill-current" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-500 font-sans">
              Real-Time Dynamic Recency Decay
            </span>
            <h1 className="text-3xl font-bold font-serif">Trending Stories Now</h1>
            <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted mt-1">
              Top published stories weighted by recent reader activity and exponential time decay
            </p>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
              selectedCategory === ''
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border hover:border-amber-500'
            }`}
          >
            All Trending
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => {
                setSelectedCategory(c.slug);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                selectedCategory === c.slug
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border hover:border-amber-500'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <ArticleSkeleton count={6} />}

      {/* Error State */}
      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {/* Empty State */}
      {!isLoading && !error && articles.length === 0 && (
        <EmptyState
          title="No Trending Stories Found"
          description="There are currently no trending stories in this category."
          actionLabel="Reset Category Filter"
          onAction={() => setSelectedCategory('')}
        />
      )}

      {/* Trending Grid with Rank Badges */}
      {!isLoading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art, index) => {
            const rank = (page - 1) * 12 + index + 1;
            return (
              <div key={art._id} className="relative">
                {/* Rank Badge Indicator */}
                <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-amber-500 text-white font-serif font-bold text-xs flex items-center justify-center shadow-md">
                  #{rank}
                </div>
                <ArticleCard article={art} />
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12 pt-6 flex items-center justify-between border-t border-editorial-border dark:border-darkEditorial-border">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold disabled:opacity-40 hover:border-amber-500 transition"
          >
            Previous
          </button>
          <span className="text-xs text-editorial-muted font-mono">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold disabled:opacity-40 hover:border-amber-500 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
