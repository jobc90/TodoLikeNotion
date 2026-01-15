import { BlockPropsSchema } from '@/schemas/block.schema';
import { ViewConfigSchema } from '@/schemas/database.schema';
import type { BlockProps } from '@/schemas/block.schema';
import type { ViewConfig } from '@/schemas/database.schema';

export function parseBlockProps(json: string): BlockProps {
  try {
    const parsed = JSON.parse(json);
    return BlockPropsSchema.parse(parsed);
  } catch {
    return { text: '' };
  }
}

export function parseViewConfig(json: string | null): ViewConfig {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return ViewConfigSchema.parse(parsed);
  } catch {
    return {};
  }
}
