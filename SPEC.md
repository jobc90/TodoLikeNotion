# Project Specification: TodoLikeNotion

## 1. 개요 (Overview)

`TodoLikeNotion`은 Notion의 사용자 경험을 지향하는 **개인 생산성 애플리케이션**입니다. 유려한 디자인(Aesthetics), 부드러운 인터랙션, 그리고 강력한 데이터베이스 기능을 핵심 가치로 삼고 있습니다.

### 1.1 타겟 사용자
- 개인 사용자 (1인 사용)
- 로컬 환경에서 데이터를 완전히 제어하고 싶은 사용자

### 1.2 핵심 사용 시나리오
- **개인 생산성**: 할일 관리, 노트 정리, 개인 프로젝트 추적
- **데이터 트래킹**: 습관, 독서, 운동, 재정 등 개인 데이터 기록 및 분석

---

## 2. 기술 스택 (Tech Stack)

| 영역 | 기술 |
|------|------|
| **Framework** | Next.js 16+ (App Router) |
| **Language** | TypeScript |
| **Styling** | Vanilla CSS (CSS Variables, Module-free) |
| **Database** | SQLite (로컬 파일) |
| **ORM** | Prisma |
| **배포 타겟** | Electron/Tauri (로컬 데스크톱 앱) |

### 2.1 스타일링 원칙
- 다크/라이트 모드 완벽 지원 (`[data-theme="dark"]`)
- Glassmorphism 및 프리미엄 색상 팔레트 적용
- **미니멀리즘 강화**: 깔끔하고 여백이 많은 디자인

---

## 3. 핵심 기능 (Core Features)

### 3.1 워크스페이스 & 사이드바

| 기능 | 설명 |
|------|------|
| **네비게이션** | 'PAGES'와 'DATABASES' 섹션으로 구분된 사이드바 |
| **빠른 생성** | `+` 버튼으로 새 페이지/데이터베이스 즉시 생성 |
| **슬라이딩 메뉴** | 아이템 호버 시 `⋮` 버튼이 부드럽게 슬라이딩하며 등장 |
| **테마 전환** | 상단 토글을 통한 즉각적인 다크/라이트 모드 전환 |

---

### 3.2 데이터베이스 (Databases)

#### 3.2.1 뷰 타입 (Views)

| 뷰 | 우선순위 | 설명 |
|----|----------|------|
| **테이블 뷰** | P0 (최우선) | 엑셀/스프레드시트 형태의 데이터 조회 및 편집 |
| **칸반 보드 뷰** | P1 | Select/Status 속성 기반 카드를 컬럼별로 그룹화 |
| **캘린더 뷰** | P2 | Date 속성 기반 주간/월간 일정 표시 |

#### 3.2.2 테이블 뷰 세부 기능

**필터/정렬 UI**: 툴바 버튼 방식
- 테이블 상단에 'Filter', 'Sort' 버튼
- 클릭 시 팝오버로 조건 설정

**지원 속성 타입**:

| 속성 타입 | 설명 | 우선순위 |
|-----------|------|----------|
| Text | 기본 텍스트 | P0 |
| Number | 숫자 전용 | P0 |
| Select | 단일 선택 태그 (색상 지원) | P0 |
| Multi-select | 다중 선택 태그 | P0 |
| Date | 날짜 선택기 내장 | P0 |
| Checkbox | true/false 토글 | P0 |
| URL | 클릭 가능한 링크 | P0 |
| Person | 텍스트 기반 담당자 | P1 |
| Files & Media | URL/텍스트 기반 파일 | P1 |
| **Relation** | 다른 데이터베이스와 연결 | P1 |
| **Formula** | 다른 컬럼 값 기반 계산 | P2 |

**행(Row) 기능**:
- Drag & Drop 순서 변경
- `⋮` 호버 메뉴: 삭제, 복제, 위/아래 행 추가
- Optimistic Updates로 지연 없는 UX
- Tab/방향키를 이용한 셀 이동

#### 3.2.3 칸반 보드 뷰 세부 기능

| 기능 | 설명 |
|------|------|
| **드래그 이동** | 카드를 다른 컬럼으로 드래그하여 상태 변경 |
| **컬럼 관리** | Select 옵션 추가/삭제/순서 변경 |
| **서브태스크** | 카드 안에 체크리스트 서브태스크 추가 |

#### 3.2.4 캘린더 뷰 세부 기능

| 기능 | 설명 |
|------|------|
| **주간 뷰** | 기본 뷰, 7일 단위로 상세하게 표시 |
| **월간 뷰** | 선택적, 한 달 전체를 그리드로 표시 |

---

### 3.3 페이지 에디터 (Block Editor)

#### 3.3.1 기본 블록 타입

