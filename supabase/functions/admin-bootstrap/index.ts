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

// ---------- helpers ----------

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Verify the Bearer token is a valid Supabase auth user AND a site_admin. */
async function verifyAdmin(req: Request): Promise<{ id: string; email: string } | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: adminRow } = await admin
    .from('site_admins')
    .select('id, email, auth_user_id')
    .eq('auth_user_id', data.user.id)
    .maybeSingle();
  if (!adminRow) return null;
  return { id: data.user.id, email: adminRow.email };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function sanitize(s: unknown, max: number): string {
  if (typeof s !== 'string') return '';
  return s.trim().slice(0, max);
}

// ---------- main ----------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    // GET: check if the current caller is an admin. Used by the frontend to
    // gate the admin area. Returns { admin: true } or { admin: false }.
    if (req.method === 'GET') {
      const a = await verifyAdmin(req);
      return json({ admin: !!a, email: a?.email ?? null });
    }

    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    // POST: bootstrap the first admin. ONLY allowed when no site_admins exist.
    const body = await req.json().catch(() => ({}));
    const email = sanitize(body.email, 254).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';

    if (!isValidEmail(email)) return json({ error: 'A valid email is required.' }, 400);
    if (password.length < 10) {
      return json({ error: 'Password must be at least 10 characters.' }, 400);
    }

    // Block bootstrap if an admin already exists (prevents takeover).
    const { count, error: countErr } = await admin
      .from('site_admins')
      .select('id', { count: 'exact', head: true });
    if (countErr) return json({ error: 'Server error.' }, 500);
    if ((count ?? 0) > 0) {
      // If caller is already an admin, return a friendly message instead of 403,
      // so the admin UI can show "already set up".
      const a = await verifyAdmin(req);
      if (a) return json({ message: 'Admin already set up.', admin: true });
      return json({ error: 'Admin setup is already complete. Ask an existing admin to add you.' }, 403);
    }

    // Create the auth user with the service role.
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) {
      return json({ error: createErr.message || 'Could not create admin user.' }, 400);
    }

    // Insert into site_admins.
    const { error: insErr } = await admin.from('site_admins').insert({
      email,
      auth_user_id: created.user.id,
    });
    if (insErr) {
      // Best-effort cleanup of the auth user to avoid an orphan.
      await admin.auth.admin.deleteUserById(created.user.id);
      return json({ error: 'Could not register admin.' }, 500);
    }

    return json({ message: 'Admin account created. You can now sign in.', admin: true });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Server error' }, 500);
  }
});
