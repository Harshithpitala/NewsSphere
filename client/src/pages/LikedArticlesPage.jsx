import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reactionService } from '../services/reaction.service';
import ArticleCard from '../components/article/ArticleCard';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { Heart } from 'lucide-react';

export default function LikedArticlesPage() {
  const [page, setPage] = useState(1);

  const { data: likedData, isLoading, error, refetch } = useQuery({
    queryKey: ['user-liked-articles', page],
    queryFn: () => reactionService.getUserLikedArticles({ page, limit: 12 }),
  });

  const articles = likedData?.data || [];
  const pagination = likedData?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <div className="mb-8 pb-6 border-b border-editorial-border dark:border-darkEditorial-border flex items-center space-x-3">
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-500">Liked Content</span>
          <h1 className="text-3xl font-bold font-serif">Articles You Liked</h1>
          <p className="text-xs text-editorial-muted mt-1">Stories you have reacted to or found insightful</p>
        </div>
      </div>

      {isLoading && <ArticleSkeleton count={6} />}

      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && articles.length === 0 && (
        <EmptyState
          title="No Liked Articles Yet"
          description="React to any article using Like, Love, or Insightful to see them here."
        />
      )}

      {!isLoading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <ArticleCard key={art._id} article={art} />
          ))}
        </div>
      )}
    </div>
  );
}
