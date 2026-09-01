import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Flame, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import OptimizedImage from '../common/OptimizedImage';

export default function ArticleCard({ article, variant = 'standard' }) {
  if (!article) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (variant === 'hero') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="relative group overflow-hidden rounded-xl bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border shadow-md hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0"
      >
        <div className="lg:col-span-7 aspect-[16/9] lg:aspect-auto overflow-hidden relative min-h-[300px]">
          <OptimizedImage
            src={article.coverImage}
            alt={article.title}
            responsiveUrls={article.responsiveUrls}
            priority={true}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {article.isBreaking && (
            <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow flex items-center gap-1 z-10">
              <Zap className="w-3 h-3 fill-current" /> Breaking
            </span>
          )}
        </div>

        <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Link
                to={`/category/${article.category?.slug}`}
                className="text-xs font-bold uppercase tracking-wider text-editorial-accent hover:underline"
              >
                {article.category?.name || 'General'}
              </Link>
              <span className="text-editorial-muted text-xs">•</span>
              <span className="text-xs text-editorial-muted dark:text-darkEditorial-muted flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" /> {article.readingTimeMinutes || 3} min read
              </span>
            </div>

            <Link to={`/article/${article.slug}`}>
              <h2 className="text-2xl lg:text-3xl font-bold font-serif leading-tight group-hover:text-editorial-accent transition mb-3">
                {article.title}
              </h2>
            </Link>

            <p className="text-sm text-editorial-muted dark:text-darkEditorial-muted line-clamp-3 mb-6 leading-relaxed">
              {article.subtitle || article.summary}
            </p>
          </div>

          <div className="pt-4 border-t border-editorial-border dark:border-darkEditorial-border flex items-center justify-between">
            <Link
              to={`/author/${article.author?._id}`}
              className="flex items-center space-x-2 text-xs font-medium hover:text-editorial-accent transition"
            >
              <div className="w-7 h-7 rounded-full bg-editorial-accent text-white font-bold flex items-center justify-center text-xs uppercase shadow-sm">
                {article.author?.name?.charAt(0) || 'A'}
              </div>
              <span>{article.author?.name}</span>
            </Link>

            <span className="text-xs text-editorial-muted dark:text-darkEditorial-muted font-mono">
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="group flex items-start space-x-4 py-3 border-b border-editorial-border dark:border-darkEditorial-border last:border-none">
        <div className="w-20 h-20 shrink-0 overflow-hidden rounded-lg bg-editorial-bg dark:bg-darkEditorial-bg relative">
          <OptimizedImage
            src={article.coverImage}
            alt={article.title}
            responsiveUrls={article.responsiveUrls}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/category/${article.category?.slug}`}
            className="text-[10px] font-bold uppercase tracking-wider text-editorial-accent hover:underline block mb-1"
          >
            {article.category?.name || 'General'}
          </Link>
          <Link to={`/article/${article.slug}`}>
            <h4 className="text-sm font-bold font-serif leading-snug group-hover:text-editorial-accent transition line-clamp-2 mb-1">
              {article.title}
            </h4>
          </Link>
          <span className="text-[10px] text-editorial-muted dark:text-darkEditorial-muted font-mono">
            {formatDate(article.publishedAt || article.createdAt)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col justify-between bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div>
        <div className="aspect-[16/10] overflow-hidden relative bg-editorial-bg dark:bg-darkEditorial-bg">
          <OptimizedImage
            src={article.coverImage}
            alt={article.title}
            responsiveUrls={article.responsiveUrls}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {article.isBreaking && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow flex items-center gap-1 z-10">
              <Zap className="w-2.5 h-2.5 fill-current" /> Breaking
            </span>
          )}
          {article.isFeatured && !article.isBreaking && (
            <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow flex items-center gap-1 z-10">
              <Flame className="w-2.5 h-2.5 fill-current" /> Featured
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center space-x-2 mb-2">
            <Link
              to={`/category/${article.category?.slug}`}
              className="text-[11px] font-bold uppercase tracking-wider text-editorial-accent hover:underline"
            >
              {article.category?.name || 'General'}
            </Link>
            <span className="text-editorial-muted text-xs">•</span>
            <span className="text-[11px] text-editorial-muted dark:text-darkEditorial-muted flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" /> {article.readingTimeMinutes || 3} min
            </span>
          </div>

          <Link to={`/article/${article.slug}`}>
            <h3 className="text-lg font-bold font-serif leading-snug group-hover:text-editorial-accent transition line-clamp-2 mb-2">
              {article.title}
            </h3>
          </Link>

          <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted line-clamp-2 mb-4 leading-relaxed">
            {article.subtitle || article.summary}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-editorial-border dark:border-darkEditorial-border flex items-center justify-between text-xs text-editorial-muted dark:text-darkEditorial-muted">
        <Link
          to={`/author/${article.author?._id}`}
          className="font-medium hover:text-editorial-accent transition truncate max-w-[120px]"
        >
          By {article.author?.name || 'Editorial'}
        </Link>
        <span className="flex items-center gap-2 font-mono text-[11px]">
          <span>{formatDate(article.publishedAt || article.createdAt)}</span>
          {article.viewsCount > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {article.viewsCount}
            </span>
          )}
        </span>
      </div>
    </motion.div>
  );
}
