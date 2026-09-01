import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { articleService } from '../services/article.service';
import { historyService } from '../services/history.service';
import { useAuthStore } from '../store/useAuthStore';
import { socket } from '../services/socket.service';
import ArticleContentSanitizer from '../components/article/ArticleContentSanitizer';
import ArticleCard from '../components/article/ArticleCard';
import ReadingProgressBar from '../components/article/ReadingProgressBar';
import ArticleActions from '../components/article/ArticleActions';
import CommentSection from '../components/article/CommentSection';
import ErrorState from '../components/common/ErrorState';
import AIReaderWidget from '../components/article/AIReaderWidget';
import ErrorBoundary from '../components/common/ErrorBoundary';
import OptimizedImage from '../components/common/OptimizedImage';
import { ArticleDetailSkeleton } from '../components/common/Skeleton';
import { Clock, Eye, Tag, Calendar, Sparkles } from 'lucide-react';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  const startTimeRef = useRef(Date.now());
  const queryClient = useQueryClient();

  // Fetch Article Detail by Slug
  const { data: articleData, isLoading, error, refetch } = useQuery({
    queryKey: ['article-detail', slug],
    queryFn: () => articleService.getArticleBySlug(slug),
    enabled: !!slug,
  });
  const article = articleData?.data;

  // Fetch Related Articles
  const { data: relatedData } = useQuery({
    queryKey: ['article-related', article?._id],
    queryFn: () => articleService.getRelatedArticles(article._id),
    enabled: !!article?._id,
  });
  const relatedArticles = relatedData?.data || [];

  // Socket.IO Room Joining & Real-time Comments/Reactions Listener
  useEffect(() => {
    if (!article?._id) return;

    socket.emit('join_article_room', article._id);

    const handleCommentAdded = (data) => {
      if (data.articleId === article._id) {
        queryClient.invalidateQueries({ queryKey: ['comments', article._id] });
      }
    };

    const handleReactionUpdated = (data) => {
      if (data.articleId === article._id) {
        queryClient.invalidateQueries({ queryKey: ['reactions', article._id] });
      }
    };

    socket.on('comment_added', handleCommentAdded);
    socket.on('reaction_updated', handleReactionUpdated);

    return () => {
      socket.emit('leave_article_room', article._id);
      socket.off('comment_added', handleCommentAdded);
      socket.off('reaction_updated', handleReactionUpdated);
    };
  }, [article?._id, queryClient]);

  // Track Reading Progress and Time Spent
  useEffect(() => {
    if (!isAuthenticated || !article?._id) return;

    startTimeRef.current = Date.now();

    const trackHistory = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.min(100, Math.round((currentScroll / scrollHeight) * 100)) : 0;
      const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      if (timeSpentSeconds > 3) {
        historyService.trackProgress({
          articleId: article._id,
          progressPercentage: progress,
          readingTimeSeconds: timeSpentSeconds,
        });
      }
    };

    const interval = setInterval(trackHistory, 15000); // Heartbeat every 15s

    return () => {
      clearInterval(interval);
      trackHistory(); // Track on unmount
    };
  }, [isAuthenticated, article?._id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return <ArticleDetailSkeleton />;
  }

  if (error || !article) {
    return <ErrorState title="Article Not Found" message="The requested article does not exist or may have been removed." onRetry={refetch} />;
  }

  const categoryName = article.category?.name || (typeof article.category === 'string' ? article.category : 'General');
  const categorySlug = article.category?.slug || '';
  const authorName = article.author?.name || 'NewsSphere Editorial';
  const authorRole = article.author?.role || 'Staff Writer';

  return (
    <ErrorBoundary>
      <article className="min-h-screen pb-16">
        {/* Top Reading Progress Bar */}
        <ReadingProgressBar />

        {/* Article Header & Breadcrumbs */}
        <header className="border-b border-editorial-border dark:border-darkEditorial-border bg-editorial-card dark:bg-darkEditorial-card py-10 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 text-xs font-medium text-editorial-muted dark:text-darkEditorial-muted mb-4">
              <Link to="/" className="hover:underline">Home</Link>
              <span>/</span>
              <Link to={`/category/${categorySlug}`} className="text-editorial-accent font-bold uppercase tracking-wider hover:underline">
                {categoryName}
              </Link>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight mb-4">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-lg text-editorial-muted dark:text-darkEditorial-muted leading-relaxed mb-6 font-sans">
                {article.subtitle}
              </p>
            )}

            {/* Author Card & Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-editorial-border dark:border-darkEditorial-border">
              <Link
                to={`/author/${article.author?._id || ''}`}
                className="flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-editorial-accent text-white font-bold flex items-center justify-center text-sm uppercase shadow">
                  {authorName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold group-hover:text-editorial-accent transition">{authorName}</h4>
                  <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted">{authorRole}</p>
                </div>
              </Link>

              <div className="flex items-center space-x-4 text-xs text-editorial-muted dark:text-darkEditorial-muted font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(article.publishedAt || article.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {article.readingTimeMinutes || 3} min read
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {article.viewsCount || 1} views
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Layout */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
          {/* Cover Image */}
          {article.coverImage && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-md">
              <OptimizedImage
                src={article.coverImage}
                alt={article.title}
                responsiveUrls={article.responsiveUrls}
                priority={true}
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* AI Key Points Section */}
          {article.aiMetadata?.aiKeyPoints && article.aiMetadata.aiKeyPoints.length > 0 && (
            <div className="mb-8 p-6 bg-brand-50 dark:bg-brand-900/20 border border-brand-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                <Sparkles className="w-4 h-4" /> Key Takeaways
              </div>
              <ul className="space-y-2 text-sm text-editorial-text dark:text-darkEditorial-text">
                {article.aiMetadata.aiKeyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-500 font-bold">•</span>
                    <span>{typeof pt === 'string' ? pt : JSON.stringify(pt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Reader Tools Widget */}
          <AIReaderWidget articleId={article._id} />

          {/* Article Body Content */}
          <div className="py-4">
            <ArticleContentSanitizer content={article.content} />
          </div>

          {/* Tags */}
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="mt-8 pt-4 flex items-center flex-wrap gap-2">
              <Tag className="w-3.5 h-3.5 text-editorial-muted" />
              {article.tags.map((t, idx) => {
                const tagName = typeof t === 'string' ? t : t?.name || t?._id || idx;
                const tagKey = typeof t === 'string' ? t : t?._id || idx;
                return (
                  <span
                    key={tagKey}
                    className="text-xs px-2.5 py-1 rounded-full bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border font-medium"
                  >
                    #{tagName}
                  </span>
                );
              })}
            </div>
          )}

          {/* Article Engagement Actions Bar (Bookmarks, Reactions, Share) */}
          <ArticleActions article={article} />

          {/* Comment Section & Discussion */}
          <CommentSection articleId={article._id} />

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <section className="mt-16 pt-8 border-t-2 border-editorial-border dark:border-darkEditorial-border">
              <h3 className="text-xl font-bold font-serif mb-6">Related Stories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((rel) => (
                  <ArticleCard key={rel._id} article={rel} />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </ErrorBoundary>
  );
}
