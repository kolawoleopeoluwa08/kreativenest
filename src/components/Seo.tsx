import { useEffect } from 'react';
import type { SiteSettings } from '@/lib/types';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  settings?: SiteSettings | null;
}

/**
 * Lightweight client-side SEO manager. Updates document.title and meta tags.
 * For a true SSR solution you'd render these server-side, but this is a SPA.
 */
export function Seo({ title, description, image, settings }: SeoProps) {
  useEffect(() => {
    const siteName = settings?.business_name || 'KreativeNest';
    const fullTitle = title ? `${title} — ${siteName}` : `${siteName} — Cinematography`;
    document.title = fullTitle;

    const setDescription = (content: string) => {
      let el = document.querySelector('meta[name="description"]');
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', 'description');
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
      let og = document.querySelector('meta[property="og:description"]');
      if (!og) {
        og = document.createElement('meta');
        og.setAttribute('property', 'og:description');
        document.head.appendChild(og);
      }
      og.setAttribute('content', content);
    };
    if (description) setDescription(description);

    const setOg = (key: string, content: string) => {
      let el = document.querySelector(`meta[property="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setOg('og:title', fullTitle);
    if (image) setOg('og:image', image);
  }, [title, description, image, settings]);

  return null;
}
