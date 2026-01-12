-- Migration: Add Q&A Feature

-- 1. Add show_qa to chef_profile
ALTER TABLE chef_profile ADD COLUMN IF NOT EXISTS show_qa BOOLEAN DEFAULT false;

-- 2. Create qa_items table
CREATE TABLE IF NOT EXISTS qa_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- 3. Enable RLS
ALTER TABLE qa_items ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read-only access on qa_items' AND tablename = 'qa_items') THEN
        CREATE POLICY "Allow public read-only access on qa_items" ON qa_items FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all actions on qa_items for developing' AND tablename = 'qa_items') THEN
        CREATE POLICY "Allow all actions on qa_items for developing" ON qa_items FOR ALL USING (true);
    END IF;
END $$;
