import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { Button, Stack, TextInput, Textarea, Select, NumberInput, Switch, Group, FileInput, Slider, Combobox, useCombobox, Input, InputBase } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { z } from 'zod';
import { useState, useEffect } from 'react';


// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Simplified type system for ZodForm using discriminated unions
 * 
 * Each field type has its own config interface
 * Base properties are shared, type-specific properties are separate
 */

// Shared base properties
interface BaseField {
  label?: string;
  placeholder?: string;
  description?: string;
}

// Base field config without type (for auto-inference)
type BaseFieldConfig = { name: string } & BaseField;

// User input: may not have type (auto-infer from Zod schema)
export type FieldConfig =
  | (BaseFieldConfig & { type: 'text' })
  | (BaseFieldConfig & { type: 'textarea'; rows?: number })
  | (BaseFieldConfig & { type: 'number'; min?: number; max?: number; step?: number })
  | (BaseFieldConfig & { type: 'slider'; sliderMin?: number; sliderMax?: number; step?: number })
  | (BaseFieldConfig & { type: 'select'; options?: { value: string; label: string }[] })
  | (BaseFieldConfig & { type: 'switch' })
  | (BaseFieldConfig & { type: 'date' })
  | (BaseFieldConfig & { type: 'file'; accept?: string; multiple?: boolean })
  | (BaseFieldConfig & { type: 's3url'; buckets?: string[]; allowCustomBucket?: boolean })
  | BaseFieldConfig; // No type = auto-infer

// After resolving: guaranteed to have correct type and all properties
export type ResolvedFieldConfig =
  | (BaseFieldConfig & { type: 'text' })
  | (BaseFieldConfig & { type: 'textarea'; rows: number })
  | (BaseFieldConfig & { type: 'number'; min?: number; max?: number; step?: number })
  | (BaseFieldConfig & { type: 'slider'; sliderMin: number; sliderMax: number; step?: number })
  | (BaseFieldConfig & { type: 'select'; options: { value: string; label: string }[] })
  | (BaseFieldConfig & { type: 'switch' })
  | (BaseFieldConfig & { type: 'date' })
  | (BaseFieldConfig & { type: 'file'; accept?: string; multiple?: boolean })
  | (BaseFieldConfig & { type: 's3url'; buckets: string[]; allowCustomBucket: boolean });

// Metadata is just FieldConfig without the name requirement
export type FieldMetadata = Omit<FieldConfig, 'name'> & { name?: string };

// ============================================================================
// Component Props
// ============================================================================

export interface ZodFormProps<T extends Record<string, any>> {
  schema: z.ZodObject<any>;
  fields: (string | FieldConfig)[];
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

// Helper to get metadata from Zod type
function getMetadata(zodType: any): FieldMetadata {
  if (!zodType) return {};
  
  // Check if metadata exists - description might be a getter
  const def = zodType.def;
  const description = zodType.description || def?.description;
  
  if (description) {
    try {
      // Try to parse description as JSON metadata
      const parsed = JSON.parse(description);
      if (typeof parsed === 'object') {
        return parsed as FieldMetadata;
      }
    } catch {
      // If not JSON, treat as plain description
      return { description };
    }
  }
  
  // For ZodOptional or ZodDefault, check the inner type
  if (def?.type === 'optional' || def?.type === 'default') {
    return getMetadata(def.innerType);
  }
  
  return {};
}

// Helper to infer field type from Zod schema
function inferFieldType(zodType: any): 'text' | 'textarea' | 'number' | 'select' | 'switch' | 'date' {
  const def = zodType?.def;
  const typeName = def?.type;
  
  if (typeName === 'number') return 'number';
  if (typeName === 'boolean') return 'switch';
  if (typeName === 'date') return 'date';
  if (typeName === 'enum') return 'select';
  
  // For ZodOptional or ZodDefault, check the inner type
  if (typeName === 'optional' || typeName === 'default') {
    return inferFieldType(def.innerType);
  }
  
  // Default to text for strings
  return 'text';
}

// Helper to check if field is required
function isFieldRequired(zodType: any): boolean {
  const def = zodType?.def;
  return def?.type !== 'optional';
}

// Helper to get enum options
function getEnumOptions(zodType: any): { value: string; label: string }[] | undefined {
  let currentType = zodType;
  let def = currentType?.def;
  
  // Unwrap optional/default
  while (def?.type === 'optional' || def?.type === 'default') {
    currentType = def.innerType;
    def = currentType?.def;
  }
  
  if (def?.type === 'enum') {
    // Zod v4: entries is an object { value1: value1, value2: value2, ... }
    const entries = def.entries || def.values;
    if (entries) {
      const values = Array.isArray(entries) ? entries : Object.keys(entries);
      return values.map((v: string) => ({ value: v, label: v }));
    }
  }
  
  return undefined;
}

// Helper to format field name as label
function formatLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
}

