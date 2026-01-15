# Phase 1 Refactoring - Learnings

## Completed: Admin 통합 & 라우트 재편 (2025-01-15)

### What Was Done

1. **Directory Structure Reorganization**
   - Created `workspace/` directory for all workspace-related routes
   - Created `(dashboard)/` route group for admin features
   - Moved `/pages/[pageId]` → `/workspace/[pageId]`
   - Moved `/database/[databaseId]` → `/workspace/database/[databaseId]`
   - Moved `/admin/orders` → `/(dashboard)/orders`
   - Moved `/admin/customers` → `/(dashboard)/customers`

2. **Layout Integration**
   - Merged admin layout into root layout.tsx
   - Added film strip decoration to root layout
   - Integrated admin sidebar with workspace navigation
   - Added new navigation items: Dashboard, Orders, Customers, Workspace, Graph, Settings

3. **CSS Consolidation**
   - Merged admin.css into globals.css
   - Moved @import statement to top of globals.css (required by CSS spec)
   - Preserved both Serene Systematic and Cinematic Editorial styles

4. **Route Reference Updates**
   - Updated all internal route references from `/pages/` to `/workspace/`
   - Updated all database references from `/database/` to `/workspace/database/`
   - Fixed CommandPalette route typo (`/databases/` → `/workspace/database/`)
   - Updated references in:
     - CommandPalette.tsx
     - Sidebar.tsx
     - BlockRenderer.tsx (for [[page]] links)
     - GraphView.tsx
     - useKeyboardShortcuts.ts
     - page.actions.ts
     - block.actions.ts

### Key Patterns

1. **CSS @import Rules**
   - MUST be at the top of CSS files
   - Must precede all rules except @charset and @layer
   - When merging CSS files, extract @import and move to top

2. **Next.js Route Structure**
   - Dynamic route segments cannot have duplicate names in same path
   - Route groups `(name)` don't affect URL structure but organize files
   - `/workspace/[pageId]` is correct, `/workspace/[pageId]/[pageId]` is invalid

3. **Global Search and Replace Strategy**
   - Use Grep to find all occurrences first
   - Read file before editing (Edit tool requirement)
   - Use `replace_all: true` when pattern is unique
   - Update actions (server-side) and components (client-side) separately

### Issues Encountered & Solutions

**Issue 1: Duplicate Dynamic Route Segment**
- Error: `You cannot have the same slug name "pageId" repeat within a single dynamic path`
- Cause: Copied `/pages/` directory created nested structure `/workspace/[pageId]/[pageId]/`
- Solution: Moved files up one level and removed nested directory

**Issue 2: CSS @import Not at Top**
- Error: `@import rules must precede all rules aside from @charset and @layer`
- Cause: Appended admin.css (with @import) to end of globals.css
- Solution: Moved @import to top of globals.css, removed duplicate

### Build Verification

Final route structure:
```
/                              → Dashboard (Admin style)
/orders                        → Orders management
/customers                     → Customers management
/workspace/[pageId]            → Page editor
/workspace/database/[databaseId] → Database view
/graph                         → Graph visualization
```

Build: ✅ Success
TypeScript: ✅ No errors
All old routes removed: ✅ Confirmed

### Files Modified

**Created:**
- `src/app/workspace/[pageId]/` (moved from `src/app/pages/[pageId]/`)
- `src/app/workspace/database/[databaseId]/` (moved from `src/app/database/[databaseId]/`)
- `src/app/(dashboard)/orders/` (moved from `src/app/admin/orders/`)
- `src/app/(dashboard)/customers/` (moved from `src/app/admin/customers/`)

**Modified:**
- `src/app/layout.tsx` - Integrated admin layout, added sidebar
- `src/app/page.tsx` - Replaced with admin dashboard
- `src/app/globals.css` - Merged admin.css, moved @import to top
- `src/components/CommandPalette.tsx` - Updated routes
- `src/components/layout/Sidebar.tsx` - Updated routes
- `src/components/blocks/BlockRenderer.tsx` - Updated page links
- `src/components/graph/GraphView.tsx` - Updated navigation
- `src/hooks/useKeyboardShortcuts.ts` - Updated new page route
- `src/actions/page.actions.ts` - Updated revalidatePath
- `src/actions/block.actions.ts` - Updated revalidatePath

**Deleted:**
- `src/app/admin/` (merged into root)
- `src/app/pages/` (moved to workspace)
- `src/app/database/` (moved to workspace)

### Next Steps (Phase 1.5 & Beyond)

Per the plan, the next phases are:
1. **Phase 1.5**: Critical bug fixes (text disappearing, excessive server requests)
2. **Phase 2**: Code quality improvements (Zod, component splitting)
3. **Phase 3**: Architecture modernization (Zustand, Tailwind migration)
4. **Phase 4**: Performance optimization (virtualization, debouncing)
5. **Phase 5**: Testing infrastructure (Vitest, RTL)
6. **Phase 6**: Documentation and finalization
