# TodoLikeNotion 전체 리팩토링 계획

> **생성일**: 2025-01-15
> **상태**: 대기 중
> **예상 규모**: 대규모 리팩토링

---

## 1. 개요

### 1.1 프로젝트 배경
TodoLikeNotion은 Notion 스타일의 블록 기반 문서/할일 관리 애플리케이션입니다. 현재 기본 기능은 동작하지만, 코드 품질, 성능, 아키텍처 측면에서 개선이 필요합니다.

### 1.2 리팩토링 목표
1. **Admin 대시보드를 메인 앱으로 승격** - 기존 기능을 Admin 하위로 이관
2. **치명적 버그 수정** - 텍스트 사라짐 문제, 과도한 서버 요청 문제 해결
3. **코드 품질 향상** - 타입 안전성, 컴포넌트 분리, 중복 제거
4. **아키텍처 현대화** - Zustand 상태관리, Tailwind CSS 전면 도입
5. **성능 최적화** - 가상화, 디바운싱, 캐시 전략 개선
6. **테스트 커버리지** - Vitest + Testing Library 전체 도입
7. **패키지 매니저 교체** - npm → pnpm

### 1.3 기술 스택 변경

| 영역 | Before | After |
|------|--------|-------|
| 패키지 매니저 | npm | **pnpm** |
| 상태 관리 | Local state only | **Zustand** |
| 스타일링 | CSS Variables (globals.css) | **Tailwind CSS** |
| 테스트 | 없음 | **Vitest + RTL** |
| 스키마 검증 | 없음 | **Zod** |

---

## 2. 수락 기준 (Acceptance Criteria)

### 2.1 필수 기준
- [ ] pnpm으로 패키지 관리 전환 완료
- [ ] **텍스트 입력 후 사라지는 버그 수정**
- [ ] **과도한 서버 요청 문제 해결**
- [ ] Admin이 루트 경로(`/`)로 동작
- [ ] 기존 Pages/Blocks/Database 기능이 Admin 하위에서 정상 동작
- [ ] Zustand 스토어로 전역 상태 관리
- [ ] 모든 컴포넌트 Tailwind CSS로 스타일링
- [ ] Zod 스키마로 런타임 데이터 검증
- [ ] 주요 Server Actions 테스트 커버리지 80% 이상
- [ ] 컴포넌트 테스트 커버리지 70% 이상
- [ ] `pnpm run build` 성공
- [ ] README.md 업데이트 완료

### 2.2 품질 기준
- [ ] TypeScript strict mode 에러 없음
- [ ] ESLint 에러 없음
- [ ] 번들 사이즈 현재 대비 20% 이하 증가
- [ ] Lighthouse Performance 점수 80 이상

---

## 3. Phase 0: 환경 설정 (pnpm 마이그레이션)

### 3.1 작업 내용

#### Task 0.1: npm에서 pnpm으로 전환
```bash
# 실행할 명령어
rm -rf node_modules package-lock.json
npm install -g pnpm
pnpm install
```

#### Task 0.2: 설정 파일 정리
- **삭제**: `package-lock.json`
- **정리**: 기존 `pnpm-lock.yaml` (있다면 재생성)
- **생성**: `.npmrc` (필요시)

```ini
# .npmrc
auto-install-peers=true
strict-peer-dependencies=false
```

#### Task 0.3: package.json 스크립트 검증
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

### 3.2 검증
- [ ] `pnpm install` 성공
- [ ] `pnpm run dev` 정상 실행
- [ ] `pnpm run build` 성공

---

## 4. Phase 1: Admin 통합 & 구조 재편

### 4.1 현재 라우트 구조
```
src/app/
├── page.tsx                    # 홈 (리다이렉트)
├── admin/
│   ├── layout.tsx              # Admin 레이아웃
│   ├── page.tsx                # Admin 대시보드
│   ├── orders/page.tsx         # 주문 관리
│   └── customers/page.tsx      # 고객 관리
├── pages/[pageId]/page.tsx     # 페이지 뷰
├── database/[databaseId]/page.tsx  # 데이터베이스 뷰
└── graph/page.tsx              # 그래프 뷰
```

