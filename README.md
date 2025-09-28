# Human Relation Map (人際關係圖)

一個以心智圖方式呈現人際關係的 Web 應用程式，支援節點管理、關係建立、檔案操作等完整功能。

## 🎯 專案特色

- **視覺化關係圖**：使用 D3.js 建立互動式人際關係圖
- **節點管理**：新增、編輯、刪除、拖曳人員節點
- **關係管理**：建立、編輯、刪除人員間的關係線
- **檔案操作**：支援 JSON 格式儲存/讀取，CSV 格式匯入/匯出
- **復原/重做**：完整的 Undo/Redo 功能，支援鍵盤快捷鍵
- **自動儲存**：LocalStorage 自動備份，避免資料遺失
- **視覺合併**：視覺上合併相關節點群組，方便查看核心關係
- **節點合併**：處理重複人員資料的資料合併功能
- **響應式設計**：使用 Tailwind CSS 建構的現代化 UI

## 🚀 快速開始

### 環境需求

- Node.js (版本 14 或以上)
- npm 或 yarn

### 手動開啟專案步驟

#### 方法一：使用 Git Clone (推薦)

1. **複製專案**
```bash
git clone https://github.com/Clark0315/HumanRelationMap.git
cd HumanRelationMap/human-relation-map
```

2. **安裝相依套件**
```bash
npm install
```

3. **啟動開發伺服器**
```bash
npm start
```

4. **開啟瀏覽器**
   - 自動開啟：通常會自動在預設瀏覽器開啟
   - 手動開啟：訪問 `http://localhost:3000`

#### 方法二：下載 ZIP 檔案

1. **下載專案**
   - 前往 [GitHub 專案頁面](https://github.com/Clark0315/HumanRelationMap)
   - 點擊綠色「Code」按鈕
   - 選擇「Download ZIP」
   - 解壓縮到指定資料夾

2. **進入專案資料夾**
```bash
cd /path/to/HumanRelationMap/human-relation-map
```

3. **安裝相依套件**
```bash
npm install
```

4. **啟動開發伺服器**
```bash
npm start
```

#### 疑難排解

- **端口被占用**：如果 3000 port 被占用，系統會自動分配其他端口（如 3001）
- **npm 錯誤**：嘗試刪除 `node_modules` 和 `package-lock.json`，重新執行 `npm install`
- **建置錯誤**：確保 Node.js 版本為 14 或以上

### 其他可用指令

```bash
# 執行測試
npm test

# 建立生產版本
npm run build

# 檢查程式碼風格
npm run lint  # (如果有設定)
```

## 📋 功能說明

### 基本操作

- **新增人員**：點擊「新增人員」按鈕或在畫布空白處右鍵
- **編輯資料**：點擊節點後在右側詳細資訊區編輯
- **拖曳節點**：直接拖曳節點調整位置
- **建立關係**：右鍵點擊節點選擇「建立關係」
- **縮放畫布**：使用滑鼠滾輪縮放，拖曳空白處平移

### 視覺合併功能

- **視覺合併**：右鍵點擊節點選擇「視覺合併」，隱藏與該節點有關係的其他節點
- **合併效果**：合併的節點會變大並顯示為橘色，便於識別
- **切換顯示**：在右上角的合併控制面板中選擇要顯示哪個節點
- **解除合併**：右鍵點擊合併節點選擇「解除合併」，或在控制面板點擊解除按鈕
- **多群組支援**：可同時合併多個節點群組，互不影響
- **資料完整性**：視覺合併不修改原始資料，僅改變顯示狀態

### 節點合併功能（資料合併）

- **資料合併**：在右側詳細資訊區選擇要合併的節點
- **保留選項**：可選擇保留哪個節點的資料
- **關係更新**：合併後自動更新所有相關關係
- **復原支援**：可使用 Ctrl+Z 復原合併操作

### 快捷鍵

- `Ctrl + Z`：復原上一步操作
- `Ctrl + Y` 或 `Ctrl + Shift + Z`：重做操作

### 檔案操作

- **儲存 JSON**：將當前資料儲存為 JSON 檔案
- **讀取 JSON**：從 JSON 檔案載入資料
- **匯入 CSV**：從 CSV 檔案匯入人員資料
- **匯出 CSV**：將資料匯出為 CSV 檔案（分別匯出人員和關係）

### CSV 格式

**人員檔案 (persons.csv)**
```csv
name,phone,note,photo
張三,0912345678,朋友,
李四,0987654321,同事,
```

**關係檔案 (relations.csv)**
```csv
from_name,to_name,label,note
張三,李四,同事,同部門
李四,王五,朋友,大學同學
```

## 🏗️ 技術架構

- **前端框架**：React 18
- **視覺化**：D3.js
- **UI 框架**：Tailwind CSS
- **狀態管理**：React Hooks + Custom Hooks
- **檔案處理**：File API + Blob
- **本地儲存**：LocalStorage
- **建構工具**：Create React App

## 📁 專案結構

```
src/
├── components/           # React 元件
│   ├── GraphCanvas.jsx   # 主要畫布元件
│   └── Sidebar.jsx       # 側邊資訊欄
├── hooks/               # 自定義 Hooks
│   └── useUndoRedo.js   # 復原/重做功能
├── utils/               # 工具函式
│   ├── storage.js       # 本地儲存功能
│   └── csvParser.js     # CSV 解析功能
├── App.js               # 主應用程式
└── index.js            # 應用程式入口
```

## 🎨 資料結構

### 人員資料 (Person)
```json
{
  "id": "string (UUID)",
  "name": "string",
  "photo": "string (base64 or file path)",
  "phone": "string",
  "note": "string",
  "x": "number",
  "y": "number"
}
```

### 關係資料 (Relation)
```json
{
  "id": "string (UUID)",
  "from": "string (Person.id)",
  "to": "string (Person.id)",
  "label": "string (max 8 chars)",
  "note": "string"
}
```

## 🤝 貢獻指南

歡迎提出 Issue 或 Pull Request 來改善這個專案！

## 📄 授權條款

此專案採用 MIT 授權條款。

---

## Available Scripts (Create React App)

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

---

🤖 此專案由 [Claude Code](https://claude.ai/code) 協助開發
