# Dataset Web - 專案進度

## ✅ 已完成功能

### 1. 專案初始化
- ✅ Vite + React + TypeScript 專案設置
- ✅ 使用 pnpm 作為包管理器
- ✅ 整合 Mantine UI 框架 (v7)
- ✅ 安裝 Tabler Icons

### 2. 資料結構定義 (`src/types/dataset.ts`)
- ✅ 10 種 Dataset 類型定義：
  - EBI
  - Escan IDT / Escan IDT Result
  - PrimeV IDT / PrimeV IDT Result
  - GDS
  - Review Ready
  - RSEM / RSEM Result
  - Group (用於集合多個 dataset)
  
- ✅ 完整的 TypeScript 類型系統：
  - `ResourceMeta` - 資源元數據（創建者、更新者、時間、ID）
  - `BaseDataset` - 基礎資料集（名稱、描述、子集 IDs）
  - `BasicDataset` - 帶工具資訊的資料集（toolId, waferId, lotId, part, recipe, stage）
  - `GroupDataset` - 集合型資料集
  - `DatasetDataMeta` - 完整的資料集包裝（meta + data）

### 3. Mock 資料 (`src/data/mockData.ts`)
- ✅ 6 個範例資料集，涵蓋不同類型
- ✅ 包含完整的 metadata 和 subdataset IDs

### 4. 首頁 (`src/pages/HomePage.tsx`)
- ✅ Dataset 列表展示（Grid 布局）
- ✅ 搜尋功能（名稱、描述）
- ✅ 類型篩選下拉選單
- ✅ 響應式設計（手機、平板、桌面）

### 5. Dataset Card 元件 (`src/components/DatasetCard.tsx`)
- ✅ 卡片式呈現，包含：
  - Dataset 名稱和類型 badge
  - Recipe 和 Stage 資訊（帶 tooltip）
  - 短 meta badges（Tool, Wafer, Lot, Part）
  - 描述文字（自動截斷）
  - Subdataset 數量顯示
  - Creator 和建立時間
  - View 和 Download 按鈕

### 6. 詳細頁 (`src/pages/DatasetDetailPage.tsx`)
- ✅ 完整的 metadata 展示
- ✅ Breadcrumb 導航
- ✅ Back 按鈕
- ✅ Subdataset 列表
- ✅ 右側 Sidebar 包含：
  - Process Info (Tool, Wafer, Lot, Part)
  - Recipe & Stage
  - Resource Info (Creator, Updater, 時間)
  - Identifiers (Resource ID, Revision ID)

### 7. 路由系統
- ✅ 基本的 view state 管理（home / detail）
- ✅ 首頁 ↔ 詳細頁切換

---

## 📋 下一步待實作功能

### 短期目標
1. **Preview 功能**
   - [ ] 檔案結構樹狀圖
   - [ ] 圖片縮圖預覽
   - [ ] 支援不同格式（default / yolo / coco）

2. **Download 功能**
   - [ ] 下拉選單選擇格式
   - [ ] 模擬下載流程

3. **Subdataset 詳細資訊**
   - [ ] 點擊 subdataset 查看詳細
   - [ ] 遞迴顯示子集的子集

### 中期目標
4. **進階搜尋與篩選**
   - [ ] 多條件篩選（Creator, Date Range）
   - [ ] 排序功能

5. **資料夾結構視覺化**
   - [ ] 樹狀圖展示每種 dataset type 的特定結構

6. **Markdown Description**
   - [ ] 支援 Markdown 渲染
   - [ ] "Read more" 展開/收起功能

### 長期目標
7. **後端整合**
   - [ ] API 串接
   - [ ] 真實資料載入
   - [ ] 分頁功能

8. **使用者認證**
   - [ ] 登入/登出
   - [ ] 權限管理

---

## 🎨 設計特色

- ✅ 使用 Mantine UI 提供一致的設計語言
- ✅ 響應式設計，支援手機、平板、桌面
- ✅ 彩色 Badge 系統區分不同 Dataset Type
- ✅ 清晰的資訊層次（Card → Detail → Subdatasets）
- ✅ 友善的 UX（Tooltip, Badge, 截斷文字）

---

## 🚀 開發指令

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 建置生產版本
pnpm build

# 預覽建置結果
pnpm preview
```

---

## 📦 技術棧

- **框架**: React 19 + TypeScript
- **建置工具**: Vite 7
- **UI 框架**: Mantine UI v7
- **圖示**: Tabler Icons
- **包管理器**: pnpm
