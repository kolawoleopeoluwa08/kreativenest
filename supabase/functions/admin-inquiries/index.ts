import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const isOk = await verifyAdmin(req);
    if (!isOk) return json({ error: 'Unauthorized' }, 401);

    const url = new URL(req.url);

    if (req.method === 'GET') {
      const { data, error } = await admin
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return json({ error: error.message }, 500);
      return json(data);
    }

    if (req.method === 'PATCH') {
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'Missing id' }, 400);
      const body = await req.json().catch(() => ({}));
      const is_read = !!body.is_read;
      const { data, error } = await admin
        .from('inquiries')
        .update({ is_read })
        .eq('id', id)
        .select()
        .single();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: 'Not found' }, 404);
      return json(data);
    }

    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'Missing id' }, 400);
      const { error } = await admin.from('inquiries').delete().eq('id', id);
      if (error) return json({ error: error.message }, 500);
      return json({ message: 'Deleted' });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Server error' }, 500);
  }
});