### 4.2 목표 라우트 구조
```
src/app/
├── layout.tsx                  # 루트 레이아웃 (Admin 스타일)
├── page.tsx                    # 대시보드 (기존 admin/page.tsx)
├── (dashboard)/
│   ├── orders/page.tsx         # 주문 관리
│   └── customers/page.tsx      # 고객 관리
├── workspace/
│   ├── layout.tsx              # 워크스페이스 레이아웃
│   ├── page.tsx                # 워크스페이스 홈
│   ├── [pageId]/page.tsx       # 페이지 뷰
│   └── database/[databaseId]/page.tsx  # 데이터베이스 뷰
├── graph/page.tsx              # 그래프 뷰
└── settings/page.tsx           # 설정 (신규)
```

### 4.3 작업 내용

#### Task 1.1: 루트 레이아웃 통합
**파일**: `src/app/layout.tsx`
- Admin 레이아웃 스타일을 루트로 이동
- Film strip 장식 유지
- 사이드바에 워크스페이스 메뉴 추가

#### Task 1.2: 사이드바 통합
**파일**: `src/components/layout/AdminSidebar.tsx` (신규)
- 기존 Admin 사이드바 + 기존 Sidebar 기능 통합
- 네비게이션 항목:
  - 대시보드
  - 주문 관리
  - 고객 관리
  - ---구분선---
  - 워크스페이스 (기존 Pages 목록)
  - 그래프 뷰

#### Task 1.3: 워크스페이스 라우트 그룹 생성
**디렉토리**: `src/app/workspace/`
- 기존 `pages/[pageId]` → `workspace/[pageId]`
- 기존 `database/[databaseId]` → `workspace/database/[databaseId]`
- 라우트 변경에 따른 링크 업데이트

#### Task 1.4: 홈 페이지 변경
**파일**: `src/app/page.tsx`
- 기존 Admin 대시보드 내용으로 교체
- 웨딩 스튜디오 대시보드 → 일반 워크스페이스 대시보드로 수정 (또는 유지)

#### Task 1.5: CSS 통합
**파일**: `src/app/globals.css`
- `admin.css` 내용을 `globals.css`로 병합
- 중복 스타일 제거

### 4.4 파일 변경 목록
| 작업 | 파일 |
|------|------|
| 수정 | `src/app/layout.tsx` |
| 수정 | `src/app/page.tsx` |
| 생성 | `src/app/workspace/layout.tsx` |
| 이동 | `src/app/pages/[pageId]/*` → `src/app/workspace/[pageId]/*` |
| 이동 | `src/app/database/*` → `src/app/workspace/database/*` |
| 삭제 | `src/app/admin/` (통합 후) |
| 수정 | `src/components/layout/Sidebar.tsx` |
| 수정 | `src/app/globals.css` |
| 수정 | `src/components/CommandPalette.tsx` (라우트 업데이트) |

### 4.5 검증
- [ ] `/` 접속 시 대시보드 표시
- [ ] `/workspace/[pageId]` 페이지 정상 동작
- [ ] `/workspace/database/[databaseId]` 데이터베이스 정상 동작
- [ ] 사이드바 네비게이션 모두 동작
- [ ] CommandPalette 검색 및 이동 정상 동작

---

## 4.5 Phase 1.5: 치명적 버그 수정 (Critical Bug Fixes)

> **우선순위**: 최상 - 핵심 기능 정상화
> **영향 범위**: BlockRenderer, BlockEditor, Server Actions

### 4.5.1 버그 분석

#### 버그 #1: 텍스트 입력 후 사라짐 (Race Condition)

**증상**:
- 텍스트 입력 후 다른 동작(블록 이동, 클릭 등) 수행 시 텍스트 사라짐
- 새로고침 후 텍스트 다시 나타남

**원인 분석**:
```
[문제 흐름]
1. 사용자 "Hello" 입력 → textRef.current = "Hello" (로컬만)
2. 사용자가 다른 블록 클릭 또는 액션 수행
3. BlockEditor에서 router.refresh() 호출 (line 38, 53, 78)
4. Server에서 이전 데이터 반환 (아직 저장 안 된 상태)
5. BlockRenderer의 useEffect (line 62-66)가 block.props 변경 감지
6. localProps와 textRef를 서버 값(이전 값)으로 덮어쓰기
7. 화면에서 텍스트 "사라짐"
8. handleBlur가 호출되어 저장되면, 새로고침 후 나타남
```

**문제 코드 위치**:
| 파일 | 라인 | 문제 |
|------|------|------|
| `BlockRenderer.tsx` | 62-66 | 서버 props 변경 시 무조건 로컬 상태 덮어쓰기 |
| `BlockEditor.tsx` | 38, 53, 78 | 모든 액션 후 `router.refresh()` 호출 |
| `block.actions.ts` | 49, 80, 93 | 모든 CRUD에서 `revalidatePath()` 호출 |

