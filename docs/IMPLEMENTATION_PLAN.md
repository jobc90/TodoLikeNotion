# Notion Database 기능 구현 계획 (v2)

실제 노션 스크린샷을 기반으로 UI/UX를 정확히 분석하고 반영한 상세 구현 계획입니다.

---

## 구현 현황

### Phase 1: 핵심 인프라 - 완료
- [x] Database, Property, Row, Cell, View 모델 추가 (Prisma)
- [x] `npx prisma db push` 실행
- [x] Prisma Client 재생성
- [x] database.actions.ts 생성 (CRUD 전체)

### Phase 2: 테이블 UI - 완료
- [x] DatabaseView.tsx (메인 컨테이너)
- [x] TableHeader.tsx (헤더/컬럼)
- [x] TableRow.tsx (행)
- [x] TableCell.tsx (셀 - 타입별 분기)
- [x] cells/SelectDropdown.tsx (선택 드롭다운)
- [x] cells/DatePicker.tsx (날짜 선택기)
- [x] PropertyMenu.tsx (컬럼 설정 메뉴)
- [x] RowDetailModal.tsx (행 상세 모달)
- [x] FilterSort.tsx (필터 & 정렬)

### Phase 3: 필터 & 정렬 - 완료
- [x] 필터 조건 UI
- [x] 다중 필터 (AND)
- [x] 정렬 UI
- [x] 다중 정렬

### Phase 4: 행 상세 모달 - 완료
- [x] 전체 화면 모달로 상세 편집
- [x] 모든 속성 타입 지원

### Phase 5: 보드 & 갤러리 뷰 - 미구현
- [ ] 보드 뷰 (Kanban)
- [ ] 갤러리 뷰

---

## 📸 노션 UI 분석

### 실제 노션 스크린샷
![노션 테이블 UI](uploaded_image_1768369965252.png)

### UI 요소 상세 분석

#### 1. 헤더 영역
```
♥ 주문 리스트 (상세)                              ≡  ↗  ⟲  ⋯  ⌃
```
- **아이콘 + 제목**: 이모지 + 제목
- **우측 도구**: 정렬, 필터, 새로고침, 더보기, 확장

#### 2. 컬럼 헤더 (Property)
| 컬럼명 | 타입 | 아이콘 |
|--------|------|--------|
| 진행단계 | Select | (컬러 태그) |
| 주문일 | Date | 📅 |
| 구매자명 | Text | 📝 |
| 신부 | Text | 👤 |
| 신랑 | Text | 👤 |
| 영상 | Select | 🎬 |
| N | Number | # |
| 제작 | Select | ⚙️ |
| 결혼날짜 | Date | 📅 |
| 사진마감 | Date | 📅 |
| 마감일 | Date | 📅 |
| 영상전달 | Date | 📅 |
| SNS 동의 | Checkbox | ☑️ |
| # | Number | # |
| 구분 | Select | 📁 |
| 상담 | Select | 💬 |
| 전화 변경 | Text | 📞 |
| 메모 | Text | 📝 |

#### 3. Select 컬럼 스타일 (핵심!)
```css
/* 진행단계 컬럼의 컬러 태그 */
.tag-주문완료 { background: #FFE2E2; color: #C4554D; }  /* 빨강 */
.tag-제작시작 { background: #FDECC8; color: #9F6B53; }  /* 주황 */
.tag-최종본전 { background: #DBEDDB; color: #4D6B4D; }  /* 초록 */
.tag-홍보중   { background: #E8DEEE; color: #6B4D7D; }  /* 보라 */
```

#### 4. 행(Row) 인터랙션
- **호버**: 배경색 연하게 변경
- **체크박스**: 좌측에 행 선택 체크박스
- **행 열기**: 더블클릭 시 모달로 상세 페이지 열림
- **드래그**: 행 순서 변경 가능

