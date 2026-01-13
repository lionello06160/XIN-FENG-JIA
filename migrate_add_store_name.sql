-- Add store_name column to chef_profile table
ALTER TABLE chef_profile ADD COLUMN IF NOT EXISTS store_name TEXT DEFAULT '鑫蘴家';
