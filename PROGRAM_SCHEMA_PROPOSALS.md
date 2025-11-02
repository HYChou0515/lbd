# Program Detail Page - Implementation Status

## ✅ Phase 1: 已完成的基礎改進

### 1. 統一左側欄佈局
- ✅ 標題格式統一：`Program Structure` / `File Structure`
- ✅ 移除冗餘的 Program Header（避免與頁面頂部重複）
- ✅ 使用 Divider 分隔兩個區塊
- ✅ File Structure 使用可交互的文件樹（與 Dataset 一致）

### 2. 當前左側欄結構
```
┌─────────────────────────────┐
│ Program Structure           │  ← 可點擊的樹狀結構
│  ▼ Program Root             │
│    ▼ Open Data              │
│       - OD1                 │
│       - OD2                 │
│    ▼ Open Exam              │
│       - OE1                 │
│       - OE2                 │
│    ▼ Close Exam             │
│       - CE1                 │
│       - CE2                 │
│       - CE3                 │
│    ▼ Sample Code            │
│       - SC1                 │
│    ▼ Eval Code              │
│       - EC1                 │
│       - EC2                 │
│       - EC3                 │
│       - EC4                 │
│    - Submissions            │
│    - Leaderboard            │
├─────────────────────────────┤
│ File Structure              │  ← 可交互的文件樹
│  ▼ program_root             │
│    ▼ data/                  │
│      ▼ cases/               │
│        - open_data_1.json   │
│    ▼ algos/                 │
│      ▼ sample/              │
│      ▼ eval/                │
│    ▼ submissions/           │
│    - README.md              │
└─────────────────────────────┘
```

### 3. 中間面板內容渲染

已實現的內容顯示邏輯：

| 選擇的節點 | 顯示內容 | 狀態 |
|-----------|---------|------|
| Program Root | Program README (Markdown) with Code/Preview toggle | ✅ 已實現 |
| Open Data / Open Exam / Close Exam (分類節點) | 提示選擇具體項目 | ✅ 已實現 |
| Case 節點 (OD1, OE1, etc.) | Case 詳情 Markdown (TODO: 應顯示 Dataset 內容) | ⚠️ 待改進 |
| Sample Code / Eval Code (分類節點) | 提示選擇具體代碼 | ✅ 已實現 |
| Code 節點 (SC1, EC1, etc.) | Python 代碼顯示 (TODO: 從 GitLab 獲取) | ⚠️ 待改進 |
| Submissions | 內嵌 SubmissionPage (不切換路由) | ✅ 已實現 |
| Leaderboard | 空白頁面 "Coming soon..." | ✅ 已實現 |
| File Structure 中的文件 | 文件內容 (從 mock 數據) | ⚠️ 待改進 |

---

## 📋 Phase 2: Mock 數據實現 (已完成)

### ✅ 已創建的 Mock 數據

1. **mockProgramFileStructure.ts**
   - 模擬 Program ZIP 文件結構
   - 包含 data/, algos/, submissions/, README.md
   - 文件節點包含實際內容

2. **可交互的 FileTreeNode 組件**
   - 與 DatasetDetailPage 使用相同的實現
   - 支持展開/收合文件夾
   - 點擊文件可選中並顯示內容

### ⚠️ 待改進功能

1. **File Structure 文件內容顯示**
   - 當前：文件樹已可交互，但選中後中間面板尚未整合
   - 需要：將 selectedFile 傳遞給 ProgramContent 並顯示

2. **Case 節點內容**
   - 當前：顯示 Case 的 Markdown 描述
   - 理想：應該顯示關聯的 Dataset 內容（類似 DatasetDetailPage）
   - 需要：從 Case.dataset_revision_id 查找並顯示 Dataset

3. **Code 節點內容**
   - 當前：顯示 placeholder Python 代碼
   - 理想：從 GitLab URL 或 Backend API 獲取實際代碼
   - 需要：實現代碼內容獲取機制

