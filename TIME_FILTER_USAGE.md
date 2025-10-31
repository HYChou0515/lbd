# 時間範圍過濾功能

## 新增功能

在 HomePage 中新增了兩個日期範圍選擇器：

### 1. Filter by Update Time Range
- 過濾更新時間在指定範圍內的 datasets
- 例如：選擇 10/15 ~ 現在，會顯示所有在 10/15 之後更新的 datasets

### 2. Filter by Create Time Range
- 過濾創建時間在指定範圍內的 datasets
- 例如：選擇 10/1 ~ 10/31，會顯示所有在 10 月創建的 datasets

## 使用方式

1. **選擇開始日期**：點擊日期選擇器，選擇起始日期
2. **選擇結束日期**：繼續選擇結束日期（可以選擇今天作為結束日期）
3. **清除範圍**：點擊 ✕ 按鈕清除日期範圍

## 範例

### 查看最近一個月更新的 datasets
1. 打開 "Filter by Update Time Range"
2. 選擇開始日期：一個月前的日期
3. 選擇結束日期：今天
4. 系統會自動觸發 API 呼叫並過濾結果

### 查看 10/15 到現在的 datasets
1. 打開 "Filter by Update Time Range" 或 "Filter by Create Time Range"
2. 選擇開始日期：2024-10-15
3. 選擇結束日期：2024-11-01（今天）
4. 查看過濾後的結果

## 技術細節

- 使用 `@mantine/dates` 的 `DatePickerInput` 組件
- `type="range"` 支援選擇日期範圍
- 日期會被轉換為 ISO 字串格式傳給 API
- 當日期範圍變更時，會自動觸發 `useEffect` 重新呼叫 API

## 整合的過濾器

現在 HomePage 包含完整的過濾功能：

### 前端過濾（不觸發 API）
1. ✅ Mine - 只顯示我的 datasets
2. ✅ Global Search - 全域搜尋
3. ✅ Filter by Creators - 多選 creators
4. ✅ Filter by Types - 多選 types

### 後端過濾（觸發 API 呼叫）
5. ✅ **Update Time Range** - 更新時間範圍
6. ✅ **Create Time Range** - 創建時間範圍
7. ✅ Sort By - 排序欄位（Create Time / Update Time）
8. ✅ Sort Order - 排序方向（Newest First / Oldest First）

## 注意事項

- 時間範圍過濾會觸發 API 呼叫，有 300ms 的模擬延遲
- 前端過濾在 API 回應後才執行，不會再次呼叫 API
- 清除日期範圍會立即觸發新的 API 呼叫
