# Dataset API 和過濾功能說明

## 架構設計

### API 層 (`/src/api/datasetApi.ts`)

模擬真實的後端 API 行為，分為兩層過濾：

#### 1. 後端支援的功能（API 參數）
- **Create Time Range**: `createTimeStart`, `createTimeEnd`
- **Update Time Range**: `updateTimeStart`, `updateTimeEnd`
- **Sort**: `sortBy` (createTime/updateTime), `sortOrder` (asc/desc)
- **Pagination**: `page`, `pageSize`

#### 2. 前端額外的過濾（Frontend Filters）
- **Mine**: 只顯示我的 datasets (creator === CURRENT_USER)
- **Creators**: 多選過濾 creators
- **Types**: 多選過濾 dataset types
- **Global Search**: 搜尋 name, description, wafer, tool, lot, part, recipe, stage

### HomePage 功能

#### 狀態管理
- `apiParams`: 後端 API 參數（會觸發重新呼叫 API）
- `frontendFilters`: 前端過濾參數（只在前端過濾，不呼叫 API）
- `apiResponse`: API 回應資料
- `isLoading`: 載入狀態

#### 過濾流程
1. 使用者調整 API 參數 (sort, pagination) → 觸發 API 呼叫
2. API 返回資料 → 儲存到 `apiResponse`
3. 前端過濾 (`applyFrontendFilters`) 應用到 API 資料
4. 顯示最終結果

#### UI 功能
- **Show/Hide Filters**: 收合/展開過濾面板
- **Refresh**: 重新載入資料
- **Reset All**: 清除所有前端過濾
- **Active Filter Count**: 顯示啟用的過濾器數量
- **Empty State**: 沒有資料時的提示

### 模擬當前使用者
```typescript
export const CURRENT_USER = 'john.doe';
```

可以在 `datasetApi.ts` 中修改這個值來測試 "Mine" 過濾功能。

## 使用範例

### 取得所有 datasets（按更新時間排序）
```typescript
const response = await fetchDatasets({
  sortBy: 'updateTime',
  sortOrder: 'desc',
  page: 1,
  pageSize: 50,
});
```

### 應用前端過濾
```typescript
const filtered = applyFrontendFilters(response.data, {
  mine: true,
  types: ['RSEM', 'GDS'],
  searchQuery: 'wafer001',
});
```

## 未來擴展

當連接真實 API 時：
1. 將 `fetchDatasets` 中的 `mockDatasets` 替換為真實的 HTTP 請求
2. 保持相同的介面（`DatasetApiParams` 和 `DatasetApiResponse`）
3. 前端過濾邏輯可以考慮移到後端（如果後端支援的話）
4. 可以添加更多 API 參數（例如 create time range filter）
