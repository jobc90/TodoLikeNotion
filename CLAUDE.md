# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Notion-like todo management application with a block-based document structure. Built with Next.js 16 (App Router), React 19, TypeScript, Prisma ORM with SQLite, and Tailwind CSS 4.

## Commands

```bash
pnpm dev          # Start development server at localhost:3000
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

**Database commands:**
```bash
pnpm prisma migrate dev    # Run migrations
pnpm prisma generate       # Regenerate Prisma client
pnpm prisma studio         # Open database GUI
```

## Architecture

### Data Flow
- **Server Actions** (`src/actions/`) handle all database operations with automatic cache revalidation via `revalidatePath()`
- **Server Components** fetch initial data, **Client Components** handle interactivity
- Block properties are stored as JSON strings in the database, parsed in components

### Key Directories
- `src/app/` - Next.js App Router pages
- `src/actions/` - Server actions for page and block CRUD operations
- `src/components/blocks/` - Block rendering and editing components
- `src/components/layout/` - Layout components (Sidebar)
- `src/types/` - TypeScript type definitions
- `prisma/schema.prisma` - Database schema

### Database Models
- **Page** - Document container with title, icon, cover, archived status
- **Block** - Core content blocks with type, props (JSON), order, and parent-child hierarchy
- **Revision** - Version history snapshots
- **Tag/PageTag** - Tagging system
- **Attachment** - File metadata

### Block System
Block types: `paragraph`, `heading1`, `heading2`, `heading3`, `bullet`, `numbered`, `todo`, `toggle`, `quote`, `divider`

Block props structure:
- `text` - Content string
- `checked` - Boolean for todo blocks
- `expanded` - Boolean for toggle blocks
- `level` - Number for indentation

### Path Alias
Use `@/*` to import from `./src/*`
