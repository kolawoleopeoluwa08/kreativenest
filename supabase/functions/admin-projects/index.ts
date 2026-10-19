import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = (() => { try { const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}') as Record<string,string>; return keys.default ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''; } catch { return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''; } })();

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function verifyAdmin(req: Request): Promise<boolean> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return false;
  const { data: row } = await admin
    .from('site_admins')
    .select('id')
    .eq('auth_user_id', data.user.id)
    .maybeSingle();
  return !!row;
}

function sanitize(s: unknown, max: number): string {
  if (typeof s !== 'string') return '';
  return s.trim().slice(0, max);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toInt(v: unknown, def = 0): number {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : def;
}

function normalizeCredits(v: unknown): { role: string; name: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((c): c is { role: string; name: string } =>
      typeof c === 'object' && c !== null &&
      typeof (c as Record<string, unknown>).role === 'string' &&
      typeof (c as Record<string, unknown>).name === 'string'
    )
    .map((c) => ({ role: sanitize(c.role, 80), name: sanitize(c.name, 120) }))
    .filter((c) => c.role && c.name);
}

function toNullIfEmpty(s: unknown): string | null {
  if (typeof s !== 'string') return null;
  const v = s.trim();
  return v.length === 0 ? null : v;
}

interface ProjectInput {
  slug?: string;
  title?: string;
  short_description?: string | null;
  full_description?: string | null;
  category_id?: string | null;
  client?: string | null;
  year?: number | null;
  shot_date?: string | null;
  thumbnail_url?: string | null;
  poster_url?: string | null;
  video_url?: string | null;
  video_provider?: string;
  featured?: boolean;
  is_published?: boolean;
  display_order?: number;
  credits?: { role: string; name: string }[];
  seo_title?: string | null;
  seo_description?: string | null;
}

function validateProjectInput(body: ProjectInput, partial: boolean): string | null {
  if (!partial || body.title !== undefined) {
    if (!sanitize(body.title, 200)) return 'Title is required.';
  }
  if (!partial || body.slug !== undefined) {
    if (!slugify(sanitize(body.slug, 200))) return 'A valid slug is required.';
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) return json({ error: 'Unauthorized' }, 401);

    const url = new URL(req.url);

    // GET: list all projects (incl. drafts)
    if (req.method === 'GET') {
      const { data, error } = await admin
        .from('projects')
        .select('*, category:categories(*)')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) return json({ error: error.message }, 500);
      return json(data);
    }

    // POST: create
    if (req.method === 'POST') {
      const body = (await req.json().catch(() => ({}))) as ProjectInput;
      const vErr = validateProjectInput(body, false);
      if (vErr) return json({ error: vErr }, 400);

      const slug = slugify(sanitize(body.slug, 200));
      // ensure slug uniqueness
      const { data: existing } = await admin
        .from('projects')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (existing) return json({ error: 'That slug is already in use.' }, 409);

      const insert = {
        slug,
        title: sanitize(body.title, 200),
        short_description: toNullIfEmpty(body.short_description),
        full_description: toNullIfEmpty(body.full_description),
        category_id: toNullIfEmpty(body.category_id),
        client: toNullIfEmpty(body.client),
        year: body.year ? toInt(body.year, null as unknown as number) : null,
        shot_date: toNullIfEmpty(body.shot_date),
        thumbnail_url: toNullIfEmpty(body.thumbnail_url),
        poster_url: toNullIfEmpty(body.poster_url),
        video_url: toNullIfEmpty(body.video_url),
        video_provider: sanitize(body.video_provider, 20) || 'external',
        featured: !!body.featured,
        is_published: !!body.is_published,
        display_order: toInt(body.display_order, 0),
        credits: normalizeCredits(body.credits),
        seo_title: toNullIfEmpty(body.seo_title),
        seo_description: toNullIfEmpty(body.seo_description),
      };

      const { data, error } = await admin
        .from('projects')
        .insert(insert)
        .select('*, category:categories(*)')
        .single();
      if (error) return json({ error: error.message }, 500);
      return json(data);
    }

    // PUT: update by ?id=
    if (req.method === 'PUT') {
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'Missing id' }, 400);
      const body = (await req.json().catch(() => ({}))) as ProjectInput;
      const vErr = validateProjectInput(body, true);
      if (vErr) return json({ error: vErr }, 400);

      const patch: Record<string, unknown> = {};
      if (body.title !== undefined) patch.title = sanitize(body.title, 200);
      if (body.slug !== undefined) {
        const slug = slugify(sanitize(body.slug, 200));
        const { data: dup } = await admin
          .from('projects')
          .select('id')
          .eq('slug', slug)
          .neq('id', id)
          .maybeSingle();
        if (dup) return json({ error: 'That slug is already in use.' }, 409);
        patch.slug = slug;
      }
      if (body.short_description !== undefined) patch.short_description = toNullIfEmpty(body.short_description);
      if (body.full_description !== undefined) patch.full_description = toNullIfEmpty(body.full_description);
      if (body.category_id !== undefined) patch.category_id = toNullIfEmpty(body.category_id);
      if (body.client !== undefined) patch.client = toNullIfEmpty(body.client);
      if (body.year !== undefined) patch.year = body.year === null ? null : toInt(body.year, 0);
      if (body.shot_date !== undefined) patch.shot_date = toNullIfEmpty(body.shot_date);
      if (body.thumbnail_url !== undefined) patch.thumbnail_url = toNullIfEmpty(body.thumbnail_url);
      if (body.poster_url !== undefined) patch.poster_url = toNullIfEmpty(body.poster_url);
      if (body.video_url !== undefined) patch.video_url = toNullIfEmpty(body.video_url);
      if (body.video_provider !== undefined) patch.video_provider = sanitize(body.video_provider, 20) || 'external';
      if (body.featured !== undefined) patch.featured = !!body.featured;
      if (body.is_published !== undefined) patch.is_published = !!body.is_published;
      if (body.display_order !== undefined) patch.display_order = toInt(body.display_order, 0);
      if (body.credits !== undefined) patch.credits = normalizeCredits(body.credits);
      if (body.seo_title !== undefined) patch.seo_title = toNullIfEmpty(body.seo_title);
      if (body.seo_description !== undefined) patch.seo_description = toNullIfEmpty(body.seo_description);

      const { data, error } = await admin
        .from('projects')
        .update(patch)
        .eq('id', id)
        .select('*, category:categories(*)')
        .single();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: 'Not found' }, 404);
      return json(data);
    }

    // DELETE
    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'Missing id' }, 400);
      const { error } = await admin.from('projects').delete().eq('id', id);
      if (error) return json({ error: error.message }, 500);
      return json({ message: 'Deleted' });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Server error' }, 500);
  }
});