// ============================================================================
// S3 URL Field Component
// ============================================================================

interface S3UrlFieldProps {
  config: ResolvedFieldConfig & { type: 's3url'; buckets: string[]; allowCustomBucket: boolean } & { required: boolean };
  form: any;
}

function S3UrlField({ config, form }: S3UrlFieldProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [bucket, setBucket] = useState<string>('');
  const [path, setPath] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');

  // Parse S3 URL: s3://bucket/path/to/file
  const parseS3Url = (url: string): { bucket: string; path: string } => {
    if (!url) return { bucket: '', path: '' };
    
    const s3Match = url.match(/^s3:\/\/([^\/]+)\/?(.*)/);
    if (s3Match) {
      return { bucket: s3Match[1], path: s3Match[2] || '' };
    }
    
    return { bucket: '', path: url };
  };

  // Build S3 URL from bucket and path
  const buildS3Url = (bucket: string, path: string): string => {
    if (!bucket) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `s3://${bucket}/${cleanPath}`;
  };

  // Initialize from form value
  useEffect(() => {
    const currentValue = form.values[config.name] || '';
    if (currentValue) {
      const parsed = parseS3Url(currentValue);
      setBucket(parsed.bucket);
      setPath(parsed.path);
      setSearchValue(parsed.bucket);
    }
  }, []);

  // Update form value when bucket or path changes
  useEffect(() => {
    const s3Url = buildS3Url(bucket, path);
    if (s3Url !== form.values[config.name]) {
      form.setFieldValue(config.name, s3Url);
    }
  }, [bucket, path]);

  // Sync searchValue with bucket when bucket changes externally
  useEffect(() => {
    if (bucket && bucket !== searchValue) {
      setSearchValue(bucket);
    }
  }, [bucket]);

  // Handle paste in path field - auto-parse S3 URL
  const handlePathPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const parsed = parseS3Url(pastedText);
    
    if (parsed.bucket) {
      e.preventDefault();
      setBucket(parsed.bucket);
      setSearchValue(parsed.bucket);
      setPath(parsed.path);
    }
  };

  // Filter bucket options based on search
  const filteredBuckets = config.buckets.filter((b) =>
    b.toLowerCase().includes(searchValue.toLowerCase())
  );

  const shouldShowCustomOption = 
    config.allowCustomBucket && 
    searchValue && 
    !config.buckets.includes(searchValue) &&
    !filteredBuckets.length;

  return (
    <Stack gap="xs">
      {config.label && (
        <div>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            {config.label}
            {config.required && <span style={{ color: 'red' }}> *</span>}
          </span>
        </div>
      )}
      
      <Group gap="md" align="flex-start" wrap="nowrap">
        {/* Bucket Selector with Search */}
        <Combobox
          store={combobox}
          onOptionSubmit={(val) => {
            setBucket(val);
            setSearchValue(val);
            combobox.closeDropdown();
          }}
          withinPortal={false}
        >
          <Combobox.Target>
            <InputBase
              component="input"
              type="text"
              pointer
              rightSection={<Combobox.Chevron />}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => {
                combobox.closeDropdown();
                // When losing focus, if searchValue doesn't match bucket, update bucket
                if (searchValue && searchValue !== bucket) {
                  // If it's in the filtered list, use the first match
                  if (filteredBuckets.length > 0 && filteredBuckets.includes(searchValue)) {
                    setBucket(searchValue);
                  } else if (config.allowCustomBucket) {
                    // Use custom bucket
                    setBucket(searchValue);
                  } else if (filteredBuckets.length > 0) {
                    // If not allowing custom, but there are matches, don't auto-select
                    // Keep the bucket as is
                  } else {
                    // Reset to current bucket value
                    setSearchValue(bucket);
                  }
                }
              }}
              value={searchValue}
              onChange={(e) => {
                const val = e.currentTarget.value;
                setSearchValue(val);
                // If user clears the input, also clear the bucket
                if (!val) {
                  setBucket('');
                }
                combobox.openDropdown();
              }}
              placeholder="選擇或輸入 bucket"
              style={{ width: '250px' }}
            />
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>
              {filteredBuckets.map((b) => (
                <Combobox.Option value={b} key={b} active={bucket === b}>
                  {b}
                </Combobox.Option>
              ))}
              {shouldShowCustomOption && (
                <Combobox.Option value={searchValue} key="__custom__">
                  使用自訂: <strong>{searchValue}</strong>
                </Combobox.Option>
              )}
              {!filteredBuckets.length && !shouldShowCustomOption && searchValue && (
                <Combobox.Empty>
                  {config.allowCustomBucket ? '按 Enter 使用自訂 bucket' : '找不到符合的 bucket'}
                </Combobox.Empty>
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>

        {/* Path Input */}
        <TextInput
          placeholder={config.placeholder || "輸入 S3 路徑或貼上完整 S3 URL"}
          value={path}
          onChange={(e) => setPath(e.currentTarget.value)}
          onPaste={handlePathPaste}
          onKeyDown={(e) => {
            // Allow Enter to confirm custom bucket name
            if (e.key === 'Enter' && searchValue && config.allowCustomBucket) {
              e.preventDefault();
              setBucket(searchValue);
              combobox.closeDropdown();
            }
          }}
          style={{ flex: 1 }}
          error={form.errors[config.name]}
        />
      </Group>

      {/* Preview */}
      {(bucket || path) && (
        <Input.Wrapper>
          <div style={{ fontSize: '12px', color: '#228be6', fontFamily: 'monospace' }}>
            完整 URL: {buildS3Url(bucket, path) || '(請輸入路徑)'}
          </div>
        </Input.Wrapper>
      )}

      {config.description && (
        <div style={{ fontSize: '12px', color: '#868e96' }}>
          {config.description}
        </div>
      )}
    </Stack>
  );
}

