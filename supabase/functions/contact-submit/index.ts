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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function sanitize(s: unknown, max: number): string {
  if (typeof s !== 'string') return '';
  return s.trim().slice(0, max);
}

// Tiny hash for rate-limit keys — keeps PII out of the rate_limits table.
async function shortHash(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function windowStart(): string {
  // 1-minute window
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString();
}

async function checkRateLimit(key: string, maxPerMinute = 3): Promise<boolean> {
  const start = windowStart();
  const { data, error } = await admin
    .from('rate_limits')
    .select('id, count')
    .eq('key', key)
    .eq('window_start', start)
    .maybeSingle();

  if (error) {
    // If rate-limit table is unavailable, fail closed (block) for safety.
    return false;
  }
  if (!data) {
    const { error: insErr } = await admin
      .from('rate_limits')
      .insert({ key, window_start: start, count: 1 });
    if (insErr) return false;
    return true;
  }
  if (data.count >= maxPerMinute) return false;
  const { error: updErr } = await admin
    .from('rate_limits')
    .update({ count: data.count + 1 })
    .eq('id', data.id);
  if (updErr) return false;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const body = await req.json().catch(() => ({}));

    // Honeypot — real users never fill this hidden field.
    if (sanitize(body.website, 200).length > 0) {
      // Pretend success so bots don't retry.
      return json({ ok: true });
    }

    const name = sanitize(body.name, 120);
    const email = sanitize(body.email, 254).toLowerCase();
    const project_type = sanitize(body.project_type, 80);
    const budget = sanitize(body.budget, 80);
    const timeline = sanitize(body.timeline, 80);
    const message = sanitize(body.message, 4000);

    if (name.length < 2) return json({ error: 'Please enter your name.' }, 400);
    if (!isValidEmail(email)) return json({ error: 'A valid email is required.' }, 400);
    if (message.length < 10) {
      return json({ error: 'Please include a message of at least 10 characters.' }, 400);
    }

    // Rate limit by hashed email + IP. Max 3 per minute.
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const key = 'contact:' + (await shortHash(email + '|' + ip));
    const allowed = await checkRateLimit(key, 3);
    if (!allowed) {
      return json(
        { error: 'Too many submissions. Please wait a minute and try again.' },
        429
      );
    }

    const { error } = await admin.from('inquiries').insert({
      name,
      email,
      project_type: project_type || null,
      budget: budget || null,
      timeline: timeline || null,
      message,
    });
    if (error) {
      return json({ error: 'Could not save your message. Please try again.' }, 500);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Server error' }, 500);
  }
});
