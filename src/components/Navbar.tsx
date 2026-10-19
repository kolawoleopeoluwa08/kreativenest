import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { classNames } from '@/lib/video';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const { settings } = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const brand = settings?.business_name || 'KreativeNest';

  return (
    <header
      className={classNames(
        'fixed inset-x-0 top-0 z-40 transition-all duration-500',
        scrolled
          ? 'bg-ink-950/85 backdrop-blur-md border-b border-ink-800/80'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="container-prose flex h-16 md:h-20 items-center justify-between">
        <Link to="/" className="group flex items-center gap-2" aria-label={`${brand} — home`}>
          <span className="font-display text-xl md:text-2xl tracking-tightish text-bone">
            {brand}
          </span>
          <span className="hidden md:inline-block h-1.5 w-1.5 rounded-full bg-ember-400/90 transition-transform duration-500 group-hover:scale-125" />
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                classNames(
                  'relative text-sm tracking-wide transition-colors duration-200 py-2',
                  isActive
                    ? 'text-bone'
                    : 'text-bone/70 hover:text-bone'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  <span
                    className={classNames(
                      'absolute -bottom-0.5 left-0 h-px bg-ember-300 transition-all duration-300',
                      isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/contact" className="btn-primary !px-5 !py-2.5 text-xs">
            Get in touch
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg text-bone hover:bg-ink-850 transition"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden fixed inset-0 top-16 z-30 bg-ink-950/95 backdrop-blur-md animate-fade-in">
          <nav
            className="container-prose flex flex-col gap-2 pt-8"
            aria-label="Mobile"
          >
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  classNames(
                    'border-b border-ink-800 py-5 font-display text-2xl tracking-tightish transition-colors',
                    isActive ? 'text-bone' : 'text-bone/70 hover:text-bone'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/contact" className="btn-primary mt-6 w-full">
              Get in touch
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
