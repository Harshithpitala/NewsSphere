import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { articleService } from '../services/article.service';
import { categoryService } from '../services/category.service';
import ArticleCard from '../components/article/ArticleCard';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import { Folder } from 'lucide-react';

export default function CategoryNewsPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(1);

  const { data: categoryData } = useQuery({
    queryKey: ['category-detail', slug],
    queryFn: () => categoryService.getCategoryBySlug(slug),
  });
  const category = categoryData?.data;

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['category-articles', slug, page],
    queryFn: () => articleService.getArticles({ category: slug, page, limit: 12 }),
  });

  const articles = articlesData?.data || [];
  const pagination = articlesData?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <div className="mb-8 pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-editorial-accent/10 text-editorial-accent rounded-xl">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-editorial-accent">Category</span>
            <h1 className="text-3xl font-bold font-serif">{category?.name || slug}</h1>
          </div>
        </div>
        {category?.description && (
          <p className="text-sm text-editorial-muted dark:text-darkEditorial-muted mt-2 max-w-2xl">
            {category.description}
          </p>
        )}
      </div>

      {isLoading && <ArticleSkeleton count={6} />}

      {!isLoading && articles.length === 0 && (
        <div className="p-12 text-center bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl">
          <h3 className="font-bold font-serif text-lg mb-1">No articles found</h3>
          <p className="text-xs text-editorial-muted">No published stories available in this category yet.</p>
        </div>
      )}

      {!isLoading && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12 pt-6 flex items-center justify-between border-t border-editorial-border dark:border-darkEditorial-border">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold disabled:opacity-40 hover:border-editorial-accent transition"
          >
            Previous
          </button>
          <span className="text-xs text-editorial-muted dark:text-darkEditorial-muted font-mono">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold disabled:opacity-40 hover:border-editorial-accent transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
