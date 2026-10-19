import { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { Section } from '@/components/Section';
import { ProjectCard } from '@/components/ProjectCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { Seo } from '@/components/Seo';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { fetchCategories, fetchPublishedProjects } from '@/lib/api';
import { classNames } from '@/lib/video';
import type { Category, Project } from '@/lib/types';

export function PortfolioPage() {
  const { settings } = useSiteSettings();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchPublishedProjects(), fetchCategories()])
      .then(([p, c]) => {
        if (!mounted) return;
        setProjects(p);
        setCategories(c);
      })
      .catch((e) => mounted && setError(e.message ?? 'Failed to load work'));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      if (featuredOnly && !p.featured) return false;
      if (active !== 'all' && p.category?.slug !== active) return false;
      return true;
    });
  }, [projects, active, featuredOnly]);

  const hasFilters = categories.length > 0;

  return (
    <>
      <Seo
        settings={settings}
        title="Work"
        description="A portfolio of recent cinematography — branded films, documentaries, music videos, and events."
      />

      <Section className="pt-32 md:pt-40">
        <div className="max-w-3xl">
          <p className="eyebrow mb-3">Portfolio</p>
          <h1 className="font-display text-4xl md:text-6xl tracking-tightish text-bone text-balance">
            Selected cinematography
          </h1>
          <p className="mt-5 text-bone/70 text-pretty md:text-lg">
            Browse the work by category, or filter to featured projects. Click any
            film to watch and read the credits.
          </p>
        </div>

        {/* Filters */}
        {hasFilters && (
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widestish text-ink-300">
              <Filter size={13} /> Filter
            </span>
            <FilterChip active={active === 'all'} onClick={() => setActive('all')}>
              All
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c.id}
                active={active === c.slug}
                onClick={() => setActive(c.slug)}
              >
                {c.name}
              </FilterChip>
            ))}
            <span className="mx-1 h-5 w-px bg-ink-700" />
            <FilterChip active={featuredOnly} onClick={() => setFeaturedOnly((v) => !v)}>
              Featured only
            </FilterChip>
          </div>
        )}

        {/* Grid */}
        <div className="mt-10">
          {!projects && !error && <LoadingState label="Loading work…" />}
          {error && <ErrorState message={error} />}
          {projects && filtered.length === 0 && (
            <EmptyState
              title="No projects match"
              description="Try clearing the filters to see the full portfolio."
              action={
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setActive('all');
                    setFeaturedOnly(false);
                  }}
                >
                  Clear filters
                </button>
              }
            />
          )}
          {projects && filtered.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                  <ProjectCard project={p} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'rounded-full border px-4 py-2 text-xs font-medium transition-all',
        active
          ? 'border-ember-300/70 bg-ember-400/10 text-bone'
          : 'border-ink-700 text-bone/70 hover:border-ink-500 hover:text-bone'
      )}
    >
      {children}
    </button>
  );
}
