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
          minWidth: 160,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className="dropdown-item"
          onClick={handleDelete}
          style={{ color: "var(--destructive)", fontSize: "13px" }}
        >
          <span className="dropdown-item-icon" style={{ fontSize: "14px" }}>🗑️</span>
          <span>Delete</span>
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ flex: 1 }} /> {/* Spacer to push toggle to right, or keep it left? "System" removed. */}
        <ThemeToggle />
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          className="sidebar-search-input"
          placeholder="Search..."
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            borderBottom: "1px solid var(--border)",
            paddingLeft: 0,
            fontSize: "13px",
          }}
        />
      </div>

      <div className="sidebar-scroll-area" style={{ flex: 1, overflowY: "auto", paddingBottom: "20px" }}>
        {/* Graph View Link */}
        <div className="sidebar-section">
          <nav className="sidebar-list">
            <Link
              href="/graph"
              className={`sidebar-page-item ${pathname === "/graph" ? "active" : ""}`}
            >
              <span className="sidebar-page-icon">🕸️</span>
              <span className="sidebar-page-title">Graph View</span>
            </Link>
          </nav>
        </div>
        {/* Pages Section */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Private</div>
          <nav className="sidebar-list">
            {pages.length === 0 ? (
              <div className="sidebar-empty-hint">No pages</div>
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
                      className={`sliding-menu-btn ${isHovered || isMenuOpen ? "visible" : ""}`}
                      onClick={(e) => handleMenuClick("page", page.id, e)}
                    >
                      ⋮
                    </button>
                    <span className="sidebar-page-icon">{page.icon || "📄"}</span>
                    <span className="sidebar-page-title">{page.title || "Untitled"}</span>
                  </Link>
                );
              })
            )}
            <button className="sidebar-new-page" onClick={handleNewPage} disabled={isPending}>
              + New Page
            </button>
          </nav>
        </div>

        {/* Databases Section */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Databases</div>
          <nav className="sidebar-list">
            {databases.length === 0 ? (
              <div className="sidebar-empty-hint">No databases</div>
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
                      className={`sliding-menu-btn ${isHovered || isMenuOpen ? "visible" : ""}`}
                      onClick={(e) => handleMenuClick("database", db.id, e)}
                    >
                      ⋮
                    </button>
                    <span className="sidebar-page-icon">{db.icon || "📊"}</span>
                    <span className="sidebar-page-title">{db.title || "Untitled Database"}</span>
                  </Link>
                );
              })
            )}
            <button className="sidebar-new-page" onClick={handleNewDatabase} disabled={isPending}>
              + New Database
            </button>
          </nav>
        </div>
      </div>

      {menuPortal}
    </aside>
  );
}
