import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ADMIN_EDGE_BASE } from '@/lib/supabase';

interface AuthState {
  ready: boolean;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  adminChecked: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  const checkAdmin = useCallback(async (s: Session | null) => {
    if (!s?.access_token) {
      setIsAdmin(false);
      setAdminChecked(true);
      return;
    }
    try {
      const res = await fetch(`${ADMIN_EDGE_BASE}/admin-bootstrap`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${s.access_token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string },
      });
      // 200 => admin; anything else => not admin
      setIsAdmin(res.ok);
    } catch {
      setIsAdmin(false);
    } finally {
      setAdminChecked(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setReady(true);
      // onAuthStateChange deadlock guard: run async in IIFE
      (async () => {
        await checkAdmin(data.session ?? null);
      })();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      (async () => {
        await checkAdmin(s);
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setAdminChecked(true);
  }, []);

  const refreshAdmin = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await checkAdmin(data.session ?? null);
  }, [checkAdmin]);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      isAdmin,
      adminChecked,
      signIn,
      signOut,
      refreshAdmin,
    }),
    [ready, session, isAdmin, adminChecked, signIn, signOut, refreshAdmin]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
