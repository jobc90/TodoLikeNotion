/**
 * Command Palette Component
 *
 * A Notion-style command palette for quick navigation and search across pages and databases.
 *
 * Features:
 * - Opens with Cmd+K (Mac) or Ctrl+K (Windows)
 * - Closes with Escape key
 * - Shows recent pages (top 5 by update time)
 * - Searches across all pages and databases
 * - Arrow key navigation
 * - Enter to select
 * - Smooth animations with Framer Motion
 * - Glass morphism dark mode design
 *
 * Usage:
 * This component is wrapped by CommandPaletteWrapper (server component) which fetches
 * pages and databases data and passes them as props. The wrapper is included globally
 * in the root layout, making the command palette available throughout the app.
 *
 * Keyboard shortcuts:
 * - Cmd/Ctrl + K: Toggle command palette
 * - Escape: Close command palette
 * - Arrow Up/Down: Navigate items
 * - Enter: Select item
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface Page {
  id: string;
  title: string;
  icon: string | null;
  updatedAt: Date | string;
}

interface Database {
  id: string;
  title: string;
  icon: string | null;
  updatedAt: Date | string;
}

interface CommandPaletteProps {
  pages: Page[];
  databases: Database[];
}

export default function CommandPalette({ pages, databases }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Listen for custom event from keyboard shortcuts
  useEffect(() => {
    const handleOpen = () => {
      setOpen((open) => !open);
    };

    window.addEventListener("openCommandPalette", handleOpen);
    return () => window.removeEventListener("openCommandPalette", handleOpen);
  }, []);

  // Listen for close modal event
  useEffect(() => {
    const handleClose = () => {
      if (open) {
        setOpen(false);
      }
    };

    window.addEventListener("closeModal", handleClose);
    return () => window.removeEventListener("closeModal", handleClose);
  }, [open]);

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const handleSelect = useCallback((callback: () => void) => {
    setOpen(false);
    callback();
  }, []);

  // Sort pages by recency
  const recentPages = [...pages]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="command-palette-backdrop"
            onClick={() => setOpen(false)}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="command-palette-container"
          >
            <Command
              className="command-palette"
              shouldFilter={true}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                }
              }}
            >
              {/* Search Input */}
              <div className="command-palette-header">
                <svg
                  className="command-palette-search-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16ZM18.5 18.5l-4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="명령어 및 페이지 검색..."
                  className="command-palette-input"
                  autoFocus
                />
                <kbd className="command-palette-kbd">ESC</kbd>
              </div>

              {/* Results */}
              <Command.List className="command-palette-list">
                <Command.Empty className="command-palette-empty">
                  검색 결과 없음
                </Command.Empty>

                {/* Recent Pages */}
                {!search && recentPages.length > 0 && (
                  <Command.Group heading="최근 페이지" className="command-palette-group">
                    {recentPages.map((page) => (
                      <Command.Item
                        key={page.id}
                        value={`page-${page.id}-${page.title}`}
                        onSelect={() =>
                          handleSelect(() => router.push(`/pages/${page.id}`))
                        }
                        className="command-palette-item"
                      >
                        <span className="command-palette-icon">
                          {page.icon || "📄"}
                        </span>
                        <span className="command-palette-title">{page.title}</span>
                        <span className="command-palette-badge">페이지</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* All Pages */}
                {pages.length > 0 && (
                  <Command.Group
                    heading={search ? "페이지" : "전체 페이지"}
                    className="command-palette-group"
                  >
                    {pages.map((page) => (
                      <Command.Item
                        key={page.id}
                        value={`page-${page.id}-${page.title}`}
                        onSelect={() =>
                          handleSelect(() => router.push(`/pages/${page.id}`))
                        }
                        className="command-palette-item"
                      >
                        <span className="command-palette-icon">
                          {page.icon || "📄"}
                        </span>
                        <span className="command-palette-title">{page.title}</span>
                        <span className="command-palette-badge">페이지</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Databases */}
                {databases.length > 0 && (
                  <Command.Group heading="데이터베이스" className="command-palette-group">
                    {databases.map((database) => (
                      <Command.Item
                        key={database.id}
                        value={`database-${database.id}-${database.title}`}
                        onSelect={() =>
                          handleSelect(() => router.push(`/databases/${database.id}`))
                        }
                        className="command-palette-item"
                      >
                        <span className="command-palette-icon">
                          {database.icon || "📊"}
                        </span>
                        <span className="command-palette-title">
                          {database.title}
                        </span>
                        <span className="command-palette-badge">데이터베이스</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              {/* Footer */}
              <div className="command-palette-footer">
                <div className="command-palette-footer-hint">
                  <kbd>↑↓</kbd>
                  <span>탐색</span>
                </div>
                <div className="command-palette-footer-hint">
                  <kbd>↵</kbd>
                  <span>선택</span>
                </div>
                <div className="command-palette-footer-hint">
                  <kbd>ESC</kbd>
                  <span>닫기</span>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
