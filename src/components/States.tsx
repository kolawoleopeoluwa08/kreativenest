import type { ReactNode } from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-ink-300">
      <Loader2 className="mb-3 animate-spin text-ember-300/80" size={24} />
      <p className="font-mono text-xs uppercase tracking-widestish">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <AlertCircle className="mb-3 text-ember-300/80" size={24} />
      <p className="max-w-md text-bone/80">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-ghost mt-5">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 px-6 py-16 text-center">
      <Inbox className="mb-4 text-ember-300/70" size={26} />
      <p className="font-display text-2xl text-bone">{title}</p>
      {description && (
        <p className="mt-2 max-w-md text-sm text-bone/60 text-pretty">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
