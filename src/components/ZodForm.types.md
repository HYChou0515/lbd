# ZodForm Type System

## Overview

ZodForm 使用 **discriminated unions** 來提供類型安全的表單配置。這確保每個欄位類型只能使用其支援的屬性。

## Type Structure

### Metadata Types (用於 Zod schema 的 describe)

```typescript
// Base - 所有類型共享的屬性
interface BaseMetadata {
  label?: string;
  placeholder?: string;
  description?: string;
}

// Text - 文字輸入框
type TextMetadata = BaseMetadata & {
  type: 'text';
};

// Textarea - 多行文字輸入
type TextareaMetadata = BaseMetadata & {
  type: 'textarea';
  rows?: number;  // 特定於 textarea
};

// Number - 數字輸入
type NumberMetadata = BaseMetadata & {
  type: 'number';
  min?: number;   // 特定於 number
  max?: number;
  step?: number;
};

// Select - 下拉選單
type SelectMetadata = BaseMetadata & {
  type: 'select';
  options?: { value: string; label: string }[];  // 特定於 select
};

// Switch - 開關按鈕
type SwitchMetadata = BaseMetadata & {
  type: 'switch';
};

// Date - 日期選擇器
type DateMetadata = BaseMetadata & {
  type: 'date';
};

// Union - 所有可能的 metadata 類型
type ZodFormMetadata = 
  | TextMetadata 
  | TextareaMetadata 
  | NumberMetadata 
  | SelectMetadata 
  | SwitchMetadata 
  | DateMetadata
  | BaseMetadata;  // 允許不指定 type，自動推斷
```

### Field Config Types (用於 ZodForm 的 fields prop)

```typescript
// 結構與 Metadata 相同，但用於 component 層級的配置
type ZodFormField = 
  | TextFieldConfig 
  | TextareaFieldConfig 
  | NumberFieldConfig 
  | SelectFieldConfig 
  | SwitchFieldConfig 
  | DateFieldConfig
  | BaseFieldConfig;
```

## Type Safety Benefits

### ✅ 正確的用法

```typescript
// Textarea - rows 是有效的
const field1: TextareaFieldConfig = { 
  name: 'description', 
  type: 'textarea', 
  rows: 5 
};

// Number - min, max, step 是有效的
const field2: NumberFieldConfig = { 
  name: 'age', 
  type: 'number', 
  min: 0, 
  max: 150 
};

// Select - options 是有效的
const field3: SelectFieldConfig = { 
  name: 'type', 
  type: 'select', 
  options: [{ value: 'a', label: 'A' }] 
};
```

### ❌ TypeScript 會防止錯誤

```typescript
// 錯誤：text 類型不能有 rows 屬性
const field1: TextFieldConfig = { 
  name: 'name', 
  type: 'text', 
  rows: 5  // ❌ Type error
};

// 錯誤：switch 類型不能有 placeholder
const field2: SwitchFieldConfig = { 
  name: 'isActive', 
  type: 'switch', 
  placeholder: 'Toggle'  // ❌ Type error
};

// 錯誤：number 類型不能有 options
const field3: NumberFieldConfig = { 
  name: 'score', 
  type: 'number', 
  options: [...]  // ❌ Type error
};
```

## Usage Examples

### 1. Field Registry (Metadata in Zod schema)

```typescript
// 在 fieldRegistry.ts 中使用 discriminated union
const description = z.string()
  .optional()
  .describe(JSON.stringify({ 
    type: "textarea",  // 指定 type
    rows: 3,          // textarea 特有的屬性
    placeholder: "Enter description"
  } satisfies TextareaMetadata));  // TypeScript 會驗證

const age = z.number()
  .optional()
  .describe(JSON.stringify({ 
    type: "number",   // 指定 type
    min: 0,          // number 特有的屬性
    max: 150,
    step: 1
  } satisfies NumberMetadata));
```

### 2. Component Fields (ZodForm props)

```typescript
// 在 component 中使用 discriminated union
<ZodForm
  schema={schema}
  fields={[
    'name',  // string - 完全自動推斷
    
    { 
      name: 'description', 
      type: 'textarea',  // 明確指定 type
      rows: 5           // TypeScript 知道 textarea 可以有 rows
    } satisfies TextareaFieldConfig,
    
    { 
      name: 'age', 
      type: 'number'    // TypeScript 知道 number 不能有 rows
    } satisfies NumberFieldConfig,
  ]}
  initialValues={...}
  onSubmit={...}
/>
```

### 3. customizeField Helper

```typescript
import { MetadataCustomization, customizeField, fieldRegistry } from '../schemas/fieldRegistry';

// TypeScript 會驗證 metadata 是否有效
const customDescription = customizeField(
  fieldRegistry.description, 
  {
    rows: 10,  // ✅ 有效，description 是 textarea
    placeholder: "Custom text"
  } satisfies TextareaMetadataCustomization
);

const customAge = customizeField(
  fieldRegistry.age, 
  {
    min: 18,   // ✅ 有效，age 是 number
    max: 100
  } satisfies NumberMetadataCustomization
);
```

## Key Advantages

1. **Type Safety**: TypeScript 會在編譯時捕捉錯誤
2. **IntelliSense**: IDE 會提供正確的自動完成建議
3. **Self-Documenting**: 類型定義即文檔
4. **Refactoring Safety**: 修改類型時，所有使用處都會被檢查
5. **Discriminated Unions**: 根據 `type` 屬性，TypeScript 自動 narrow 可用的屬性

## Migration from Previous Version

之前的版本使用單一 interface：

```typescript
// Old (less type-safe)
interface ZodFormMetadata {
  type?: 'text' | 'textarea' | 'number' | 'select' | 'switch' | 'date';
  options?: { value: string; label: string }[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
}
```

問題：
- 任何 type 都可以有任何屬性（例如：text 可以有 rows）
- IDE 無法提供正確的建議
- 容易產生執行時錯誤

新版本使用 discriminated unions：

```typescript
// New (type-safe)
type ZodFormMetadata = 
  | TextMetadata        // 只有 base 屬性
  | TextareaMetadata    // 可以有 rows
  | NumberMetadata      // 可以有 min, max, step
  | SelectMetadata      // 可以有 options
  | SwitchMetadata      // 只有 base 屬性
  | DateMetadata        // 只有 base 屬性
  | BaseMetadata;       // 不指定 type，自動推斷
```

優點：
- TypeScript 會防止無效的屬性組合
- IDE 根據 type 提供正確的自動完成
- 編譯時就能發現錯誤
