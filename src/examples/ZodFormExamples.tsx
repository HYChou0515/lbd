/**
 * ZodForm Usage Example
 * 
 * This file demonstrates how to use the ZodForm component with the field registry
 * to automatically generate Mantine forms from Zod schemas.
 */

import { Modal } from '@mantine/core';
import { z } from 'zod';
import { ZodForm } from '../components/ZodForm';
import { fieldRegistry, customizeField } from '../schemas/fieldRegistry';

// Example 1: Simple user form using field registry
const userSchema = z.object({
  name: fieldRegistry.name,
  email: fieldRegistry.email,
  age: fieldRegistry.age,
  description: fieldRegistry.description,
});

export function UserFormExample() {
  const handleSubmit = (data: z.infer<typeof userSchema>) => {
    console.log('User data:', data);
  };

  return (
    <Modal opened={true} onClose={() => {}} title="User Information">
      <ZodForm
        schema={userSchema}
        fields={['name', 'email', 'age', 'description']}
        initialValues={{
          name: '',
          email: '',
          age: undefined,
          description: '',
        }}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}

// Example 2: Dataset form using field registry (same as DatasetPage)
const datasetSchema = z.object({
  name: fieldRegistry.datasetName,
  description: fieldRegistry.datasetDescription,
  type: fieldRegistry.datasetType,
  toolId: fieldRegistry.toolId,
  waferId: fieldRegistry.waferId,
  lotId: fieldRegistry.lotId,
  part: fieldRegistry.part,
});

export function DatasetFormExample() {
  const handleSubmit = (data: z.infer<typeof datasetSchema>) => {
    console.log('Dataset data:', data);
  };

  return (
    <Modal opened={true} onClose={() => {}} title="Create Dataset">
      <ZodForm
        schema={datasetSchema}
        fields={[
          'name',
          'description',
          'type',
          'toolId',
          'waferId',
          'lotId',
          'part',
        ]}
        initialValues={{
          name: '',
          description: '',
          type: 'EBI' as const,
          toolId: '',
          waferId: '',
          lotId: '',
          part: '',
        }}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}

// Example 3: Customized field from registry
const projectSchema = z.object({
  name: customizeField(fieldRegistry.name, {
    label: "Project Name",
    placeholder: "Enter your project name (min 5 characters)",
  }).min(5, "Project name must be at least 5 characters"),
  
  description: customizeField(fieldRegistry.description, {
    rows: 5,
    placeholder: "Describe your project in detail..."
  }),
  
  startDate: fieldRegistry.startDate,
  endDate: fieldRegistry.endDate,
  isPublic: fieldRegistry.isPublic,
});

export function CustomizedFieldExample() {
  const handleSubmit = (data: z.infer<typeof projectSchema>) => {
    console.log('Project data:', data);
  };

  return (
    <Modal opened={true} onClose={() => {}} title="Create Project">
      <ZodForm
        schema={projectSchema}
        fields={['name', 'description', 'startDate', 'endDate', 'isPublic']}
        initialValues={{
          name: '',
          description: '',
          startDate: undefined,
          endDate: undefined,
          isPublic: false,
        }}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}

/**
 * Key Features with Field Registry:
 * 
 * 1. Reusable field definitions - Define once, use everywhere
 * 2. Consistent validation rules across the application
 * 3. Consistent UI metadata (labels, placeholders, etc.)
 * 4. Easy customization with customizeField helper
 * 5. Type-safe with TypeScript inference
 * 6. Reduces code duplication significantly
 * 
 * Benefits:
 * 
 * - Before: Each form needs to define all field metadata
 * - After: Just reference fieldRegistry.fieldName
 * 
 * Example comparison:
 * 
 * // Without registry (verbose):
 * email: z.string()
 *   .email("Invalid email")
 *   .describe(JSON.stringify({ 
 *     label: "Email",
 *     placeholder: "Enter your email"
 *   }))
 * 
 * // With registry (concise):
 * email: fieldRegistry.email
 * 
 * // With customization:
 * email: customizeField(fieldRegistry.email, {
 *   placeholder: "Enter your work email"
 * })
 */
