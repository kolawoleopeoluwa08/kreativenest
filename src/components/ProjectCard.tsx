import { Link } from 'react-router-dom';
import { Play, ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  large?: boolean;
  index?: number;
}

export function ProjectCard({ project, large = false, index = 0 }: ProjectCardProps) {
  const poster = project.poster_url || project.thumbnail_url;
  const to = `/work/${project.slug}`;

  return (
    <Link
      to={to}
      className="group relative block overflow-hidden rounded-2xl bg-ink-900"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <div
        className={
          large
            ? 'aspect-[16/9] w-full overflow-hidden'
            : 'aspect-[4/3] w-full overflow-hidden'
        }
      >
        {poster ? (
          <img
            src={poster}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ink-850 text-ink-500">
            <span className="font-mono text-xs">No image</span>
          </div>
        )}
        {/* Cinematic scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-bone/30 bg-ink-950/50 backdrop-blur-sm">
          <Play size={22} className="ml-0.5 text-bone" fill="currentColor" />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widestish text-ember-300/90">
          {project.category?.name && <span>{project.category.name}</span>}
          {project.year && (
            <>
              {project.category?.name && <span className="text-ink-500">/</span>}
              <span className="text-ink-300">{project.year}</span>
            </>
          )}
        </div>
        <h3
          className={
            large
              ? 'mt-2 font-display text-2xl md:text-3xl text-bone'
              : 'mt-2 font-display text-xl md:text-2xl text-bone'
          }
        >
          {project.title}
        </h3>
        {project.short_description && (
          <p className="mt-2 line-clamp-2 max-w-xl text-sm text-bone/70 text-pretty">
            {project.short_description}
          </p>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-xs text-bone/80">
          View project <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  );
}
