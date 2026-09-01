import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center p-8 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl shadow-sm">
        <div className="w-16 h-16 bg-editorial-accent/10 text-editorial-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <Newspaper className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-serif mb-2">404</h1>
        <h2 className="text-lg font-bold font-serif mb-2">Page Not Found</h2>
        <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted mb-6">
          The news story or section you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-editorial-accent text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
