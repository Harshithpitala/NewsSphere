import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { articleService } from '../services/article.service';
import ArticleCard from '../components/article/ArticleCard';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import { User, Newspaper } from 'lucide-react';

export default function AuthorPage() {
  const { id } = useParams();

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['author-articles', id],
    queryFn: () => articleService.getArticles({ author: id, limit: 12 }),
  });

  const articles = articlesData?.data || [];
  const authorInfo = articles[0]?.author;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <div className="mb-8 p-8 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl flex items-center space-x-6">
        <div className="w-16 h-16 rounded-full bg-editorial-accent text-white font-serif font-bold text-2xl flex items-center justify-center uppercase shadow">
          {authorInfo?.name?.charAt(0) || 'A'}
        </div>
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-editorial-accent">Author Profile</span>
          <h1 className="text-2xl font-bold font-serif">{authorInfo?.name || 'Editorial Contributor'}</h1>
          <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted mt-1">
            {authorInfo?.bio || 'Senior Editorial Correspondent at NewsSphere.'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6 font-bold font-serif text-xl">
        <Newspaper className="w-5 h-5 text-editorial-accent" />
        <h2>Articles by {authorInfo?.name || 'Author'}</h2>
      </div>

      {isLoading && <ArticleSkeleton count={6} />}

      {!isLoading && articles.length === 0 && (
        <div className="p-12 text-center bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl">
          <p className="text-xs text-editorial-muted">No published articles found for this author.</p>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
