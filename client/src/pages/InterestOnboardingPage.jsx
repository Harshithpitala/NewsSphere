import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { recommendationClientService } from '../services/recommendation.service';
import { Sparkles, CheckCircle2, ArrowRight, X } from 'lucide-react';

export default function InterestOnboardingPage() {
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: prefData, isLoading } = useQuery({
    queryKey: ['recommendation-preferences'],
    queryFn: () => recommendationClientService.getUserPreferences(),
  });

  const categories = prefData?.data?.availableCategories || [];
  const existingInterests = prefData?.data?.interests || [];

  useEffect(() => {
    if (existingInterests.length > 0) {
      setSelectedIds(existingInterests.map((i) => i._id || i));
    }
  }, [existingInterests.length]);

  const updateMutation = useMutation({
    mutationFn: (ids) =>
      recommendationClientService.updateUserPreferences({
        interestIds: ids,
        personalizedFeedEnabled: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['recommendation-preferences'] });
      navigate('/for-you');
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
    updateMutation.mutate(selectedIds);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 min-h-screen space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold font-serif">Welcome to NewsSphere Personalization</h1>
        <p className="text-xs text-editorial-muted max-w-md mx-auto">
          Select topics you are interested in to tailor your daily news feed. You can change these anytime in preferences.
        </p>
      </div>

      {/* Categories Grid Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const isSelected = selectedIds.includes(cat._id);
          return (
            <button
              key={cat._id}
              onClick={() => toggleCategory(cat._id)}
              className={`p-5 rounded-2xl border text-left transition space-y-2 relative ${
                isSelected
                  ? 'bg-purple-600/10 border-purple-600 ring-2 ring-purple-600'
                  : 'bg-editorial-card dark:bg-darkEditorial-card border-editorial-border hover:border-purple-600/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{cat.icon || '📰'}</span>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
              </div>
              <div>
                <span className="font-bold text-sm font-serif block text-editorial-text">{cat.name}</span>
                <span className="text-[10px] text-editorial-muted block line-clamp-1">{cat.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-editorial-border">
        <Link to="/for-you" className="text-xs font-bold text-editorial-muted hover:underline">
          Skip for Now
        </Link>

        <button
          disabled={updateMutation.isPending}
          onClick={handleSave}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save & View Personalized Feed'}{' '}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
