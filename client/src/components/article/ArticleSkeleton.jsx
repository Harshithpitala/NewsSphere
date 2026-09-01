import React from 'react';

export default function ArticleSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl overflow-hidden animate-pulse"
        >
          <div className="aspect-[16/10] bg-black/10 dark:bg-white/10" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/4" />
            <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-full" />
            <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-5/6" />
          </div>
          <div className="p-4 border-t border-editorial-border dark:border-darkEditorial-border flex justify-between">
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/3" />
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
