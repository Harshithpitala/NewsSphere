import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { articleService } from '../services/article.service';
import { categoryService } from '../services/category.service';
import { externalNewsService } from '../services/externalNews.service';
import { recommendationClientService } from '../services/recommendation.service';
import ArticleCard from '../components/article/ArticleCard';
import ExternalNewsCard from '../components/article/ExternalNewsCard';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { Zap, ChevronRight, Newspaper, TrendingUp, Sparkles, Mail, Send, Globe, Flame } from 'lucide-react';

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch Active Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  const categories = categoriesData?.data || [];

  // Fetch Breaking News
  const { data: breakingData } = useQuery({
    queryKey: ['breaking-news'],
    queryFn: () => articleService.getArticles({ breaking: 'true', limit: 3 }),
  });
  const breakingArticles = breakingData?.data || [];

  // Fetch Featured Stories for Top Stories section
  const { data: featuredData } = useQuery({
    queryKey: ['featured-news'],
    queryFn: () => articleService.getArticles({ featured: 'true', limit: 4 }),
  });
  const featuredArticles = featuredData?.data || [];

  // Fetch Decaying Trending Stories
  const { data: trendingData } = useQuery({
    queryKey: ['home-trending-stories'],
    queryFn: () => articleService.getTrendingArticles({ limit: 3 }),
  });
  const trendingArticles = trendingData?.data || [];

  // Fetch External News Stream (Around The Web)
  const { data: externalData } = useQuery({
    queryKey: ['external-news-strip'],
    queryFn: () => externalNewsService.getLatestExternalNews({ limit: 3 }),
  });
  const externalArticles = externalData?.data || [];

  // Fetch Recommendations Feed (Top 3)
  const { data: recData } = useQuery({
    queryKey: ['home-recommendations'],
    queryFn: () => recommendationClientService.getRecommendations({ limit: 3 }),
  });
  const recArticles = recData?.data || [];

  // Fetch Latest Articles (with Pagination & Category Filter)
  const { data: articlesData, isLoading, error, refetch } = useQuery({
    queryKey: ['home-articles', page, selectedCategory],
    queryFn: () => articleService.getArticles({ page, limit: 9, category: selectedCategory }),
  });

  const articles = articlesData?.data || [];
  const pagination = articlesData?.pagination;

  // Primary Hero Story
  const heroStory = breakingArticles[0] || featuredArticles[0] || articles[0];
  const secondaryTopStories = (featuredArticles.length > 0 ? featuredArticles : articles)
    .filter((a) => a._id !== heroStory?._id)
    .slice(0, 3);

  const remainingArticles = articles.filter((a) => a._id !== heroStory?._id && !secondaryTopStories.some((s) => s._id === a._id));

  return (
    <div className="min-h-screen pb-12">
      {/* Breaking News Ticker Strip */}
      {breakingArticles.length > 0 && (
        <div className="bg-red-600 text-white text-xs font-semibold py-2 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden">
            <span className="bg-black/20 px-2.5 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Zap className="w-3.5 h-3.5 fill-current" /> Breaking News
            </span>
            <div className="truncate font-medium flex-1">
              <Link to={`/article/${breakingArticles[0].slug}`} className="hover:underline">
                {breakingArticles[0].title}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Category Navigation Bar Strip */}
      <nav className="border-b border-editorial-border dark:border-darkEditorial-border bg-editorial-card dark:bg-darkEditorial-card py-3 px-4 sticky top-[61px] z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs font-medium">
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full transition whitespace-nowrap ${
              selectedCategory === ''
                ? 'bg-editorial-accent text-white font-bold shadow-xs'
                : 'hover:bg-black/5 dark:hover:bg-white/5 text-editorial-muted dark:text-darkEditorial-muted'
            }`}
          >
            All News
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full transition whitespace-nowrap ${
                selectedCategory === cat.slug
                  ? 'bg-editorial-accent text-white font-bold shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-editorial-muted dark:text-darkEditorial-muted'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-12">
        {/* Loading State */}
        {isLoading && <ArticleSkeleton count={6} />}

        {/* Error State */}
        {error && <ErrorState message={error.message} onRetry={refetch} />}

        {/* Top Stories Editorial Layout (Hero + Secondary Stack) */}
        {!isLoading && heroStory && selectedCategory === '' && page === 1 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-editorial-border dark:border-darkEditorial-border pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-editorial-accent flex items-center gap-1.5 font-sans">
                <Sparkles className="w-3.5 h-3.5" /> Top Headlines & Featured Stories
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Hero Card */}
              <div className="lg:col-span-8">
                <ArticleCard article={heroStory} variant="hero" />
              </div>

              {/* Secondary Compact Top Stories Sidebar */}
              <div className="lg:col-span-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold font-serif flex items-center gap-2 border-b border-editorial-border dark:border-darkEditorial-border pb-3">
                  <TrendingUp className="w-4 h-4 text-editorial-accent" /> Editor's Top Picks
                </h3>
                <div className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                  {secondaryTopStories.map((story) => (
                    <ArticleCard key={story._id} article={story} variant="compact" />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Trending Stories Strip */}
        {trendingArticles.length > 0 && selectedCategory === '' && page === 1 && (
          <section className="space-y-4 pt-4 border-t border-editorial-border dark:border-darkEditorial-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-current" /> 🔥 Trending Now
              </h2>
              <Link
                to="/trending"
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
              >
                Full Trending Board <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingArticles.map((art, idx) => (
                <div key={art._id} className="relative">
                  <div className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-amber-500 text-white font-serif font-bold text-[11px] flex items-center justify-center shadow">
                    #{idx + 1}
                  </div>
                  <ArticleCard article={art} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended For You Section */}
        {recArticles.length > 0 && selectedCategory === '' && (
          <section className="space-y-6 p-6 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div>
                <h2 className="text-xl font-bold font-serif flex items-center gap-2 text-editorial-text">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Recommended For You
                </h2>
                <span className="text-[10px] font-mono text-editorial-muted">
                  Personalized based on your reading interests & interactions
                </span>
              </div>
              <Link to="/for-you" className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-0.5">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recArticles.slice(0, 3).map((art) => (
                <ArticleCard key={art._id} article={art} />
              ))}
            </div>
          </section>
        )}

        {/* Latest News Feed Grid */}
        {!isLoading && (remainingArticles.length > 0 || (articles.length > 0 && selectedCategory !== '')) && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-editorial-border dark:border-darkEditorial-border pb-3">
              <h2 className="text-xl font-bold font-serif flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-editorial-accent" />
                {selectedCategory
                  ? `${categories.find((c) => c.slug === selectedCategory)?.name || 'Category'} Stories`
                  : 'Latest News Stream'}
              </h2>
              <Link
                to="/latest"
                className="text-xs font-semibold text-editorial-accent hover:underline flex items-center gap-0.5"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(selectedCategory ? articles : remainingArticles).map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pt-8 flex items-center justify-between border-t border-editorial-border dark:border-darkEditorial-border">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold disabled:opacity-40 hover:border-editorial-accent transition shadow-xs"
                >
                  Previous Page
                </button>
                <span className="text-xs text-editorial-muted dark:text-darkEditorial-muted font-mono">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold disabled:opacity-40 hover:border-editorial-accent transition shadow-xs"
                >
                  Next Page
                </button>
              </div>
            )}
          </section>
        )}

        {/* Around The Web (External Global Media Section) */}
        {externalArticles.length > 0 && selectedCategory === '' && page === 1 && (
          <section className="space-y-6 pt-6 border-t border-editorial-border dark:border-darkEditorial-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Around The Web
              </h2>
              <Link
                to="/external-news"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5"
              >
                View Global Wire <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {externalArticles.map((article) => (
                <ExternalNewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isLoading && articles.length === 0 && (
          <EmptyState
            title="No Published Stories Found"
            description="There are currently no published articles in this section. Please check back soon or switch categories."
            actionLabel="Reset Category Filter"
            onAction={() => setSelectedCategory('')}
          />
        )}

        {/* Editorial Newsletter Section Placeholder */}
        <section className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-2xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xs my-12">
          <div className="w-12 h-12 bg-editorial-accent/10 text-editorial-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold font-serif mb-2">Subscribe to NewsSphere Daily Digest</h3>
          <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted max-w-lg mx-auto mb-6 leading-relaxed">
            Get top breaking headlines, curated editor picks, and AI-summarized insights delivered straight to your email every morning.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Newsletter subscription functionality will be activated in Phase 8.');
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-editorial-accent"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-editorial-accent hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition shadow-xs shrink-0 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Subscribe Now
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
