import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { categoryService } from '../services/category.service';
import { articleService } from '../services/article.service';
import ArticleCard from '../components/article/ArticleCard';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import { Compass, TrendingUp, Sparkles, FolderTree, ArrowRight } from 'lucide-react';

export default function DiscoverPage() {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  const categories = categoriesData?.data || [];

  const { data: trendingData, isLoading } = useQuery({
    queryKey: ['trending-articles-discover'],
    queryFn: () => articleService.getTrendingArticles({ limit: 6 }),
  });
  const trendingArticles = trendingData?.data || [];

  if (isLoading) return <ArticleSkeleton count={4} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">Content Hub</span>
          <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
            <Compass className="w-8 h-8 text-purple-600 dark:text-purple-400" /> Discover NewsSphere
          </h1>
          <p className="text-xs text-editorial-muted mt-1">Explore popular topics, trending headlines, and news categories</p>
        </div>

        <Link
          to="/onboarding/interests"
          className="px-4 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-xs hover:bg-purple-700 transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Sparkles className="w-4 h-4" /> Personalize Your Feed
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-serif flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-purple-600" /> Popular News Categories
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl text-center space-y-2 hover:border-purple-600 hover:scale-[1.02] transition"
            >
              <span className="text-2xl block">{cat.icon || '📰'}</span>
              <span className="font-bold text-xs font-serif block truncate">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Stories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-serif flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-500" /> Trending Across NewsSphere
          </h3>
          <Link to="/trending" className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1">
            View All Trending <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingArticles.map((art) => (
            <ArticleCard key={art._id} article={art} />
          ))}
        </div>
      </div>
    </div>
  );
}
