# 鑫蘴家 · Julian Vane Gastronomy

<div align="center">
  <img width="1200" alt="Julian Vane Gastronomy Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

這是一個專為頂級私廚 **Julian Vane** 打造的高級感官饗宴展示網站，整合了現代化的前端設計與強大的後端管理功能。

## ✨ 核心特色

- **極致設計**：採用金色與深色調的奢華風格，完美呈現高級料理的質感。
- **動態菜單**：主廚可隨時更新菜色名稱、價格、食材、靈感及供應狀態。
- **主廚後台**：內置受密碼保護的管理控制台，支援即時內容管理與 CRUD 操作。
- **實體照片上傳**：整合 Supabase Storage，支援菜色與主廚頭像的直接檔案上傳。
- **客製化內容**：首頁的社群連結（IG/FB/LINE）及預約文字均可透過後台靈活配置。

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

### 資料庫初始化

請在 Supabase SQL Editor 中執行專案內的 `setup.sql` 腳本，以自動創建必要的資料表與預設管理員帳號 (`rolando`)。

---

© 2019 鑫蘴家. All rights reserved.