#### 5. 셀 편집 UX
- **Single Click**: 셀 선택 (테두리 표시)
- **Double Click/Click**: 편집 모드 진입
- **Enter**: 값 확정
- **Escape**: 편집 취소
- **Tab**: 다음 셀로 이동

---

## 🎨 UI/UX 디자인 명세

### 색상 시스템 (노션 기준)

```css
:root {
  /* 배경 */
  --table-bg: #ffffff;
  --table-header-bg: #f7f6f3;
  --row-hover: #f7f6f3;
  --row-selected: #e8f4ff;

  /* 테두리 */
  --border-color: #e9e9e7;
  --border-hover: #d3d3d0;

  /* Select 태그 색상 */
  --tag-gray: #e3e2e0;
  --tag-brown: #eee0da;
  --tag-orange: #fadec9;
  --tag-yellow: #fdecc8;
  --tag-green: #dbeddb;
  --tag-blue: #d3e5ef;
  --tag-purple: #e8deee;
  --tag-pink: #f5e0e9;
  --tag-red: #ffe2dd;
}
```

### 컴포넌트 스펙

#### 테이블 컨테이너
```
┌─────────────────────────────────────────────────────────────────┐
│ [아이콘] 테이블 제목                    [Filter] [Sort] [⋯] [↗] │
├─────────────────────────────────────────────────────────────────┤
│ ☐ │ 진행단계  │ 주문일  │ 구매자명 │ ... │ 메모    │ + │
├───┼───────────┼─────────┼──────────┼─────┼─────────┼───┤
│ ☐ │ 🔴 완료   │ 01/12   │ 박소현   │ ... │ 가사... │   │
│ ☐ │ 🟡 진행   │ 12/31   │ 김보연   │ ... │         │   │
│ ☐ │ 🟢 대기   │ 01/05   │ 이제희   │ ... │ 세상... │   │
├───┴───────────┴─────────┴──────────┴─────┴─────────┴───┤
│ + 새 항목                                                │
└─────────────────────────────────────────────────────────────────┘
```

#### 셀 타입별 렌더링

| 타입 | 표시 방식 | 편집 방식 |
|------|-----------|-----------|
| Text | 일반 텍스트 | 인라인 input |
| Number | 우측 정렬 숫자 | 인라인 input |
| Select | 컬러 태그 (둥근 pill) | 드롭다운 |
| Multi-Select | 여러 컬러 태그 | 드롭다운 (다중) |
| Date | YYYY/MM/DD | 날짜 피커 |
| Checkbox | ☐/☑ | 클릭 토글 |
| URL | 밑줄 텍스트 | 인라인 input |

---

## 🗄️ 데이터베이스 스키마

### Prisma 모델 (구현됨)

```prisma
// ==================== Database ====================
model Database {
  id          String   @id @default(cuid())
  pageId      String?  // 페이지에 임베드 시
  title       String   @default("Untitled")
  icon        String?  // 이모지
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  properties  Property[]
  rows        Row[]
  views       View[]
}

// ==================== Property (컬럼) ====================
model Property {
  id          String   @id @default(cuid())
  databaseId  String
  name        String
  type        String   // text, number, select, multi_select, date, checkbox, url
  options     String   @default("{}") // JSON
  order       Int
  width       Int      @default(150)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  database    Database @relation(fields: [databaseId], references: [id], onDelete: Cascade)
  cells       Cell[]

  @@index([databaseId])
}

// ==================== Row (행) ====================
model Row {
  id          String   @id @default(cuid())
  databaseId  String
  order       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  database    Database @relation(fields: [databaseId], references: [id], onDelete: Cascade)
  cells       Cell[]

  @@index([databaseId])
}

// ==================== Cell (셀) ====================
model Cell {
  id          String   @id @default(cuid())
  rowId       String
  propertyId  String
  value       String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  row         Row      @relation(fields: [rowId], references: [id], onDelete: Cascade)
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@unique([rowId, propertyId])
  @@index([rowId])
  @@index([propertyId])
}

// ==================== View (뷰 설정) ====================
model View {
  id          String   @id @default(cuid())
  databaseId  String
  name        String   @default("기본 뷰")
  type        String   @default("table") // table, board, gallery
  config      String   @default("{}") // JSON: filters, sorts, hiddenCols
  order       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  database    Database @relation(fields: [databaseId], references: [id], onDelete: Cascade)

  @@index([databaseId])
}
```

