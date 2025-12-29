-- Add onboarding_completed and settings columns to profiles table

-- Add onboarding_completed column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add settings column if it doesn't exist (using JSONB for flexibility)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Create an index on onboarding_completed for potential filtering
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON profiles(onboarding_completed);

-- Comment on columns
COMMENT ON COLUMN profiles.onboarding_completed IS 'Flag to indicate if user has completed onboarding flow';
COMMENT ON COLUMN profiles.settings IS 'User application settings (theme, language, etc)';
