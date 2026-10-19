/*
# Seed demo portfolio content + default site settings

## Purpose
Insert a small set of clearly-marked demo portfolio projects, categories, and
a default site_settings row so the site renders something cinematic on first
load. All demo content is easy to delete/replace from the admin area.

## Changes
- Insert 6 categories (Branded Film, Documentary, Music Video, Wedding, Event, Commercial).
- Insert 5 demo projects, each clearly titled with a "(Demo)" suffix in short_description.
- Insert the singleton site_settings row with placeholder brand info and a
  starter services list. Social links left empty so the UI hides them until set.
- All inserts are idempotent (ON CONFLICT DO NOTHING / DO UPDATE).

## Notes
- Demo projects use real, license-free Pexels poster images. Video URLs point
  to public sample videos so the player works out of the box. Replace these
  from the admin area with your real Vimeo/YouTube embed URLs.
- Mark each demo project is_published = true so the public site shows them.
  Toggle is_featured on two of them for the home/featured strip.
*/

-- ---------- categories ----------
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Branded Film', 'branded-film', 1),
  ('Documentary', 'documentary', 2),
  ('Music Video', 'music-video', 3),
  ('Wedding', 'wedding', 4),
  ('Event', 'event', 5),
  ('Commercial', 'commercial', 6)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- ---------- site settings (singleton) ----------
