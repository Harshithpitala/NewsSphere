import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import ErrorState from '../../components/common/ErrorState';
import { FolderTree, Plus, Trash2, AlertCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminService.getCategories(),
  });

  const categories = categoriesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => adminService.createCategory(data),
    onSuccess: () => {
      setName('');
      setDescription('');
      setErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteCategory(id),
    onSuccess: () => {
      setErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || err.message);
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), description: description.trim() });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">Taxonomy Control</span>
        <h1 className="text-3xl font-bold font-serif">Category Management</h1>
        <p className="text-xs text-editorial-muted mt-1">Manage editorial news categories and taxonomy structures</p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl space-y-4 shadow-xs self-start">
          <h3 className="text-base font-bold font-serif flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-600" /> Create New Category
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Technology"
                required
                className="w-full p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Brief category description..."
                className="w-full p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="w-full py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition disabled:opacity-40"
            >
              Save Category
            </button>
          </form>
        </div>

        {/* Category List Table */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading && <ArticleSkeleton count={4} />}
          {error && <ErrorState message={error.message} onRetry={refetch} />}

          {!isLoading && !error && (
            <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-editorial-bg dark:bg-darkEditorial-bg border-b border-editorial-border text-editorial-muted uppercase font-mono font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Category</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Articles Count</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                    {categories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                        <td className="p-4 font-bold font-serif">{cat.name}</td>
                        <td className="p-4 font-mono text-[11px] text-editorial-muted">{cat.slug}</td>
                        <td className="p-4 font-mono font-bold">{cat.articleCount || 0} story(ies)</td>
                        <td className="p-4 text-right">
                          <button
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(cat._id)}
                            className="p-1.5 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 inline-block"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
