import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { externalNewsService } from '../services/externalNews.service';
import ExternalNewsCard from '../components/article/ExternalNewsCard';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { Globe, Search, RefreshCw } from 'lucide-react';

export default function ExternalNewsPage() {
  const [query, setQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data: externalData, isLoading, error, refetch } = useQuery({
    queryKey: ['external-news-page', searchSubmitted, selectedCategory, page],
    queryFn: () =>
      externalNewsService.getLatestExternalNews({
        q: searchSubmitted,
        category: selectedCategory,
        page,
        limit: 12,
      }),
  });

  const articles = externalData?.data || [];
  const pagination = externalData?.pagination;
  const provider = externalData?.provider || 'External News Provider';

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchSubmitted(query);
    setPage(1);
  };

  const categories = [
    { name: 'All World Wire', slug: '' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Business', slug: 'business' },
    { name: 'Science', slug: 'science' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'India News', slug: 'india' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-editorial-border dark:border-darkEditorial-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-brand-600/10 text-brand-600 dark:text-brand-400 rounded-xl">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-brand-600 dark:text-brand-400">
              Aggregated Global Media
            </span>
            <h1 className="text-3xl font-bold font-serif">Around The Web</h1>
            <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted mt-1">
              Curated stories from partner publications ({provider})
            </p>
          </div>
        </div>

        {/* External Search Bar */}
        <form onSubmit={handleSearch} className="flex space-x-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-editorial-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search global news..."
              className="w-full pl-9 pr-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar mb-8 pb-2">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => {
              setSelectedCategory(cat.slug);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
              selectedCategory === cat.slug
                ? 'bg-brand-600 text-white'
                : 'bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border hover:border-brand-500'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Content Rendering */}
      {isLoading && <ArticleSkeleton count={6} />}

      {error && <ErrorState title="External News Unavailable" message={error.message} onRetry={refetch} />}

      {!isLoading && !error && articles.length === 0 && (
        <EmptyState
          title="No external stories found"
          description="Try modifying your search keywords or switching category filters."
          actionLabel="Clear Search"
          onAction={() => {
            setQuery('');
            setSearchSubmitted('');
            setSelectedCategory('');
          }}
        />
      )}

      {!isLoading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ExternalNewsCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12 pt-6 flex items-center justify-between border-t border-editorial-border dark:border-darkEditorial-border">
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold disabled:opacity-40 hover:border-brand-500 transition"
          >
            Previous
          </button>
          <span className="text-xs text-editorial-muted font-mono">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold disabled:opacity-40 hover:border-brand-500 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
