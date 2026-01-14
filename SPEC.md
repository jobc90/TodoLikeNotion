# Project Specification: TodoLikeNotion

## 1. 개요 (Overview)
`TodoLikeNotion`은 Notion의 사용자 경험을 지향하는 프리미엄 생산성 애플리케이션입니다. 유려한 디자인(Aesthetics), 부드러운 인터랙션, 그리고 강력한 데이터베이스 기능을 핵심 가치로 삼고 있습니다.

## 2. 기술 스택 (Tech Stack)
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Variables, Global Styles, Module-free)
  - 다크/라이트 모드 완벽 지원 (`[data-theme="dark"]`)
  - Glassmorphism 및 프리미엄 색상 팔레트 적용
- **Database**: SQLite
- **ORM**: Prisma
- **Environment**: Node.js (Windows)

## 3. 핵심 기능 (Core Features)

### 3.1 워크스페이스 & 사이드바 (Workspace & Sidebar)
- **네비게이션**: '페이지(Private)'와 '데이터베이스' 섹션으로 구분된 사이드바.
- **페이지/DB 관리**:
  - `+` 버튼으로 빠른 생성.
  - **슬라이딩 메뉴 (Sliding Menu)**: 아이템 호버 시 `⋮` 버튼이 부드럽게 슬라이딩하며 등장.
  - 삭제 기능 지원.
- **테마 전환**: 상단 토글을 통한 즉각적인 다크/라이트 모드 전환.

### 3.2 데이터베이스 (Databases)
이 프로젝트의 가장 강력한 기능으로, 노션의 데이터베이스와 유사한 사용성을 제공합니다.

#### 뷰 (Views)
- **테이블 뷰 (Table View)**: 엑셀/스프레드시트 형태의 데이터 조회 및 편집.

#### 속성 (Properties)
다양한 데이터 타입을 지원하며, 각 컬럼(Header)은 드래그 앤 드롭으로 순서 변경 및 크기 조절이 가능합니다.
- **Text**: 기본 텍스트.
- **Number**: 숫자 전용.
- **Select (단일 선택)**: 태그 시스템. 색상 지정 가능 (Gray, Brown, Orange, Yellow, Green, Blue, Purple, Pink, Red).
- **Multi-select (다중 선택)**: 여러 태그 동시 선택 가능.
- **Date**: 날짜 선택기 (Date Picker) 내장.
- **Person**: (현재 텍스트 기반으로 구현).
- **Files & Media**: (현재 URL/Text 기반).
- **Checkbox**: `true/false` 토글.
- **URL**: 클릭 가능한 링크.

#### 행 (Rows)
- **Drag & Drop**: 행 순서 변경 가능.
- **Row Actions**:
  - `⋮` 호버 메뉴를 통한 '삭제', '복제', '위/아래 행 추가'.
  - 다중 선택(Checkbox)을 통한 일괄 삭제 (구현 예정).
- **UX**:
  - **Optimistic Updates**: 데이터 입력 시 서버 응답을 기다리지 않고 즉시 UI에 반영하여 딜레이 없는 경험 제공.
  - **Keyboard Navigation**: 탭(Tab), 방향키를 이용한 셀 이동 지원.

### 3.3 페이지 에디터 (Block Editor)
- **블록 시스템**: 텍스트, 제목 등 기본 블록 지원.
- **Slash Command**: `/` 입력 시 메뉴 호출 (기본 구조 구현).

## 4. UI/UX 디자인 시스템
- **철학**: "Vibrant & Premium"
- **색상 시스템**:
  - 단순한 `black/white`가 아닌, `Ink` 계열의 세련된 텍스트 색상 (`#1F1F1F`, `#37352F` 등).
  - 배경 또한 `Surface`, `Surface-Subtle` 등으로 계층화.
  - 데이터베이스 태그를 위한 파스텔 톤의 팔레트.
- **상호작용 (Interactions)**:
  - **Sliding Action Buttons**: 공간을 차지하지 않던 버튼이 호버 시 `width`가 늘어나며 등장하는 고급스러운 인터랙션.
  - **Glassmorphism**: 팝업, 드롭다운 메뉴에 반투명 블러 효과 적용.

## 5. 데이터베이스 스키마 (Prisma Model)
- **Page**: 문서의 기본 단위.
- **Block**: 페이지 내의 콘텐츠 블록. 부모-자식 관계 지원.
- **Database**: 페이지와 유사하지만 구조화된 데이터를 담는 컨테이너.
- **Property**: 데이터베이스의 컬럼 정의 (`type`, `options` 등 메타데이터 포함).
- **Row**: 데이터 레코드.
- **Cell**: 실제 데이터 값 (`value`) 저장.

## 6. 파일 구조 (File Structure)
```
src/
├── app/                 # Next.js App Router Pages
├── actions/             # Server Actions (DB CRUD)
├── components/
│   ├── database/        # DB 관련 컴포넌트 (Cell, Row, Header...)
│   ├── layout/          # Sidebar, MainLayout
│   └── ...
├── lib/                 # Utility functions (utils.ts)
└── types/               # TypeScript Definitions
prisma/
└── schema.prisma        # DB Schema
```
