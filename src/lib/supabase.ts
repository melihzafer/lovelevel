import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// TypeScript types for database tables
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          email: string | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email?: string | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          email?: string | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      partnerships: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string;
          status: 'pending' | 'active' | 'declined';
          anniversary_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user1_id: string;
          user2_id: string;
          status?: 'pending' | 'active' | 'declined';
          anniversary_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user1_id?: string;
          user2_id?: string;
          status?: 'pending' | 'active' | 'declined';
          anniversary_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invite_codes: {
        Row: {
          code: string;
          created_by: string;
          created_at: string;
          expires_at: string;
          status: 'pending' | 'used' | 'expired';
          partnership_id: string | null;
          target_email: string | null;
        };
        Insert: {
          code: string;
          created_by: string;
          created_at?: string;
          expires_at: string;
          status?: 'pending' | 'used' | 'expired';
          partnership_id?: string | null;
          target_email?: string | null;
        };
        Update: {
          code?: string;
          created_by?: string;
          created_at?: string;
          expires_at?: string;
          status?: 'pending' | 'used' | 'expired';
          partnership_id?: string | null;
          target_email?: string | null;
        };
      };
      shared_challenges: {
        Row: {
          id: string;
          partnership_id: string;
          title: string;
          category: string;
          status: 'todo' | 'done';
          completed_at: string | null;
          notes: string | null;
          tags: string[] | null;
          xp_reward: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          partnership_id: string;
          title: string;
          category: string;
          status?: 'todo' | 'done';
          completed_at?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          xp_reward?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          partnership_id?: string;
          title?: string;
          category?: string;
          status?: 'todo' | 'done';
          completed_at?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          xp_reward?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      shared_pet: {
        Row: {
          partnership_id: string;
          name: string;
          xp: number;
          level: number;
          mood: string;
          hunger: number;
          energy: number;
          equipped_accessory_id: string | null;
          equipped_background_id: string | null;
          last_updated_at: string;
          updated_by: string;
        };
        Insert: {
          partnership_id: string;
          name: string;
          xp?: number;
          level?: number;
          mood?: string;
          hunger?: number;
          energy?: number;
          equipped_accessory_id?: string | null;
          equipped_background_id?: string | null;
          last_updated_at?: string;
          updated_by: string;
        };
        Update: {
          partnership_id?: string;
          name?: string;
          xp?: number;
          level?: number;
          mood?: string;
          hunger?: number;
          energy?: number;
          equipped_accessory_id?: string | null;
          equipped_background_id?: string | null;
          last_updated_at?: string;
          updated_by?: string;
        };
      };
    };
  };
};
