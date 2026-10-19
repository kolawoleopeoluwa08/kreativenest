// Minimal database typing — sufficient for the typed supabase client without
// generating a full schema. Keeps the codebase navigable and avoids drift.
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: Partial<{
          name: string;
          slug: string;
          sort_order: number;
        }>;
      };
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          short_description: string | null;
          full_description: string | null;
          category_id: string | null;
          client: string | null;
          year: number | null;
          thumbnail_url: string | null;
          poster_url: string | null;
          video_url: string | null;
          video_provider: string;
          featured: boolean;
          is_published: boolean;
          display_order: number;
          credits: { role: string; name: string }[];
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          short_description?: string | null;
          full_description?: string | null;
          category_id?: string | null;
          client?: string | null;
          year?: number | null;
          thumbnail_url?: string | null;
          poster_url?: string | null;
          video_url?: string | null;
          video_provider?: string;
          featured?: boolean;
          is_published?: boolean;
          display_order?: number;
          credits?: { role: string; name: string }[];
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Update: Record<string, unknown>;
      };
      site_settings: {
        Row: {
          id: number;
          business_name: string;
          tagline: string | null;
          location: string | null;
          contact_email: string | null;
          phone: string | null;
          bio: string | null;
          portrait_url: string | null;
          social_links: Record<string, string>;
          services: { title: string; description: string }[];
          clients: string[];
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['site_settings']['Row']> & { id?: number };
        Update: Partial<Database['public']['Tables']['site_settings']['Row']>;
      };
      inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          project_type: string | null;
          budget: string | null;
          timeline: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          project_type?: string | null;
          budget?: string | null;
          timeline?: string | null;
          message: string;
          is_read?: boolean;
        };
        Update: Partial<{
          is_read: boolean;
        }>;
      };
    };
  };
}