---

## 🔧 Phase 3: Schema 擴展建議 (待討論)

### 問題 1: File Structure 數據來源

**當前方案：**
- 使用 `mockProgramFileStructure` 模擬 ZIP 結構
- 與 Dataset 的 `mockFileStructure` 類似

**建議的 API 設計：**
```typescript
// 獲取 Program ZIP 文件結構
GET /api/programs/:programId/zip

Response: {
  structure: FileNode  // 與 Dataset 相同的 FileNode 類型
}

// 獲取特定文件內容
GET /api/programs/:programId/files/:filePath

Response: {
  content: string,
  mimeType: string
}
```

### 問題 2: Code 內容獲取

**當前 Code Schema：**
```typescript
export interface Code {
  name: string;
  description: string;
  gitlab_url: string;  // ← 外部鏈接，無法直接讀取
  commit_hash: string;
  code_type: CodeType;
}
```

**建議方案 A: 添加內容欄位**
```typescript
export interface Code {
  name: string;
  description: string;
  gitlab_url: string;
  commit_hash: string;
  code_type: CodeType;
  content?: string;     // ← 新增：代碼內容
  language?: string;    // ← 新增：語言（用於語法高亮）
  filename?: string;    // ← 新增：文件名
}
```

**建議方案 B: Backend API 代理**
```typescript
// Backend 從 GitLab 獲取代碼並返回
GET /api/code/:codeId/content

Response: {
  content: string,
  language: string,
  filename: string
}
```

### 問題 3: Case 與 Dataset 的關聯

**當前 Case Schema：**
```typescript
export interface Case {
  dataset_revision_id: string;  // ← 只有 ID，沒有完整 Dataset 數據
  case_type: CaseType;
  name: string;
  description: string;
}
```

**理想行為：**
點擊 Case 節點時，應該顯示與 DatasetDetailPage 相同的內容（Dataset 結構、文件樹、Markdown 預覽等）

**需要決定：**
1. 在前端通過 `dataset_revision_id` 查找並顯示 Dataset？
2. Backend API 返回完整的 Case + Dataset 組合數據？
3. 直接導航到 `/dataset/:revisionId` 頁面？

---

## 📊 Phase 4: API 集成規劃 (長期)

### 需要的 API Endpoints

1. **Program ZIP 結構**
   ```
   GET /api/programs/:programId/zip
   ```

2. **Program 文件內容**
   ```
   GET /api/programs/:programId/files/:filePath
   ```

3. **Code 內容**
   ```
   GET /api/code/:codeId/content
   ```

4. **Case 關聯的 Dataset**
   ```
   GET /api/cases/:caseId/dataset
   或
   GET /api/datasets/:revisionId  (通過 Case.dataset_revision_id)
   ```

5. **Leaderboard 數據**
   ```
   GET /api/programs/:programId/leaderboard
   ```

---

## 🎯 下一步行動建議

### Option A: 完成 Mock 數據功能（最快）
1. 將 `selectedFile` 傳遞給 `ProgramContent`
2. 在中間面板添加文件內容顯示邏輯
3. 為 Code 節點添加更真實的 mock 代碼內容
4. 為 Case 節點創建簡化的 Dataset 顯示

### Option B: 實現 API 集成（需要 Backend 支持）
1. 確認 Backend 是否已有 ZIP API
2. 實現文件內容獲取
3. 實現代碼內容獲取
4. 整合 Dataset 顯示

### Option C: 混合方案（推薦）
1. 先用 Mock 數據完成 UI 交互（快速驗證）
2. 逐步替換為真實 API（Backend ready 後）
3. 保持 Mock 數據作為開發/測試用途

---

## ✅ 總結

### 已完成
- ✅ Program Structure 樹狀結構（可交互，有分類和子項目）
- ✅ File Structure 文件樹（可交互）
- ✅ 中間面板基本內容渲染（Program, Case, Code, Submissions, Leaderboard）
- ✅ Submissions 內嵌顯示（不切換路由）
- ✅ Markdown 代碼雙模式顯示（Code/Preview toggle）

