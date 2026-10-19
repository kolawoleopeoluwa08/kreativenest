import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ADMIN_EDGE_BASE } from '@/lib/supabase';
import { classNames } from '@/lib/video';

export function AdminLoginPage() {
  const { ready, user, isAdmin, adminChecked, signIn, refreshAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [setupDone, setSetupDone] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${ADMIN_EDGE_BASE}/admin-bootstrap`, { method: 'GET' })
      .then((r) => r.json())
      .then((b) => setSetupDone(!!b?.admin))
      .catch(() => setSetupDone(false));
  }, []);

  if (ready && adminChecked && setupDone === false) {
    return <Navigate to="/admin/setup" replace />;
  }
  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await signIn(email.trim(), password);
    if (res.error) {
      setError(res.error);
      setBusy(false);
      return;
    }
    await refreshAdmin();
    // Slight delay to let context settle; navigate regardless.
    setTimeout(() => navigate('/admin'), 50);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="grain-overlay" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-cinematic" aria-hidden />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-2xl text-bone">KreativeNest</Link>
          <p className="mt-1 text-xs font-mono uppercase tracking-widestish text-ink-300">
            Admin sign in
          </p>
        </div>
        <form onSubmit={onSubmit} className="card-surface p-6">
          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="mt-4 rounded-lg border border-ember-400/40 bg-ember-500/10 p-2.5 text-sm text-ember-200">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className={classNames('btn-primary mt-6 w-full')}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <><Lock size={15} /> Sign in</>}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-ink-400">
          <Link to="/" className="hover:text-bone inline-flex items-center gap-1">
            Back to site <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export { supabase };
