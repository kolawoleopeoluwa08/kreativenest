import { Link } from 'react-router-dom';
import { Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const socialIconMap: Record<string, typeof Instagram> = {
  instagram: Instagram,
  youtube: Youtube,
  vimeo: Youtube,
  tiktok: Instagram,
  facebook: Instagram,
  linkedin: Instagram,
  twitter: Instagram,
  website: Instagram,
};

const socialLabelMap: Record<string, string> = {
  instagram: 'Instagram',
  vimeo: 'Vimeo',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  website: 'Website',
};

export function Footer() {
  const { settings } = useSiteSettings();
  const s = settings;
  const socials = s?.social_links ?? {};
  const socialEntries = Object.entries(socials).filter(([, v]) => v);

  return (
    <footer className="relative z-10 border-t border-ink-800/80 bg-ink-950">
      <div className="container-prose py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="font-display text-2xl text-bone">
              {s?.business_name || 'KreativeNest'}
            </Link>
            {s?.tagline && (
              <p className="mt-3 text-bone/60 text-pretty max-w-sm">{s.tagline}</p>
            )}
            <div className="mt-6 flex flex-col gap-2 text-sm text-bone/70">
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
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow mb-4">Explore</p>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                { to: '/', label: 'Home' },
                { to: '/work', label: 'Portfolio' },
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-bone/70 hover:text-bone transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {socialEntries.length > 0 && (
            <div className="md:col-span-4">
              <p className="eyebrow mb-4">Follow</p>
              <ul className="flex flex-col gap-2.5 text-sm">
                {socialEntries.map(([key, url]) => {
                  const Icon = socialIconMap[key] ?? Instagram;
                  const label = socialLabelMap[key] ?? key;
                  return (
                    <li key={key}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-bone/70 hover:text-bone transition-colors"
                      >
                        <Icon size={15} className="text-ember-300/80" /> {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="divider mt-12 mb-6" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-ink-300">
          <p>
            &copy; {new Date().getFullYear()} {s?.business_name || 'KreativeNest'}. All rights reserved.
          </p>
          <p className="font-mono">
            Crafted for stories worth telling.
          </p>
        </div>
      </div>
    </footer>
  );
}
