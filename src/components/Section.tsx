import type { ReactNode } from 'react';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={
        align === 'center'
          ? `mx-auto max-w-2xl text-center ${className}`
          : `max-w-2xl ${className}`
      }
    >
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-display text-3xl md:text-5xl tracking-tightish text-bone text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-bone/70 text-pretty md:text-lg">{description}</p>
      )}
    </div>
  );
}

export function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`relative py-20 md:py-32 ${className}`}>
      <div className="container-prose">{children}</div>
    </section>
  );
}
