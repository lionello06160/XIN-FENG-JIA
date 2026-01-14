-- Migration: Add Dish Reviews Feature

-- 1. Add show_reviews toggles
ALTER TABLE chef_profile ADD COLUMN IF NOT EXISTS show_reviews BOOLEAN DEFAULT true;
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS show_reviews BOOLEAN DEFAULT true;

-- 2. Create dish_reviews table
CREATE TABLE IF NOT EXISTS dish_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'pending',
    published_at TIMESTAMPTZ,
    reply_text TEXT,
    replied_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ
);

ALTER TABLE dish_reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE dish_reviews ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 3. Enable RLS
ALTER TABLE dish_reviews ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read-only access on dish_reviews' AND tablename = 'dish_reviews') THEN
        CREATE POLICY "Allow public read-only access on dish_reviews" ON dish_reviews FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all actions on dish_reviews for developing' AND tablename = 'dish_reviews') THEN
        CREATE POLICY "Allow all actions on dish_reviews for developing" ON dish_reviews FOR ALL USING (true);
    END IF;
END $$;
