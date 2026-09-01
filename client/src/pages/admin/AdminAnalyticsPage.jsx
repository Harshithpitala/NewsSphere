import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsClientService } from '../../services/analytics.service';
import ArticleSkeleton from '../../components/article/ArticleSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  Search,
  Download,
  Calendar,
  UserCheck,
  FolderTree,
  BookOpen,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('30d');

  // Fetch Analytics Queries concurrently
  const { data: overviewData, isLoading: isOverviewLoading, error: overviewError } = useQuery({
    queryKey: ['admin-analytics-overview', range],
    queryFn: () => analyticsClientService.getOverview({ range }),
  });

  const { data: viewsData, isLoading: isViewsLoading } = useQuery({
    queryKey: ['admin-analytics-views', range],
    queryFn: () => analyticsClientService.getViewsOverTime({ range }),
  });

  const { data: topArticlesData } = useQuery({
    queryKey: ['admin-analytics-articles', range],
    queryFn: () => analyticsClientService.getTopArticles({ range, limit: 8 }),
  });

  const { data: categoryData } = useQuery({
    queryKey: ['admin-analytics-categories', range],
    queryFn: () => analyticsClientService.getCategoryAnalytics({ range }),
  });

  const { data: authorData } = useQuery({
    queryKey: ['admin-analytics-authors', range],
    queryFn: () => analyticsClientService.getAuthorAnalytics({ range }),
  });

  const { data: searchData } = useQuery({
    queryKey: ['admin-analytics-searches', range],
    queryFn: () => analyticsClientService.getSearchAnalytics({ range }),
  });

  const { data: readingData } = useQuery({
    queryKey: ['admin-analytics-reading'],
    queryFn: () => analyticsClientService.getReadingAnalytics(),
  });

  const overview = overviewData?.data || {
    totalViews: 0,
    totalReactions: 0,
    totalComments: 0,
    totalBookmarks: 0,
    publishedArticlesCount: 0,
    engagementRate: 0,
  };

  const timeSeries = viewsData?.data || [];
  const topArticles = topArticlesData?.data || [];
  const categories = categoryData?.data || [];
  const authors = authorData?.data || [];
  const searchTerms = searchData?.data || [];
  const reading = readingData?.data || { avgProgress: 0, completionRate: 0, avgDurationMinutes: 0 };

  const maxViewsInSeries = Math.max(...timeSeries.map((t) => t.views), 1);

  if (isOverviewLoading) return <ArticleSkeleton count={4} />;
  if (overviewError) return <ErrorState message={overviewError.message} />;

  return (
    <div className="space-y-8">
      {/* Header & Date Range Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-editorial-border dark:border-darkEditorial-border">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">Business Intelligence</span>
          <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" /> Analytics & Performance Insights
          </h1>
          <p className="text-xs text-editorial-muted mt-1">Real-time readership, content performance, engagement rates, and search trends</p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* Date Range Selector */}
          <div className="flex items-center bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl p-1 text-xs font-semibold">
            {['today', '7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  range === r
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'text-editorial-muted hover:text-editorial-text'
                }`}
              >
                {r === 'today' ? 'Today' : r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={() => analyticsClientService.exportCSV(range)}
            className="px-3.5 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl text-xs font-bold hover:border-purple-600 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" /> Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Article Views</span>
            <Eye className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-bold font-mono">{overview.totalViews}</p>
          <span className="text-[11px] text-editorial-muted font-mono block">In selected {range} window</span>
        </div>

        <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Engagement Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {overview.engagementRate}%
          </p>
          <span className="text-[10px] text-editorial-muted font-mono block">
            (Reactions + Comments + Bookmarks) / Views
          </span>
        </div>

        <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Total Interactions</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-bold font-mono">
            {overview.totalReactions + overview.totalComments + overview.totalBookmarks}
          </p>
          <span className="text-[11px] text-editorial-muted font-mono block">
            {overview.totalReactions} Likes • {overview.totalComments} Comments
          </span>
        </div>

        <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs text-editorial-muted font-bold">
            <span>Published Stories</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold font-mono">{overview.publishedArticlesCount}</p>
          <span className="text-[11px] text-editorial-muted font-mono block">Live editorial archive</span>
        </div>
      </div>

      {/* Views Over Time Bar Chart */}
      <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-4 shadow-xs">
        <h3 className="text-base font-bold font-serif flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-600" /> Readership Trend (Daily Views)
        </h3>

        {timeSeries.length === 0 ? (
          <p className="text-xs text-editorial-muted italic py-8 text-center">
            No readership views logged in this date range. Read articles to see chart activity!
          </p>
        ) : (
          <div className="space-y-2 pt-2">
            <div className="h-44 flex items-end gap-2 border-b border-editorial-border pb-2 overflow-x-auto">
              {timeSeries.map((item) => {
                const heightPercent = Math.max(8, Math.round((item.views / maxViewsInSeries) * 100));
                return (
                  <div key={item.date} className="flex-1 min-w-[24px] flex flex-col items-center gap-1 group">
                    <span className="text-[9px] font-mono font-bold opacity-0 group-hover:opacity-100 transition">
                      {item.views}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-purple-600/80 hover:bg-purple-600 rounded-t transition"
                      title={`${item.date}: ${item.views} views`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-editorial-muted">
              <span>{timeSeries[0]?.date}</span>
              <span>{timeSeries[timeSeries.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </div>

      {/* Top Performing Articles & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Articles Table */}
        <div className="lg:col-span-2 p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-base font-bold font-serif">Top Performing Stories</h3>
          {topArticles.length === 0 ? (
            <p className="text-xs text-editorial-muted italic">Not enough reading activity recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-editorial-bg dark:bg-darkEditorial-bg border-b border-editorial-border text-editorial-muted uppercase font-mono font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Headline</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Views</th>
                    <th className="p-3">Reactions</th>
                    <th className="p-3">Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                  {topArticles.map((art) => (
                    <tr key={art._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                      <td className="p-3 font-bold font-serif max-w-xs truncate">{art.title}</td>
                      <td className="p-3 font-medium text-editorial-muted">{art.category?.name}</td>
                      <td className="p-3 font-mono font-bold text-purple-600">{art.views}</td>
                      <td className="p-3 font-mono">{art.likesCount}</td>
                      <td className="p-3 font-mono">{art.commentsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Performance */}
        <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-base font-bold font-serif flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-purple-600" /> Category Breakdown
          </h3>

          {categories.length === 0 ? (
            <p className="text-xs text-editorial-muted italic">No category view metrics available.</p>
          ) : (
            <div className="space-y-3 text-xs font-mono">
              {categories.map((cat) => (
                <div key={cat._id} className="p-3 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl border border-editorial-border flex items-center justify-between">
                  <div>
                    <span className="font-bold block text-editorial-text">{cat.name}</span>
                    <span className="text-[10px] text-editorial-muted">{cat.articleCount} published story(ies)</span>
                  </div>
                  <span className="font-bold text-purple-600">{cat.views} views</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Author Leaderboard & Search Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Author Performance */}
        <div className="lg:col-span-2 p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-base font-bold font-serif flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-600" /> Author Performance Leaderboard
          </h3>

          {authors.length === 0 ? (
            <p className="text-xs text-editorial-muted italic">No author statistics logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-editorial-bg dark:bg-darkEditorial-bg border-b border-editorial-border text-editorial-muted uppercase font-mono font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Author Name</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Published</th>
                    <th className="p-3">Total Views</th>
                    <th className="p-3">Avg Views / Story</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-editorial-border dark:divide-darkEditorial-border">
                  {authors.map((auth, idx) => (
                    <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                      <td className="p-3 font-bold font-serif">{auth.author?.name}</td>
                      <td className="p-3 font-mono text-[10px] uppercase text-editorial-muted">{auth.author?.role}</td>
                      <td className="p-3 font-mono">{auth.articlesPublished}</td>
                      <td className="p-3 font-mono font-bold text-purple-600">{auth.totalViews}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{auth.avgViewsPerArticle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Search Terms */}
        <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-base font-bold font-serif flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-600" /> Top Searched Terms
          </h3>

          {searchTerms.length === 0 ? (
            <p className="text-xs text-editorial-muted italic">No search queries logged yet.</p>
          ) : (
            <div className="space-y-2 text-xs font-mono">
              {searchTerms.map((st, idx) => (
                <div key={idx} className="p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg rounded-lg border border-editorial-border flex items-center justify-between">
                  <span className="font-bold text-editorial-text">"{st.term}"</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 font-bold text-[10px]">
                    {st.count} searches
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reading Behavior & Scroll Completion Metrics */}
      <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-4 shadow-xs">
        <h3 className="text-base font-bold font-serif">Reader Engagement & Scroll Completion</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono">
          <div className="p-4 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl border border-editorial-border space-y-1">
            <span className="text-editorial-muted font-bold block">Average Scroll Progress</span>
            <p className="text-2xl font-bold text-purple-600">{reading.avgProgress}%</p>
          </div>

          <div className="p-4 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl border border-editorial-border space-y-1">
            <span className="text-editorial-muted font-bold block">Article Completion Rate</span>
            <p className="text-2xl font-bold text-emerald-600">{reading.completionRate}%</p>
          </div>

          <div className="p-4 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl border border-editorial-border space-y-1">
            <span className="text-editorial-muted font-bold block">Avg Reading Duration</span>
            <p className="text-2xl font-bold text-amber-500">{reading.avgDurationMinutes} mins</p>
          </div>
        </div>
      </div>
    </div>
  );
}
