-- Consolidated schema for XIN-FENG-JIA
-- Creates all tables, RLS, and policies in a single script.

-- 1. Core Tables
CREATE TABLE IF NOT EXISTS dishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    description TEXT NOT NULL,
    inspiration TEXT,
    ingredients TEXT[] DEFAULT '{}',
    image TEXT NOT NULL,
    available BOOLEAN DEFAULT true,
    sold_out BOOLEAN DEFAULT false,
    spiciness INTEGER DEFAULT 0,
    is_new BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    show_reviews BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chef_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT NOT NULL,
    image TEXT NOT NULL,
    instagram TEXT,
    facebook TEXT,
    line TEXT,
    email TEXT,
    cta_title TEXT DEFAULT '預約私廚體驗',
    cta_description TEXT DEFAULT '在您的私人寓所中，體驗由主廚親自操刀的 8 道式招牌饗宴。',
    show_cta BOOLEAN DEFAULT true,
    order_link TEXT DEFAULT '',
    show_order_button BOOLEAN DEFAULT false,
    show_qa BOOLEAN DEFAULT false,
    show_reviews BOOLEAN DEFAULT true,
    store_name TEXT DEFAULT '鑫蘴家'
);

CREATE TABLE IF NOT EXISTS admin_auth (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
);

-- 2. Feature Tables
CREATE TABLE IF NOT EXISTS qa_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

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

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    dish_id UUID REFERENCES dishes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read-only access on dishes' AND tablename = 'dishes') THEN
        CREATE POLICY "Allow public read-only access on dishes" ON dishes FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin modify dishes' AND tablename = 'dishes') THEN
        CREATE POLICY "Allow admin modify dishes" ON dishes FOR ALL USING (id IS NOT NULL) WITH CHECK (price >= 0 AND length(name) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read-only access on chef_profile' AND tablename = 'chef_profile') THEN
        CREATE POLICY "Allow public read-only access on chef_profile" ON chef_profile FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin modify profile' AND tablename = 'chef_profile') THEN
        CREATE POLICY "Allow admin modify profile" ON chef_profile FOR ALL USING (id = 1) WITH CHECK (id = 1);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select on admin_auth' AND tablename = 'admin_auth') THEN
        CREATE POLICY "Allow public select on admin_auth" ON admin_auth FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read-only access on qa_items' AND tablename = 'qa_items') THEN
        CREATE POLICY "Allow public read-only access on qa_items" ON qa_items FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin modify qa' AND tablename = 'qa_items') THEN
        CREATE POLICY "Allow admin modify qa" ON qa_items FOR ALL USING (id IS NOT NULL) WITH CHECK (length(question) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read-only access on dish_reviews' AND tablename = 'dish_reviews') THEN
        CREATE POLICY "Allow public read-only access on dish_reviews" ON dish_reviews FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow modify reviews' AND tablename = 'dish_reviews') THEN
        CREATE POLICY "Allow modify reviews" ON dish_reviews FOR ALL USING (id IS NOT NULL) WITH CHECK (rating >= 1 AND rating <= 5 AND length(comment) > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous insert reviews' AND tablename = 'dish_reviews') THEN
        CREATE POLICY "Allow anonymous insert reviews" ON dish_reviews FOR INSERT TO anon WITH CHECK (rating >= 1 AND rating <= 5 AND length(comment) > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous insert' AND tablename = 'analytics_events') THEN
        CREATE POLICY "Allow anonymous insert" ON analytics_events FOR INSERT TO anon WITH CHECK (event_type IN ('page_view', 'dish_click'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin select' AND tablename = 'analytics_events') THEN
        CREATE POLICY "Allow admin select" ON analytics_events FOR SELECT USING (true);
    END IF;
END $$;