// ============================================================================
// Helper Functions (continued)
// ============================================================================

// Helper to merge field config and metadata with proper type handling
function mergeFieldConfig(
  field: FieldConfig,
  metadata: FieldMetadata,
  zodType: any
): ResolvedFieldConfig & { required: boolean } {
  // Merge metadata and field (field takes precedence), with inferred type as fallback
  const merged = { 
    type: inferFieldType(zodType),
    ...metadata, 
    ...field 
  };
  
  // Common properties
  const base = {
    name: merged.name,
    label: merged.label || formatLabel(merged.name),
    required: isFieldRequired(zodType),
    placeholder: merged.placeholder,
    description: merged.description,
  };
  
  // Build config based on type (type is guaranteed to exist from spread)
  const type = ('type' in merged && merged.type) || 'text';
  
  switch (type) {
    case 'textarea':
      return {
        ...base,
        type: 'textarea' as const,
        rows: ('rows' in merged ? merged.rows : undefined) ?? 3,
      };
    
    case 'number':
      return {
        ...base,
        type: 'number' as const,
        min: 'min' in merged ? merged.min : undefined,
        max: 'max' in merged ? merged.max : undefined,
        step: 'step' in merged ? merged.step : undefined,
      };
    
    case 'slider':
      return {
        ...base,
        type: 'slider' as const,
        sliderMin: ('sliderMin' in merged ? merged.sliderMin : undefined) ?? 0,
        sliderMax: ('sliderMax' in merged ? merged.sliderMax : undefined) ?? 100,
        step: ('step' in merged ? merged.step : undefined) ?? 1,
      };
    
    case 'select':
      return {
        ...base,
        type: 'select' as const,
        options: ('options' in merged ? merged.options : undefined) ?? getEnumOptions(zodType) ?? [],
      };
    
    case 'switch':
      return {
        type: 'switch' as const,
        name: base.name,
        label: base.label,
        required: base.required,
        description: base.description,
      };
    
    case 'date':
      return {
        ...base,
        type: 'date' as const,
      };
    
    case 'file':
      return {
        ...base,
        type: 'file' as const,
        accept: 'accept' in merged ? merged.accept : undefined,
        multiple: 'multiple' in merged ? merged.multiple : undefined,
      };
    
    case 's3url':
      return {
        ...base,
        type: 's3url' as const,
        buckets: ('buckets' in merged ? merged.buckets : undefined) ?? [],
        allowCustomBucket: ('allowCustomBucket' in merged ? merged.allowCustomBucket : undefined) ?? true,
      };
    
    case 'text':
    default:
      return {
        ...base,
        type: 'text' as const,
      };
  }
}

