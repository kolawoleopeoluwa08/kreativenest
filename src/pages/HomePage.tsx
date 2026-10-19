import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { Section, SectionHeading } from '@/components/Section';
import { ProjectCard } from '@/components/ProjectCard';
import { LoadingState, ErrorState } from '@/components/States';
import { Seo } from '@/components/Seo';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { fetchPublishedProjects } from '@/lib/api';
import type { Project } from '@/lib/types';

export function HomePage() {
  const { settings } = useSiteSettings();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchPublishedProjects()
      .then((p) => mounted && setProjects(p))
      .catch((e) => mounted && setError(e.message ?? 'Failed to load projects'));
    return () => {
      mounted = false;
    };
  }, []);

  const featured = useMemo(
    () => (projects ?? []).find((p) => p.featured) ?? (projects ?? [])[0] ?? null,
    [projects]
  );
  const recent = useMemo(
    () => (projects ?? []).slice(0, 6),
    [projects]
  );
  const services = settings?.services ?? [];
  const clients = settings?.clients ?? [];

  return (
    <>
      <Seo
        settings={settings}
        title={undefined}
        description={settings?.tagline ?? undefined}
        image={featured?.poster_url ?? undefined}
      />

      <Hero
        poster={featured?.poster_url ?? featured?.thumbnail_url ?? null}
        projectTitle={featured?.title}
        projectSlug={featured?.slug}
      />

      {/* Recent work */}
      <Section id="work">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <SectionHeading
            eyebrow="Selected Work"
            title="Recent films"
            description="A curated selection of recent cinematography across branded films, documentary, and music videos."
          />
          <Link to="/work" className="btn-link shrink-0">
            View all projects <ArrowRight size={16} />
          </Link>
        </div>

        {!projects && !error && <LoadingState label="Loading projects…" />}
        {error && <ErrorState message={error} />}
        {projects && projects.length === 0 && (
          <p className="text-bone/60">No projects published yet. Check back soon.</p>
        )}
        {projects && projects.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((p, i) => (
              <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <ProjectCard project={p} index={i} />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Approach / bio */}
      <Section className="border-t border-ink-800/60">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16 items-center">
          <div className="md:col-span-5">
            {settings?.portrait_url ? (
              <div className="overflow-hidden rounded-2xl border border-ink-700/70">
                <img
                  src={settings.portrait_url}
                  alt={settings?.business_name ?? 'Portrait'}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/5] w-full rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 flex items-center justify-center text-ink-500 text-sm">
                Portrait image not set
              </div>
            )}
          </div>
          <div className="md:col-span-7">
            <SectionHeading
              eyebrow="The Cinematographer"
              title="A quiet, intentional visual language"
            />
            <p className="mt-6 text-bone/75 text-pretty md:text-lg leading-relaxed">
              {settings?.bio ??
                'KreativeNest is the work of [YOUR NAME OR BUSINESS], a cinematographer crafting cinematic branded films, documentaries, and music videos with a quiet, intentional visual language.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/about" className="btn-ghost">
                More about the work
              </Link>
              <Link to="/contact" className="btn-link">
                Start a project <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Services */}
      {services.length > 0 && (
        <Section className="border-t border-ink-800/60">
          <SectionHeading
            eyebrow="Services"
            title="What we do"
            description="A focused set of cinematography and post-production services, adaptable to your project."
            align="center"
            className="mb-12"
          />
          <div className="grid gap-px bg-ink-800/60 rounded-2xl overflow-hidden border border-ink-800/60 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.title} className="bg-ink-950 p-7 md:p-8 transition-colors hover:bg-ink-900">
                <h3 className="font-display text-xl text-bone">{s.title}</h3>
                {s.description && (
                  <p className="mt-3 text-sm text-bone/65 text-pretty">{s.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Clients / recognition — hidden when empty */}
      {clients.length > 0 && (
        <Section className="border-t border-ink-800/60">
          <SectionHeading
            eyebrow="Recognition"
            title="Selected clients & credits"
            className="mb-10"
          />
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {clients.map((c) => (
              <span key={c} className="font-display text-xl md:text-2xl text-bone/70">
                {c}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Contact CTA */}
      <Section className="border-t border-ink-800/60">
        <div className="relative overflow-hidden rounded-3xl border border-ink-800 bg-gradient-to-br from-ink-900 to-ink-950 p-10 md:p-16 text-center">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-ember-500/10 blur-3xl" />
          <p className="eyebrow mb-4">Let&apos;s build something</p>
          <h2 className="font-display text-3xl md:text-5xl text-bone text-balance max-w-2xl mx-auto">
            Have a story worth telling?
          </h2>
          <p className="mt-4 text-bone/70 max-w-xl mx-auto text-pretty">
            Tell us about your project — we&apos;ll reply within a few days.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-primary">
              Get in touch <ArrowRight size={16} />
            </Link>
            <Link to="/work" className="btn-ghost">
              Browse the work
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