#### 버그 #2: 과도한 서버 요청 (Performance)

**증상**:
- 텍스트 입력 시 콘솔에 지속적인 서버 요청 로그
- 네트워크 탭에서 다수의 요청 확인

**원인 분석**:
```
[문제 흐름]
1. 사용자가 한 글자 입력
2. handleContentChange 실행 (매 입력마다)
3. 마크다운 단축키 검사 로직 실행
4. handleBlur 시 updateBlock 호출
5. updateBlock 내부에서 revalidatePath 호출
6. 전체 페이지 데이터 다시 fetch
7. 반복...
```

**문제 코드 위치**:
| 파일 | 라인 | 문제 |
|------|------|------|
| `BlockRenderer.tsx` | 92-216 | `handleContentChange`에 디바운싱 없음 |
| `BlockRenderer.tsx` | 218-225 | `handleBlur`에서 매번 즉시 저장 |
| `BlockRenderer.tsx` | 68-90 | `beforeunload`에서 동기 저장 시도 |
| `block.actions.ts` | 80 | 모든 업데이트에서 `revalidatePath` 호출 |

---

### 4.5.2 해결 방안

#### Solution #1: 로컬 상태 보호 (Dirty Flag 패턴)

**개념**: 로컬에서 수정 중인 상태를 서버 응답이 덮어쓰지 못하도록 보호

```typescript
// src/components/blocks/BlockRenderer.tsx

// 수정 전 (문제 코드)
useEffect(() => {
  setLocalProps(block.props);
  textRef.current = block.props.text || "";
}, [block.props]);

// 수정 후 (해결 코드)
const isDirtyRef = useRef(false);  // 로컬 수정 중 플래그
const lastSavedTextRef = useRef(block.props.text || "");

useEffect(() => {
  // 로컬에서 수정 중이 아닐 때만 서버 상태로 동기화
  if (!isDirtyRef.current) {
    setLocalProps(block.props);
    textRef.current = block.props.text || "";
    lastSavedTextRef.current = block.props.text || "";
  }
}, [block.props]);
```

#### Solution #2: 디바운스된 자동 저장

**개념**: 입력 완료 후 일정 시간(500ms) 뒤에 자동 저장

```typescript
// src/lib/debounce.ts (신규)
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
} {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debounced;
}
```

```typescript
// src/components/blocks/BlockRenderer.tsx

// 디바운스된 저장 함수
const debouncedSave = useMemo(
  () => debounce(async (blockId: string, text: string) => {
    if (text !== lastSavedTextRef.current) {
      await updateBlockText(blockId, text);  // 새로운 경량 액션
      lastSavedTextRef.current = text;
      isDirtyRef.current = false;
    }
  }, 500),
  []
);

// handleContentChange 수정
const handleContentChange = useCallback(
  (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || "";
    textRef.current = newText;
    isDirtyRef.current = true;  // 수정 중 플래그 설정

    // 디바운스된 저장 트리거
    debouncedSave(block.id, newText);

    // ... 마크다운 단축키 로직 (기존 유지)
  },
  [block.id, debouncedSave]
);

// handleBlur 수정 - 즉시 저장 대신 flush
const handleBlur = useCallback(() => {
  setIsEditing(false);
  debouncedSave.flush();  // 대기 중인 저장 즉시 실행
}, [debouncedSave]);

// 언마운트 시 저장
useEffect(() => {
  return () => {
    debouncedSave.flush();
  };
}, [debouncedSave]);
```

#### Solution #3: 경량 업데이트 액션 (revalidatePath 제거)

**개념**: 텍스트 저장용 경량 액션 생성, 불필요한 페이지 갱신 제거

```typescript
// src/actions/block.actions.ts

// 기존 updateBlock은 유지 (타입 변경 등 중요한 변경용)

// 신규: 텍스트 전용 경량 업데이트 (revalidatePath 없음)
export async function updateBlockText(blockId: string, text: string) {
  const existingBlock = await prisma.block.findUnique({
    where: { id: blockId },
  });

  if (!existingBlock) {
    throw new Error("Block not found");
  }

  const existingProps = JSON.parse(existingBlock.props) as BlockProps;
  const newProps = { ...existingProps, text };

  await prisma.block.update({
    where: { id: blockId },
    data: {
      props: JSON.stringify(newProps),
      plainText: extractPlainText(newProps),
    },
  });

  // revalidatePath 호출하지 않음!
  // 로컬 상태가 이미 최신이므로 페이지 갱신 불필요
}

// 신규: 체크박스/토글 전용 경량 업데이트
export async function updateBlockProps(
  blockId: string,
  propsUpdate: Partial<BlockProps>
) {
  const existingBlock = await prisma.block.findUnique({
    where: { id: blockId },
  });

  if (!existingBlock) {
    throw new Error("Block not found");
  }

  const existingProps = JSON.parse(existingBlock.props) as BlockProps;
  const newProps = { ...existingProps, ...propsUpdate };

  await prisma.block.update({
    where: { id: blockId },
    data: {
      props: JSON.stringify(newProps),
      plainText: extractPlainText(newProps),
    },
  });

  // revalidatePath 호출하지 않음!
}
```

