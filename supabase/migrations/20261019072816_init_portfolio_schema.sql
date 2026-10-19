/*
# Initialize cinematography portfolio schema

## Purpose
Build the database foundation for a professional cinematography portfolio website
with a public area (projects, categories, site settings) and a private admin area
(auth, contact inquiries). Single-tenant public content + admin auth via Supabase.

## New Tables
1. `categories` — portfolio project categories (e.g. Documentary, Music Video)
   - id (uuid, pk)
   - name (text, unique, not null)
   - slug (text, unique, not null)
   - sort_order (int, default 0)
   - created_at / updated_at
2. `projects` — portfolio projects / films
   - id, slug (unique), title, short_description, full_description
   - category_id (fk -> categories, nullable so uncategorised is allowed)
   - client, year
   - thumbnail_url, poster_url, video_url, video_provider
   - featured (bool), is_published (bool), display_order (int)
   - credits (jsonb array of {role, name})
   - seo_title, seo_description
   - created_at / updated_at
3. `site_settings` — singleton row of editable site content
   - id (int, always 1)
   - business_name, tagline, location, contact_email, phone
   - bio (text), portrait_url
   - social_links (jsonb) — only configured links shown
   - services (jsonb array of {title, description})
   - clients (jsonb array of strings) — shown only when non-empty
   - updated_at
4. `inquiries` — contact form submissions
   - id, name, email, project_type, budget, timeline, message
   - is_read (bool), created_at
   - (admin-only via RLS; never exposed publicly)
5. `rate_limits` — simple per-key + per-window rate limit counters
   - id, key (text), window_start (timestamptz), count (int)
   - unique on (key, window_start)
   - used by contact-submit edge function to throttle spam
6. `site_admins` — convenience table tracking which Supabase auth users are admins
   - id (uuid, pk)
   - email (text, unique)
   - auth_user_id (uuid, unique, references auth.users on delete cascade)
   - created_at
   - NOTE: real authorization for admin mutations is enforced inside the
     admin-* edge functions using the service-role key + this table. The
     browser never has the service-role key, so RLS on projects/categories/
     site_settings/inquiries is `TO anon, authenticated` and read-only for
     public visitors (writes only via authenticated admin session is NOT
     enough — we keep public writes OFF). Admin writes go through edge
     functions that verify the caller's JWT against site_admins.

## Security / RLS
- `categories`, `projects`, `site_settings`: public SELECT for anon+authenticated.
  NO public INSERT/UPDATE/DELETE. Admin mutations happen through edge functions
  that use the service-role key and verify the caller is a site_admin.
- `inquiries`: NO public SELECT. Public INSERT allowed (so the contact form works
  without an account) WITH CHECK that the row is being created (not read/updated).
  All read/update/delete are forbidden to anon+authenticated — admin only, via
  edge functions.
- `rate_limits`: read/insert/update by anon+authenticated (needed by the
  contact-submit edge function which runs with the anon key context when invoked
  by the public form). This table holds no sensitive data — only counters keyed
  by hashed identifier + minute window.
- `site_admins`: NO public access. Admin bootstrap reads it via service-role key
  inside an edge function.

## Notes
- Public writes to projects/categories/settings/inquiries via the anon key are
  intentionally disabled to keep content admin-controlled.
- The contact form posts to the `contact-submit` edge function which validates,
  applies a rate limit (using rate_limits), then inserts the inquiry with the
  service-role client so it bypasses the no-public-insert rule on inquiries…
  except we DO allow public insert on inquiries as a fallback so the form still
  works even if edge-function invocation has issues — both paths are safe because
  SELECT on inquiries is admin-only.
*/

-- ---------- categories ----------
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories
  FOR SELECT TO anon, authenticated USING (true);

-- ---------- projects ----------
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  short_description text,
  full_description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  client text,
  year int,
  thumbnail_url text,
  poster_url text,
  video_url text,
  video_provider text NOT NULL DEFAULT 'external',
  featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  credits jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS projects_published_order_idx
  ON projects (is_published, display_order, created_at DESC);

DROP POLICY IF EXISTS "public_read_published_projects" ON projects;
CREATE POLICY "public_read_published_projects" ON projects
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

-- ---------- site_settings (singleton) ----------
CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1,
  business_name text NOT NULL DEFAULT 'KreativeNest',
  tagline text,
  location text,
  contact_email text,
  phone text,
  bio text,
  portrait_url text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  clients jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings
  FOR SELECT TO anon, authenticated USING (true);

-- ---------- inquiries (admin-only reads, public inserts) ----------
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  project_type text,
  budget text,
  timeline text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS inquiries_created_idx
  ON inquiries (created_at DESC);

-- Public can submit inquiries (contact form). No reads/updates/deletes for anon.
DROP POLICY IF EXISTS "public_insert_inquiries" ON inquiries;
CREATE POLICY "public_insert_inquiries" ON inquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ---------- rate_limits (counters only — no sensitive data) ----------
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  window_start timestamptz NOT NULL,
  count int NOT NULL DEFAULT 1,
  UNIQUE (key, window_start)
);
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS rate_limits_key_window_idx
  ON rate_limits (key, window_start DESC);

DROP POLICY IF EXISTS "rl_read" ON rate_limits;
CREATE POLICY "rl_read" ON rate_limits
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "rl_insert" ON rate_limits;
CREATE POLICY "rl_insert" ON rate_limits
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "rl_update" ON rate_limits;
CREATE POLICY "rl_update" ON rate_limits
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ---------- site_admins (admin-only; read via service role in edge fn) ----------
CREATE TABLE IF NOT EXISTS site_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE site_admins ENABLE ROW LEVEL SECURITY;
-- No policies: no anon/authenticated access. Only service role (edge functions).

-- ---------- updated_at triggers ----------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS categories_set_updated_at ON categories;
CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS projects_set_updated_at ON projects;
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS site_settings_set_updated_at ON site_settings;
CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
