import React from 'react';

export function Skeleton({ className = '', variant = 'text' }) {
  const baseClasses = 'animate-pulse bg-black/5 dark:bg-white/10 rounded-lg';

  if (variant === 'circular') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }

  if (variant === 'rectangular') {
    return <div className={`${baseClasses} ${className}`} />;
  }

  return <div className={`${baseClasses} h-4 w-full ${className}`} />;
}

export function ArticleCardSkeleton({ variant = 'standard' }) {
  if (variant === 'hero') {
    return (
      <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
        <div className="lg:col-span-7 aspect-video bg-black/5 dark:bg-white/10 rounded-xl" />
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-5/6 h-4" />
          </div>
          <div className="flex items-center space-x-3 pt-4 border-t border-editorial-border">
            <Skeleton variant="circular" className="w-8 h-8" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-4 py-3 border-b border-editorial-border animate-pulse">
        <div className="w-20 h-20 bg-black/5 dark:bg-white/10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-2/3 h-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-black/5 dark:bg-white/10" />
      <div className="p-5 space-y-3">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-full h-5" />
        <Skeleton className="w-4/5 h-5" />
        <Skeleton className="w-full h-3" />
        <div className="pt-3 border-t border-editorial-border flex justify-between items-center">
          <Skeleton className="w-24 h-3" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
    </div>
  );
}

export function ArticleDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="space-y-4 text-center">
        <Skeleton className="w-32 h-4 mx-auto" />
        <Skeleton className="w-full h-10 mx-auto" />
        <Skeleton className="w-3/4 h-10 mx-auto" />
        <div className="flex items-center justify-center space-x-4 pt-2">
          <Skeleton variant="circular" className="w-10 h-10" />
          <Skeleton className="w-40 h-4" />
        </div>
      </div>
      <div className="aspect-[16/9] bg-black/5 dark:bg-white/10 rounded-2xl w-full" />
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-11/12 h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-4/5 h-4" />
      </div>
    </div>
  );
}
