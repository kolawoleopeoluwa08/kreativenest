import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { SiteSettings } from '@/lib/types';
import { fetchSiteSettings } from '@/lib/api';

interface SettingsState {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const Ctx = createContext<SettingsState | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const s = await fetchSiteSettings();
      setSettings(s);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <Ctx.Provider value={{ settings, loading, error, reload }}>{children}</Ctx.Provider>
  );
}

export function useSiteSettings(): SettingsState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSiteSettings must be used inside SiteSettingsProvider');
  return ctx;
}
