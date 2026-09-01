import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService } from '../../services/cms.service';
import ArticleEditorForm from '../../components/cms/ArticleEditorForm';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import ErrorState from '../../components/common/ErrorState';
import { ArrowLeft, FileEdit } from 'lucide-react';

export default function JournalistArticleEditorPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch article if editing existing story
  const { data: articleData, isLoading, error, refetch } = useQuery({
    queryKey: ['journalist-article-edit', id],
    queryFn: () => cmsService.getArticleById(id).then((res) => res.data),
    enabled: isEdit,
  });

  // Create Article Mutation
  const createMutation = useMutation({
    mutationFn: (data) => cmsService.createArticle(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['journalist-articles'] });
      queryClient.invalidateQueries({ queryKey: ['journalist-dashboard'] });
      navigate('/journalist/articles');
    },
  });

  // Update Article Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => cmsService.updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalist-articles'] });
      queryClient.invalidateQueries({ queryKey: ['journalist-dashboard'] });
      navigate('/journalist/articles');
    },
  });

  // Autosave handler callback
  const handleAutosave = async (data) => {
    if (isEdit) {
      await cmsService.updateArticle(id, { ...data, submitForReview: false });
    }
  };

  const handleSubmit = (formData) => {
    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isEdit && isLoading) return <ArticleSkeleton count={3} />;
  if (isEdit && error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-editorial-border dark:border-darkEditorial-border">
        <Link
          to="/journalist/articles"
          className="p-2 rounded-lg border border-editorial-border dark:border-darkEditorial-border hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-editorial-accent">Newsroom Composer</span>
          <h1 className="text-2xl font-bold font-serif">
            {isEdit ? 'Edit Article Story' : 'Draft New Article Story'}
          </h1>
        </div>
      </div>

      {(createMutation.error || updateMutation.error) && (
        <div className="p-4 bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl">
          {(createMutation.error || updateMutation.error)?.message}
        </div>
      )}

      <ArticleEditorForm
        initialData={articleData || {}}
        onSubmit={handleSubmit}
        onAutosave={handleAutosave}
        isPending={createMutation.isPending || updateMutation.isPending}
        isEdit={isEdit}
      />
    </div>
  );
}
