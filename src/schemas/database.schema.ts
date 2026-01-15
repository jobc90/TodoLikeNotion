import { z } from 'zod';

export const PropertyTypeSchema = z.enum([
  'text', 'number', 'select', 'multi_select',
  'date', 'checkbox', 'url', 'email', 'phone'
]);

export const SelectOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});

export const ViewConfigSchema = z.object({
  hiddenColumns: z.array(z.string()).optional(),
  columnWidths: z.record(z.string(), z.number()).optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  filters: z.array(z.object({
    propertyId: z.string(),
    operator: z.string(),
    value: z.string(),
  })).optional(),
});

export type PropertyType = z.infer<typeof PropertyTypeSchema>;
export type SelectOption = z.infer<typeof SelectOptionSchema>;
export type ViewConfig = z.infer<typeof ViewConfigSchema>;
