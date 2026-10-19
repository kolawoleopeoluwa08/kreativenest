import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { Section, SectionHeading } from '@/components/Section';
import { Seo } from '@/components/Seo';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export function AboutPage() {
  const { settings } = useSiteSettings();
  const s = settings;
  const services = s?.services ?? [];

  return (
    <>
      <Seo
        settings={s}
        title="About"
        description={s?.bio ?? undefined}
        image={s?.portrait_url ?? undefined}
      />

      <Section className="pt-32 md:pt-40">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16 items-start">
          <div className="md:col-span-5">
            {s?.portrait_url ? (
              <div className="overflow-hidden rounded-2xl border border-ink-700/70">
                <img
                  src={s.portrait_url}
                  alt={s?.business_name ?? 'Portrait'}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/5] w-full rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 flex items-center justify-center text-ink-500 text-sm text-center px-6">
                Add a portrait image URL in the admin area to show it here.
              </div>
            )}
          </div>
          <div className="md:col-span-7">
            <p className="eyebrow mb-3">About</p>
            <h1 className="font-display text-4xl md:text-6xl tracking-tightish text-bone text-balance">
              {s?.business_name || 'KreativeNest'}
            </h1>
            {s?.tagline && (
              <p className="mt-4 text-bone/70 text-pretty md:text-lg">{s.tagline}</p>
            )}
            <div className="mt-8 space-y-5 text-bone/80 text-pretty md:text-lg leading-relaxed whitespace-pre-line">
              {s?.bio ??
                'KreativeNest is the work of [YOUR NAME OR BUSINESS], a cinematographer crafting cinematic branded films, documentaries, and music videos with a quiet, intentional visual language.'}
            </div>

            <div className="mt-8 flex flex-col gap-2 text-sm text-bone/75">
              {s?.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={15} className="text-ember-300/80" /> {s.location}
                </span>
              )}
              {s?.contact_email && (
                <a
                  href={`mailto:${s.contact_email}`}
                  className="inline-flex items-center gap-2 hover:text-bone transition-colors"
                >
                  <Mail size={15} className="text-ember-300/80" /> {s.contact_email}
                </a>
              )}
              {s?.phone && (
                <a
                  href={`tel:${s.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2 hover:text-bone transition-colors"
                >
                  <Phone size={15} className="text-ember-300/80" /> {s.phone}
                </a>
              )}
            </div>

            <div className="mt-8">
              <Link to="/contact" className="btn-primary">
                Work together <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {services.length > 0 && (
        <Section className="border-t border-ink-800/60">
          <SectionHeading
            eyebrow="Services"
            title="How we can work together"
            align="center"
            className="mb-12"
          />
          <div className="grid gap-px bg-ink-800/60 rounded-2xl overflow-hidden border border-ink-800/60 sm:grid-cols-2">
            {services.map((sv) => (
              <div key={sv.title} className="bg-ink-950 p-7 md:p-8 transition-colors hover:bg-ink-900">
                <h3 className="font-display text-xl text-bone">{sv.title}</h3>
                {sv.description && (
                  <p className="mt-3 text-sm text-bone/65 text-pretty">{sv.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
