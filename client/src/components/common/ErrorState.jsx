import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while fetching information.',
  onRetry,
}) {
  return (
    <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-red-600 dark:text-red-400 max-w-md mx-auto my-8">
      <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="font-bold text-base font-serif mb-1">{title}</h3>
      <p className="text-xs opacity-90 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try Again
        </button>
      )}
    </div>
  );
}
