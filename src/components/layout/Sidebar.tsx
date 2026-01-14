"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { PageListItem } from "@/types/page";
import type { DatabaseListItem } from "@/types/database";
import { createPage, deletePage } from "@/actions/page.actions";
import { createDatabase, deleteDatabase } from "@/actions/database.actions";
import ThemeToggle from "@/components/ThemeToggle";

interface SidebarProps {
  pages: PageListItem[];
  databases?: DatabaseListItem[];
}

export default function Sidebar({ pages, databases = [] }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<{
    type: "page" | "database";
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNewPage = () => {
    startTransition(async () => {
      const page = await createPage();
      router.push(`/pages/${page.id}`);
    });
  };

  const handleNewDatabase = () => {
    startTransition(async () => {
      const database = await createDatabase();
      router.push(`/database/${database.id}`);
    });
  };

  const handleMenuClick = useCallback((type: "page" | "database", id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuOpen({ type, id, x: rect.right + 4, y: rect.top });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!menuOpen) return;

    const { type, id } = menuOpen;
    closeMenu();

    startTransition(async () => {
      if (type === "page") {
        await deletePage(id);
        if (pathname === `/pages/${id}`) {
          router.push("/");
        }
      } else {
        await deleteDatabase(id);
        if (pathname === `/database/${id}`) {
          router.push("/");
        }
      }
      router.refresh();
    });
  }, [menuOpen, pathname, router, closeMenu]);

  // Menu portal
  const menuPortal = mounted && menuOpen && createPortal(
    <>
      <div
        className="dropdown-overlay"
        onClick={closeMenu}
        style={{ background: "transparent" }}
      />
      <div
        className="dropdown-menu"
        style={{
          position: "fixed",
          left: menuOpen.x,
          top: menuOpen.y,
          minWidth: 140,
        }}
      >
        <div
          className="dropdown-item"
          onClick={handleDelete}
          style={{ color: "var(--destructive)" }}
        >
          <span className="dropdown-item-icon">🗑️</span>
          <span>삭제</span>
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">노트</span>
        <ThemeToggle />
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          className="sidebar-search-input"
          placeholder="검색..."
        />
      </div>

      {/* Pages Section */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">PAGES</div>
      </div>

      <nav className="sidebar-pages" style={{ flex: "none", maxHeight: "40vh" }}>
        {pages.length === 0 ? (
          <div style={{ padding: "8px 14px", color: "var(--ink-tertiary)", fontSize: "13px" }}>
            페이지가 없습니다
          </div>
        ) : (
          pages.map((page) => {
            const isActive = pathname === `/pages/${page.id}`;
            const isHovered = hoveredItemId === `page-${page.id}`;
            const isMenuOpen = menuOpen?.type === "page" && menuOpen.id === page.id;
            return (
              <Link
                key={page.id}
                href={`/pages/${page.id}`}
                className={`sidebar-page-item ${isActive ? "active" : ""}`}
                onMouseEnter={() => setHoveredItemId(`page-${page.id}`)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                <button
                  className={`hover-menu-btn ${isHovered || isMenuOpen ? "visible" : ""}`}
                  onClick={(e) => handleMenuClick("page", page.id, e)}
                  title="옵션"
                >
                  ⋯
                </button>
                <span className="sidebar-page-icon">{page.icon || "📄"}</span>
                <span className="sidebar-page-title">{page.title}</span>
              </Link>
            );
          })
        )}
      </nav>

      <button
        className="sidebar-new-page"
        onClick={handleNewPage}
        disabled={isPending}
      >
        <span>+</span>
        <span>{isPending ? "생성 중..." : "새 페이지"}</span>
      </button>

      {/* Databases Section */}
      <div className="sidebar-section" style={{ marginTop: 8 }}>
        <div className="sidebar-section-title">DATABASES</div>
      </div>

      <nav className="sidebar-pages" style={{ flex: 1 }}>
        {databases.length === 0 ? (
          <div style={{ padding: "8px 14px", color: "var(--ink-tertiary)", fontSize: "13px" }}>
            데이터베이스가 없습니다
          </div>
        ) : (
          databases.map((db) => {
            const isActive = pathname === `/database/${db.id}`;
            const isHovered = hoveredItemId === `db-${db.id}`;
            const isMenuOpen = menuOpen?.type === "database" && menuOpen.id === db.id;
            return (
              <Link
                key={db.id}
                href={`/database/${db.id}`}
                className={`sidebar-page-item ${isActive ? "active" : ""}`}
                onMouseEnter={() => setHoveredItemId(`db-${db.id}`)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                <button
                  className={`hover-menu-btn ${isHovered || isMenuOpen ? "visible" : ""}`}
                  onClick={(e) => handleMenuClick("database", db.id, e)}
                  title="옵션"
                >
                  ⋯
                </button>
                <span className="sidebar-page-icon">{db.icon || "📊"}</span>
                <span className="sidebar-page-title">{db.title}</span>
              </Link>
            );
          })
        )}
      </nav>

      <button
        className="sidebar-new-page"
        onClick={handleNewDatabase}
        disabled={isPending}
      >
        <span>+</span>
        <span>{isPending ? "생성 중..." : "새 데이터베이스"}</span>
      </button>

      {/* Menu Portal */}
      {menuPortal}
    </aside>
  );
}
