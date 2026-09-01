import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiClientService } from '../../services/ai.service';
import { Bot, Sparkles, FileText, CheckCircle2, HelpCircle, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function AIReaderWidget({ articleId }) {
  const [activeTab, setActiveTab] = useState(null); // 'summary', 'keyPoints', 'explain'
  const [isOpen, setIsOpen] = useState(true);

  // Summary Mutation
  const summaryMutation = useMutation({
    mutationFn: () => aiClientService.summarizeArticle(articleId),
    onSuccess: () => setActiveTab('summary'),
  });

  // Key Points Mutation
  const keyPointsMutation = useMutation({
    mutationFn: () => aiClientService.extractKeyPoints(articleId),
    onSuccess: () => setActiveTab('keyPoints'),
  });

  // Explain Simply Mutation
  const explainMutation = useMutation({
    mutationFn: () => aiClientService.explainSimply(articleId),
    onSuccess: () => setActiveTab('explain'),
  });

  const isLoading = summaryMutation.isPending || keyPointsMutation.isPending || explainMutation.isPending;

  return (
    <div className="my-6 p-5 bg-editorial-card dark:bg-darkEditorial-card border border-purple-500/30 rounded-2xl space-y-4 shadow-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-serif flex items-center gap-1.5">
              AI Reader Intelligence <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            </h4>
            <span className="text-[10px] font-mono text-editorial-muted">
              Optional AI tools to summarize & simplify story insights
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg border border-editorial-border hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-2 border-t border-editorial-border dark:border-darkEditorial-border">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              disabled={isLoading}
              onClick={() => summaryMutation.mutate()}
              className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'summary'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border hover:border-purple-600'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Summarize Story
            </button>

            <button
              disabled={isLoading}
              onClick={() => keyPointsMutation.mutate()}
              className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'keyPoints'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border hover:border-purple-600'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Key Takeaways
            </button>

            <button
              disabled={isLoading}
              onClick={() => explainMutation.mutate()}
              className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'explain'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border hover:border-purple-600'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Explain Simply
            </button>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-4 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl text-xs font-mono text-purple-600 dark:text-purple-400 flex items-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" /> Generating AI Insights...
            </div>
          )}

          {/* Active Tab Output Display */}
          {!isLoading && activeTab === 'summary' && summaryMutation.data && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between text-[10px] font-mono text-purple-600 font-bold uppercase tracking-wider">
                <span>🤖 AI-Generated Summary</span>
                <span>Gemini 1.5 Flash</span>
              </div>
              <p className="font-serif leading-relaxed text-editorial-text dark:text-darkEditorial-text">
                {summaryMutation.data.data?.summary}
              </p>
              {summaryMutation.data.data?.bulletPoints?.length > 0 && (
                <ul className="list-disc list-inside space-y-1 font-sans text-editorial-muted">
                  {summaryMutation.data.data.bulletPoints.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!isLoading && activeTab === 'keyPoints' && keyPointsMutation.data && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-3 text-xs">
              <div className="text-[10px] font-mono text-purple-600 font-bold uppercase tracking-wider">
                🤖 Key Points Extracted by AI
              </div>
              <ul className="space-y-2">
                {keyPointsMutation.data.data?.keyPoints?.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-editorial-text">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isLoading && activeTab === 'explain' && explainMutation.data && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-3 text-xs">
              <div className="text-[10px] font-mono text-purple-600 font-bold uppercase tracking-wider">
                🤖 Simplified Story Explanation
              </div>
              <p className="font-sans leading-relaxed text-editorial-text">
                "{explainMutation.data.data?.simpleExplanation}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
