-- 1. 創建 dishes 表
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
    order_index INTEGER DEFAULT 0
);

-- 2. 創建 chef_profile 表
CREATE TABLE IF NOT EXISTS chef_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- 確保只有一條記錄
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
    show_order_button BOOLEAN DEFAULT false
);

-- 3. 開啟 Row Level Security (RLS)
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_profile ENABLE ROW LEVEL SECURITY;

-- 4. 創建 Policy
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read-only access on dishes') THEN
        CREATE POLICY "Allow public read-only access on dishes" ON dishes FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read-only access on chef_profile') THEN
        CREATE POLICY "Allow public read-only access on chef_profile" ON chef_profile FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all actions on dishes for developing') THEN
        CREATE POLICY "Allow all actions on dishes for developing" ON dishes FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all actions on chef_profile for developing') THEN
        CREATE POLICY "Allow all actions on chef_profile for developing" ON chef_profile FOR ALL USING (true);
    END IF;
END $$;

-- 5. 插入初始數據 (使用 ON CONFLICT 避免重複)
INSERT INTO chef_profile (id, name, title, bio, image, instagram, facebook)
VALUES (1, 'Rolando', 'Executive Chef / Creative Director', '致力於將傳統烹飪技藝與現代創新融合，透過每一道佳餚演繹感官故事。擁有超過十五年的頂級餐飲經驗，專注於食材本味的極致發揮。', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3jaeKVcJimTXBq17P7X2VU4a4E5zx_Eu3KA6m1jGIIH6GsrOlI2UurzjYT5xLqk6ngEyigdo7sSFr_zAG5SCxNi0sf2mBOtewv4rRNPnHBwXXSlZryB3mj3tZSMl75oE0WY9ZMhjSSjSJdo9itFINrVR80SHQQP0gl86VYob0aNarvOIyvNjKtAx5_EibxzBe3sjkb6MuZei3lzPx8bb-4PbtIZQiYrwh4SkFiNukUY54Zg_DVV0ZWL-ns7St4SKjif2u4mAs4TII', 'https://instagram.com/chef_julian', '')
ON CONFLICT (id) DO NOTHING;

-- 6. 創建 admin_auth 表
CREATE TABLE IF NOT EXISTS admin_auth (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
);

INSERT INTO admin_auth (username, password) 
VALUES ('rolando', 'rolando')
ON CONFLICT (username) DO NOTHING;

ALTER TABLE admin_auth ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select on admin_auth') THEN
        CREATE POLICY "Allow public select on admin_auth" ON admin_auth FOR SELECT USING (true);
    END IF;
END $$;

-- 8. 設置 Supabase Storage (存儲桶)
-- 注意：這部分通常也可以在 Supabase Dashboard UI 手動操作
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 設置 Storage Policy (允許所有人在開發環境操作，生產環境建議收緊)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects') THEN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'images' );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow upload' AND tablename = 'objects') THEN
        CREATE POLICY "Allow upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'images' );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow update' AND tablename = 'objects') THEN
        CREATE POLICY "Allow update" ON storage.objects FOR UPDATE USING ( bucket_id = 'images' );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow delete' AND tablename = 'objects') THEN
        CREATE POLICY "Allow delete" ON storage.objects FOR DELETE USING ( bucket_id = 'images' );
    END IF;
END $$;

-- 9. 數據分析表 (Analytics)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL, -- e.g., 'page_view', 'dish_click'
    dish_id UUID REFERENCES dishes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 開啟 RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 設置 Policy
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous insert' AND tablename = 'analytics_events') THEN
        CREATE POLICY "Allow anonymous insert" ON analytics_events FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin select' AND tablename = 'analytics_events') THEN
        CREATE POLICY "Allow admin select" ON analytics_events FOR SELECT USING (true);
    END IF;
END $$;
