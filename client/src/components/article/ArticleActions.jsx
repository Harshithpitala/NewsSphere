import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { bookmarkService } from '../../services/bookmark.service';
import { reactionService } from '../../services/reaction.service';
import { Bookmark, Heart, Lightbulb, ThumbsUp, Share2 } from 'lucide-react';

export default function ArticleActions({ article }) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch Bookmark State
  const { data: bookmarkData } = useQuery({
    queryKey: ['bookmark-check', article._id],
    queryFn: () => bookmarkService.checkBookmark(article._id),
    enabled: isAuthenticated && !!article._id,
  });
  const isBookmarked = bookmarkData?.isBookmarked || false;

  // Fetch Reaction Stats
  const { data: reactionData } = useQuery({
    queryKey: ['article-reactions', article._id],
    queryFn: () => reactionService.getArticleReactions(article._id),
    enabled: !!article._id,
  });
  const stats = reactionData?.data || {
    totalReactions: article.likesCount || 0,
    countsByType: { like: article.likesCount || 0, love: 0, insightful: 0 },
    userReaction: null,
  };

  const userReaction = stats.userReaction ? stats.userReaction.toLowerCase() : null;

  const counts = stats.countsByType || {};
  const likeCount = counts.like || counts.LIKE || 0;
  const loveCount = counts.love || counts.LOVE || 0;
  const insightfulCount = counts.insightful || counts.INSIGHTFUL || 0;

  // Toggle Bookmark Mutation
  const bookmarkMutation = useMutation({
    mutationFn: () => (isBookmarked ? bookmarkService.removeBookmark(article._id) : bookmarkService.addBookmark(article._id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmark-check', article._id] });
      queryClient.invalidateQueries({ queryKey: ['article-detail'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks'] });
    },
  });

  // Toggle Reaction Mutation
  const reactionMutation = useMutation({
    mutationFn: (type) => reactionService.toggleReaction(article._id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-reactions', article._id] });
      queryClient.invalidateQueries({ queryKey: ['article-detail'] });
      queryClient.invalidateQueries({ queryKey: ['user-liked-articles'] });
    },
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article URL copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl shadow-xs my-6">
      {/* Reactions Controls */}
      <div className="flex items-center space-x-3 text-xs">
        <span className="font-bold font-serif text-editorial-muted">Reactions:</span>

        {/* Like Button */}
        <button
          disabled={!isAuthenticated || reactionMutation.isPending}
          onClick={() => reactionMutation.mutate('like')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
            userReaction === 'like'
              ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
              : 'border-editorial-border dark:border-darkEditorial-border hover:border-editorial-accent'
          }`}
          title={userReaction === 'like' ? 'Remove Like' : 'Like'}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>{likeCount}</span>
        </button>

        {/* Love Button */}
        <button
          disabled={!isAuthenticated || reactionMutation.isPending}
          onClick={() => reactionMutation.mutate('love')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
            userReaction === 'love'
              ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs'
              : 'border-editorial-border dark:border-darkEditorial-border hover:border-editorial-accent'
          }`}
          title={userReaction === 'love' ? 'Remove Love' : 'Love'}
        >
          <Heart className={`w-3.5 h-3.5 ${userReaction === 'love' ? 'fill-current' : ''}`} />
          <span>{loveCount}</span>
        </button>

        {/* Insightful Button */}
        <button
          disabled={!isAuthenticated || reactionMutation.isPending}
          onClick={() => reactionMutation.mutate('insightful')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
            userReaction === 'insightful'
              ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-xs'
              : 'border-editorial-border dark:border-darkEditorial-border hover:border-editorial-accent'
          }`}
          title={userReaction === 'insightful' ? 'Remove Insightful' : 'Insightful'}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{insightfulCount}</span>
        </button>
      </div>

      {/* Bookmark & Share Controls */}
      <div className="flex items-center space-x-2 text-xs">
        <button
          disabled={!isAuthenticated || bookmarkMutation.isPending}
          onClick={() => bookmarkMutation.mutate()}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
            isBookmarked
              ? 'bg-editorial-accent text-white border-editorial-accent font-bold shadow-xs'
              : 'border-editorial-border dark:border-darkEditorial-border hover:border-editorial-accent'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          <span>{isBookmarked ? 'Bookmarked' : 'Save Story'}</span>
        </button>

        <button
          onClick={handleShare}
          className="px-3.5 py-1.5 rounded-lg border border-editorial-border dark:border-darkEditorial-border hover:border-editorial-accent text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>
    </div>
  );
}
