'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { PageListItem } from '@/types/page';
import type { DatabaseListItem } from '@/types/database';
import { createPage, deletePage } from '@/actions/page.actions';
import { createDatabase, deleteDatabase } from '@/actions/database.actions';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  pages: PageListItem[];
  databases: DatabaseListItem[];
}

// Icons - Cinematic Style (thin strokes, elegant)
const ScriptIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8M16 17H8M10 9H8" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const GraphIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

const ChevronIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {direction === 'left' ? (
      <path d="M15 18l-6-6 6-6" />
    ) : (
      <path d="M9 18l6-6-6-6" />
    )}
  </svg>
);

const MoreIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

export default function WorkspaceLayout({ children, pages, databases }: WorkspaceLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    type: 'page' | 'database';
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const handleCreatePage = useCallback(() => {
    startTransition(async () => {
      const page = await createPage();
      router.push(`/workspace/${page.id}`);
    });
  }, [router]);

  const handleCreateDatabase = useCallback(() => {
    startTransition(async () => {
      const db = await createDatabase();
      router.push(`/workspace/database/${db.id}`);
    });
  }, [router]);

  const handleContextMenu = useCallback((
    e: React.MouseEvent,
    type: 'page' | 'database',
    id: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ type, id, x: e.clientX, y: e.clientY });
  }, []);

  const handleDelete = useCallback(async () => {
    if (!contextMenu) return;
    const { type, id } = contextMenu;
    setContextMenu(null);

    startTransition(async () => {
      if (type === 'page') {
        await deletePage(id);
        if (pathname === `/workspace/${id}`) router.push('/workspace');
      } else {
        await deleteDatabase(id);
        if (pathname === `/workspace/database/${id}`) router.push('/workspace');
      }
      router.refresh();
    });
  }, [contextMenu, pathname, router]);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="workspace-root">
      {/* Ambient Film Grain Overlay */}
      <div className="workspace-grain" />

      {/* Sidebar */}
      <aside className={`workspace-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Header */}
        <div className="ws-sidebar-header">
          <Link href="/" className="ws-back-link" title="대시보드로 돌아가기">
            <HomeIcon />
            {!sidebarCollapsed && <span>대시보드</span>}
          </Link>
          <button
            className="ws-collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? '펼치기' : '접기'}
          >
            <ChevronIcon direction={sidebarCollapsed ? 'right' : 'left'} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="ws-sidebar-nav">
          {/* Quick Links */}
          <div className="ws-nav-section">
            <Link
              href="/graph"
              className={`ws-nav-item ${isActive('/graph') ? 'active' : ''}`}
              title={sidebarCollapsed ? '그래프 뷰' : undefined}
            >
              <span className="ws-nav-icon"><GraphIcon /></span>
              {!sidebarCollapsed && <span className="ws-nav-label">그래프 뷰</span>}
            </Link>
          </div>

          {/* Pages Section */}
          <div className="ws-nav-section">
            {!sidebarCollapsed && (
              <div className="ws-section-header">
                <span className="ws-section-title">SCRIPTS</span>
                <button
                  className="ws-add-btn"
                  onClick={handleCreatePage}
                  disabled={isPending}
                  title="새 페이지"
                >
                  <PlusIcon />
                </button>
              </div>
            )}
            <div className="ws-nav-list">
              {pages.length === 0 ? (
                !sidebarCollapsed && (
                  <div className="ws-empty-hint">아직 페이지가 없습니다</div>
                )
              ) : (
                pages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/workspace/${page.id}`}
                    className={`ws-nav-item ${isActive(`/workspace/${page.id}`) ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredItem(`page-${page.id}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onContextMenu={(e) => handleContextMenu(e, 'page', page.id)}
                    title={sidebarCollapsed ? page.title || '제목 없음' : undefined}
                  >
                    <span className="ws-nav-icon">
                      {page.icon || <ScriptIcon />}
                    </span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="ws-nav-label">{page.title || '제목 없음'}</span>
                        {hoveredItem === `page-${page.id}` && (
                          <button
                            className="ws-item-menu"
                            onClick={(e) => handleContextMenu(e, 'page', page.id)}
                          >
                            <MoreIcon />
                          </button>
                        )}
                      </>
                    )}
                  </Link>
                ))
              )}
              {sidebarCollapsed && (
                <button
                  className="ws-nav-item ws-add-collapsed"
                  onClick={handleCreatePage}
                  disabled={isPending}
                  title="새 페이지"
                >
                  <PlusIcon />
                </button>
              )}
            </div>
          </div>

          {/* Databases Section */}
          <div className="ws-nav-section">
            {!sidebarCollapsed && (
              <div className="ws-section-header">
                <span className="ws-section-title">DATABASES</span>
                <button
                  className="ws-add-btn"
                  onClick={handleCreateDatabase}
                  disabled={isPending}
                  title="새 데이터베이스"
                >
                  <PlusIcon />
                </button>
              </div>
            )}
            <div className="ws-nav-list">
              {databases.length === 0 ? (
                !sidebarCollapsed && (
                  <div className="ws-empty-hint">아직 데이터베이스가 없습니다</div>
                )
              ) : (
                databases.map((db) => (
                  <Link
                    key={db.id}
                    href={`/workspace/database/${db.id}`}
                    className={`ws-nav-item ${isActive(`/workspace/database/${db.id}`) ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredItem(`db-${db.id}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onContextMenu={(e) => handleContextMenu(e, 'database', db.id)}
                    title={sidebarCollapsed ? db.title || '제목 없음' : undefined}
                  >
                    <span className="ws-nav-icon">
                      {db.icon || <DatabaseIcon />}
                    </span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="ws-nav-label">{db.title || '제목 없음'}</span>
                        {hoveredItem === `db-${db.id}` && (
                          <button
                            className="ws-item-menu"
                            onClick={(e) => handleContextMenu(e, 'database', db.id)}
                          >
                            <MoreIcon />
                          </button>
                        )}
                      </>
                    )}
                  </Link>
                ))
              )}
              {sidebarCollapsed && (
                <button
                  className="ws-nav-item ws-add-collapsed"
                  onClick={handleCreateDatabase}
                  disabled={isPending}
                  title="새 데이터베이스"
                >
                  <DatabaseIcon />
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Footer - Subtle branding */}
        <div className="ws-sidebar-footer">
          {!sidebarCollapsed && (
            <div className="ws-footer-brand">
              <span className="ws-footer-line" />
              <span className="ws-footer-text">SCREENPLAY</span>
              <span className="ws-footer-line" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="workspace-main">
        <div className="workspace-content">
          {children}
        </div>
      </main>

      {/* Context Menu Portal */}
      {contextMenu && (
        <>
          <div
            className="ws-context-overlay"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="ws-context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button className="ws-context-item delete" onClick={handleDelete}>
              삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
}
