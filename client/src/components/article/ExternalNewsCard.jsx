import React from 'react';
import { ExternalLink, Globe, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExternalNewsCard({ article }) {
  if (!article) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col justify-between bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
    >
      <div>
        {/* Cover Image with External Badge */}
        <div className="aspect-[16/10] overflow-hidden relative bg-editorial-bg dark:bg-darkEditorial-bg">
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <span className="absolute top-3 left-3 bg-brand-600 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded shadow flex items-center gap-1">
            <Globe className="w-2.5 h-2.5" /> Around The Web
          </span>
        </div>

        <div className="p-5">
          {/* Source Attribution */}
          <div className="flex items-center justify-between text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">
            <span>{article.sourceName}</span>
            <span className="text-editorial-muted font-normal flex items-center gap-1 font-mono text-[10px]">
              <Clock className="w-3 h-3" /> {formatDate(article.publishedAt)}
            </span>
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group-hover:text-editorial-accent transition"
          >
            <h3 className="text-base font-bold font-serif leading-snug line-clamp-2 mb-2">
              {article.title}
            </h3>
          </a>

          <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted line-clamp-3 mb-4 leading-relaxed">
            {article.description}
          </p>
        </div>
      </div>

      {/* External Original Link */}
      <div className="px-5 pb-5 pt-3 border-t border-editorial-border dark:border-darkEditorial-border flex items-center justify-between text-xs">
        <span className="text-[11px] text-editorial-muted truncate max-w-[140px]">
          By {article.author}
        </span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-editorial-accent hover:underline shrink-0"
        >
          Read Original <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}
