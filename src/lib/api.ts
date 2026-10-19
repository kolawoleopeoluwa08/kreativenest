import { supabase, ADMIN_EDGE_BASE } from './supabase';
import type {
  Category,
  Inquiry,
  Project,
  ProjectInput,
  SiteSettings,
  SocialLinks,
} from './types';

// ---------- public reads ----------

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPublishedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return data ? (data as unknown as Project) : null;
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data ? (data as unknown as SiteSettings) : null;
}

export async function fetchRelatedProjects(project: Project, limit = 3): Promise<Project[]> {
  let q = supabase
    .from('projects')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .neq('id', project.id)
    .order('display_order', { ascending: true })
    .limit(limit);
  if (project.category_id) {
    q = (q as typeof q).eq('category_id', project.category_id);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Project[];
}

// ---------- contact form ----------

export async function submitInquiry(input: {
  name: string;
  email: string;
  project_type?: string;
  budget?: string;
  timeline?: string;
  message: string;
  website?: string; // honeypot
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${ADMIN_EDGE_BASE}/contact-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: body?.error || `Request failed (${res.status})` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error. Please try again.',
    };
  }
}

// ---------- admin: edge-function wrappers ----------

async function adminFetch<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string; status?: number }> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      ...(init?.headers as Record<string, string> | undefined),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${ADMIN_EDGE_BASE}${path}`, { ...init, headers });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: body?.error || `Request failed (${res.status})`, status: res.status };
    }
    return { ok: true, data: body as T };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export const adminApi = {
  // bootstrap: create first admin
  bootstrap: (email: string, password: string) =>
    adminFetch<{ message: string }>('/admin-bootstrap', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // projects (all — including drafts)
  listProjects: () =>
    adminFetch<Project[]>('/admin-projects', { method: 'GET' }),
  createProject: (p: ProjectInput) =>
    adminFetch<Project>('/admin-projects', { method: 'POST', body: JSON.stringify(p) }),
  updateProject: (id: string, p: Partial<ProjectInput>) =>
    adminFetch<Project>(`/admin-projects?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(p),
    }),
  deleteProject: (id: string) =>
    adminFetch<{ message: string }>(`/admin-projects?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // categories
  listCategories: () => adminFetch<Category[]>('/admin-categories', { method: 'GET' }),
  upsertCategory: (c: { id?: string; name: string; slug: string; sort_order?: number }) =>
    adminFetch<Category>('/admin-categories', { method: 'POST', body: JSON.stringify(c) }),
  deleteCategory: (id: string) =>
    adminFetch<{ message: string }>(`/admin-categories?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // inquiries
  listInquiries: () => adminFetch<Inquiry[]>('/admin-inquiries', { method: 'GET' }),
  markInquiry: (id: string, is_read: boolean) =>
    adminFetch<Inquiry>(`/admin-inquiries?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read }),
    }),
  deleteInquiry: (id: string) =>
    adminFetch<{ message: string }>(`/admin-inquiries?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // settings
  getSettings: () => adminFetch<SiteSettings>('/admin-settings', { method: 'GET' }),
  updateSettings: (s: Partial<SiteSettings>) =>
    adminFetch<SiteSettings>('/admin-settings', { method: 'PUT', body: JSON.stringify(s) }),
};

export type AdminApi = typeof adminApi;
export type { SocialLinks };
