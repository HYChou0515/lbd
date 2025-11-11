# Field Registry

這個目錄包含可重複使用的 Zod schema 欄位定義，用於在整個應用程式中保持一致性。

## 使用方式

### 基本使用

直接從 registry 引用預定義的欄位：

```typescript
import { z } from 'zod';
import { fieldRegistry } from '../schemas/fieldRegistry';

const userSchema = z.object({
  name: fieldRegistry.name,
  email: fieldRegistry.email,
  age: fieldRegistry.age,
});
```

### 客製化欄位

使用 `customizeField` helper 來覆蓋 metadata：

```typescript
import { fieldRegistry, customizeField } from '../schemas/fieldRegistry';

const projectSchema = z.object({
  name: customizeField(fieldRegistry.name, {
    label: "Project Name",
    placeholder: "Enter your project name",
  }).min(5, "Project name must be at least 5 characters"),
});
```

### 完整範例

```typescript
import { z } from 'zod';
import { fieldRegistry, customizeField } from '../schemas/fieldRegistry';

// 簡單使用 - 直接引用
const simpleSchema = z.object({
  name: fieldRegistry.name,
  description: fieldRegistry.description,
  email: fieldRegistry.email,
});

// 客製化使用 - 修改部分 metadata
const customSchema = z.object({
  name: customizeField(fieldRegistry.name, {
    placeholder: "Enter a custom placeholder",
  }),
  
  description: customizeField(fieldRegistry.description, {
    rows: 5,  // 增加 textarea 高度
    placeholder: "More detailed description...",
  }),
  
  // 混合使用 - 修改 metadata 和驗證規則
  email: customizeField(fieldRegistry.email, {
    label: "Work Email",
  }).endsWith("@company.com", "Must be a company email"),
});
```

## Registry 欄位列表

### 身份識別欄位
- `name`: 通用名稱欄位 (3-100 字元)
- `description`: 通用描述欄位 (textarea, 最多 500 字元)

### Dataset 專用欄位
- `datasetName`: Dataset 名稱 (3-100 字元)
- `datasetDescription`: Dataset 描述 (textarea, 最多 500 字元)
- `datasetType`: Dataset 類型 (enum: EBI, Escan IDT, 等)

### 製造/硬體欄位
- `toolId`: 工具識別碼 (選填)
- `waferId`: Wafer 識別碼 (選填)
- `lotId`: Lot 識別碼 (選填)
- `part`: 零件名稱 (選填)

### 使用者欄位
- `email`: Email 地址 (含驗證)
- `username`: 使用者名稱 (3-50 字元)

### 數值欄位
- `age`: 年齡 (0-150)
- `score`: 分數 (0-100, 支援小數)

### 日期欄位
- `startDate`: 開始日期
- `endDate`: 結束日期
- `createdAt`: 建立日期

### 布林欄位
- `isActive`: 啟用/停用
- `isPublic`: 公開/私密

## Metadata 支援

每個欄位都包含以下 metadata (透過 Zod 的 `describe` 方法以 JSON 格式儲存)：

```typescript
{
  label: "欄位標籤",           // 顯示在表單上的標籤
  placeholder: "提示文字",     // 輸入框的提示文字
  description: "說明文字",     // 欄位的說明 (用於 Switch 等)
  type: "textarea",           // 覆蓋自動推斷的欄位類型
  options: [...],            // Select 欄位的選項
  rows: 3,                   // Textarea 的列數
  min: 0,                    // NumberInput 的最小值
  max: 100,                  // NumberInput 的最大值
  step: 0.1,                 // NumberInput 的步進值
}
```

## 與 ZodForm 整合

Field registry 與 `ZodForm` 元件完美整合：

```typescript
import { ZodForm } from '../components/ZodForm';
import { fieldRegistry } from '../schemas/fieldRegistry';

const schema = z.object({
  name: fieldRegistry.datasetName,
  description: fieldRegistry.datasetDescription,
  type: fieldRegistry.datasetType,
});

function MyForm() {
  return (
    <ZodForm
      schema={schema}
      fields={['name', 'description', 'type']}  // 簡潔！不需要任何配置
      initialValues={{...}}
      onSubmit={handleSubmit}
    />
  );
}
```

## 優點

### 1. 減少重複程式碼

**Before:**
```typescript
// 每個表單都需要重新定義
const schema1 = z.object({
  name: z.string().min(3).max(100).describe(JSON.stringify({
    label: "Name",
    placeholder: "Enter name"
  })),
});

const schema2 = z.object({
  name: z.string().min(3).max(100).describe(JSON.stringify({
    label: "Name", 
    placeholder: "Enter name"
  })),
});
```

**After:**
```typescript
// 只需引用 registry
const schema1 = z.object({
  name: fieldRegistry.name,
});

const schema2 = z.object({
  name: fieldRegistry.name,
});
```

### 2. 保持一致性

所有使用相同欄位的表單都會有：
- 相同的驗證規則
- 相同的錯誤訊息
- 相同的 UI 配置 (label, placeholder)

### 3. 易於維護

如果需要修改某個欄位的驗證規則或 UI，只需在 registry 中修改一次，所有使用該欄位的表單都會自動更新。

### 4. 類型安全

TypeScript 會確保你使用的欄位是存在的，並且類型正確。

## 最佳實踐

1. **優先使用 Registry**: 如果欄位會在多個地方使用，就加入 registry
2. **使用 customizeField**: 需要微調時，不要直接修改 registry，使用 customizeField
3. **命名清晰**: Registry 欄位名稱應該清楚表達其用途
4. **分組管理**: 相關欄位放在一起 (例如: dataset 相關、user 相關)
5. **文檔化**: 為每個欄位加上註解說明其用途和適用場景

## 擴展 Registry

新增欄位到 registry：

```typescript
export const fieldRegistry = {
  // ... existing fields
  
  // 新增自訂欄位
  customField: z.string()
    .min(1, "Custom field is required")
    .describe(JSON.stringify({ 
      label: "Custom Field",
      placeholder: "Enter custom value"
    })),
} as const;
```

## 參考資源

- [Zod Documentation](https://zod.dev/)
- [Zod Metadata](https://zod.dev/metadata)
- [ZodForm Component](../components/ZodForm.tsx)
- [Example Usage](../examples/ZodFormExamples.tsx)
