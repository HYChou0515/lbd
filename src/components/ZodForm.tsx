import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { Button, Stack, TextInput, Textarea, Select, NumberInput, Switch, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { z } from 'zod';


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

// Field config types (used for both metadata and user API)
export type FieldConfig =
  | ({ name: string } & BaseField & { type?: 'text' })
  | ({ name: string } & BaseField & { type: 'textarea'; rows?: number })
  | ({ name: string } & BaseField & { type: 'number'; min?: number; max?: number; step?: number })
  | ({ name: string } & BaseField & { type: 'select'; options?: { value: string; label: string }[] })
  | ({ name: string } & BaseField & { type: 'switch' })
  | ({ name: string } & BaseField & { type: 'date' })
  | ({ name: string } & BaseField); // No type = auto-infer

// Metadata is just FieldConfig without the name requirement
export type FieldMetadata = Omit<FieldConfig, 'name'> & { name?: string };

// ============================================================================
// Component Props
// ============================================================================

export interface ZodFormProps<T extends Record<string, any>> {
  schema: z.ZodObject<any>;
  fields: (string | FieldConfig)[];
  initialValues: T;
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

// Helper to merge field config and metadata with proper type handling
function mergeFieldConfig(
  field: FieldConfig,
  metadata: FieldMetadata,
  zodType: any
): FieldConfig & { required: boolean } {
  // Determine the final type - use 'in' operator for type narrowing
  const finalType = 
    ('type' in field && field.type) || 
    ('type' in metadata && metadata.type) || 
    inferFieldType(zodType);
  
  // Common properties
  const name = field.name;
  const label = field.label || metadata.label || formatLabel(name);
  const required = isFieldRequired(zodType);
  const placeholder = field.placeholder || metadata.placeholder;
  const description = field.description || metadata.description;
  
  // Build config based on type
  switch (finalType) {
    case 'textarea': {
      const fieldRows = 'rows' in field && typeof field.rows === 'number' ? field.rows : undefined;
      const metadataRows = 'rows' in metadata && typeof metadata.rows === 'number' ? metadata.rows : undefined;
      return {
        type: 'textarea' as const,
        name,
        label,
        required,
        placeholder,
        description,
        rows: fieldRows ?? metadataRows ?? 3,
      };
    }
    
    case 'number': {
      const min = 'min' in metadata && typeof metadata.min === 'number' ? metadata.min : undefined;
      const max = 'max' in metadata && typeof metadata.max === 'number' ? metadata.max : undefined;
      const step = 'step' in metadata && typeof metadata.step === 'number' ? metadata.step : undefined;
      return {
        type: 'number' as const,
        name,
        label,
        required,
        placeholder,
        description,
        min,
        max,
        step,
      };
    }
    
    case 'select': {
      const fieldOptions = 'options' in field && Array.isArray(field.options) ? field.options : undefined;
      const metadataOptions = 'options' in metadata && Array.isArray(metadata.options) ? metadata.options : undefined;
      const options = fieldOptions ?? metadataOptions ?? getEnumOptions(zodType) ?? [];
      return {
        type: 'select' as const,
        name,
        label,
        required,
        placeholder,
        description,
        options,
      };
    }
    
    case 'switch': {
      return {
        type: 'switch' as const,
        name,
        label,
        required,
        description,
      };
    }
    
    case 'date': {
      return {
        type: 'date' as const,
        name,
        label,
        required,
        placeholder,
        description,
      };
    }
    
    case 'text':
    default: {
      return {
        type: 'text' as const,
        name,
        label,
        required,
        placeholder,
        description,
      };
    }
  }
}

export function ZodForm<T extends Record<string, any>>({
  schema,
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
}: ZodFormProps<T>) {
  const form = useForm<T>({
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
      placeholder: 'placeholder' in mergedConfig ? mergedConfig.placeholder : undefined,
      required: mergedConfig.required,
      description: mergedConfig.description,
      ...form.getInputProps(field.name),
    };

    const type = 'type' in mergedConfig ? mergedConfig.type : 'text';
    
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            key={field.name}
            {...commonProps}
            minRows={'rows' in mergedConfig ? mergedConfig.rows : 3}
          />
        );
      
      case 'number':
        return (
          <NumberInput
            key={field.name}
            {...commonProps}
            min={'min' in mergedConfig ? mergedConfig.min : undefined}
            max={'max' in mergedConfig ? mergedConfig.max : undefined}
            step={'step' in mergedConfig ? mergedConfig.step : undefined}
          />
        );
      
      case 'select':
        return (
          <Select
            key={field.name}
            {...commonProps}
            data={'options' in mergedConfig ? mergedConfig.options || [] : []}
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
    <form onSubmit={form.onSubmit(onSubmit)}>
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