| 블록 | 단축키 | 설명 |
|------|--------|------|
| Paragraph | - | 기본 텍스트 |
| Heading 1/2/3 | `#`, `##`, `###` + Space | 섹션 제목 |
| Bullet List | `-` 또는 `*` + Space | 글머리 기호 목록 |
| Numbered List | `1.` + Space | 번호 매기기 목록 |
| Todo | `[]` + Space | 체크박스 할일 |
| Toggle | - | 접기/펼치기 가능한 블록 |
| Quote | `>` + Space | 인용문 |
| Divider | `---` + Space | 구분선 |

#### 3.3.2 추가 블록 타입 (P1)

| 블록 | 설명 |
|------|------|
| **테이블 블록** | 간단한 마크다운 스타일 표 |
| **이미지/파일 블록** | 이미지 업로드 및 파일 첨부 |
| **임베드 블록** | YouTube, 트윗, 링크 미리보기 등 |

#### 3.3.3 Slash Command
`/` 입력 시 블록 타입 선택 메뉴 호출

---

### 3.4 페이지 연결 시스템

#### 3.4.1 내부 링크 (P1)
- `[[Page Name]]` 문법으로 다른 페이지 링크
- 입력 중 자동완성 제안
- 존재하지 않는 페이지 입력 시 새 페이지 생성 옵션

#### 3.4.2 그래프 뷰 (P1)
- **구현 방식**: 간단한 2D 노드 그래프
- D3.js 또는 Canvas 기반
- 노드와 엣지로 페이지 간 연결 시각화
- 기본적인 줌/패닝 지원

---

### 3.5 검색 기능

| 기능 | 우선순위 | 설명 |
|------|----------|------|
| **필터 기반 검색** | P1 | DB 뷰에서 속성별 필터링 (`status:done`, `date>today`) |
| **고급 쿼리** | P1 | AND/OR 조건, 날짜 범위 등 복합 필터링 |
| 전체 텍스트 검색 | P2 | 블록 내용, 셀 값까지 모두 검색 |

---

### 3.6 키보드 단축키

| 단축키 | 기능 |
|--------|------|
| `Cmd/Ctrl + K` | 검색/명령 팔레트 |
| `Cmd/Ctrl + N` | 새 페이지 |
| `Cmd/Ctrl + /` | 슬래시 명령 |
| `Tab` / `Shift+Tab` | 블록 들여쓰기/내어쓰기 |

---

## 4. 데이터 관리

### 4.1 저장 방식
- **SQLite 로컬 파일**: 모든 데이터는 로컬 `.db` 파일에 저장
- **실시간 자동 저장**: 변경 즉시 저장

### 4.2 백업 전략
- **자동 백업 스케줄링**: 설정된 주기로 `.db` 파일 복사본 자동 생성
- 백업 파일 위치 및 보관 개수 설정 가능

### 4.3 에러 처리
- **Optimistic Updates**: UI 즉시 반영 후 서버 처리
- **인라인 에러 표시**: 실패 시 해당 셀/행에 에러 상태 표시 및 재시도 옵션

### 4.4 확장성
- 대규모 데이터 처리를 위한 페이지네이션/가상화 고려
- 초기엔 소규모로 시작하되, 10,000건 이상도 처리 가능한 구조 설계

---

## 5. UI/UX 디자인 시스템

### 5.1 디자인 철학
> **"Vibrant & Premium + Minimalism"**

- 불필요한 요소 제거, 여백 활용
- Glassmorphism으로 깊이감 표현
- 부드러운 애니메이션으로 프리미엄 느낌

### 5.2 색상 시스템

**텍스트 색상 (Ink)**:
- Primary: `#1F1F1F` (라이트) / `#FFFFFF` (다크)
- Secondary: `#37352F` / `rgba(255,255,255,0.8)`
- Tertiary: `#6B6B6B` / `rgba(255,255,255,0.5)`

**배경 색상**:
- Canvas: `#FFFFFF` / `#1C1C1E`
- Surface: `#F7F7F7` / `#2C2C2E`
- Surface-Subtle: `#FAFAFA` / `#3C3C3E`

**태그 색상 팔레트**:
Gray, Brown, Orange, Yellow, Green, Blue, Purple, Pink, Red (파스텔 톤)

### 5.3 인터랙션 패턴

| 패턴 | 설명 |
|------|------|
| **Sliding Action Buttons** | 호버 시 `width` 애니메이션으로 버튼 등장 |
| **Glassmorphism** | 팝업, 드롭다운에 반투명 블러 효과 |
| **Micro-interactions** | 버튼 클릭, 상태 변경 시 미세한 애니메이션 |

### 5.4 반응형 디자인
- 데스크톱 우선 설계
- 기본적인 반응형 레이아웃으로 모바일에서도 사용 가능
- 사이드바 토글, 컬럼 축소 등 적응형 UI

### 5.5 접근성 (A11y)
- 기본 접근성 수준
- 키보드 탐색 지원
- 기본 ARIA 레이블 적용

---

## 6. 데이터베이스 스키마