#### Solution #4: router.refresh() 최소화

**개념**: 정말 필요한 경우에만 페이지 갱신

```typescript
// src/components/blocks/BlockEditor.tsx

// 수정 전
const handleDeleteBlock = useCallback(async (blockId: string) => {
  setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  startTransition(async () => {
    await deleteBlock(blockId);
    router.refresh();  // 불필요 - 이미 로컬 상태 업데이트됨
  });
}, [router]);

// 수정 후
const handleDeleteBlock = useCallback(async (blockId: string) => {
  // Optimistic update만 - 서버 동기화는 백그라운드
  setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  startTransition(async () => {
    await deleteBlock(blockId);
    // router.refresh() 제거!
  });
}, []);

// handleReorder도 동일하게 수정
const handleReorder = useCallback((newBlocks: Block[]) => {
  setBlocks(newBlocks);
  startTransition(async () => {
    const blockOrders = newBlocks.map((b, idx) => ({ id: b.id, order: idx }));
    await reorderBlocks(pageId, blockOrders);
    // router.refresh() 제거!
  });
}, [pageId]);
```

#### Solution #5: Server Actions에서 선택적 revalidation

```typescript
// src/actions/block.actions.ts

// 블록 삭제 - 구조 변경이므로 revalidation 유지
export async function deleteBlock(blockId: string) {
  const block = await prisma.block.delete({
    where: { id: blockId },
  });
  // 삭제는 구조 변경이므로 유지할 수 있음
  // 단, 클라이언트에서 optimistic update 했으므로 선택적
  // revalidatePath(`/workspace/${block.pageId}`);
  return block;
}

// 블록 생성 - 구조 변경이므로 revalidation 필요할 수 있음
export async function createBlock(data: CreateBlockDto) {
  // ... 생성 로직
  // 클라이언트에서 반환된 블록을 상태에 추가하므로
  // revalidatePath 필요 없을 수 있음
  return { ...block, props: JSON.parse(block.props) };
}
```

---

### 4.5.3 구현 작업 목록

#### Task 1.5.1: 디바운스 유틸리티 생성
**파일**: `src/lib/debounce.ts`
**작업**:
- `debounce` 함수 구현 (cancel, flush 지원)
- `throttle` 함수 구현 (필요시)

#### Task 1.5.2: 경량 Server Actions 생성
**파일**: `src/actions/block.actions.ts`
**작업**:
- `updateBlockText()` 추가 (revalidatePath 없음)
- `updateBlockProps()` 추가 (revalidatePath 없음)
- 기존 `updateBlock()`은 타입 변경 등 중요 변경용으로 유지

#### Task 1.5.3: BlockRenderer 리팩토링
**파일**: `src/components/blocks/BlockRenderer.tsx`
**작업**:
- `isDirtyRef` 플래그 추가
- `lastSavedTextRef` 추가
- `debouncedSave` 훅 구현
- `useEffect` 수정 (dirty 체크)
- `handleContentChange` 수정 (디바운스 적용)
- `handleBlur` 수정 (flush 사용)
- `handleCheckboxToggle`, `handleToggleExpand` 수정 (경량 액션 사용)

#### Task 1.5.4: BlockEditor 리팩토링
**파일**: `src/components/blocks/BlockEditor.tsx`
**작업**:
- `handleDeleteBlock`에서 `router.refresh()` 제거
- `handleReorder`에서 `router.refresh()` 제거
- `handleMoveBlock`에서 `router.refresh()` 제거
- 필요시 에러 처리 추가 (서버 실패 시 롤백)

#### Task 1.5.5: 기존 Server Actions 정리
**파일**: `src/actions/block.actions.ts`
**작업**:
- `updateBlock`의 `revalidatePath` 호출 검토 및 조건부 적용
- `createBlock`, `deleteBlock`의 revalidation 전략 검토

