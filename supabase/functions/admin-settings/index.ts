import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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

function toNullIfEmpty(s: unknown): string | null {
  if (typeof s !== 'string') return null;
  const v = s.trim();
  return v.length === 0 ? null : v;
}

function normalizeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter((x) => x.length > 0)
    .slice(0, 200);
}

function normalizeServices(v: unknown): { title: string; description: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(
      (s): s is { title: string; description: string } =>
        typeof s === 'object' && s !== null &&
        typeof (s as Record<string, unknown>).title === 'string'
    )
    .map((s) => ({
      title: sanitize(s.title, 120),
      description: sanitize(s.description, 600),
    }))
    .filter((s) => s.title);
}

function normalizeSocialLinks(v: unknown): Record<string, string> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return {};
  const out: Record<string, string> = {};
  const allowed = ['instagram', 'vimeo', 'youtube', 'tiktok', 'facebook', 'linkedin', 'twitter', 'website', 'snapchat', 'whatsapp'];
  for (const key of allowed) {
    const val = (v as Record<string, unknown>)[key];
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed) out[key] = trimmed.slice(0, 300);
    }
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const isOk = await verifyAdmin(req);
    if (!isOk) return json({ error: 'Unauthorized' }, 401);

    if (req.method === 'GET') {
      const { data, error } = await admin
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return json(data);
    }

    if (req.method === 'PUT') {
      const body = await req.json().catch(() => ({}));
      const patch: Record<string, unknown> = {};

      if (body.business_name !== undefined) {
        const v = sanitize(body.business_name, 120);
        if (!v) return json({ error: 'Business name is required.' }, 400);
        patch.business_name = v;
      }
      if (body.tagline !== undefined) patch.tagline = toNullIfEmpty(body.tagline);
      if (body.location !== undefined) patch.location = toNullIfEmpty(body.location);
      if (body.contact_email !== undefined) patch.contact_email = toNullIfEmpty(body.contact_email);
      if (body.phone !== undefined) patch.phone = toNullIfEmpty(body.phone);
      if (body.bio !== undefined) patch.bio = toNullIfEmpty(body.bio);
      if (body.portrait_url !== undefined) patch.portrait_url = toNullIfEmpty(body.portrait_url);
      if (body.services !== undefined) patch.services = normalizeServices(body.services);
      if (body.clients !== undefined) patch.clients = normalizeStringArray(body.clients);
      if (body.social_links !== undefined) patch.social_links = normalizeSocialLinks(body.social_links);

      const { data, error } = await admin
        .from('site_settings')
        .update(patch)
        .eq('id', 1)
        .select()
        .single();
      if (error) return json({ error: error.message }, 500);
      return json(data);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Server error' }, 500);
  }
});