```prisma
model Page {
  id        String   @id @default(cuid())
  title     String   @default("Untitled")
  icon      String?
  cover     String?
  archived  Boolean  @default(false)
  blocks    Block[]
  tags      PageTag[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Block {
  id        String   @id @default(cuid())
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  type      String   @default("paragraph")
  props     String   @default("{}")  // JSON
  order     Int      @default(0)
  parentId  String?
  parent    Block?   @relation("BlockChildren", fields: [parentId], references: [id])
  children  Block[]  @relation("BlockChildren")
}

model Database {
  id         String     @id @default(cuid())
  title      String     @default("Untitled")
  icon       String?
  properties Property[]
  rows       Row[]
  views      View[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

model Property {
  id         String   @id @default(cuid())
  databaseId String
  database   Database @relation(fields: [databaseId], references: [id], onDelete: Cascade)
  name       String
  type       String   // text, number, select, multi-select, date, checkbox, url, relation, formula
  options    String   @default("{}") // JSON for select options, relation config, formula
  order      Int      @default(0)
  width      Int      @default(150)
  cells      Cell[]
}

model Row {
  id         String   @id @default(cuid())
  databaseId String
  database   Database @relation(fields: [databaseId], references: [id], onDelete: Cascade)
  order      Int      @default(0)
  cells      Cell[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Cell {
  id         String   @id @default(cuid())
  rowId      String
  row        Row      @relation(fields: [rowId], references: [id], onDelete: Cascade)
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  value      String   @default("")

  @@unique([rowId, propertyId])
}

model View {
  id         String   @id @default(cuid())
  databaseId String
  database   Database @relation(fields: [databaseId], references: [id], onDelete: Cascade)
  name       String
  type       String   @default("table") // table, kanban, calendar
  config     String   @default("{}") // JSON for filters, sorts, groupBy, etc.
  order      Int      @default(0)
}
```

---

## 7. 파일 구조

```
src/
├── app/                      # Next.js App Router Pages
│   ├── page.tsx              # 홈 (대시보드)
│   ├── pages/[pageId]/       # 페이지 에디터
│   └── database/[databaseId]/ # 데이터베이스 뷰
├── actions/                  # Server Actions (DB CRUD)
│   ├── page.actions.ts
│   ├── block.actions.ts
│   └── database.actions.ts
├── components/
│   ├── blocks/               # 블록 에디터 컴포넌트
│   ├── database/             # 데이터베이스 뷰 컴포넌트
│   │   ├── TableView/
│   │   ├── KanbanView/
│   │   └── CalendarView/
│   ├── layout/               # Sidebar, MainLayout
│   ├── graph/                # 그래프 뷰 컴포넌트
│   └── ui/                   # 공통 UI 컴포넌트
├── hooks/                    # Custom React Hooks
├── lib/                      # Utility functions
└── types/                    # TypeScript Definitions

prisma/
├── schema.prisma             # DB Schema
└── dev.db                    # SQLite Database
```

---

## 8. 우선순위 로드맵

### Phase 1: 테이블 뷰 완성 (최우선)
- [ ] 필터/정렬 UI (툴바 버튼 방식)
- [ ] 커럼 리사이즈 안정화
- [ ] 모든 속성 타입 안정화
- [ ] 키보드 네비게이션 강화

### Phase 2: 칸반 보드 뷰
- [ ] Select 속성 기반 컬럼 그룹화
- [ ] 카드 드래그 앤 드롭
- [ ] 컬럼 추가/삭제/순서 변경
- [ ] 서브태스크 (체크리스트) 지원

### Phase 3: 내부 링크 & 그래프 뷰
- [ ] `[[Page Name]]` 문법 파서
- [ ] 자동완성 UI
- [ ] 2D 노드 그래프 시각화
- [ ] 줌/패닝 인터랙션

### Phase 4: 추가 기능
- [ ] 캘린더 뷰 (주간/월간)
- [ ] Relation 속성
- [ ] Formula 속성
- [ ] 테이블/이미지/임베드 블록
- [ ] 고급 검색 쿼리
- [ ] 자동 백업 시스템

---

## 9. 우려사항 및 완화 전략

### 9.1 복잡성 증가
**위험**: 기능 추가 시 코드베이스 관리 어려움

**완화 전략**:
- 컴포넌트 모듈화 철저히
- 각 뷰 타입별 독립적인 폴더 구조
- 공통 로직은 hooks/utils로 분리
- TypeScript 타입 정의 철저히

### 9.2 데이터 손실
**위험**: SQLite 파일 손상으로 인한 데이터 유실

**완화 전략**:
- 자동 백업 스케줄링 구현
- 백업 파일 별도 위치 저장
- 앱 시작 시 무결성 체크

---

## 10. 배포 계획

### 10.1 타겟 플랫폼
- **Electron** 또는 **Tauri**로 데스크톱 앱 패키징
- Windows, macOS, Linux 지원

### 10.2 배포 이점
- 로컬 SQLite 사용으로 외부 DB 불필요
- 오프라인 완전 지원
- 데이터 프라이버시 보장

---

*Last Updated: 2026-01-15*
