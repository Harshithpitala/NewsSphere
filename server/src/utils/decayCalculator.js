/**
 * NewsSphere Decaying Trending Score Calculator
 *
 * Formula:
 * BaseScore = (viewsCount * 1.5) + (isBreaking ? 50 : 0) + (isFeatured ? 20 : 0) + 10
 * RecencyFactor = e^(-lambda * t)
 * TrendingScore = BaseScore * RecencyFactor
 *
 * where t = hours since publication, and lambda = ln(2) / 48 (48-hour half-life).
 */
export const calculateTrendingScore = (article) => {
  if (!article) return 0;

  const views = article.viewsCount || 0;
  const isBreaking = article.isBreaking ? 50 : 0;
  const isFeatured = article.isFeatured ? 20 : 0;

  const baseScore = views * 1.5 + isBreaking + isFeatured + 10;

  const publishDate = article.publishedAt || article.createdAt || new Date();
  const hoursAgo = Math.max(0, (Date.now() - new Date(publishDate).getTime()) / (1000 * 60 * 60));

  // 48-hour half-life decay constant
  const lambda = Math.LN2 / 48; // ~0.01443
  const recencyFactor = Math.exp(-lambda * hoursAgo);

  const finalScore = Number((baseScore * recencyFactor).toFixed(2));
  return finalScore;
};
