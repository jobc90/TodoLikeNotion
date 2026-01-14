// Database 관련 타입 정의

// Property (컬럼) 타입
export type PropertyType =
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "checkbox"
  | "url";

// Select 옵션 색상 (노션 기준)
export type SelectColor =
  | "default"
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red";

// Select 옵션 인터페이스
export interface SelectOption {
  id: string;
  name: string;
  color: SelectColor;
}

// Property 옵션 (JSON으로 저장)
export interface PropertyOptions {
  options?: SelectOption[];
}

// Property 엔티티
export interface Property {
  id: string;
  databaseId: string;
  name: string;
  type: PropertyType;
  options: PropertyOptions;
  order: number;
  width: number;
  createdAt: Date;
  updatedAt: Date;
}

// Cell 엔티티
export interface Cell {
  id: string;
  rowId: string;
  propertyId: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

// Row 엔티티
export interface Row {
  id: string;
  databaseId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  cells: Cell[];
}

// View 타입
export type ViewType = "table" | "board" | "gallery";

// Filter 조건
export interface FilterCondition {
  propertyId: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "is_empty"
    | "is_not_empty"
    | "greater_than"
    | "less_than";
  value: string;
}

// Sort 조건
export interface SortCondition {
  propertyId: string;
  direction: "asc" | "desc";
}

// View 설정
export interface ViewConfig {
  filters?: FilterCondition[];
  sorts?: SortCondition[];
  hiddenColumns?: string[];
  groupBy?: string;
}

// View 엔티티
export interface View {
  id: string;
  databaseId: string;
  name: string;
  type: ViewType;
  config: ViewConfig;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Database 엔티티
export interface Database {
  id: string;
  pageId: string | null;
  title: string;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
  properties: Property[];
  rows: Row[];
  views: View[];
}

// Database 목록 아이템
export interface DatabaseListItem {
  id: string;
  title: string;
  icon: string | null;
  updatedAt: Date;
}

// 타입별 기본값
export const DEFAULT_PROPERTY_WIDTH: Record<PropertyType, number> = {
  text: 200,
  number: 100,
  select: 150,
  multi_select: 200,
  date: 150,
  checkbox: 80,
  url: 200,
};

// Select 색상 스타일 맵
export const SELECT_COLOR_STYLES: Record<
  SelectColor,
  { bg: string; text: string }
> = {
  default: { bg: "#e3e2e0", text: "#37352f" },
  gray: { bg: "#e3e2e0", text: "#37352f" },
  brown: { bg: "#eee0da", text: "#64473a" },
  orange: { bg: "#fadec9", text: "#d9730d" },
  yellow: { bg: "#fdecc8", text: "#cb912f" },
  green: { bg: "#dbeddb", text: "#448361" },
  blue: { bg: "#d3e5ef", text: "#337ea9" },
  purple: { bg: "#e8deee", text: "#9065b0" },
  pink: { bg: "#f5e0e9", text: "#c14c8a" },
  red: { bg: "#ffe2dd", text: "#e03e3e" },
};

// Property 타입 아이콘
export const PROPERTY_TYPE_ICONS: Record<PropertyType, string> = {
  text: "📝",
  number: "#",
  select: "▼",
  multi_select: "☰",
  date: "📅",
  checkbox: "☑",
  url: "🔗",
};

// Property 타입 라벨
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  text: "텍스트",
  number: "숫자",
  select: "선택",
  multi_select: "다중 선택",
  date: "날짜",
  checkbox: "체크박스",
  url: "URL",
};

// 유틸리티: JSON 문자열에서 PropertyOptions 파싱
export function parsePropertyOptions(optionsJson: string): PropertyOptions {
  try {
    return JSON.parse(optionsJson) as PropertyOptions;
  } catch {
    return {};
  }
}

// 유틸리티: JSON 문자열에서 ViewConfig 파싱
export function parseViewConfig(configJson: string): ViewConfig {
  try {
    return JSON.parse(configJson) as ViewConfig;
  } catch {
    return {};
  }
}

// 유틸리티: 고유 ID 생성 (Select 옵션용)
export function generateOptionId(): string {
  return Math.random().toString(36).substring(2, 9);
}
