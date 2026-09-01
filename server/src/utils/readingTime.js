export const calculateReadingTime = (content) => {
  if (!content) return 1;

  // Strip HTML tags
  const plainText = content.replace(/<[^>]*>/g, ' ');

  // Count words
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;

  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200;
  const readingTime = Math.ceil(words / wordsPerMinute);

  return Math.max(1, readingTime);
};
