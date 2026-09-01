import React, { useState, useEffect } from 'react';

export const resolveUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) return url;
  if (url.startsWith('uploads')) return `/${url}`;
  return url;
};

export default function OptimizedImage({
  src,
  alt = 'NewsSphere Editorial Image',
  responsiveUrls = null,
  priority = false,
  className = '',
}) {
  const fallbackImage =
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';

  const initialSrc = resolveUrl(src) || fallbackImage;
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  useEffect(() => {
    const resolved = resolveUrl(src);
    setCurrentSrc(resolved || fallbackImage);
  }, [src]);

  const handleImageError = () => {
    console.warn('[OptimizedImage Error loading src]:', currentSrc, 'Original:', src);
    if (currentSrc !== fallbackImage) {
      setCurrentSrc(fallbackImage);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-editorial-bg dark:bg-darkEditorial-bg ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onError={handleImageError}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
    </div>
  );
}
