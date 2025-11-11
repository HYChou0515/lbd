# Discriminated Union 支援範例

ZodForm 現在完整支援 Zod 的 discriminated union！這讓你能夠根據使用者的選擇動態顯示不同的欄位。

## 使用方式

### 1. 定義 Discriminated Union Schema

```typescript
import { z } from 'zod';

// 在 fieldRegistry.ts 中定義
export const dataSourceUpload = z.discriminatedUnion('uploadMethod', [
  // 選項 1: 檔案上傳
  z.object({
    uploadMethod: z.literal('file'),
    file: z.instanceof(File)
      .refine(file => file.size <= 10 * 1024 * 1024, 'File must be ≤10MB')
      .describe(JSON.stringify({
        type: "file",
        label: "Upload File",
        accept: ".csv,.txt,.json",
        description: "Upload a file from your computer"
      })),
  }),
  // 選項 2: S3 URL
  z.object({
    uploadMethod: z.literal('s3url'),
    s3url: z.string()
      .url({ protocol: /^s3$/ })
      .regex(/^s3:\/\/[a-zA-Z0-9.\-_]+\/[a-zA-Z0-9\/.\-_]*$/, "必須是有效的 S3 URL 格式")
      .describe(JSON.stringify({
        type: "s3url",
        label: "S3 URL",
        buckets: ["my-bucket", "data-bucket", "upload-bucket"],
        allowCustomBucket: true,
        description: "Provide an S3 URL to your data"
      })),
  }),
]).describe(JSON.stringify({
  label: "Data Source",
  description: "Choose how you want to provide your data"
}));
```

### 2. 在表單中使用

```typescript
const mySchema = z.object({
  name: z.string(),
  dataSource: fieldRegistry.dataSourceUpload, // 使用 discriminated union
  description: z.string().optional(),
});

// 在組件中
<ZodForm
  schema={mySchema}
  fields={[
    'name',
    'dataSource',  // ZodForm 會自動偵測並正確渲染
    'description',
  ]}
  onSubmit={handleSubmit}
/>
```

## 工作原理

1. **自動偵測**: ZodForm 會自動偵測 schema 中的 `z.discriminatedUnion`
2. **Radio 選擇器**: discriminator 欄位（例如 `uploadMethod`）會渲染成 Radio.Group
3. **條件式顯示**: 根據使用者選擇的選項，動態顯示對應的欄位
4. **視覺分隔**: 條件欄位會有視覺縮排和左側邊框，清楚顯示層級關係

## 實際效果

當使用者選擇 "File" 時：
```
○ File
● S3url

  ┃ Upload File
  ┃ [選擇檔案按鈕]
  ┃ Upload a file from your computer
```

當使用者選擇 "S3url" 時：
```
● File
○ S3url

  ┃ S3 URL
  ┃ [Bucket 選擇器]
  ┃ [路徑輸入框]
  ┃ Provide an S3 URL to your data
```

## 優勢

✅ **完全自動**: 不需要手動配置條件邏輯  
✅ **類型安全**: 使用 Zod 的類型推斷，完全 TypeScript 支援  
✅ **易於使用**: 就像使用普通欄位一樣簡單  
✅ **符合 Zod 設計**: 使用 Zod 原生的 discriminated union API  
✅ **視覺清晰**: 自動提供視覺層級和分組

## 範例應用

查看 `src/pages/DatasetPage.tsx` 中的實際應用範例！
