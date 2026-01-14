// Block 타입 정의

export type BlockType = 
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "todo"
  | "toggle"
  | "bullet"
  | "numbered"
  | "divider"
  | "quote";

// Block props 타입 (JSON으로 저장됨)
export interface BlockProps {
  text?: string;
  checked?: boolean; // todo 블록용
  expanded?: boolean; // toggle 블록용
  level?: number; // 들여쓰기 레벨
}

// Block 엔티티 타입
export interface Block {
  id: string;
  pageId: string;
  parentBlockId: string | null;
  type: BlockType;
  props: BlockProps;
  plainText: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  children?: Block[];
}

// Block 생성 DTO
export interface CreateBlockDto {
  pageId: string;
  parentBlockId?: string;
  type: BlockType;
  props?: BlockProps;
  order?: number;
}

// Block 수정 DTO
export interface UpdateBlockDto {
  type?: BlockType;
  props?: Partial<BlockProps>;
  order?: number;
}

// props에서 plainText 추출
export function extractPlainText(props: BlockProps): string {
  return props.text?.replace(/<[^>]*>/g, "") || "";
}
