import Sidebar from "@/components/layout/Sidebar";
import { getPages, createPage } from "@/actions/page.actions";
import { redirect } from "next/navigation";

export default async function Home() {
  const pages = await getPages();

  // 페이지가 있으면 첫 번째 페이지로 리디렉션
  if (pages.length > 0) {
    redirect(`/pages/${pages[0].id}`);
  }

  return (
    <div className="app-container">
      <Sidebar pages={pages} />
      <main className="main-content">
        <div className="empty-state">
          <div className="empty-state-icon">📓</div>
          <div className="empty-state-title">Notion-like Todo에 오신 것을 환영합니다</div>
          <div className="empty-state-description">
            왼쪽 사이드바에서 새 페이지를 만들어보세요
          </div>
          <form
            action={async () => {
              "use server";
              const page = await createPage({ title: "첫 번째 페이지" });
              redirect(`/pages/${page.id}`);
            }}
          >
            <button type="submit" className="btn btn-primary" style={{ marginTop: "16px" }}>
              + 첫 페이지 만들기
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
