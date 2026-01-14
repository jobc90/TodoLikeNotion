import type { Block } from "./block";

// Page 엔티티 타입
export interface Page {
  id: string;
  title: string;
  icon: string | null;
  cover: string | null;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  blocks?: Block[];
  tags?: PageTag[];
}

// Page 목록 아이템 (간략 정보)
export interface PageListItem {
  id: string;
  title: string;
  icon: string | null;
  updatedAt: Date;
  archived: boolean;
}

// Tag 타입
export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

// PageTag 관계 타입
export interface PageTag {
  pageId: string;
  tagId: string;
  tag?: Tag;
}

// Page 생성 DTO
export interface CreatePageDto {
  title?: string;
  icon?: string;
}

// Page 수정 DTO
export interface UpdatePageDto {
  title?: string;
  icon?: string;
  cover?: string;
  archived?: boolean;
}
