import React from 'react';
import { Newspaper } from 'lucide-react';

export default function EmptyState({
  title = 'No content found',
  description = 'There are no items matching your request.',
  actionLabel,
  onAction,
  icon: Icon = Newspaper,
}) {
  return (
    <div className="p-12 text-center bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl max-w-md mx-auto my-8">
      <div className="w-12 h-12 bg-editorial-accent/10 text-editorial-accent rounded-full flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold font-serif mb-1">{title}</h3>
      <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-editorial-accent text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
