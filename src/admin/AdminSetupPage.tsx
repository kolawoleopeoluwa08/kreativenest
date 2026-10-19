import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import { classNames } from '@/lib/video';

export function AdminSetupPage() {
  const { ready, user, isAdmin, adminChecked, refreshAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [alreadySetup, setAlreadySetup] = useState<boolean | null>(null);

  useEffect(() => {
    // If an admin already exists, this page shouldn't be used.
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-bootstrap`, {
      method: 'GET',
      headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string },
    })
      .then((r) => r.json())
      .then((b) => setAlreadySetup(!!b?.admin))
      .catch(() => setAlreadySetup(false));
  }, []);

  if (ready && adminChecked && alreadySetup && user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 10) {
      setError('Password must be at least 10 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    const res = await adminApi.bootstrap(email.trim(), password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(true);
    // Refresh admin check; the new user is not yet signed in, so they'll
    // be routed to /admin/login after a short delay.
    await refreshAdmin();
    setTimeout(() => navigate('/admin/login'), 1200);
  }

  if (done) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="grain-overlay" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-cinematic" aria-hidden />
        <div className="relative z-10 w-full max-w-md text-center">
          <ShieldCheck className="mx-auto mb-4 text-ember-300" size={32} />
          <h1 className="font-display text-3xl text-bone">Admin created</h1>
          <p className="mt-3 text-bone/70">
            You can now sign in with the credentials you just created.
          </p>
          <Link to="/admin/login" className="btn-primary mt-6">
            Go to sign in <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grain-overlay" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-cinematic" aria-hidden />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="font-display text-2xl text-bone">KreativeNest</Link>
          <p className="mt-1 text-xs font-mono uppercase tracking-widestish text-ink-300">
            Initial admin setup
          </p>
        </div>
        <div className="card-surface p-6">
          <p className="text-sm text-bone/70 mb-5 text-pretty">
            This one-time step creates the first admin account. Choose a strong
            password (10+ characters). After this, the setup page is locked.
          </p>
          <form onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="field-label">Admin email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
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
                required
                minLength={10}
                autoComplete="new-password"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="confirm" className="field-label">Confirm password</label>
              <input
                id="confirm"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                className="field-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              {busy ? <Loader2 size={16} className="animate-spin" /> : 'Create admin account'}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-ink-400">
          <Link to="/" className="hover:text-bone">Back to site</Link>
        </p>
      </div>
    </div>
  );
}
