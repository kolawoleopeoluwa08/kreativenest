-- Live KreativeNest content, shot dates, and protected public image storage.
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS shot_date date;

INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Documentary / Film','documentary-film',1),
  ('Music Video','music-video',2),
  ('Commercial / Promotional','commercial-promotional',3),
  ('Lifestyle / Fashion','lifestyle-fashion',4),
  ('Real Estate','real-estate',5),
  ('Wedding','wedding',6),
  ('Events','events',7),
  ('Others','others',8)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name,sort_order=EXCLUDED.sort_order;

-- Remove the earlier starter/demo records so only the owner's real projects appear.
DELETE FROM public.projects WHERE slug IN (
  'aurelia-fragrance-film','the-long-coast','hollow-bones-music-video','maris-wedding-film','north-loop-event'
);

WITH c AS (SELECT slug,id FROM public.categories),
p(slug,title,category,year,shot_date,thumbnail_url,video_url,display_order,featured) AS (VALUES
 ('a-tale-of-two-first-date','A Tale of Two First Date','documentary-film',NULL,NULL,'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1800&q=85','https://www.youtube.com/watch?v=GiNcsMU0jqE',1,true),
 ('my-indigene','MY INDIGENE','documentary-film',NULL,NULL,'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85','https://www.youtube.com/watch?v=9v3Ovc0rljM',2,true),
 ('ocean-tide','OCEAN TIDE','documentary-film',NULL,NULL,'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=85','https://www.youtube.com/watch?v=sLlmFY8Ywkc',3,true),
 ('babafemi','Babafemi','documentary-film',NULL,NULL,'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/1lWAksJm1ZHAF0TzlJNdm4A0uu1ZIpZua/view?usp=share_link',4,true),
 ('trust-issues','TRUST ISSUES','music-video',NULL,NULL,'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1800&q=85','https://www.youtube.com/watch?v=_Kf8anUuVwM',5,true),
 ('oversabi-aunty','Oversabi Aunty','commercial-promotional',2025,NULL,'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/15WnG5HRtXWQdQR085tE8D09OYxWy73CT/view?usp=share_link',6,true),
 ('bobo-tvc','Bobo TVC','commercial-promotional',2023,NULL,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/1nxEvp-wh3rNLaLJezwdIsdaFGf5jacHa/view?usp=share_link',7,false),
 ('luminous-hills','Luminous Hills','commercial-promotional',2022,NULL,'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/1HgO3fViUyeBnVEmvj5KFVLHVhZaB0i1B/view?usp=share_link',8,false),
 ('metallic-horses','Metallic Horses','commercial-promotional',2023,NULL,'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/1Vlg3M1hD1C6AIOxWFHdRvB6ZpVvHpO7T/view?usp=share_link',9,false),
 ('green-builders','Green builders','commercial-promotional',NULL,NULL,'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/1OdabGrbg0kpU6Iss5tQR03Ot4GRKueJJ/view?usp=share_link',10,false),
 ('bc-25','BC 25','wedding',2025,NULL,'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/1eYdBsJnuyBLmnJt7j0v6l9Pqr2KkHihi/view?usp=share_link',11,false),
 ('flo-25-trad','FLO 25 TRAD','wedding',2025,NULL,'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/1jBPSUEOak-Ft57A3YL193mXLxb7AeNBQ/view?usp=share_link',12,false),
 ('flo-25','FLO 25','wedding',2025,NULL,'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/124Y3W1WFFdTBlpQ_tYbK024L7fzNGZ-t/view?usp=share_link',13,false),
 ('before-and-after','Before and After','wedding',NULL,NULL,'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/124Y3W1WFFdTBlpQ_tYbK024L7fzNGZ-t/view?usp=share_link',14,false),
 ('flo-25-highlight','FLO 25 HIGHLIGHT','wedding',2025,NULL,'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/1u6gPUQ7c8bBYsia7tcc1y4snUgTqpk3D/view?usp=share_link',15,false),
 ('tofunmi-walk','Tofunmi Walk','lifestyle-fashion',NULL,NULL,'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85','https://www.youtube.com/watch?v=4xQhNc7-kco',16,false),
 ('daffodil-garden','DAFFODIL GARDEN','real-estate',NULL,NULL,'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/1jKKZ0uF68dkPGHgykxDpsw1uusGkx5v7/view?usp=share_link',17,false),
 ('get-conference','Get Conference','events',NULL,NULL,'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/1csZWkuMJrgNBFJX3orcOI9PQrv14LK_n/view?usp=share_link',18,false),
 ('galentines-with-mo','Galentines with MO','events',NULL,NULL,'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/1w3fFMyaiOtqS9qQOHrXM289soSTzaJxA/view?usp=share_link',19,false),
 ('hale','HALE','events',NULL,NULL,'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1800&q=85','https://drive.google.com/file/d/1SPBVdOwDDUpi66Dyl9So1G5Z4-lMhI7y/view?usp=share_link',20,false)
)
INSERT INTO public.projects (slug,title,category_id,year,shot_date,thumbnail_url,poster_url,video_url,video_provider,featured,is_published,display_order,short_description,full_description,client,credits)
SELECT p.slug,p.title,c.id,p.year,p.shot_date,p.thumbnail_url,p.thumbnail_url,p.video_url,
  CASE WHEN p.video_url ILIKE '%youtube.com%' OR p.video_url ILIKE '%youtu.be%' THEN 'youtube' WHEN p.video_url ILIKE '%vimeo.com%' THEN 'vimeo' ELSE 'external' END,
  p.featured,true,p.display_order,NULL,NULL,NULL,'[]'::jsonb
FROM p JOIN c ON c.slug=p.category
ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title,category_id=EXCLUDED.category_id,year=EXCLUDED.year,shot_date=EXCLUDED.shot_date,thumbnail_url=EXCLUDED.thumbnail_url,poster_url=EXCLUDED.poster_url,video_url=EXCLUDED.video_url,video_provider=EXCLUDED.video_provider,featured=EXCLUDED.featured,is_published=true,display_order=EXCLUDED.display_order;

INSERT INTO public.site_settings (id,business_name,tagline,location,contact_email,phone,bio,portrait_url,social_links,services,clients)
VALUES (1,'KreativeNest','Images shaped by light. Guided by story.','Lagos, Nigeria','Officialkreativenest@gmail.com','+234 814 743 3290',
  'I’m a cinematographer based in Lagos, Nigeria. I work with directors, artists, and production teams to shape a visual language that serves each story, with a close eye for light, movement, and detail.',
  'https://ravlgfwctvfquscgwoym.supabase.co/storage/v1/object/public/portfolio%20img/Screenshot%202026-10-19%20at%204.39.35%20PM.png',
  '{"instagram":"https://www.instagram.com/sam.kreativenest_studios/","tiktok":"https://www.tiktok.com/@sam.kreativenest","twitter":"https://x.com/samkreativenest","snapchat":"https://www.snapchat.com/add/kreative.nest","youtube":"https://www.youtube.com/@sam.kreativenest","whatsapp":"https://wa.me/2348147433290"}'::jsonb,
  '[]'::jsonb,'[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET business_name=EXCLUDED.business_name,tagline=EXCLUDED.tagline,location=EXCLUDED.location,contact_email=EXCLUDED.contact_email,phone=EXCLUDED.phone,bio=EXCLUDED.bio,portrait_url=EXCLUDED.portrait_url,social_links=EXCLUDED.social_links;

-- Images are public to visitors; only registered site admins can upload/modify/delete.
INSERT INTO storage.buckets (id,name,public) VALUES ('portfolio img','portfolio img',true)
ON CONFLICT (id) DO UPDATE SET public=true;

CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.site_admins WHERE auth_user_id=auth.uid());
$$;
GRANT EXECUTE ON FUNCTION public.is_site_admin() TO authenticated;

DROP POLICY IF EXISTS "kreativenest_admin_upload" ON storage.objects;
CREATE POLICY "kreativenest_admin_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='portfolio img' AND public.is_site_admin());
DROP POLICY IF EXISTS "kreativenest_admin_update" ON storage.objects;
CREATE POLICY "kreativenest_admin_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='portfolio img' AND public.is_site_admin()) WITH CHECK (bucket_id='portfolio img' AND public.is_site_admin());
DROP POLICY IF EXISTS "kreativenest_admin_delete" ON storage.objects;
CREATE POLICY "kreativenest_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='portfolio img' AND public.is_site_admin());
