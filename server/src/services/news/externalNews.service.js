import { env } from '../../config/env.js';
import { memoryCache } from '../../utils/cache.js';

// Category Mapping Layer
const CATEGORY_MAP = {
  technology: 'technology',
  business: 'business',
  science: 'science',
  sports: 'sports',
  entertainment: 'entertainment',
  health: 'health',
  india: 'general',
  world: 'general',
  politics: 'general',
};

// Default Fallback World News (Used if API Key missing or Provider unavailable)
const FALLBACK_EXTERNAL_NEWS = [
  {
    id: 'ext-fallback-1',
    title: 'Global Tech Summits Announce New Protocols for Responsible AI Deployment',
    description: 'International leaders and technology executives align on safety benchmarks and transparent governance frameworks.',
    url: 'https://news.google.com',
    urlToImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    sourceName: 'Global News Wire',
    author: 'International Tech Bureau',
    publishedAt: new Date().toISOString(),
    category: 'technology',
    isExternal: true,
    isFallback: true,
  },
  {
    id: 'ext-fallback-2',
    title: 'Renewable Energy Investments Reach Record High Across Emerging Markets',
    description: 'Solar and wind infrastructure acceleration drives economic growth and clean energy transition across developing nations.',
    url: 'https://news.google.com',
    urlToImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
    sourceName: 'Economic Times Global',
    author: 'Energy Markets Desk',
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    category: 'business',
    isExternal: true,
    isFallback: true,
  },
  {
    id: 'ext-fallback-3',
    title: 'James Webb Space Telescope Uncovers Ancient Galaxy Cluster from Cosmic Dawn',
    description: 'Astronomers detect unprecedented stellar structures shedding light on the formation of early cosmic bodies.',
    url: 'https://news.google.com',
    urlToImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    sourceName: 'Cosmic Science Journal',
    author: 'Astrophysics Observatory',
    publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    category: 'science',
    isExternal: true,
    isFallback: true,
  },
];

// Helper: Normalize external provider payload
const normalizeArticle = (item, defaultCategory = 'world') => {
  return {
    id: item.url ? Buffer.from(item.url).toString('base64').substring(0, 24) : `ext-${Date.now()}`,
    title: item.title || 'Untitled External Story',
    description: item.description || item.content || 'Read full story on the original news publisher website.',
    url: item.url || '#',
    urlToImage:
      item.urlToImage && item.urlToImage.startsWith('http')
        ? item.urlToImage
        : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
    sourceName: item.source?.name || 'External Publisher',
    author: item.author || item.source?.name || 'News Wire',
    publishedAt: item.publishedAt || new Date().toISOString(),
    category: defaultCategory,
    isExternal: true,
    isFallback: false,
  };
};

export const fetchExternalLatestNews = async ({ page = 1, limit = 10, category, query }) => {
  const cacheKey = `ext_news_${category || 'all'}_${query || 'none'}_${page}_${limit}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // If no API key configured, return fallback data cleanly without failing
  if (!env.NEWS_API_KEY) {
    let filteredFallback = [...FALLBACK_EXTERNAL_NEWS];
    if (category) {
      filteredFallback = filteredFallback.filter((item) => item.category === category.toLowerCase());
      if (filteredFallback.length === 0) filteredFallback = [...FALLBACK_EXTERNAL_NEWS];
    }
    const result = {
      success: true,
      provider: 'NewsSphere Provider Abstraction (Fallback Mode)',
      data: filteredFallback,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: filteredFallback.length,
        totalPages: 1,
      },
    };
    memoryCache.set(cacheKey, result, 300); // 5 min TTL
    return result;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second HTTP timeout

    const mappedCategory = category ? CATEGORY_MAP[category.toLowerCase()] || 'general' : 'general';
    const params = new URLSearchParams({
      apiKey: env.NEWS_API_KEY,
      page: page.toString(),
      pageSize: limit.toString(),
      language: 'en',
    });

    let endpoint = `${env.NEWS_API_BASE_URL}/top-headlines`;
    if (query) {
      endpoint = `${env.NEWS_API_BASE_URL}/everything`;
      params.append('q', query);
    } else {
      params.append('category', mappedCategory);
      if (category && category.toLowerCase() === 'india') {
        params.append('country', 'in');
      }
    }

    const response = await fetch(`${endpoint}?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[News API Warning] External provider status: ${response.status}`);
      return {
        success: true,
        provider: 'News API (Rate Limited / Fallback)',
        data: FALLBACK_EXTERNAL_NEWS,
        pagination: { currentPage: page, pageSize: limit, totalItems: FALLBACK_EXTERNAL_NEWS.length, totalPages: 1 },
      };
    }

    const json = await response.json();
    const rawArticles = json.articles || [];
    const normalized = rawArticles.map((art) => normalizeArticle(art, category || 'world'));

    const result = {
      success: true,
      provider: 'News API Org',
      data: normalized,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: json.totalResults || normalized.length,
        totalPages: Math.ceil((json.totalResults || normalized.length) / limit) || 1,
      },
    };

    memoryCache.set(cacheKey, result, 900); // 15 min TTL cache
    return result;
  } catch (error) {
    console.error(`[External News Service Error]: ${error.message}`);
    return {
      success: true,
      provider: 'NewsSphere Provider Abstraction (Fallback Mode)',
      data: FALLBACK_EXTERNAL_NEWS,
      pagination: { currentPage: page, pageSize: limit, totalItems: FALLBACK_EXTERNAL_NEWS.length, totalPages: 1 },
    };
  }
};
