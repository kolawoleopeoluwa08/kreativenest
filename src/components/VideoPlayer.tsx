import { useMemo } from 'react';
import { parseVideo } from '@/lib/video';
import { ExternalLink, AlertTriangle } from 'lucide-react';

interface VideoPlayerProps {
  url: string | null;
  poster?: string | null;
  title?: string;
  aspect?: string;
}

/**
 * Renders a Vimeo/YouTube embed for known URLs, or a native <video> player
 * for direct video files (mp4/webm). Shows a graceful fallback when nothing
 * is configured.
 */
export function VideoPlayer({ url, poster, title = 'Project film', aspect = '16/9' }: VideoPlayerProps) {
  const parsed = useMemo(() => parseVideo(url), [url]);

  if (!url || !parsed.embedUrl) {
    return (
      <div
        className="flex aspect-video w-full items-center justify-center rounded-2xl border border-ink-700/70 bg-ink-900/60 text-center"
      >
        <div className="px-6">
          <AlertTriangle className="mx-auto mb-3 text-ember-300/70" size={22} />
          <p className="font-mono text-xs uppercase tracking-widestish text-ink-300">
            No video linked yet
          </p>
          <p className="mt-2 text-sm text-bone/60">
            Add a Vimeo or YouTube URL from the admin area to show the film here.
          </p>
        </div>
      </div>
    );
  }

  // Native video file
  if (parsed.provider === 'external' && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border border-ink-700/70 bg-black" style={{ aspectRatio: aspect }}>
        <video
          controls
          poster={poster ?? undefined}
          className="h-full w-full object-cover"
          title={title}
          preload="metadata"
        >
          <source src={url} />
        </video>
      </div>
    );
  }

  // External link (not a known provider or file)
  if (parsed.provider === 'external') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex aspect-video w-full items-center justify-center rounded-2xl border border-ink-700/70 bg-ink-900/60 text-bone/80 transition hover:border-ember-300/60 hover:bg-ink-850"
      >
        <span className="inline-flex items-center gap-2 text-sm">
          Watch on external site <ExternalLink size={16} />
        </span>
      </a>
    );
  }

  // Vimeo / YouTube embed
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-ink-700/70 bg-black shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]"
      style={{ aspectRatio: aspect }}
    >
      <iframe
        src={parsed.embedUrl}
        title={title}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
