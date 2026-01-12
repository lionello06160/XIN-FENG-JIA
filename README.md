# 鑫蘴家 · Rolando Gastronomy

<div align="center">
  <img width="1200" alt="Rolando Gastronomy Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

這是一個專為頂級私廚 **Rolando** 打造的高級感官饗宴展示網站，整合了現代化的前端設計與強大的後端管理功能。

## ✨ 核心特色

- **極致設計**：採用金色與深色調的奢華風格，完美呈現高級料理的質感。
- **動態菜單**：主廚可隨時更新菜色名稱、價格、食材、靈感及供應狀態。
- **主廚後台**：內置受密碼保護的管理控制台，支援即時內容管理與 CRUD 操作。
- **實體照片上傳**：整合 Supabase Storage，支援菜色與主廚頭像的直接檔案上傳。
- **客製化內容**：首頁的社群連結（IG/FB/LINE）及預約文字均可透過後台靈活配置。
- **Q&A 專區**：全新的問答管理功能，支援首頁手風琴式問答列表，並可在後台自由新增、排序與開關。

## 🛠️ 技術架構

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (Database + Storage + Auth Logic)
- **UI Components**: Lucide-React + Framer-like transitions
- **Routing**: React Router (HashRouter for easy deployment)

## 🚀 快速開始

### 本地開發

1. **安裝依賴**：
   ```bash
   npm install
   ```

2. **環境變數設定**：
   在根目錄創建 `.env.local` 並填入您的 Supabase 憑證：
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **啟動專案**：
   ```bash
   npm run dev
   ```

### 🗄️ 資料庫初始化 (Supabase)

為了讓後端功能正常運作，請在您的 Supabase 專案中執行以下腳本：

1. **全新安裝**：在 **SQL Editor** 中複製並執行 [`setup.sql`](./setup.sql)。
2. **Q&A 功能升級**：若要啟用問答功能，請務必執行 [`migration_qa.sql`](./migration_qa.sql)。
3. **舊版升級**：如果您是從最早期版本升級，可以執行 [`migrate_profile.sql`](./migrate_profile.sql) 來補齊新增的欄位。
4. **圖片空間**：請在 Storage 中手動建立一個名為 `images` 的 **Public** 儲存桶。

預設管理員帳號：`rolando` / 密碼：`rolando`。

---

© 2019 鑫蘴家. All rights reserved.
