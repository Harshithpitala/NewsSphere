import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiClientService } from '../../services/ai.service';
import { Bot, Sparkles, FileText, CheckCircle, Tag, FolderTree, AlertCircle, Copy, Check, Eye } from 'lucide-react';

export default function AIEditorialAssistant({
  articleId,
  onApplyHeadline,
  onApplyCategory,
  onApplyTag,
}) {
  const [activeTool, setActiveTool] = useState(null); // 'headlines', 'category', 'tags', 'similar'

  // Headline Mutation
  const headlinesMutation = useMutation({
    mutationFn: () => aiClientService.suggestHeadlines(articleId),
    onSuccess: () => setActiveTool('headlines'),
  });

  // Category Mutation
  const categoryMutation = useMutation({
    mutationFn: () => aiClientService.suggestCategory(articleId),
    onSuccess: () => setActiveTool('category'),
  });

  // Tag Mutation
  const tagsMutation = useMutation({
    mutationFn: () => aiClientService.suggestTags(articleId),
    onSuccess: () => setActiveTool('tags'),
  });

  // Similar Articles Mutation
  const similarMutation = useMutation({
    mutationFn: () => aiClientService.findSimilarArticles(articleId),
    onSuccess: () => setActiveTool('similar'),
  });

  const isLoading =
    headlinesMutation.isPending ||
    categoryMutation.isPending ||
    tagsMutation.isPending ||
    similarMutation.isPending;

  if (!articleId) {
    return (
      <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl text-xs text-editorial-muted italic">
        Save initial draft to enable AI Editorial Assistance tools.
      </div>
    );
  }

  return (
    <div className="p-5 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl space-y-4 shadow-xs">
      <div className="flex items-center space-x-2 border-b border-editorial-border pb-3">
        <Bot className="w-5 h-5 text-editorial-accent" />
        <div>
          <h4 className="text-sm font-bold font-serif flex items-center gap-1">
            AI Newsroom Assistant <Sparkles className="w-3.5 h-3.5 text-editorial-accent" />
          </h4>
          <span className="text-[10px] font-mono text-editorial-muted">
            Non-destructive editorial tools (Review & Apply)
          </span>
        </div>
      </div>

      {/* Tools Buttons Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => headlinesMutation.mutate()}
          className="p-2.5 rounded-lg border border-editorial-border hover:border-editorial-accent bg-editorial-bg dark:bg-darkEditorial-bg text-left transition flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-editorial-accent shrink-0" />
          <span>Suggest Headlines</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => categoryMutation.mutate()}
          className="p-2.5 rounded-lg border border-editorial-border hover:border-editorial-accent bg-editorial-bg dark:bg-darkEditorial-bg text-left transition flex items-center gap-1.5"
        >
          <FolderTree className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Suggest Category</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => tagsMutation.mutate()}
          className="p-2.5 rounded-lg border border-editorial-border hover:border-editorial-accent bg-editorial-bg dark:bg-darkEditorial-bg text-left transition flex items-center gap-1.5"
        >
          <Tag className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <span>Suggest Tags</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => similarMutation.mutate()}
          className="p-2.5 rounded-lg border border-editorial-border hover:border-editorial-accent bg-editorial-bg dark:bg-darkEditorial-bg text-left transition flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Find Similar Stories</span>
        </button>
      </div>

      {isLoading && (
        <div className="p-3 bg-editorial-accent/10 text-editorial-accent rounded-lg text-xs font-mono animate-pulse flex items-center gap-2">
          <Sparkles className="w-4 h-4 animate-spin" /> Generating AI Suggestions...
        </div>
      )}

      {/* Headlines Results */}
      {!isLoading && activeTool === 'headlines' && headlinesMutation.data && (
        <div className="space-y-2 pt-2 text-xs border-t border-editorial-border">
          <span className="font-bold font-mono text-[10px] text-editorial-accent uppercase">Headline Suggestions:</span>
          {headlinesMutation.data.data?.headlines?.map((h, i) => (
            <div key={i} className="p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border rounded-lg flex items-center justify-between gap-2">
              <span className="font-serif font-bold text-editorial-text">{h}</span>
              <button
                type="button"
                onClick={() => onApplyHeadline && onApplyHeadline(h)}
                className="px-2 py-1 bg-editorial-accent text-white font-bold rounded text-[10px] shrink-0 hover:bg-red-700 transition"
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Category Results */}
      {!isLoading && activeTool === 'category' && categoryMutation.data && (
        <div className="space-y-2 pt-2 text-xs border-t border-editorial-border">
          <span className="font-bold font-mono text-[10px] text-amber-500 uppercase">Category Recommendations:</span>
          {categoryMutation.data.data?.suggestions?.length === 0 ? (
            <p className="text-editorial-muted italic">No category matches found.</p>
          ) : (
            categoryMutation.data.data.suggestions.map((cat) => (
              <div key={cat._id} className="p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border rounded-lg flex items-center justify-between gap-2">
                <span className="font-bold font-serif">{cat.name}</span>
                <button
                  type="button"
                  onClick={() => onApplyCategory && onApplyCategory(cat._id)}
                  className="px-2 py-1 bg-amber-500 text-white font-bold rounded text-[10px] shrink-0 hover:bg-amber-600 transition"
                >
                  Apply Category
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tags Results */}
      {!isLoading && activeTool === 'tags' && tagsMutation.data && (
        <div className="space-y-2 pt-2 text-xs border-t border-editorial-border">
          <span className="font-bold font-mono text-[10px] text-purple-500 uppercase">Suggested Tags:</span>
          <div className="flex flex-wrap gap-1.5">
            {tagsMutation.data.data?.suggestions?.map((t) => (
              <button
                key={t._id}
                type="button"
                onClick={() => onApplyTag && onApplyTag(t._id)}
                className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-600 rounded-full font-bold text-[10px] hover:bg-purple-500/20 transition flex items-center gap-1"
              >
                +#{t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Similar Articles Results */}
      {!isLoading && activeTool === 'similar' && similarMutation.data && (
        <div className="space-y-2 pt-2 text-xs border-t border-editorial-border">
          <span className="font-bold font-mono text-[10px] text-emerald-600 uppercase">Potentially Related Stories:</span>
          {similarMutation.data.data?.similarArticles?.length === 0 ? (
            <p className="text-editorial-muted italic">No duplicate or similar published articles found.</p>
          ) : (
            similarMutation.data.data.similarArticles.map((sim) => (
              <div key={sim._id} className="p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border rounded-lg space-y-1">
                <span className="font-bold block truncate">{sim.title}</span>
                <span className="text-[10px] text-editorial-muted font-mono">{sim.category?.name}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
