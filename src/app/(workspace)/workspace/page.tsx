import Link from "next/link";
import WorkspaceLayout from "@/components/layout/WorkspaceLayout";
import { getPages } from "@/actions/page.actions";
import { getDatabases } from "@/actions/database.actions";

export const dynamic = "force-dynamic";

export default async function WorkspaceIndex() {
  const [pages, databases] = await Promise.all([
    getPages(),
    getDatabases(),
  ]);

  return (
    <WorkspaceLayout pages={pages} databases={databases}>
      <div className="workspace-index">
        <h1 className="workspace-title">Scripts & Documents</h1>
        <p className="workspace-description">
          프로젝트의 모든 문서와 대본을 관리하세요.
        </p>

        {pages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📜</div>
            <h2>아직 작성된 문서가 없습니다</h2>
            <p>사이드바에서 새 페이지를 만들어 시작하세요.</p>
          </div>
        ) : (
          <div className="page-grid">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/workspace/${page.id}`}
                className="page-card"
              >
                <span className="page-icon">{page.icon || "📄"}</span>
                <span className="page-title">{page.title || "제목 없음"}</span>
                <span className="page-date">
                  {new Date(page.updatedAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
