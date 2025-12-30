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
          onboarding_completed: boolean;
          settings: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email?: string | null;
          photo_url?: string | null;
          onboarding_completed?: boolean;
          settings?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          email?: string | null;
          photo_url?: string | null;
          onboarding_completed?: boolean;
          settings?: Record<string, any> | null;
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
          hygiene: number;
          coins: number;
          equipped_accessory_id: string | null;
          equipped_background_id: string | null;
          equipped_outfit_id: string | null;
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
          hygiene?: number;
          coins?: number;
          equipped_accessory_id?: string | null;
          equipped_background_id?: string | null;
          equipped_outfit_id?: string | null;
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
          hygiene?: number;
          coins?: number;
          equipped_accessory_id?: string | null;
          equipped_background_id?: string | null;
          equipped_outfit_id?: string | null;
          last_updated_at?: string;
          updated_by?: string;
        };
      };
    };
  };
};

/**
 * 🔧 CRITICAL FIX: Ensure user profile exists in Supabase
 * This MUST be called before any Supabase operations that reference profiles table
 * (e.g., invite codes with foreign key constraints)
 * 
 * @param userId - Firebase Auth UID
 * @param email - User's email
 * @param displayName - User's display name (optional)
 * @param photoUrl - User's photo URL (optional)
 * @param retryCount - Internal retry counter (default: 0)
 */
export async function ensureProfile(
  userId: string,
  email: string | null,
  displayName: string | null = null,
  photoUrl: string | null = null,
  retryCount: number = 0
): Promise<void> {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 500; // ms

  try {
    console.log('🔍 Checking if profile exists for user:', userId);
    
    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', fetchError);
      
      // Retry on network/connection errors
      if (retryCount < MAX_RETRIES && (
        fetchError.message.includes('fetch') || 
        fetchError.message.includes('network') ||
        fetchError.message.includes('timeout')
      )) {
        console.log(`🔄 Retrying profile check (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return ensureProfile(userId, email, displayName, photoUrl, retryCount + 1);
      }
      
      throw fetchError;
    }
    
    if (existingProfile) {
      console.log('✅ Profile already exists:', userId);
      return;
    }
    
    // Create new profile
    console.log('➕ Creating new profile for user:', userId);
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        display_name: displayName,
        photo_url: photoUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (insertError) {
      console.error('❌ Error creating profile:', insertError);
      
      // If profile was created by another concurrent request, that's OK
      if (insertError.code === '23505') { // Duplicate key
        console.log('✅ Profile already created by concurrent request');
        return;
      }
      
      // Retry on transient errors
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying profile creation (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return ensureProfile(userId, email, displayName, photoUrl, retryCount + 1);
      }
      
      throw insertError;
    }
    
    console.log('✅ Profile created successfully:', userId);
  } catch (error) {
    console.error('❌ Failed to ensure profile exists:', error);
    // Re-throw to prevent operations that depend on profile
    throw error;
  }
}
