import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { commentService } from '../services/comment.service';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { MessageSquare, Trash2, Edit2 } from 'lucide-react';

export default function MyCommentsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: commentsData, isLoading, error, refetch } = useQuery({
    queryKey: ['user-comments', page],
    queryFn: () => commentService.getUserComments({ page, limit: 12 }),
  });

  const comments = commentsData?.data || [];
  const pagination = commentsData?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (commentId) => commentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-comments'] });
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <div className="mb-8 pb-6 border-b border-editorial-border dark:border-darkEditorial-border flex items-center space-x-3">
        <div className="p-3 bg-editorial-accent/10 text-editorial-accent rounded-xl">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-editorial-accent">Community Discussions</span>
          <h1 className="text-3xl font-bold font-serif">My Comments</h1>
          <p className="text-xs text-editorial-muted mt-1">Review and manage your comments across NewsSphere stories</p>
        </div>
      </div>

      {isLoading && <ArticleSkeleton count={4} />}

      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && comments.length === 0 && (
        <EmptyState
          title="No Comments Posted Yet"
          description="Join the discussion on any story to view your comments here."
        />
      )}

      {!isLoading && !error && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => {
            const art = comment.article;
            return (
              <div
                key={comment._id}
                className="p-5 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-3 shadow-xs"
              >
                {art && (
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-editorial-border dark:border-darkEditorial-border">
                    <Link to={`/article/${art.slug}`} className="font-bold font-serif hover:text-editorial-accent transition line-clamp-1">
                      Story: {art.title}
                    </Link>
                    <span className="text-[11px] text-editorial-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                )}

                <p className="text-xs text-editorial-text dark:text-darkEditorial-text leading-relaxed">
                  "{comment.content}"
                </p>

                <div className="flex items-center justify-between pt-2 text-xs text-editorial-muted font-mono">
                  <span>Likes: {comment.likesCount || 0}</span>
                  <button
                    onClick={() => deleteMutation.mutate(comment._id)}
                    className="flex items-center gap-1 text-red-500 hover:underline transition font-sans font-semibold text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Comment
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