### 待改進
- ⚠️ File Structure 選中文件後顯示內容
- ⚠️ Case 節點顯示關聯的 Dataset
- ⚠️ Code 節點從 GitLab 或 API 獲取實際代碼
- ⚠️ Leaderboard 內容實現

### 需要決定
1. File Structure 使用 Mock 還是真實 API？
2. Code 內容如何獲取（Schema 擴展 vs API 代理）？
3. Case 節點如何顯示 Dataset（內嵌 vs 跳轉）？

#### 當前狀態
- **ProgramPage**: File Structure 是硬編碼的靜態文字
- **DatasetPage**: File Structure 是從 `mockFileStructure` 讀取的可交互樹

#### 需要的 Schema 擴展

**選項 A: 在 Program 中添加文件結構欄位**

```typescript
// src/types/program.ts

export interface ProgramFileNode {
  name: string;
  type: 'folder' | 'file';
  path: string;  // 相對路徑
  children?: ProgramFileNode[];
  content?: string;  // 文件內容（對於文件節點）
  size?: number;  // 文件大小（bytes）
  lastModified?: string;  // 最後修改時間
}

export interface Program {
  name: string;
  description: string;
  case_ids: string[];
  code_ids: string[];
  file_structure?: ProgramFileNode;  // ← 新增
}
```

**選項 B: 創建 Mock 數據（短期方案）**

```typescript
// src/data/mockProgramFiles.ts

export const mockProgramFileStructure: ProgramFileNode = {
  name: 'program-root',
  type: 'folder',
  path: '/',
  children: [
    {
      name: 'data',
      type: 'folder',
      path: '/data',
      children: [
        {
          name: 'cases',
          type: 'folder',
          path: '/data/cases',
          children: [...]
        }
      ]
    },
    {
      name: 'algos',
      type: 'folder',
      path: '/algos',
      children: [...]
    },
    {
      name: 'README.md',
      type: 'file',
      path: '/README.md',
      content: '# Program Documentation\n...',
      size: 1024
    }
  ]
};
```

**選項 C: 動態加載（長期方案）**

```typescript
// API 設計
GET /api/programs/:programId/files
Response: {
  structure: ProgramFileNode
}

GET /api/programs/:programId/files/:filePath
Response: {
  content: string,
  mimeType: string
}
```

---

### 問題 2: 中間面板內容渲染策略

#### 當前 DatasetDetailPage 行為
1. 選擇 Dataset → 顯示 Dataset 資訊（Markdown）
2. 選擇文件 → 使用 Monaco Editor 顯示文件內容

#### 建議的 ProgramPage 行為

**需要決定的內容來源：**

| 選擇的節點 | 應該顯示什麼？ | 數據來源 |
|-----------|---------------|---------|
| Program 根節點 | Program README.md | ❓ 需要定義 |
| Case 節點 | Case 詳情 + Dataset 預覽 | ❓ Case schema 是否包含？ |
| Sample Code | 代碼內容 | ✅ 可從 Code.gitlab_url 獲取 |
| Eval Code | 代碼內容 | ✅ 可從 Code.gitlab_url 獲取 |
| Algo Code | 算法代碼 | ❓ 需要確認來源 |
| File Structure 中的文件 | 文件內容 | ❓ 需要 API 支持 |
| Submissions | 跳轉到 SubmissionPage | ✅ 已實現 |
| Leaderboard | 顯示排行榜表格 | ⏳ 未實現 |

---

### 問題 3: Code 節點的內容獲取

#### 當前 Code Schema

```typescript
export interface Code {
  code_type: 'sample' | 'eval' | 'algo';
  commit_hash: string;
  gitlab_url: string;
}
```

**問題：**
- `gitlab_url` 是外部鏈接，無法直接在中間面板顯示代碼
- 需要 GitLab API 集成或者將代碼內容存儲在系統中