---

### 4.5.4 검증

- [ ] 텍스트 입력 후 다른 블록 클릭해도 텍스트 유지
- [ ] 텍스트 입력 후 블록 드래그해도 텍스트 유지
- [ ] 체크박스 토글 시 다른 블록 텍스트 영향 없음
- [ ] 네트워크 탭에서 입력 중 요청 횟수 대폭 감소 확인
- [ ] 빠른 연속 입력 시에도 정상 동작
- [ ] 브라우저 새로고침 시 최신 데이터 표시
- [ ] 블록 삭제/이동 후에도 다른 블록 텍스트 유지

---

## 5. Phase 2: 코드 품질 개선

### 5.1 Zod 스키마 도입

#### Task 2.1: Zod 설치 및 스키마 정의
**파일**: `src/schemas/` (신규 디렉토리)

```typescript
// src/schemas/block.schema.ts
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
```

```typescript
// src/schemas/database.schema.ts
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
```

#### Task 2.2: 파싱 유틸리티 함수 생성
**파일**: `src/lib/parse.ts` (신규)

```typescript
import { BlockPropsSchema, BlockProps } from '@/schemas/block.schema';
import { ViewConfigSchema, ViewConfig } from '@/schemas/database.schema';

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
```

#### Task 2.3: 기존 JSON.parse 호출 교체
**영향 파일**:
- `src/actions/block.actions.ts`
- `src/actions/database.actions.ts`
- `src/app/workspace/[pageId]/page.tsx`
- `src/components/database/DatabaseView.tsx`

### 5.2 대형 컴포넌트 분리

#### Task 2.4: DatabaseView.tsx 분리 (795줄 → 여러 파일)
**현재**: `src/components/database/DatabaseView.tsx`
**목표**:
```
src/components/database/
├── DatabaseView.tsx            # 메인 컨테이너 (~150줄)
├── DatabaseToolbar.tsx         # 툴바 (필터, 정렬, 뷰 전환)
├── DatabaseTable.tsx           # 테이블 뷰 컨테이너
├── hooks/
│   ├── useDatabaseFilters.ts   # 필터링 로직
│   ├── useDatabaseSort.ts      # 정렬 로직
│   ├── useDatabaseSelection.ts # 행 선택 로직
│   └── useDatabaseDragDrop.ts  # 드래그앤드롭 로직
└── index.ts                    # 배럴 export
```

#### Task 2.5: BlockRenderer.tsx 분리 (557줄 → 여러 파일)
**현재**: `src/components/blocks/BlockRenderer.tsx`
**목표**:
```
src/components/blocks/
├── BlockRenderer.tsx           # 메인 렌더러 (~150줄)
├── BlockContent.tsx            # 콘텐츠 편집 영역
├── BlockActions.tsx            # 액션 버튼들
├── hooks/
│   ├── useBlockEditing.ts      # 편집 상태 관리
│   ├── useMarkdownShortcuts.ts # 마크다운 단축키
│   └── usePageLinks.ts         # [[페이지]] 링크 처리
└── index.ts
```

### 5.3 중복 코드 제거

#### Task 2.6: 공통 유틸리티 함수 추출
**파일**: `src/lib/utils.ts` (확장)

```typescript
// 순서 계산 유틸리티
export async function getNextOrder<T extends { order: number }>(
  items: T[]
): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map(item => item.order)) + 1;
}

// ID 생성 유틸리티
export function generateId(): string {
  return crypto.randomUUID();
}
```

#### Task 2.7: 중복 타입 정의 제거
**파일**: `src/actions/database.actions.ts`
- `PropertyOption`, `ViewConfig` 등 중복 인터페이스 제거
- `@/types/database`에서 import로 교체

### 5.4 버그 수정

#### Task 2.8: CommandPalette 라우트 수정
**파일**: `src/components/CommandPalette.tsx`
**위치**: 219번 라인
```typescript
// Before
router.push(`/databases/${database.id}`)
// After
router.push(`/workspace/database/${database.id}`)
```

#### Task 2.9: XSS 취약점 수정
**파일**: `src/components/blocks/BlockRenderer.tsx`
```typescript
// parsePageLinks 함수에서 표시 텍스트도 인코딩
const parsePageLinks = (text: string): string => {
  return text.replace(/\[\[([^\]]+)\]\]/g, (match, pageName) => {
    const encodedName = encodeURIComponent(pageName);
    const displayName = escapeHtml(pageName); // 추가
    return `<a href="/workspace/${encodedName}">${displayName}</a>`;
  });
};
```

