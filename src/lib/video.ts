import type { VideoProvider } from './types';

/**
 * Parse a user-entered video URL into an embeddable URL + provider.
 * Supports Vimeo and YouTube in their common URL shapes. Anything else
 * is treated as a generic external link (mp4, etc).
 */
export function parseVideo(
  raw: string | null | undefined
): { provider: VideoProvider; embedUrl: string | null; original: string | null } {
  if (!raw) return { provider: 'external', embedUrl: null, original: null };
  const url = raw.trim();
  if (!url) return { provider: 'external', embedUrl: null, original: null };

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      original: url,
    };
  }

  // YouTube — watch?v=, youtu.be/, /embed/, /shorts/
  const ytMatch =
    url.match(/[?&]v=([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  if (ytMatch) {
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      original: url,
    };
  }

  return { provider: 'external', embedUrl: url, original: url };
}

export function videoProviderLabel(p: VideoProvider): string {
  if (p === 'vimeo') return 'Vimeo';
  if (p === 'youtube') return 'YouTube';
  return 'External link';
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
