import { z } from 'zod';

/**
 * Common field schemas with metadata for form generation
 * These can be reused across different forms in the application
 */
export const fieldRegistry = {
  // Identity fields
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters")
    .describe(JSON.stringify({ 
      label: "Name",
      placeholder: "Enter a name"
    })),

  description: z.string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .describe(JSON.stringify({ 
      type: "textarea",
      rows: 3,
      placeholder: "Enter a description"
    })),

  // Dataset-specific fields
  datasetName: z.string()
    .min(3, "Dataset name must be at least 3 characters")
    .max(100, "Dataset name must be at most 100 characters")
    .describe(JSON.stringify({ 
      label: "Dataset Name",
      placeholder: "Enter a unique name for your dataset"
    })),

  datasetDescription: z.string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .describe(JSON.stringify({ 
      type: "textarea",
      rows: 3,
      placeholder: "Describe the purpose and content of this dataset"
    })),

  datasetType: z.enum([
    'EBI', 
    'Escan IDT', 
    'Escan IDT Result', 
    'PrimeV IDT', 
    'PrimeV IDT Result', 
    'GDS', 
    'Review Ready', 
    'RSEM', 
    'RSEM Result', 
    'Group'
  ]).describe(JSON.stringify({ 
    type: "select",
    label: "Dataset Type",
    placeholder: "Select the type of dataset"
  })),

  // Manufacturing/Hardware fields
  toolId: z.string()
    .optional()
    .describe(JSON.stringify({ 
      label: "Tool ID",
      placeholder: "Enter the tool identifier (optional)"
    })),

  waferId: z.string()
    .optional()
    .describe(JSON.stringify({ 
      label: "Wafer ID",
      placeholder: "Enter the wafer identifier (optional)"
    })),

  lotId: z.string()
    .optional()
    .describe(JSON.stringify({ 
      label: "Lot ID",
      placeholder: "Enter the lot identifier (optional)"
    })),

  part: z.string()
    .optional()
    .describe(JSON.stringify({ 
      label: "Part",
      placeholder: "Enter the part name (optional)"
    })),

  // File upload fields
  csvFile: z.instanceof(File, { message: "Please upload a CSV file" })
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine((file) => file.name.endsWith('.csv'), "File must be a CSV file")
    .describe(JSON.stringify({
      type: "file",
      label: "CSV File",
      accept: ".csv,text/csv",
      placeholder: "Upload a CSV file"
    })),

  // S3 URL fields
  s3Url: z.url({ protocol: /^s3$/ })
    .regex(/^s3:\/\/[a-zA-Z0-9.\-_]+\/[a-zA-Z0-9\/.\-_]*$/, "必須是有效的 S3 URL 格式")
    .describe(JSON.stringify({
      type: "s3url",
      label: "S3 URL",
      buckets: ["foo", "bar"],
      allowCustomBucket: true,
      placeholder: "輸入路徑或貼上完整 S3 URL",
      description: "選擇預設 bucket 或輸入自訂 bucket，也可以直接貼上完整 S3 URL"
    })),

  datasetS3Url: z.url({ protocol: /^s3$/ })
    .regex(/^s3:\/\/[a-zA-Z0-9.\-_]+\/[a-zA-Z0-9\/.\-_]*$/, "必須是有效的 S3 URL 格式")
    .describe(JSON.stringify({
      type: "s3url",
      label: "Dataset Location",
      buckets: ["prod-datasets", "staging-datasets", "dev-datasets"],
      allowCustomBucket: false,
      placeholder: "輸入資料集路徑",
      description: "選擇資料集儲存位置"
      
    })),

  // User fields
  email: z.email("Invalid email address")
    .describe(JSON.stringify({ 
      label: "Email",
      placeholder: "Enter your email address"
    })),

  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .describe(JSON.stringify({ 
      label: "Username",
      placeholder: "Enter your username"
    })),

  // Numeric fields
  age: z.number()
    .int("Age must be an integer")
    .min(0, "Age must be positive")
    .max(150, "Age must be realistic")
    .optional()
    .describe(JSON.stringify({ 
      label: "Age",
      placeholder: "Enter your age",
      min: 0,
      max: 150
    })),

  score: z.number()
    .min(0, "Score must be at least 0")
    .max(100, "Score must be at most 100")
    .describe(JSON.stringify({ 
      label: "Score",
      placeholder: "Enter a score",
      min: 0,
      max: 100,
      step: 0.1
    })),

  // Slider fields - slider range can be different from validation range
  confidence: z.number()
    .min(0, "Confidence must be at least 0")
    .max(1, "Confidence must be at most 1")
    .describe(JSON.stringify({
      type: "slider",
      label: "Confidence Level",
      sliderMin: 0,
      sliderMax: 1,
      step: 0.01,
      description: "Slider range: 0-1, but you can type any valid number in the input"
    })),

  threshold: z.number()
    .min(-100, "Threshold must be at least -100")
    .max(500, "Threshold must be at most 500")
    .describe(JSON.stringify({
      type: "slider",
      label: "Threshold",
      sliderMin: 0,
      sliderMax: 100,
      step: 5,
      description: "Slider shows 0-100, but validation allows -100 to 500"
    })),

  // Date fields
  startDate: z.date()
    .optional()
    .describe(JSON.stringify({ 
      label: "Start Date",
      placeholder: "Select start date"
    })),

  endDate: z.date()
    .optional()
    .describe(JSON.stringify({ 
      label: "End Date",
      placeholder: "Select end date"
    })),

  createdAt: z.date()
    .optional()
    .describe(JSON.stringify({ 
      label: "Created At",
      placeholder: "Creation date"
    })),

  // Boolean fields
  isActive: z.boolean()
    .optional()
    .describe(JSON.stringify({ 
      label: "Active",
      description: "Enable or disable this item"
    })),

  isPublic: z.boolean()
    .optional()
    .describe(JSON.stringify({ 
      label: "Public",
      description: "Make this item publicly visible"
    })),
} as const;

