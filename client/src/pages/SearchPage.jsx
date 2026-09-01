import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { articleService } from '../services/article.service';
import { categoryService } from '../services/category.service';
import ArticleCard from '../components/article/ArticleCard';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || 'relevance';
  const initialFrom = searchParams.get('from') || '';
  const initialTo = searchParams.get('to') || '';
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  const [inputQuery, setInputQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  // Sync debounced input query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(inputQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputQuery]);

  // Sync state with URL search parameters
  useEffect(() => {
    setInputQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Fetch Categories for Filter Dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  const categories = categoriesData?.data || [];

  // Fetch Search Suggestions
  const { data: suggestionsData } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => articleService.getSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
  });
  const suggestions = suggestionsData?.data?.suggestions;

  // Execute Main Search Query
  const { data: searchResultsData, isLoading, error, refetch } = useQuery({
    queryKey: [
      'article-search',
      initialQ,
      initialCategory,
      initialSort,
      initialFrom,
      initialTo,
      initialPage,
    ],
    queryFn: () =>
      articleService.searchArticles({
        q: initialQ,
        category: initialCategory,
        sort: initialSort,
        from: initialFrom,
        to: initialTo,
        page: initialPage,
        limit: 12,
      }),
  });

  const articles = searchResultsData?.data || [];
  const pagination = searchResultsData?.pagination;

  // Update URL Search Params helper
  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams };

    // Clean empty values
    Object.keys(merged).forEach((key) => {
      if (!merged[key]) delete merged[key];
    });

    setSearchParams(merged);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSuggestionsOpen(false);
    updateParams({ q: inputQuery, page: 1 });
  };

  const handleClearFilters = () => {
    setInputQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      {/* Search Header & Input Box */}
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <span className="text-xs uppercase font-bold tracking-widest text-editorial-accent mb-2 block font-sans">
          Editorial Knowledge Search
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-6">Search NewsSphere Stories</h1>

        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative flex items-center shadow-sm">
            <Search className="w-5 h-5 absolute left-4 text-editorial-muted pointer-events-none" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => {
                setInputQuery(e.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              placeholder="Search by keywords, headlines, or topics..."
              className="w-full pl-12 pr-28 py-3.5 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-editorial-accent font-medium"
            />
            {inputQuery && (
              <button
                type="button"
                onClick={() => {
                  setInputQuery('');
                  updateParams({ q: '', page: 1 });
                }}
                className="absolute right-24 text-editorial-muted hover:text-editorial-text p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2.5 px-4 py-2 bg-editorial-accent text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
            >
              Search
            </button>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          <AnimatePresence>
            {suggestionsOpen && suggestions && (
              (suggestions.articles?.length > 0 || suggestions.categories?.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl shadow-xl z-50 text-left p-4 space-y-3"
                >
                  {suggestions.categories?.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-editorial-muted block mb-1.5">
                        Matching Categories
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.categories.map((c) => (
                          <button
                            key={c.slug}
                            type="button"
                            onClick={() => {
                              updateParams({ category: c.slug, page: 1 });
                              setSuggestionsOpen(false);
                            }}
                            className="px-2.5 py-1 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold hover:border-editorial-accent"
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestions.articles?.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-editorial-muted block mb-1.5">
                        Suggested Headlines
                      </span>
                      <div className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                        {suggestions.articles.map((art) => (
                          <Link
                            key={art.slug}
                            to={`/article/${art.slug}`}
                            onClick={() => setSuggestionsOpen(false)}
                            className="block py-2 text-xs font-serif font-bold hover:text-editorial-accent truncate"
                          >
                            {art.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl p-4 mb-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-editorial-muted" />
              <select
                value={initialCategory}
                onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
                className="bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-editorial-accent"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-editorial-muted" />
              <select
                value={initialSort}
                onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}
                className="bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-editorial-accent"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>

            {/* Date Range Inputs */}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-editorial-muted hidden sm:inline" />
              <input
                type="date"
                value={initialFrom}
                onChange={(e) => updateParams({ from: e.target.value, page: 1 })}
                className="bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-editorial-accent font-mono"
                title="From Date"
              />
              <span className="text-xs text-editorial-muted">to</span>
              <input
                type="date"
                value={initialTo}
                onChange={(e) => updateParams({ to: e.target.value, page: 1 })}
                className="bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-editorial-accent font-mono"
                title="To Date"
              />
            </div>
          </div>

          {(initialQ || initialCategory || initialFrom || initialTo || initialSort !== 'relevance') && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Results Counter Summary */}
        {pagination && (
          <div className="pt-3 border-t border-editorial-border dark:border-darkEditorial-border flex items-center justify-between text-xs text-editorial-muted font-mono">
            <span>
              Found <strong className="text-editorial-text dark:text-darkEditorial-text font-serif text-sm">{pagination.totalItems}</strong> matching stories
            </span>
            {initialQ && (
              <span>Query: "<strong className="text-editorial-accent">{initialQ}</strong>"</span>
            )}
          </div>
        )}
      </div>

      {/* Content Results */}
      {isLoading && <ArticleSkeleton count={6} />}

      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && articles.length === 0 && (
        <EmptyState
          title="No Matching Stories Found"
          description="We couldn't find any articles matching your search criteria and filters."
          actionLabel="Reset Search Filters"
          onAction={handleClearFilters}
        />
      )}

      {!isLoading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <ArticleCard key={art._id} article={art} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12 pt-6 flex items-center justify-between border-t border-editorial-border dark:border-darkEditorial-border">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => updateParams({ page: Math.max(1, initialPage - 1) })}
            className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold disabled:opacity-40 hover:border-editorial-accent transition"
          >
            Previous
          </button>
          <span className="text-xs text-editorial-muted font-mono">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => updateParams({ page: initialPage + 1 })}
            className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold disabled:opacity-40 hover:border-editorial-accent transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
