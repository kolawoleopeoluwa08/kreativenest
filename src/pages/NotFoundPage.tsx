import { Link } from 'react-router-dom';
import { Section } from '@/components/Section';
import { Seo } from '@/components/Seo';

export function NotFoundPage() {
  return (
    <>
      <Seo title="Not found" />
      <Section className="pt-32 md:pt-40">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow mb-3">404</p>
          <h1 className="font-display text-4xl md:text-6xl text-bone text-balance">
            This reel is empty
          </h1>
          <p className="mt-4 text-bone/70 text-pretty">
            The page you were looking for doesn&apos;t exist or has moved.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/" className="btn-primary">Back home</Link>
            <Link to="/work" className="btn-ghost">View work</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
