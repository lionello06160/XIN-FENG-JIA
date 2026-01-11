-- 若之前已經創建過表，請執行此腳本來手動增加缺失的欄位
ALTER TABLE chef_profile ADD COLUMN IF NOT EXISTS line TEXT;
ALTER TABLE chef_profile ADD COLUMN IF NOT EXISTS cta_title TEXT DEFAULT '預約私廚體驗';
ALTER TABLE chef_profile ADD COLUMN IF NOT EXISTS cta_description TEXT DEFAULT '在您的私人寓所中，體驗由主廚親自操刀的 8 道式招牌饗宴。';
ALTER TABLE chef_profile ADD COLUMN IF NOT EXISTS order_link TEXT DEFAULT '';
ALTER TABLE chef_profile ADD COLUMN IF NOT EXISTS show_order_button BOOLEAN DEFAULT false;
ALTER TABLE chef_profile ADD COLUMN IF NOT EXISTS email TEXT;