### 5.5 검증
- [ ] Zod 스키마 검증 테스트 통과
- [ ] 분리된 컴포넌트 정상 동작
- [ ] TypeScript 컴파일 에러 없음
- [ ] 기존 기능 회귀 없음

---

## 6. Phase 3: 아키텍처 현대화

### 6.1 Zustand 도입

#### Task 3.1: Zustand 설치
```bash
pnpm add zustand
```

#### Task 3.2: 스토어 설계
**디렉토리**: `src/stores/`

```typescript
// src/stores/workspace.store.ts
import { create } from 'zustand';

interface WorkspaceState {
  // 현재 선택된 페이지/데이터베이스
  currentPageId: string | null;
  currentDatabaseId: string | null;

  // 사이드바 상태
  sidebarCollapsed: boolean;

  // 액션
  setCurrentPage: (id: string | null) => void;
  setCurrentDatabase: (id: string | null) => void;
  toggleSidebar: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentPageId: null,
  currentDatabaseId: null,
  sidebarCollapsed: false,

  setCurrentPage: (id) => set({ currentPageId: id, currentDatabaseId: null }),
  setCurrentDatabase: (id) => set({ currentDatabaseId: id, currentPageId: null }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
```

```typescript
// src/stores/ui.store.ts
import { create } from 'zustand';

interface UIState {
  // 모달 상태
  commandPaletteOpen: boolean;
  activeModal: string | null;

  // 토스트 메시지
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' }>;

  // 액션
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  commandPaletteOpen: false,
  activeModal: null,
  toasts: [],

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  addToast: (message, type) => set((state) => ({
    toasts: [...state.toasts, { id: crypto.randomUUID(), message, type }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
}));
```

```typescript
// src/stores/database.store.ts
import { create } from 'zustand';

interface DatabaseState {
  // 필터/정렬 상태
  filters: Array<{ propertyId: string; operator: string; value: string }>;
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';

  // 선택 상태
  selectedRows: Set<string>;

  // 뷰 상태
  viewType: 'table' | 'board' | 'calendar';
  hiddenColumns: Set<string>;

  // 액션
  setFilters: (filters: DatabaseState['filters']) => void;
  setSort: (sortBy: string | null, direction: 'asc' | 'desc') => void;
  toggleRowSelection: (rowId: string) => void;
  selectAllRows: (rowIds: string[]) => void;
  clearSelection: () => void;
  setViewType: (type: DatabaseState['viewType']) => void;
  toggleColumnVisibility: (columnId: string) => void;
}
```

#### Task 3.3: 기존 로컬 상태 마이그레이션
**영향 파일**:
- `src/components/CommandPalette.tsx` - UIStore 사용
- `src/components/layout/Sidebar.tsx` - WorkspaceStore 사용
- `src/components/database/DatabaseView.tsx` - DatabaseStore 사용

### 6.2 Tailwind CSS 전면 도입

