import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, LogOut, Film, Mail, FolderTree, Settings as SettingsIcon, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ADMIN_EDGE_BASE } from '@/lib/supabase';
import { classNames } from '@/lib/video';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { ready, isAdmin, adminChecked, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [setupDone, setSetupDone] = useState<boolean | null>(null);

  useEffect(() => {
    // Check whether any admin exists (so we can route to the bootstrap page)
    fetch(`${ADMIN_EDGE_BASE}/admin-bootstrap`, { method: 'GET' })
      .then((r) => r.json())
      .then((b) => setSetupDone(!!b?.admin))
      .catch(() => setSetupDone(false));
  }, []);

  if (!ready || !adminChecked || setupDone === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-ember-300" />
      </div>
    );
  }

  // No admin yet → bootstrap page
  if (setupDone === false) {
    return <Navigate to="/admin/setup" replace />;
  }

  // Admin exists but not signed in → login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Signed in but not an admin
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-2xl text-bone">Not authorized</p>
        <p className="mt-2 max-w-md text-bone/70">
          Your account doesn&apos;t have admin access. Ask an existing admin to add you,
          or sign out and back in with an admin account.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="btn-ghost"
            onClick={async () => {
              await signOut();
              navigate('/admin/login');
            }}
          >
            Sign out
          </button>
          <Link to="/" className="btn-link">Back to site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-ink-950 text-bone">
      <div className="grain-overlay" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 bg-cinematic" aria-hidden />

      <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/admin" className="font-display text-lg text-bone">
            KreativeNest <span className="text-ink-400 text-xs font-mono ml-2">admin</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="inline-flex items-center gap-1.5 text-bone/70 hover:text-bone transition-colors">
              <Eye size={14} /> View site
            </Link>
            <span className="text-ink-400 hidden md:inline">{user.email}</span>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate('/admin/login');
              }}
              className="inline-flex items-center gap-1.5 text-bone/70 hover:text-bone transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row">
        <nav className="md:w-56 shrink-0" aria-label="Admin">
          <ul className="flex md:flex-col gap-1 overflow-x-auto">
            <AdminNavLink to="/admin" end icon={<Film size={16} />} label="Projects" />
            <AdminNavLink to="/admin/inquiries" icon={<Mail size={16} />} label="Inquiries" />
            <AdminNavLink to="/admin/categories" icon={<FolderTree size={16} />} label="Categories" />
            <AdminNavLink to="/admin/settings" icon={<SettingsIcon size={16} />} label="Settings" />
          </ul>
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

function AdminNavLink({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}) {
  return (
    <li>
      <Link
        to={to}
        end={end}
        className={({ isActive }) =>
          classNames(
            'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors',
            isActive
              ? 'bg-ink-850 text-bone border border-ink-700'
              : 'text-bone/70 hover:text-bone hover:bg-ink-900 border border-transparent'
          )
        }
      >
        {icon} {label}
      </Link>
    </li>
  );
}

// Re-export for convenience
export { supabase };
