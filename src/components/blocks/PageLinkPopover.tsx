"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { searchPages, createPage } from "@/actions/page.actions";
import type { PageListItem } from "@/types/page";

interface PageLinkPopoverProps {
  position: { x: number; y: number };
  searchQuery: string;
  onSelect: (pageTitle: string, pageId: string) => void;
  onClose: () => void;
}

export default function PageLinkPopover({
  position,
  searchQuery,
  onSelect,
  onClose,
}: PageLinkPopoverProps) {
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Search pages based on query
  useEffect(() => {
    const loadPages = async () => {
      setIsLoading(true);
      try {
        const results = await searchPages(searchQuery);
        setPages(results);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Failed to search pages:", error);
        setPages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPages();
  }, [searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < pages.length ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex === pages.length) {
          // Create new page
          handleCreateNewPage();
        } else if (pages[selectedIndex]) {
          // Select existing page
          onSelect(pages[selectedIndex].title, pages[selectedIndex].id);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pages, selectedIndex, onSelect, onClose, searchQuery]);

  const handleCreateNewPage = async () => {
    try {
      const newPage = await createPage({
        title: searchQuery || "Untitled",
        icon: "📄",
      });
      onSelect(newPage.title, newPage.id);
    } catch (error) {
      console.error("Failed to create page:", error);
    }
  };

  const handlePageClick = (page: PageListItem) => {
    onSelect(page.title, page.id);
  };

  return (
    <>
      <div
        className="dropdown-overlay"
        onClick={onClose}
        style={{ background: "transparent" }}
      />
      <div
        ref={popoverRef}
        className="page-link-popover"
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          minWidth: 280,
          maxHeight: 320,
          overflowY: "auto",
        }}
      >
        {isLoading ? (
          <div className="page-link-popover-loading">Searching...</div>
        ) : (
          <>
            {pages.length > 0 ? (
              <>
                <div className="page-link-popover-section-title">Pages</div>
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className={`page-link-popover-item ${
                      index === selectedIndex ? "selected" : ""
                    }`}
                    onClick={() => handlePageClick(page)}
                  >
                    <span className="page-link-popover-icon">
                      {page.icon || "📄"}
                    </span>
                    <span className="page-link-popover-title">{page.title}</span>
                  </div>
                ))}
              </>
            ) : searchQuery ? (
              <div className="page-link-popover-empty">
                No pages found matching "{searchQuery}"
              </div>
            ) : (
              <div className="page-link-popover-empty">
                Type to search pages...
              </div>
            )}

            {searchQuery && (
              <>
                <div className="page-link-popover-divider" />
                <div
                  className={`page-link-popover-item page-link-popover-create ${
                    selectedIndex === pages.length ? "selected" : ""
                  }`}
                  onClick={handleCreateNewPage}
                >
                  <span className="page-link-popover-icon">+</span>
                  <span className="page-link-popover-title">
                    Create "{searchQuery}"
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
