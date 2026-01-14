"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import type { PageListItem } from "@/types/page";
import { createPage } from "@/actions/page.actions";

interface SidebarProps {
  pages: PageListItem[];
}

export default function Sidebar({ pages }: SidebarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleNewPage = () => {
    startTransition(async () => {
      await createPage();
    });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">📓 Notion Todo</span>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          className="sidebar-search-input"
          placeholder="검색..."
        />
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">PAGES</div>
      </div>

      <nav className="sidebar-pages">
        {pages.length === 0 ? (
          <div style={{ padding: "8px 14px", color: "var(--text-muted)", fontSize: "13px" }}>
            페이지가 없습니다
          </div>
        ) : (
          pages.map((page) => {
            const isActive = pathname === `/pages/${page.id}`;
            return (
              <Link
                key={page.id}
                href={`/pages/${page.id}`}
                className={`sidebar-page-item ${isActive ? "active" : ""}`}
              >
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
    </aside>
  );
}
