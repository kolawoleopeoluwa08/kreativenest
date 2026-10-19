import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Calendar, Building2, Tag } from 'lucide-react';
import { Section } from '@/components/Section';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ProjectCard } from '@/components/ProjectCard';
import { LoadingState, ErrorState } from '@/components/States';
import { Seo } from '@/components/Seo';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { fetchProjectBySlug, fetchRelatedProjects } from '@/lib/api';
import { formatDate } from '@/lib/video';
import type { Project } from '@/lib/types';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSiteSettings();
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [related, setRelated] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setProject(undefined);
    setError(null);
    if (!slug) return;
    fetchProjectBySlug(slug)
      .then(async (p) => {
        if (!mounted) return;
        if (!p) {
          setProject(null);
          return;
        }
        setProject(p);
        try {
          const r = await fetchRelatedProjects(p, 3);
          if (mounted) setRelated(r);
        } catch {
          /* non-fatal */
        }
      })
      .catch((e) => mounted && setError(e.message ?? 'Failed to load project'));
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (project === undefined && !error) {
    return (
      <Section className="pt-32">
        <LoadingState label="Loading project…" />
      </Section>
    );
  }
  if (error) {
    return (
      <Section className="pt-32">
        <ErrorState message={error} />
      </Section>
    );
  }
  if (project === null) {
    return (
      <Section className="pt-32">
        <ErrorState
          message="This project isn't here — it may have been unpublished or removed."
          action={
            <Link to="/work" className="btn-ghost">
              Back to portfolio
            </Link>
          }
        />
      </Section>
    );
  }

  return (
    <>
      <Seo
        settings={settings}
        title={project.seo_title ?? project.title}
        description={
          project.seo_description ?? project.short_description ?? undefined
        }
        image={project.poster_url ?? project.thumbnail_url ?? undefined}
      />

      <Section className="pt-28 md:pt-32">
        <Link
          to="/work"
          className="inline-flex items-center gap-2 text-sm text-bone/70 hover:text-bone transition-colors"
        >
          <ArrowLeft size={16} /> Back to work
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-12 md:gap-12 items-start">
          <div className="md:col-span-8">
            <VideoPlayer
              url={project.video_url}
              poster={project.poster_url ?? project.thumbnail_url}
              title={project.title}
            />
          </div>

          <div className="md:col-span-4 md:sticky md:top-28">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-widestish text-ember-300/90">
              {project.category?.name && <span>{project.category.name}</span>}
              {project.year && (
                <>
                  <span className="text-ink-500">/</span>
                  <span className="text-ink-300">{project.year}</span>
                </>
              )}
              {project.featured && (
                <span className="rounded-full border border-ember-300/40 px-2 py-0.5 text-ember-200">
                  Featured
                </span>
              )}
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-tightish text-bone text-balance">
              {project.title}
            </h1>
            {project.short_description && (
              <p className="mt-4 text-bone/70 text-pretty md:text-lg">
                {project.short_description}
              </p>
            )}

            {/* Meta */}
            <dl className="mt-7 space-y-3 border-t border-ink-800 pt-6 text-sm">
              {project.client && (
                <div className="flex items-center gap-2 text-bone/75">
                  <Building2 size={15} className="text-ember-300/70" />
                  <dt className="text-ink-300">Client:</dt>
                  <dd>{project.client}</dd>
                </div>
              )}
              {project.year && (
                <div className="flex items-center gap-2 text-bone/75">
                  <Calendar size={15} className="text-ember-300/70" />
                  <dt className="text-ink-300">Year:</dt>
                  <dd>{project.year}</dd>
                </div>
              )}
              {project.category?.name && (
                <div className="flex items-center gap-2 text-bone/75">
                  <Tag size={15} className="text-ember-300/70" />
                  <dt className="text-ink-300">Category:</dt>
                  <dd>{project.category.name}</dd>
                </div>
              )}
              <div className="flex items-center gap-2 text-bone/50">
                <dt className="text-ink-400 font-mono text-xs">Added:</dt>
                <dd className="text-xs">{formatDate(project.created_at)}</dd>
              </div>
            </dl>

            {/* Credits */}
            {project.credits && project.credits.length > 0 && (
              <div className="mt-6 border-t border-ink-800 pt-6">
                <p className="eyebrow mb-3">Credits</p>
                <ul className="space-y-2 text-sm">
                  {project.credits.map((c, i) => (
                    <li key={i} className="flex justify-between gap-4 text-bone/75">
                      <span className="text-ink-300">{c.role}</span>
                      <span className="text-right">{c.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {settings?.contact_email && (
              <a
                href={`mailto:${settings.contact_email}?subject=Inquiry: ${encodeURIComponent(project.title)}`}
                className="btn-link mt-7"
              >
                Enquire about this project <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Full description */}
        {project.full_description && (
          <div className="mt-16 max-w-prose2">
            <p className="eyebrow mb-4">Synopsis</p>
            <p className="text-bone/80 text-pretty md:text-lg leading-relaxed whitespace-pre-line">
              {project.full_description}
            </p>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20 border-t border-ink-800/70 pt-12">
            <p className="eyebrow mb-6">Related work</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
