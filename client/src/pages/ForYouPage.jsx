import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { recommendationClientService } from '../services/recommendation.service';
import ArticleCard from '../components/article/ArticleCard';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import ErrorState from '../components/common/ErrorState';
import { Sparkles, SlidersHorizontal, EyeOff, Compass, Settings, CheckCircle2 } from 'lucide-react';

export default function ForYouPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const queryClient = useQueryClient();

  const { data: recData, isLoading, error, refetch } = useQuery({
    queryKey: ['recommendations', selectedCategory],
    queryFn: () => recommendationClientService.getRecommendations({ category: selectedCategory }),
  });

  const dismissMutation = useMutation({
    mutationFn: (articleId) => recommendationClientService.dismissRecommendation(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const articles = recData?.data || [];
  const isPersonalized = recData?.isPersonalized ?? false;
  const explanation = recData?.explanation || 'Personalized news feed';

  if (isLoading) return <ArticleSkeleton count={6} />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">
            Tailored Reading Feed
          </span>
          <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" /> Recommended For You
          </h1>
          <p className="text-xs text-editorial-muted mt-1 font-mono">{explanation}</p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <Link
            to="/settings/interests"
            className="px-3.5 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl text-xs font-bold hover:border-purple-600 transition flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-purple-600" /> Preferences
          </Link>

          <Link
            to="/discover"
            className="px-3.5 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl text-xs font-bold hover:border-purple-600 transition flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-purple-600" /> Discover All
          </Link>
        </div>
      </div>

      {/* Explanation Notice Badge */}
      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="font-medium text-editorial-text dark:text-darkEditorial-text">
            {isPersonalized
              ? 'These stories are ranked based on your recent bookmarks, reading history, and category affinities.'
              : 'Showing popular trending news. Read stories or pick interest topics to personalize your feed!'}
          </span>
        </div>
        {!isPersonalized && (
          <Link
            to="/onboarding/interests"
            className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-lg text-xs hover:bg-purple-700 transition shrink-0"
          >
            Select Interests
          </Link>
        )}
      </div>

      {/* Feed Cards Grid */}
      {articles.length === 0 ? (
        <div className="p-12 text-center bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-3">
          <Compass className="w-10 h-10 text-editorial-muted mx-auto" />
          <h3 className="text-base font-bold font-serif">No recommendations match this filter</h3>
          <p className="text-xs text-editorial-muted">Explore trending articles or update your interest preferences.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div key={art._id} className="relative group flex flex-col">
              {/* Human-readable Reason Badge */}
              <div className="mb-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 flex items-center justify-between">
                <span>💡 {art.recommendationReason || 'Recommended Story'}</span>
                <button
                  onClick={() => dismissMutation.mutate(art._id)}
                  title="Not interested (Dismiss)"
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition"
                >
                  <EyeOff className="w-3 h-3" />
                </button>
              </div>

              <ArticleCard article={art} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
