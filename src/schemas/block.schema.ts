import { z } from 'zod';

export const BlockPropsSchema = z.object({
  text: z.string().optional().default(''),
  checked: z.boolean().optional(),
  expanded: z.boolean().optional(),
  level: z.number().optional(),
});

export const BlockTypeSchema = z.enum([
  'paragraph', 'heading1', 'heading2', 'heading3',
  'bullet', 'numbered', 'todo', 'toggle', 'quote', 'divider'
]);

export type BlockProps = z.infer<typeof BlockPropsSchema>;
export type BlockType = z.infer<typeof BlockTypeSchema>;
