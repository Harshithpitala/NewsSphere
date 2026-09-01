import React from 'react';

export default function ArticleContentSanitizer({ content }) {
  if (!content) return null;

  // Basic HTML sanitization escaping dangerous script tags / event attributes
  const sanitizeHtml = (html) => {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  };

  return (
    <div
      className="prose dark:prose-invert max-w-none text-base leading-relaxed space-y-4 font-serif text-editorial-text dark:text-darkEditorial-text"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
    />
  );
}
