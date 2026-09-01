import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import ErrorState from '../../components/common/ErrorState';
import { Tags, Plus } from 'lucide-react';

export default function AdminTagsPage() {
  const [tagName, setTagName] = useState('');
  const queryClient = useQueryClient();

  const { data: tagsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: () => adminService.getTags(),
  });

  const tags = tagsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (name) => adminService.createTag({ name }),
    onSuccess: () => {
      setTagName('');
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    createMutation.mutate(tagName.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">Tag System</span>
        <h1 className="text-3xl font-bold font-serif">Tags & Topics</h1>
        <p className="text-xs text-editorial-muted mt-1">Manage news topics and search tags</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl space-y-4 shadow-xs self-start">
          <h3 className="text-base font-bold font-serif flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-600" /> Add New Tag
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Tag Label *
              </label>
              <input
                type="text"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                required
                className="w-full p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending || !tagName.trim()}
              className="w-full py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition disabled:opacity-40"
            >
              Add Tag
            </button>
          </form>
        </div>

        {/* Tags Cloud Grid */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading && <ArticleSkeleton count={3} />}
          {error && <ErrorState message={error.message} onRetry={refetch} />}

          {!isLoading && !error && (
            <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-editorial-muted">All System Tags</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t._id}
                    className="px-3 py-1.5 rounded-lg bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Tags className="w-3 h-3 text-purple-600" /> #{t.name}
                    <span className="text-[10px] font-mono text-editorial-muted">({t.articleCount || 0})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