#### Task 3.4: Tailwind 설정 업데이트
**파일**: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Cinematic Editorial 팔레트
        cinema: {
          deep: '#0A1628',
          surface: '#0F1D32',
          elevated: '#162742',
          card: '#1A2D4A',
        },
        cream: {
          DEFAULT: '#F5F0E8',
          soft: 'rgba(245, 240, 232, 0.9)',
          muted: 'rgba(245, 240, 232, 0.6)',
        },
        amber: {
          DEFAULT: '#D4A574',
          light: '#E8C9A4',
          glow: 'rgba(212, 165, 116, 0.3)',
        },
        status: {
          recording: '#FF4D4D',
          editing: '#FFB84D',
          review: '#4DAFFF',
          complete: '#4DFF88',
          pending: '#A0A0A5',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Noto Serif KR', 'Georgia', 'serif'],
        body: ['Noto Sans KR', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
```

#### Task 3.5: CSS 마이그레이션
**작업**: `globals.css`의 커스텀 클래스를 Tailwind 유틸리티로 변환

**예시 변환**:
```css
/* Before - globals.css */
.stat-card {
  background: var(--cinema-card);
  border: 1px solid rgba(245, 240, 232, 0.06);
  border-radius: 4px;
  padding: 24px;
}

/* After - Tailwind class */
/* className="bg-cinema-card border border-cream/[0.06] rounded p-6" */
```

**마이그레이션 순서**:
1. 레이아웃 컴포넌트 (Sidebar, Layout)
2. 공통 UI 컴포넌트 (Button, Card, Modal)
3. 페이지별 컴포넌트
4. `globals.css` 최소화 (리셋, 폰트, 기본 스타일만)

### 6.3 Error Boundary 추가

#### Task 3.6: Error Boundary 컴포넌트 생성
**파일**: `src/components/ErrorBoundary.tsx`

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <h2 className="text-xl font-display text-cream mb-4">문제가 발생했습니다</h2>
          <p className="text-cream-muted mb-6">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn btn-primary"
          >
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Task 3.7: 페이지별 Error Boundary 적용
**파일**: `src/app/workspace/[pageId]/error.tsx`, `src/app/workspace/database/[databaseId]/error.tsx`

### 6.4 검증
- [ ] Zustand 스토어 정상 동작
- [ ] Tailwind 클래스 적용 확인
- [ ] Error Boundary 에러 캐치 확인
- [ ] 기존 기능 회귀 없음

---

## 7. Phase 4: 성능 최적화

### 7.1 가상 스크롤링 도입

#### Task 4.1: TanStack Virtual 설치
```bash
pnpm add @tanstack/react-virtual
```

#### Task 4.2: DatabaseTable 가상화 적용
**파일**: `src/components/database/DatabaseTable.tsx`

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function DatabaseTable({ rows, columns }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44, // 행 높이
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <TableRow
            key={rows[virtualRow.index].id}
            row={rows[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### 7.2 디바운싱/쓰로틀링 적용

#### Task 4.3: 디바운스 유틸리티 추가
**파일**: `src/lib/debounce.ts`

```typescript
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

#### Task 4.4: BlockRenderer 디바운싱 적용
**파일**: `src/components/blocks/BlockRenderer.tsx`
- 마크다운 단축키 감지: 150ms 디바운스
- 페이지 링크 파싱: 200ms 디바운스
- 자동 저장: 500ms 디바운스

### 7.3 캐시 전략 최적화

#### Task 4.5: revalidatePath 최적화
**파일**: `src/actions/*.ts`

```typescript
// Before - 과도한 무효화
revalidatePath("/");
revalidatePath(`/workspace/${pageId}`);

// After - 타겟팅된 무효화
revalidatePath(`/workspace/${pageId}`, 'page');
```

### 7.4 검증
- [ ] 1000+ 행 데이터베이스 스크롤 부드러움
- [ ] 입력 지연 없음 (디바운싱 적용 후)
- [ ] 네트워크 요청 횟수 감소 확인

---

## 8. Phase 5: 테스트 인프라 구축

### 8.1 Vitest 설정

#### Task 5.1: 테스트 패키지 설치
```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

#### Task 5.2: Vitest 설정 파일 생성
**파일**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### Task 5.3: 테스트 설정 파일 생성
**파일**: `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Next.js router mock
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
```

### 8.2 Server Actions 테스트

#### Task 5.4: Page Actions 테스트
**파일**: `src/actions/__tests__/page.actions.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPage, getPage, updatePage, deletePage } from '../page.actions';

// Prisma mock
vi.mock('@/lib/prisma', () => ({
  prisma: {
    page: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Page Actions', () => {
  describe('createPage', () => {
    it('should create a new page with default title', async () => {
      // ...
    });
  });

  describe('getPage', () => {
    it('should return page with blocks', async () => {
      // ...
    });

    it('should return null for non-existent page', async () => {
      // ...
    });
  });
});
```

#### Task 5.5: Block Actions 테스트
**파일**: `src/actions/__tests__/block.actions.test.ts`

#### Task 5.6: Database Actions 테스트
**파일**: `src/actions/__tests__/database.actions.test.ts`

### 8.3 컴포넌트 테스트

#### Task 5.7: 공통 컴포넌트 테스트
**파일**: `src/components/__tests__/`
- `Sidebar.test.tsx`
- `CommandPalette.test.tsx`
- `ErrorBoundary.test.tsx`

#### Task 5.8: Database 컴포넌트 테스트
**파일**: `src/components/database/__tests__/`
- `DatabaseView.test.tsx`
- `TableRow.test.tsx`
- `FilterSort.test.tsx`

#### Task 5.9: Block 컴포넌트 테스트
**파일**: `src/components/blocks/__tests__/`
- `BlockRenderer.test.tsx`
- `BlockEditor.test.tsx`

### 8.4 검증
- [ ] `pnpm test` 실행 성공
- [ ] Server Actions 커버리지 80% 이상
- [ ] 컴포넌트 커버리지 70% 이상
- [ ] `pnpm test:coverage` 리포트 생성

---

## 9. Phase 6: 마무리

### 9.1 문서화

#### Task 6.1: README.md 전체 업데이트
**파일**: `README.md`

```markdown
# TodoLikeNotion

Notion 스타일의 블록 기반 워크스페이스 애플리케이션

## 기능

- 대시보드 (매출, 주문, 고객 현황)
- 블록 기반 문서 편집
- 데이터베이스 뷰 (테이블, 보드, 캘린더)
- 실시간 검색 (Command Palette)
- 그래프 뷰

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Prisma ORM
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Package Manager**: pnpm

## 시작하기

### 요구사항
- Node.js 18+
- pnpm 8+

### 설치
\`\`\`bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
\`\`\`

### 개발 서버
\`\`\`bash
pnpm dev
\`\`\`

### 테스트
\`\`\`bash
pnpm test
pnpm test:coverage
\`\`\`

### 빌드
\`\`\`bash
pnpm build
\`\`\`

## 프로젝트 구조

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── workspace/          # 워크스페이스 (페이지, 데이터베이스)
│   └── ...
├── components/             # React 컴포넌트
├── stores/                 # Zustand 스토어
├── actions/                # Server Actions
├── schemas/                # Zod 스키마
├── hooks/                  # 커스텀 훅
├── lib/                    # 유틸리티
└── types/                  # TypeScript 타입
\`\`\`

## 라이선스

MIT
```

#### Task 6.2: CLAUDE.md 업데이트
**파일**: `CLAUDE.md`
- 새로운 디렉토리 구조 반영
- 새로운 명령어 추가 (pnpm, test)
- 아키텍처 변경사항 반영

### 9.2 계획서 정리

#### Task 6.3: 완료된 계획서 이동
```bash
mv .sisyphus/plans/REFACTORING-PLAN.md docs/complete/REFACTORING-PLAN-$(date +%Y%m%d).md
```

### 9.3 최종 검증

#### Task 6.4: 전체 빌드 및 테스트
```bash
pnpm install
pnpm lint
pnpm test
pnpm build
```

#### Task 6.5: 체크리스트 최종 확인
- [ ] 모든 수락 기준 충족
- [ ] TypeScript 에러 없음
- [ ] ESLint 에러 없음
- [ ] 테스트 통과
- [ ] 빌드 성공
- [ ] README.md 업데이트 완료
- [ ] 계획서 `/docs/complete/`로 이동 완료

---

## 10. 위험 요소 및 대응 방안

| 위험 | 영향도 | 대응 방안 |
|------|--------|----------|
| 텍스트 사라짐 버그 재발 | **최상** | Dirty flag + 디바운스 패턴 철저히 적용, 수동 테스트 필수 |
| 라우트 변경으로 인한 링크 깨짐 | 높음 | 변경 전 모든 내부 링크 검색 및 업데이트 |
| Tailwind 마이그레이션 누락 | 중간 | 단계별 마이그레이션, 시각적 회귀 테스트 |
| Zustand 상태 동기화 이슈 | 중간 | 점진적 도입, 로컬 상태 우선 유지 |
| 디바운스로 인한 데이터 손실 | 중간 | flush 함수로 언마운트/blur 시 즉시 저장 보장 |
| 테스트 작성 시간 초과 | 낮음 | 핵심 로직 우선, 나머지는 후속 작업 |

---

## 11. 예상 작업량

| Phase | 내용 | 예상 작업 항목 수 | 복잡도 |
|-------|------|------------------|--------|
| Phase 0 | pnpm 마이그레이션 | 3 | 낮음 |
| Phase 1 | Admin 통합 & 라우트 재편 | 5 | 높음 |
| **Phase 1.5** | **치명적 버그 수정** | **5** | **높음** |
| Phase 2 | 코드 품질 개선 | 9 | 중간 |
| Phase 3 | 아키텍처 현대화 | 7 | 높음 |
| Phase 4 | 성능 최적화 | 5 | 중간 |
| Phase 5 | 테스트 인프라 | 9 | 중간 |
| Phase 6 | 문서화 & 마무리 | 5 | 낮음 |
| **합계** | | **48** | - |

---

## 12. 실행 명령

이 계획을 실행하려면:
```bash
# Sisyphus 모드로 실행
/sisyphus 이 계획을 Phase 0부터 순차적으로 실행해줘
```

---

> **Note**: 이 계획서는 작업 완료 후 `/docs/complete/`로 이동됩니다.
