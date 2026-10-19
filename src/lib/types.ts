export type VideoProvider = 'vimeo' | 'youtube' | 'external';

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Credit {
  role: string;
  name: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  category_id: string | null;
  client: string | null;
  year: number | null;
  shot_date?: string | null;
  thumbnail_url: string | null;
  poster_url: string | null;
  video_url: string | null;
  video_provider: VideoProvider;
  featured: boolean;
  is_published: boolean;
  display_order: number;
  credits: Credit[];
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export type ProjectInput = Omit<
  Project,
  'id' | 'created_at' | 'updated_at' | 'category'
> & { category_id: string | null };

export interface ServiceItem {
  title: string;
  description: string;
}

export interface SocialLinks {
  instagram?: string;
  vimeo?: string;
  youtube?: string;
  tiktok?: string;
  [key: string]: string | undefined;
}

export interface SiteSettings {
  id: number;
  business_name: string;
  tagline: string | null;
  location: string | null;
  contact_email: string | null;
  phone: string | null;
  bio: string | null;
  portrait_url: string | null;
  social_links: SocialLinks;
  services: ServiceItem[];
  clients: string[];
  updated_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  project_type: string | null;
  budget: string | null;
  timeline: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface InquiryInput {
  name: string;
  email: string;
  project_type?: string;
  budget?: string;
  timeline?: string;
  message: string;
  // honeypot — must be empty
  website?: string;
}