// Type definitions for metadata customization
type BaseMetadataCustomization = {
  label?: string;
  placeholder?: string;
  description?: string;
};

type TextareaMetadataCustomization = BaseMetadataCustomization & {
  type?: 'textarea';
  rows?: number;
};

type NumberMetadataCustomization = BaseMetadataCustomization & {
  type?: 'number';
  min?: number;
  max?: number;
  step?: number;
};

type SelectMetadataCustomization = BaseMetadataCustomization & {
  type?: 'select';
  options?: { value: string; label: string }[];
};

type SwitchMetadataCustomization = BaseMetadataCustomization & {
  type?: 'switch';
};

type DateMetadataCustomization = BaseMetadataCustomization & {
  type?: 'date';
};

// Union type for all possible metadata customizations
export type MetadataCustomization = 
  | BaseMetadataCustomization
  | TextareaMetadataCustomization
  | NumberMetadataCustomization
  | SelectMetadataCustomization
  | SwitchMetadataCustomization
  | DateMetadataCustomization;

/**
 * Helper function to customize a field from the registry
 * @example
 * // Customize the name field
 * const projectName = customizeField(fieldRegistry.name, {
 *   label: "Project Name",
 *   placeholder: "Enter your project name"
 * });
 * 
 * @example
 * // Customize a textarea field with rows
 * const detailedDescription = customizeField(fieldRegistry.description, {
 *   label: "Detailed Description",
 *   rows: 5,
 *   placeholder: "Provide comprehensive details..."
 * });
 * 
 * @example
 * // Customize a number field with constraints
 * const customScore = customizeField(fieldRegistry.score, {
 *   label: "Custom Score",
 *   min: 10,
 *   max: 50,
 *   step: 5
 * });
 */
export function customizeField<T extends z.ZodTypeAny>(
  field: T,
  customMetadata: MetadataCustomization
): T {
  const currentMetadata = (() => {
    try {
      const desc = (field as any)._def?.description;
      return desc ? JSON.parse(desc) : {};
    } catch {
      return {};
    }
  })();

  const mergedMetadata = { ...currentMetadata, ...customMetadata };
  return field.describe(JSON.stringify(mergedMetadata)) as T;
}
