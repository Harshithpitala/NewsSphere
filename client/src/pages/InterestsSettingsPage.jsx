import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recommendationClientService } from '../services/recommendation.service';
import ArticleSkeleton from '../components/article/ArticleSkeleton';
import ErrorState from '../components/common/ErrorState';
import { SlidersHorizontal, CheckCircle2, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export default function InterestsSettingsPage() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [personalizedEnabled, setPersonalizedEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: prefData, isLoading, error, refetch } = useQuery({
    queryKey: ['recommendation-preferences'],
    queryFn: () => recommendationClientService.getUserPreferences(),
  });

  const categories = prefData?.data?.availableCategories || [];
  const existingInterests = prefData?.data?.interests || [];
  const existingToggle = prefData?.data?.personalizedFeedEnabled ?? true;

  useEffect(() => {
    if (existingInterests.length > 0) {
      setSelectedIds(existingInterests.map((i) => i._id || i));
    }
    setPersonalizedEnabled(existingToggle);
  }, [existingInterests.length, existingToggle]);

  const updateMutation = useMutation({
    mutationFn: (data) => recommendationClientService.updateUserPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['recommendation-preferences'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  const toggleCategory = (catId) => {
    if (selectedIds.includes(catId)) {
      setSelectedIds(selectedIds.filter((id) => id !== catId));
    } else {
      setSelectedIds([...selectedIds, catId]);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({
      interestIds: selectedIds,
      personalizedFeedEnabled: personalizedEnabled,
    });
  };

  if (isLoading) return <ArticleSkeleton count={3} />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">User Settings</span>
          <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
            <SlidersHorizontal className="w-8 h-8 text-purple-600 dark:text-purple-400" /> Personalization Preferences
          </h1>
          <p className="text-xs text-editorial-muted mt-1">Manage your category topics and recommendation controls</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" /> Personalization preferences updated successfully!
        </div>
      )}

      {/* Personalization ON/OFF Toggle */}
      <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold font-serif flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> Personalized Recommendations
          </h3>
          <p className="text-xs text-editorial-muted mt-1">
            When enabled, NewsSphere tailors your recommended feed based on your reading history and selected topics.
          </p>
        </div>

        <button
          onClick={() => setPersonalizedEnabled(!personalizedEnabled)}
          className="text-purple-600 transition focus:outline-none"
        >
          {personalizedEnabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-editorial-muted" />}
        </button>
      </div>

      {/* Category Topics Selection */}
      <div className="space-y-4">
        <h3 className="text-base font-bold font-serif">Selected Category Interests</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const isSelected = selectedIds.includes(cat._id);
            return (
              <button
                key={cat._id}
                onClick={() => toggleCategory(cat._id)}
                className={`p-4 rounded-xl border text-left transition space-y-1.5 ${
                  isSelected
                    ? 'bg-purple-600/10 border-purple-600 ring-1 ring-purple-600'
                    : 'bg-editorial-card dark:bg-darkEditorial-card border-editorial-border hover:border-purple-600/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{cat.icon || '📰'}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </div>
                <span className="font-bold text-xs font-serif block text-editorial-text">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          disabled={updateMutation.isPending}
          onClick={handleSave}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition shadow-xs disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Saving Preferences...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
