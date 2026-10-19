import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';

interface HeroProps {
  poster: string | null;
  projectTitle?: string | null;
  projectSlug?: string | null;
}

export function Hero({ poster, projectTitle, projectSlug }: HeroProps) {
  const { settings } = useSiteSettings();
  const business = settings?.business_name || 'KreativeNest';
  const tagline = settings?.tagline || 'Cinematography for stories worth telling.';

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {poster ? (
          <img
            src={poster}
            alt=""
            aria-hidden
            className="h-full w-full object-cover animate-ken-burns"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-b from-ink-900 via-ink-950 to-ink-950" />
        )}
        <div className="absolute inset-0 bg-hero-scrim" />
        <div className="absolute inset-0 bg-cinematic opacity-90" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full pb-20 md:pb-28 pt-32">
        <div className="container-prose">
          <p className="eyebrow mb-5 animate-fade-up">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ember-400 mr-2 align-middle animate-pulse-line" />
            {business}
          </p>
          <h1
            className="max-w-4xl font-display text-5xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tightish text-bone text-balance animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            {tagline}
          </h1>
          <p
            className="mt-6 max-w-xl text-base md:text-lg text-bone/70 text-pretty animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            A cinematographer crafting cinematic branded films, documentaries,
            and music videos — built around light, texture, and rhythm.
          </p>
          <div
            className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            <Link to="/work" className="btn-primary">
              View Work <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-ghost">
              Get in touch
            </Link>
          </div>

          {projectTitle && projectSlug && (
            <p
              className="mt-10 font-mono text-xs uppercase tracking-widestish text-bone/50 animate-fade-in"
              style={{ animationDelay: '400ms' }}
            >
              Featured: <Link to={`/work/${projectSlug}`} className="text-bone/80 hover:text-bone underline-offset-4 hover:underline">{projectTitle}</Link>
            </p>
          )}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-bone/40 animate-pulse-line">
        <ArrowDown size={18} className="mx-auto" />
      </div>
    </section>
  );
}
