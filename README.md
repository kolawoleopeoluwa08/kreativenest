# KreativeNest cinematography portfolio

A personal cinematography portfolio for Kolawole Opeoluwa Samuel (KreativeNest), based in Lagos, Nigeria. The public site includes a responsive homepage, portfolio filters, project detail/video pages, About and Contact pages, and social links. The `/admin` area uses Supabase email/password authentication and stores portfolio content and image uploads in Supabase, so changes appear on the Railway site for every visitor.

## Local preview

Requirements: Node.js 20 or newer.

1. Copy `.env.example` to `.env`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Supabase URL and public publishable/anon key.
3. Run `npm install` and `npm run dev`.

The site can render starter content without Supabase variables, but hosted admin changes require the setup below.

## Connect Supabase (one-time setup)

Use the existing Supabase project `ravlgfwctvfquscgwoym` (`https://ravlgfwctvfquscgwoym.supabase.co`). Public content is stored in its database. Image uploads go to the existing public storage bucket named `portfolio img`.

1. Install the Supabase CLI if needed, then log in and link the project:

   ```sh
   npx supabase login
   npx supabase link --project-ref ravlgfwctvfquscgwoym
   npx supabase db push
   ```

   The ordered migrations create the schema, seed KreativeNest's current projects and profile, and set up protected image uploads.
2. Deploy the protected admin functions:

   ```sh
   npx supabase functions deploy admin-bootstrap --project-ref ravlgfwctvfquscgwoym
   npx supabase functions deploy admin-projects --project-ref ravlgfwctvfquscgwoym
   npx supabase functions deploy admin-categories --project-ref ravlgfwctvfquscgwoym
   npx supabase functions deploy admin-inquiries --project-ref ravlgfwctvfquscgwoym
   npx supabase functions deploy admin-settings --project-ref ravlgfwctvfquscgwoym
   ```

3. Visit `/admin/setup` once and create your admin email and password. Once created, the setup endpoint locks itself. Use `/admin` to sign in afterward.

The browser only receives the public Supabase publishable/anon key, which is meant to be public. Supabase provides Edge Functions with server-side secret keys automatically; the functions use those to authorize writes and verify the admin allowlist. Never put a Supabase secret/service-role key in GitHub, a `VITE_` variable, or Railway.

## Railway + GitHub

1. Push the project to GitHub and connect that repository in Railway.
2. Add these Railway **Variables** before deploying:
   - `VITE_SUPABASE_URL` = `https://ravlgfwctvfquscgwoym.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your public publishable/anon key (`sb_publishable_…` or the legacy anon JWT)
3. Railway builds with `npm run build`, starts with `npm start`, and checks `/health` as configured in `railway.toml`.
4. After deployment, visit `https://YOUR-RAILWAY-DOMAIN/admin/setup` to create the first admin account, then use `/admin` to manage the site.

Railway reads those two public values during the build because Vite embeds them into the website. Redeploy after changing either. Never set `SUPABASE_SERVICE_ROLE_KEY` as a Railway or `VITE_` variable.

## Admin capabilities

- Create, edit, publish/unpublish, feature, reorder, and delete projects.
- Set project category, date/year, client, video link, descriptions, and thumbnail.
- Upload project and profile images directly to the Supabase `portfolio img` bucket.
- Update the biography, profile photo, contact email, location, and social links.
- Protected email/password sign-in and server-side admin authorization.

If you previously changed project thumbnails in this browser's local preview, open `/admin` from that same browser after connecting it to Supabase. Use **Import browser-saved projects** once to copy those saved project details and thumbnails into the hosted database. Browser storage does not automatically transfer to a new Railway domain.

Contact remains direct email, phone, WhatsApp, and social links, matching the requested design. The previous browser-only inquiry form is not used.

## Brand assets

The supplied KreativeNest logo and Coolvetica font files are in `public/`. The brand colors are plum `#4a154b`, gold `#ecb22e`, and warm cream.
