import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Section } from '@/components/Section';
import { Seo } from '@/components/Seo';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { submitInquiry } from '@/lib/api';
import { classNames } from '@/lib/video';

const PROJECT_TYPES = [
  'Branded film',
  'Documentary',
  'Music video',
  'Wedding',
  'Event',
  'Commercial',
  'Other',
];

const BUDGETS = ['Under $5k', '$5k–$15k', '$15k–$40k', '$40k+', 'Not sure yet'];
const TIMELINES = ['ASAP', '1–3 months', '3–6 months', '6+ months', 'Flexible'];

interface FormState {
  name: string;
  email: string;
  project_type: string;
  budget: string;
  timeline: string;
  message: string;
  website: string; // honeypot
}

const empty: FormState = {
  name: '',
  email: '',
  project_type: '',
  budget: '',
  timeline: '',
  message: '',
  website: '',
};

export function ContactPage() {
  const { settings } = useSiteSettings();
  const s = settings;
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'A valid email is required.';
    }
    if (form.message.trim().length < 10) {
      next.message = 'Please include a message of at least 10 characters.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setStatus('submitting');
    const res = await submitInquiry({
      name: form.name,
      email: form.email,
      project_type: form.project_type || undefined,
      budget: form.budget || undefined,
      timeline: form.timeline || undefined,
      message: form.message,
      website: form.website,
    });
    if (res.ok) {
      setStatus('success');
      setForm(empty);
    } else {
      setStatus('error');
      setServerError(res.error);
    }
  }

  return (
    <>
      <Seo
        settings={s}
        title="Contact"
        description={`Get in touch with ${s?.business_name ?? 'KreativeNest'} about your next film.`}
      />

      <Section className="pt-32 md:pt-40">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="eyebrow mb-3">Contact</p>
            <h1 className="font-display text-4xl md:text-6xl tracking-tightish text-bone text-balance">
              Let&apos;s make something
            </h1>
            <p className="mt-5 text-bone/70 text-pretty md:text-lg">
              Tell us about your project. The more detail you share, the better we
              can respond. We reply to every serious enquiry within a few days.
            </p>

            <div className="mt-8 space-y-3 text-sm">
              {s?.contact_email && (
                <a
                  href={`mailto:${s.contact_email}`}
                  className="flex items-center gap-3 text-bone/80 hover:text-bone transition-colors"
                >
                  <Mail size={16} className="text-ember-300/80" /> {s.contact_email}
                </a>
              )}
              {s?.phone && (
                <a
                  href={`tel:${s.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-3 text-bone/80 hover:text-bone transition-colors"
                >
                  <Phone size={16} className="text-ember-300/80" /> {s.phone}
                </a>
              )}
              {s?.location && (
                <p className="flex items-center gap-3 text-bone/80">
                  <MapPin size={16} className="text-ember-300/80" /> {s.location}
                </p>
              )}
            </div>

            {s?.social_links && Object.keys(s.social_links).length > 0 && (
              <div className="mt-8 border-t border-ink-800 pt-6">
                <p className="eyebrow mb-3">Follow</p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(s.social_links).map(([k, v]) => (
                    <a
                      key={k}
                      href={v}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-ink-700 px-4 py-2 text-xs capitalize text-bone/80 hover:border-ember-300/60 hover:text-bone transition-colors"
                    >
                      {k}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-7">
            <form
              onSubmit={onSubmit}
              noValidate
              className="card-surface p-6 md:p-8"
              aria-label="Contact form"
            >
              {status === 'success' ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <CheckCircle2 className="mb-4 text-ember-300" size={32} />
                  <h2 className="font-display text-2xl text-bone">Message received</h2>
                  <p className="mt-2 max-w-sm text-bone/70 text-pretty">
                    Thanks for reaching out. We&apos;ll be in touch at the email you
                    provided.
                  </p>
                  <button
                    type="button"
                    className="btn-ghost mt-6"
                    onClick={() => setStatus('idle')}
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="field-label">Name *</label>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        className={classNames('field-input', errors.name && 'border-ember-400/70')}
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                      />
                      {errors.name && <p className="field-error">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="field-label">Email *</label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className={classNames('field-input', errors.email && 'border-ember-400/70')}
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                      />
                      {errors.email && <p className="field-error">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="project_type" className="field-label">Project type</label>
                      <select
                        id="project_type"
                        className="field-input"
                        value={form.project_type}
                        onChange={(e) => update('project_type', e.target.value)}
                      >
                        <option value="">Select…</option>
                        {PROJECT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="budget" className="field-label">Estimated budget</label>
                      <select
                        id="budget"
                        className="field-input"
                        value={form.budget}
                        onChange={(e) => update('budget', e.target.value)}
                      >
                        <option value="">Select…</option>
                        {BUDGETS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="timeline" className="field-label">Preferred timeline</label>
                    <select
                      id="timeline"
                      className="field-input"
                      value={form.timeline}
                      onChange={(e) => update('timeline', e.target.value)}
                    >
                      <option value="">Select…</option>
                      {TIMELINES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="message" className="field-label">Message *</label>
                    <textarea
                      id="message"
                      rows={5}
                      className={classNames('field-input resize-y', errors.message && 'border-ember-400/70')}
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                    />
                    {errors.message && <p className="field-error">{errors.message}</p>}
                  </div>

                  {/* Honeypot — visually hidden, must stay empty */}
                  <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label htmlFor="website">Website (leave empty)</label>
                    <input
                      id="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) => update('website', e.target.value)}
                    />
                  </div>

                  {status === 'error' && serverError && (
                    <div className="mt-5 flex items-start gap-2 rounded-xl border border-ember-400/40 bg-ember-500/10 p-3 text-sm text-ember-200">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <p className="text-xs text-ink-300">
                      Protected against spam. We never share your details.
                    </p>
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="btn-primary"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Sending…
                        </>
                      ) : (
                        <>
                          Send message <Send size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
            <p className="mt-4 text-xs text-ink-400">
              By submitting, you agree to be contacted about your enquiry.{' '}
              <Link to="/" className="underline underline-offset-4 hover:text-bone">Return home</Link>.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