export function ZodForm<T extends Record<string, any>>({
  schema,
  fields,
  initialValues = {} as Partial<T>,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
}: ZodFormProps<T>) {
  const form = useForm({
    initialValues,
    validate: zod4Resolver(schema),
  });

  const renderField = (fieldConfig: string | FieldConfig) => {
    // Convert string to field config
    const field: FieldConfig = typeof fieldConfig === 'string' 
      ? { name: fieldConfig }
      : fieldConfig;

    // Get the Zod type for this field
    const schemaShape = schema.shape;
    const zodType = schemaShape?.[field.name];
    
    // Get metadata from Zod
    const metadata = getMetadata(zodType);
    
    // Merge field config and metadata into final config
    const mergedConfig = mergeFieldConfig(field, metadata, zodType);
    
    const commonProps = {
      label: mergedConfig.label,
      placeholder: mergedConfig.placeholder,
      required: mergedConfig.required,
      description: mergedConfig.description,
      ...form.getInputProps(field.name),
    };
    
    switch (mergedConfig.type) {
      case 'textarea':
        return (
          <Textarea
            key={field.name}
            {...commonProps}
            minRows={mergedConfig.rows}
          />
        );
      
      case 'number':
        return (
          <NumberInput
            key={field.name}
            {...commonProps}
            min={mergedConfig.min}
            max={mergedConfig.max}
            step={mergedConfig.step}
          />
        );
      
      case 'slider':
        return (
          <Stack key={field.name} gap="xs">
            {mergedConfig.label && (
              <div>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  {mergedConfig.label}
                  {mergedConfig.required && <span style={{ color: 'red' }}> *</span>}
                </span>
              </div>
            )}
            <Group gap="md" align="flex-start">
              <Slider
                style={{ flex: 1 }}
                min={mergedConfig.sliderMin}
                max={mergedConfig.sliderMax}
                step={mergedConfig.step}
                marks={[
                  { value: mergedConfig.sliderMin, label: String(mergedConfig.sliderMin) },
                  { value: mergedConfig.sliderMax, label: String(mergedConfig.sliderMax) },
                ]}
                {...form.getInputProps(field.name)}
              />
              <NumberInput
                style={{ width: '120px' }}
                step={mergedConfig.step}
                placeholder={mergedConfig.placeholder}
                {...form.getInputProps(field.name)}
              />
            </Group>
            {mergedConfig.description && (
              <div style={{ fontSize: '12px', color: '#868e96' }}>
                {mergedConfig.description}
              </div>
            )}
          </Stack>
        );
      
      case 'select':
        return (
          <Select
            key={field.name}
            {...commonProps}
            data={mergedConfig.options}
            searchable
          />
        );
      
      case 'switch':
        return (
          <Switch
            key={field.name}
            label={mergedConfig.label}
            description={mergedConfig.description}
            {...form.getInputProps(field.name, { type: 'checkbox' })}
          />
        );
      
      case 'date':
        return (
          <DatePickerInput
            key={field.name}
            {...commonProps}
          />
        );
      
      case 'file':
        return (
          <FileInput
            key={field.name}
            {...commonProps}
            accept={mergedConfig.accept}
            multiple={mergedConfig.multiple}
          />
        );
      
      case 's3url':
        return <S3UrlField key={field.name} config={mergedConfig} form={form} />;
      
      case 'text':
      default:
        return (
          <TextInput
            key={field.name}
            {...commonProps}
          />
        );
    }
  };

  return (
    <form onSubmit={form.onSubmit((values) => {
      // Zod validation ensures values match schema, so this cast is safe
      onSubmit(values as T);
    })}>
      <Stack gap="md">
        {fields.map(renderField)}
        
        <Group justify="flex-end" mt="md">
          {onCancel && (
            <Button variant="subtle" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit">
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
