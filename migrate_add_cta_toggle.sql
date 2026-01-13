-- Add show_cta column to chef_profile table
ALTER TABLE chef_profile ADD COLUMN IF NOT EXISTS show_cta BOOLEAN DEFAULT true;
