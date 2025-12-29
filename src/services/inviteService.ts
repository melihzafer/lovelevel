import { supabase } from '../lib/supabase';
import { nanoid } from 'nanoid';
import type { InviteCode } from '../types/database';

/**
 * Invite Code Service
 * Handles partner invitation codes stored in Supabase
 */

/**
 * Generate a new 6-character invite code
 * Stores in Supabase invite_codes table
 * Code expires in 7 days
 */
export async function generateInviteCode(userId: string): Promise<{ code: string; expiresAt: string } | null> {
  try {
    // Generate unique 6-character code (uppercase alphanumeric, no ambiguous chars)
    const code = nanoid(6).toUpperCase().replace(/[0OIL]/g, (match) => {
      const replacements: { [key: string]: string } = { '0': '8', 'O': '9', 'I': '1', 'L': '7' };
      return replacements[match] || match;
    });

    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Invalidate any existing unused codes for this user
    const { error: invalidateError } = await supabase
      .from('invite_codes')
      .update({ used: true })
      .eq('created_by', userId)
      .eq('used', false);

    if (invalidateError) {
      console.error('Error invalidating old codes:', invalidateError);
    }

    // Insert new code
    const { data, error } = await supabase
      .from('invite_codes')
      .insert({
        code,
        created_by: userId,
        expires_at: expiresAt.toISOString(),
        used: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invite code:', error);
      return null;
    }

    return {
      code: data.code,
      expiresAt: data.expires_at,
    };
  } catch (error) {
    console.error('Error in generateInviteCode:', error);
    return null;
  }
}

/**
 * Get user's current active invite code (if any)
 */
export async function getActiveInviteCode(userId: string): Promise<InviteCode | null> {
  try {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('created_by', userId)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active invite code:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getActiveInviteCode:', error);
    return null;
  }
}

/**
 * Validate an invite code
 * Returns the code creator's user ID if valid
 */
export async function validateInviteCode(code: string): Promise<{ valid: boolean; createdBy?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*, profiles!invite_codes_created_by_fkey(id, display_name, photo_url)')
      .eq('code', code.toUpperCase())
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Error validating invite code:', error);
      return { valid: false, error: 'Database error' };
    }

    if (!data) {
      return { valid: false, error: 'Invalid or expired code' };
    }

    return {
      valid: true,
      createdBy: data.created_by,
    };
  } catch (error) {
    console.error('Error in validateInviteCode:', error);
    return { valid: false, error: 'Validation error' };
  }
}

/**
 * Accept an invite code and create partnership
 * Marks code as used and creates active partnership
 */
export async function acceptInviteCode(
  code: string,
  userId: string
): Promise<{ 
  success: boolean; 
  partnershipId?: string; 
  anniversaryDate?: string;
  partnerName?: string;
  error?: string 
}> {
  try {
    // Validate code first
    const validation = await validateInviteCode(code);
    if (!validation.valid || !validation.createdBy) {
      return { success: false, error: validation.error || 'Invalid code' };
    }

    // Check if user is trying to accept their own code
    if (validation.createdBy === userId) {
      return { success: false, error: 'Cannot accept your own invite code' };
    }

    // Check if users are already partners
    const { data: existingPartnership, error: checkError } = await supabase
      .from('partnerships')
      .select('id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .or(`user1_id.eq.${validation.createdBy},user2_id.eq.${validation.createdBy}`)
      .eq('status', 'active')
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing partnership:', checkError);
      return { success: false, error: 'Database error' };
    }

    if (existingPartnership) {
      return { success: false, error: 'Already partners with this user' };
    }

    // Create partnership
    // Try to get inviter's relationship start date from their settings
    let anniversaryDate = new Date().toISOString().split('T')[0];
    
    // Fetch inviter's profile to get settings
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('settings, display_name')
      .eq('id', validation.createdBy)
      .single();
      
    if (inviterProfile?.settings && (inviterProfile.settings as any).relationshipStartDate) {
      anniversaryDate = (inviterProfile.settings as any).relationshipStartDate;
    }

    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .insert({
        user1_id: validation.createdBy,
        user2_id: userId,
        status: 'active',
        anniversary_date: anniversaryDate,
      })
      .select()
      .single();

    if (partnershipError) {
      console.error('Error creating partnership:', partnershipError);
      return { success: false, error: 'Failed to create partnership' };
    }

    // Mark invite code as used
    const { error: updateError } = await supabase
      .from('invite_codes')
      .update({
        used: true,
        used_by: userId,
      })
      .eq('code', code.toUpperCase());

    if (updateError) {
      console.error('Error marking code as used:', updateError);
      // Partnership created but code not marked - not critical
    }

    return {
      success: true,
      partnershipId: partnership.id,
      anniversaryDate,
      partnerName: inviterProfile?.display_name || 'Partner',
    };
  } catch (error) {
    console.error('Error in acceptInviteCode:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Get invite code details with creator info
 * Used for displaying partner preview before accepting
 */
export async function getInviteCodeDetails(code: string): Promise<{
  valid: boolean;
  creator?: {
    id: string;
    displayName: string;
    photoUrl?: string;
  };
  expiresAt?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('invite_codes')
      .select(
        `
        code,
        created_by,
        expires_at,
        used,
        profiles!invite_codes_created_by_fkey(
          id,
          display_name,
          photo_url
        )
      `
      )
      .eq('code', code.toUpperCase())
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Error fetching invite code details:', error);
      return { valid: false, error: 'Database error' };
    }

    if (!data || !data.profiles) {
      return { valid: false, error: 'Invalid or expired code' };
    }

    return {
      valid: true,
      creator: {
        id: (data.profiles as any).id,
        displayName: (data.profiles as any).display_name || 'Unknown User',
        photoUrl: (data.profiles as any).photo_url || undefined,
      },
      expiresAt: data.expires_at,
    };
  } catch (error) {
    console.error('Error in getInviteCodeDetails:', error);
    return { valid: false, error: 'Unexpected error' };
  }
}
