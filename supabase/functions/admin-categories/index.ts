import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const isOk = await verifyAdmin(req);
    if (!isOk) return json({ error: 'Unauthorized' }, 401);

    const url = new URL(req.url);

    if (req.method === 'GET') {
      const { data, error } = await admin
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) return json({ error: error.message }, 500);
      return json(data);
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const name = sanitize(body.name, 100);
      const slug = slugify(sanitize(body.slug, 100) || name);
      if (!name) return json({ error: 'Category name is required.' }, 400);
      if (!slug) return json({ error: 'A valid slug is required.' }, 400);

      const id = typeof body.id === 'string' && body.id ? body.id : undefined;
      const payload = { name, slug, sort_order: toInt(body.sort_order, 0) };

      if (id) {
        const { data, error } = await admin
          .from('categories')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);
        return json(data);
      }
      // uniqueness check
      const { data: dup } = await admin
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (dup) return json({ error: 'That slug is already in use.' }, 409);
      const { data, error } = await admin
        .from('categories')
        .insert(payload)
        .select()
        .single();
      if (error) return json({ error: error.message }, 500);
      return json(data);
    }

    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'Missing id' }, 400);
      // Projects reference category with ON DELETE SET NULL, so safe.
      const { error } = await admin.from('categories').delete().eq('id', id);
      if (error) return json({ error: error.message }, 500);
      return json({ message: 'Deleted' });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Server error' }, 500);
  }
});
