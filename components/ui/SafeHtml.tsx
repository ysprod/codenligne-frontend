'use client';

import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

export default function SafeHtml({ html, className }: SafeHtmlProps) {
  const [sanitized, setSanitized] = useState('');

  useEffect(() => {
    // DOMPurify a besoin d'être exécuté côté client (window existe)
    if (typeof window !== 'undefined') {
      setSanitized(DOMPurify.sanitize(html));
    }
  }, [html]);

  if (!sanitized) return null;

  return (
    <div 
      className={className} 
      dangerouslySetInnerHTML={{ __html: sanitized }} 
    />
  );
}