# 鑫蘴家 · XIN-FENG-JIA Gastronomy

<div align="center">
  <img width="1200" alt="XIN-FENG-JIA Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

這是一個專為頂級私廚 **主廚 Julian** 打造的高級感官饗宴展示網站。本專案整合了現代化的前端設計與強大的後端管理功能，旨在為顧客提供沉浸式的線上訂餐與資訊瀏覽體驗。

## ✨ 核心特色

### 👑 極致感官設計
- **奢華美學**：採用金色、深黑色調的奢華風格，搭配高品質餐點照，呈現極致的視覺饗宴。
- **全平台響應**：針對手機、平板、桌面顯示器進行深度優化，確保在任何螢幕尺寸下都能維持完美的排版。
- **微動態體驗**：引入導航縮放、背景亮點與平滑過渡動畫，提升操作的層次感與細膩度。
- **評價動態載入**：菜色詳情的最新評價採用漸進載入，避免一次載入過多內容。

### 📊 主廚強效後台
- **內容管理系統 (CMS)**：主廚可即時更新菜色、價格、食材、靈感故事及供應狀態。
- **直覺式導航**：優化後的後台佈局移除冗餘導航，聚焦於核心管理任務。
- **數據分析報表**：內建視覺化流量趨勢圖表與產品點擊排行榜，協助主廚掌握顧客喜好。
- **Q&A 排序管理**：靈活管理常見問題，支援拖曳排序與即時開關。
- **評價審核管理**：評價採待審流程，支援公開/退回待審、回覆與刪除；平均星等僅計入已公開且未刪除的評價。
- **帳號安全**：具備管理員權限驗證與密碼變更功能，保障後台數據安全。

### 🛠️ 整合功能
- **雲端圖片儲存**：整合 Supabase Storage，支援高品質菜色照片與主廚頭像的直接上傳。
- **PWA 持續化體驗**：支援離線訪問與安裝至主畫面，提供接近原生應用的使用感。
- **社群整合**：一鍵連接 Instagram、Facebook、LINE 等社群媒體，縮短預約距離。

## 🛠️ 技術架構

- **Frontend**: React (Hooks, Router) + Vite + Tailwind CSS
- **Backend**: Supabase (Database + Storage + RPC/Logic)
- **PWA**: Vite-plugin-pwa
- **Data Viz**: Recharts (用於數據分析報表)
- **Icons & Animation**: Lucide-React + CSS Micro-animations

## 🚀 快速開始

### 本地開發環境設置

1. **複製與安裝**：
   ```bash
   git clone [repository-url]
   cd julian-vane-gastronomy
   npm install
   ```

2. **配置環境變數**：
   在根目錄創建 `.env.local` 並填入您的 Supabase 憑證：
   ```env
   VITE_SUPABASE_URL=你的_supabase_網址
   VITE_SUPABASE_ANON_KEY=你的_anon_key
   ```

3. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```

### 🗄️ 資料庫初始化 (Supabase)

請在 Supabase Dashboard 的 **SQL Editor** 中執行以下腳本：

1. **整合版**：執行 [`schema.sql`](./schema.sql) 一次建立所有資料表與權限。
2. **儲存空間**：在 Storage 中建立名為 `images` 的 **Public** Bucket。

> [!IMPORTANT]
> 預設管理員帳號：`rolando` / 密碼：`rolando` (建議登入後立即變更密碼)。

---

© 2026 鑫蘴家. 保留所有權利。