INSERT INTO site_settings (id, business_name, tagline, location, contact_email, phone, bio, portrait_url, social_links, services, clients)
VALUES (
  1,
  'KreativeNest',
  'Cinematography for stories worth telling.',
  '[YOUR LOCATION] — available worldwide',
  '[YOUR EMAIL]',
  NULL,
  'KreativeNest is the work of [YOUR NAME OR BUSINESS], a cinematographer crafting cinematic branded films, documentaries, and music videos with a quiet, intentional visual language. We focus on light, texture, and rhythm — letting the subject breathe while the image carries the emotion.',
  NULL,
  '{}'::jsonb,
  jsonb_build_array(
    jsonb_build_object('title', 'Cinematography', 'description', 'Director of photography services for narrative, branded, and documentary work — from treatment to final frame.'),
    jsonb_build_object('title', 'Camera Operation', 'description', 'Experienced camera operation across cinema and mirrorless bodies, gimbal, and handheld.'),
    jsonb_build_object('title', 'Branded Films', 'description', 'Cinematic brand stories built around craft, people, and place — built to live on the web and in the room.'),
    jsonb_build_object('title', 'Documentary', 'description', 'Character-led documentary work with a patient, observational approach and strong visual sensibility.'),
    jsonb_build_object('title', 'Music Videos', 'description', 'Concept-driven music visuals that translate sound into image without losing the performance.'),
    jsonb_build_object('title', 'Post-Production', 'description', 'Color grading, offline edit supervision, and finishing for a cohesive final look.')
  ),
  '[]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  tagline = EXCLUDED.tagline,
  location = EXCLUDED.location,
  contact_email = EXCLUDED.contact_email,
  bio = EXCLUDED.bio,
  services = EXCLUDED.services;

-- ---------- demo projects ----------
-- Use a CTE to resolve category ids by slug.
WITH cat AS (SELECT slug, id FROM categories)
INSERT INTO projects
  (slug, title, short_description, full_description, category_id, client, year,
   thumbnail_url, poster_url, video_url, video_provider, featured, is_published,
   display_order, credits, seo_title, seo_description)
SELECT * FROM (VALUES
  ('aurelia-fragrance-film',
    'Aurelia',
    'A branded film for a niche fragrance house. (Demo project — replace from admin.)',
    'Aurelia is a sensory branded film built around a single perfume release — slow macro work, warm window light, and a texture-forward grade that lets the bottle live as a character. Shot over two days in a single daylight studio with a small crew.',
    (SELECT id FROM cat WHERE slug = 'branded-film'),
    'Aurelia Parfums', 2024,
    'https://images.pexels.com/photos/3393792/pexels-photo-3393792.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'https://images.pexels.com/photos/3393792/pexels-photo-3393792.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://player.vimeo.com/video/76979871',
    'vimeo', true, true, 1,
    jsonb_build_array(
      jsonb_build_object('role','Director of Photography','name','[YOUR NAME]'),
      jsonb_build_object('role','Director','name','Demo Director'),
      jsonb_build_object('role','Colorist','name','Demo Colorist')
    ),
    'Aurelia — Branded Film | KreativeNest',
    'A cinematic branded film for a niche fragrance house. (Demo project.)'),

  ('the-long-coast',
    'The Long Coast',
    'A short documentary about fishermen on the Atlantic edge. (Demo project — replace from admin.)',
    'The Long Coast follows three fishermen across one season on a remote Atlantic shoreline. Shot documentary-style with available light and a two-person crew, the piece leans into weather, patience, and the quiet between words.',
    (SELECT id FROM cat WHERE slug = 'documentary'),
    'Independent', 2023,
    'https://images.pexels.com/photos/1591382/pexels-photo-1591382.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'https://images.pexels.com/photos/1591382/pexels-photo-1591382.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://player.vimeo.com/video/76979871',
    'vimeo', true, true, 2,
    jsonb_build_array(
      jsonb_build_object('role','Cinematographer','name','[YOUR NAME]'),
      jsonb_build_object('role','Producer','name','Demo Producer')
    ),
    'The Long Coast — Documentary | KreativeNest',
    'A short documentary about fishermen on the Atlantic edge. (Demo project.)'),

  ('hollow-bones-music-video',
    'Hollow Bones',
    'A music video for an indie-folk artist. (Demo project — replace from admin.)',
    'Hollow Bones is a performance-led music video shot in a derelict theatre with a single tungsten source and a layer of atmospheric haze. The edit rides the dynamics of the track, breaking from performance to abstract texture in the choruses.',
    (SELECT id FROM cat WHERE slug = 'music-video'),
    'Hollow Bones (artist)', 2024,
    'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://player.vimeo.com/video/76979871',
    'vimeo', false, true, 3,
    jsonb_build_array(
      jsonb_build_object('role','Cinematographer','name','[YOUR NAME]'),
      jsonb_build_object('role','Director','name','Demo Director')
    ),
    'Hollow Bones — Music Video | KreativeNest',
    'A music video for an indie-folk artist. (Demo project.)'),

  ('maris-wedding-film',
    'Maris',
    'A cinematic wedding film set on a coastal cliff. (Demo project — replace from admin.)',
    'Maris is a cinematic wedding film shot on a windswept coastal cliff at golden hour, leaning into natural light, wide silhouettes, and intimate handheld moments. A small, unobtrusive crew let the day unfold without staging.',
    (SELECT id FROM cat WHERE slug = 'wedding'),
    'Private', 2024,
    'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://player.vimeo.com/video/76979871',
    'vimeo', false, true, 4,
    jsonb_build_array(
      jsonb_build_object('role','Cinematographer','name','[YOUR NAME]')
    ),
    'Maris — Wedding Film | KreativeNest',
    'A cinematic wedding film set on a coastal cliff. (Demo project.)'),

  ('north-loop-event',
    'North Loop',
    'A brand event film for an architecture studio. (Demo project — replace from admin.)',
    'North Loop captures the launch event of an architecture studio in a converted warehouse. Mixed natural and practical light, gimbal moves through the crowd, and tight detail work on materials and model tables.',
    (SELECT id FROM cat WHERE slug = 'event'),
    'North Loop Studio', 2023,
    'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://player.vimeo.com/video/76979871',
    'vimeo', false, true, 5,
    jsonb_build_array(
      jsonb_build_object('role','Cinematographer','name','[YOUR NAME]'),
      jsonb_build_object('role','Editor','name','Demo Editor')
    ),
    'North Loop — Event Film | KreativeNest',
    'A brand event film for an architecture studio. (Demo project.)')
) AS t(slug, title, short_description, full_description, category_id, client, year,
       thumbnail_url, poster_url, video_url, video_provider, featured, is_published,
       display_order, credits, seo_title, seo_description)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category_id = EXCLUDED.category_id,
  client = EXCLUDED.client,
  year = EXCLUDED.year,
  thumbnail_url = EXCLUDED.thumbnail_url,
  poster_url = EXCLUDED.poster_url,
  video_url = EXCLUDED.video_url,
  video_provider = EXCLUDED.video_provider,
  featured = EXCLUDED.featured,
  is_published = EXCLUDED.is_published,
  display_order = EXCLUDED.display_order,
  credits = EXCLUDED.credits,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
