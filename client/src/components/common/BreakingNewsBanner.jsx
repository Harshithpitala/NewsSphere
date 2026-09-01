import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { socket } from '../../services/socket.service';
import { Zap, X, ArrowRight, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BreakingNewsBanner() {
  const [breakingArticle, setBreakingArticle] = useState(null);

  useEffect(() => {
    const handleBreakingNews = (data) => {
      console.log('[Socket.IO] 🔴 Live Breaking News Event received:', data);
      setBreakingArticle(data);
    };

    socket.on('breaking_news_published', handleBreakingNews);

    return () => {
      socket.off('breaking_news_published', handleBreakingNews);
    };
  }, []);

  if (!breakingArticle) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-red-600 text-white py-2.5 px-4 sticky top-0 z-50 shadow-md border-b border-red-700"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center space-x-3 overflow-hidden">
            <span className="bg-black/30 px-2.5 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 animate-pulse">
              <Radio className="w-3.5 h-3.5 text-white" /> 🔴 LIVE BREAKING NEWS
            </span>
            <Link
              to={`/article/${breakingArticle.slug}`}
              onClick={() => setBreakingArticle(null)}
              className="font-serif font-bold text-sm hover:underline truncate"
            >
              {breakingArticle.title}
            </Link>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to={`/article/${breakingArticle.slug}`}
              onClick={() => setBreakingArticle(null)}
              className="px-3 py-1 bg-white text-red-700 font-bold rounded-lg hover:bg-gray-100 transition hidden sm:flex items-center gap-1 text-[11px]"
            >
              Read Now <ArrowRight className="w-3 h-3" />
            </Link>

            <button
              onClick={() => setBreakingArticle(null)}
              className="p-1 hover:bg-black/20 rounded transition"
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