**建議方案：**

**選項 A: 添加代碼內容欄位**
```typescript
export interface Code {
  code_type: 'sample' | 'eval' | 'algo';
  commit_hash: string;
  gitlab_url: string;
  content?: string;  // ← 新增：直接存儲代碼內容
  language?: string; // ← 新增：用於語法高亮
}
```

**選項 B: 通過 API 代理獲取**
```typescript
// Backend API 從 GitLab 獲取代碼
GET /api/code/:codeId/content
Response: {
  content: string,
  language: string,
  filename: string
}
```

**選項 C: 使用 GitLab API（需要 token）**
- 在前端直接調用 GitLab API
- 需要處理認證和 CORS

---

## 建議的實施順序

### Phase 1: 基礎改進（已完成）✅
- [x] 統一左側欄標題格式
- [x] 移除冗餘的 Program Header
- [x] 添加 Divider 分隔

### Phase 2: Mock 數據方案（快速實現）
- [ ] 創建 `mockProgramFileStructure`
- [ ] 實現可點擊的 File Tree 組件
- [ ] 在中間面板顯示選中的文件內容
- [ ] 為每種節點類型添加默認內容

### Phase 3: Schema 擴展（需要討論）
- [ ] 確定 Program 是否需要 `file_structure` 欄位
- [ ] 確定 Code 內容的獲取方式
- [ ] 設計 Case 詳情顯示格式
- [ ] 確定 Leaderboard 數據結構

### Phase 4: API 集成（長期）
- [ ] 實現文件內容 API
- [ ] 實現代碼內容 API
- [ ] 實現 Leaderboard API

---

## 具體需要回答的問題

1. **Program 的文件結構應該從哪裡來？**
   - [ ] 手動維護在 Program schema 中
   - [ ] 從 GitLab repository 動態生成
   - [ ] 從文件系統掃描
   - [ ] 其他來源？

2. **代碼內容應該如何獲取？**
   - [ ] 存儲在數據庫中
   - [ ] 通過 Backend API 從 GitLab 獲取
   - [ ] 前端直接調用 GitLab API
   - [ ] 其他方式？

3. **Case 節點點擊後應該顯示什麼？**
   - [ ] Case 的 metadata（name, description, type）
   - [ ] 關聯的 Dataset 預覽
   - [ ] Execution 和 Evaluation 統計
   - [ ] 其他內容？

4. **Leaderboard 的數據格式是什麼？**
   - [ ] 需要設計新的 API
   - [ ] 從 Submission/ExecutionResult/EvaluationResult 聚合
   - [ ] 其他來源？

---

## 參考：DatasetDetailPage 的實現

### Dataset 的 File Structure
- 使用 `mockFileStructure` (src/data/mockFileStructure.ts)
- FileNode 類型定義：
  ```typescript
  export interface FileNode {
    name: string;
    type: 'folder' | 'file';
    children?: FileNode[];
    content?: string;
  }
  ```

### 中間面板內容渲染
- 選擇 Dataset → 自動生成 Markdown（從 meta + data）
- 選擇文件 → Monaco Editor 顯示 content
- 支持 Markdown Preview 切換

### 建議 ProgramPage 採用類似架構
1. 創建 `mockProgramFileStructure.ts`
2. 為 Program 生成默認的 README.md
3. 為 Case/Code 節點生成內容
4. 使用相同的 Monaco Editor + Markdown Preview

---

## 總結

目前已經完成了**視覺層面的統一**，讓 ProgramPage 和 DatasetDetailPage 的左側欄結構一致。

要實現**功能層面的統一**（可交互的 File Tree，動態內容顯示），需要：

1. **短期方案**: 使用 Mock 數據創建 Program 的文件結構
2. **長期方案**: 設計 API 和 Schema 支持實際的文件內容獲取

請確認以上的問題和方案，我可以根據你的選擇繼續實現！