---

## 🚀 구현된 기능

### Server Actions (`src/actions/database.actions.ts`)

**Database CRUD**
- `createDatabase(title?, icon?)` - 데이터베이스 생성
- `updateDatabase(id, data: { title?, icon? })` - 업데이트
- `deleteDatabase(id)` - 삭제
- `getDatabase(id)` - 전체 데이터 포함 조회
- `getDatabases()` - 목록 조회

**Property CRUD**
- `addProperty(databaseId, name, type, options?)` - 컬럼 추가
- `updateProperty(id, data: { name?, type?, options?, width? })` - 업데이트
- `deleteProperty(id)` - 삭제
- `reorderProperties(databaseId, propertyIds[])` - 순서 변경

**Row CRUD**
- `addRow(databaseId, cells?)` - 행 추가
- `deleteRow(id)` - 삭제
- `duplicateRow(id)` - 복제
- `reorderRows(databaseId, rowIds[])` - 순서 변경

**Cell Update**
- `updateCell(rowId, propertyId, value)` - 셀 값 업데이트

**View CRUD**
- `createView(databaseId, name, type)` - 뷰 생성
- `updateView(id, data)` - 업데이트
- `deleteView(id)` - 삭제

### 컴포넌트 구조

```
src/components/database/
├── DatabaseView.tsx        # 메인 컨테이너 (필터/정렬 통합)
├── TableHeader.tsx         # 헤더 (컬럼명, 리사이즈)
├── TableRow.tsx            # 행
├── TableCell.tsx           # 셀 (타입별 분기)
├── cells/
│   ├── SelectDropdown.tsx  # Select 드롭다운
│   └── DatePicker.tsx      # 날짜 피커
├── PropertyMenu.tsx        # 컬럼 설정 메뉴
├── RowDetailModal.tsx      # 행 상세 모달
├── FilterSort.tsx          # 필터 & 정렬 UI
└── index.ts                # Exports
```

### 셀 타입 지원

| 타입 | 표시 | 편집 | 필터 | 정렬 |
|------|------|------|------|------|
| Text | O | O | O | O |
| Number | O | O | O | O |
| Select | O | O | O | O |
| Multi-Select | O | O | O | O |
| Date | O | O (DatePicker) | O | O |
| Checkbox | O | O | O | O |
| URL | O | O | O | O |

---

## 📅 향후 개발 계획

### Phase 5: 보드 & 갤러리 뷰

#### 보드 뷰 (Kanban)
- Select 컬럼 기준 그룹화
- 카드 드래그로 상태 변경
- 컬럼별 카드 개수 표시

#### 갤러리 뷰
- 카드 형태로 표시
- 파일 컬럼이 있으면 썸네일 표시

### 추가 기능

- [ ] 뷰 저장/불러오기
- [ ] 컬럼 숨기기
- [ ] 열 고정
- [ ] 페이지 내 데이터베이스 임베드
- [ ] 데이터베이스 템플릿
- [ ] CSV 가져오기/내보내기

---

## 🎯 사용 방법

1. 사이드바에서 "새 데이터베이스" 클릭
2. 제목 입력 및 아이콘 선택
3. "+" 버튼으로 컬럼 추가 (타입 선택)
4. "새 항목" 버튼으로 행 추가
5. 셀 클릭하여 편집
6. 행 더블클릭으로 상세 모달 열기
7. 필터/정렬 버튼으로 데이터 필터링/정렬
