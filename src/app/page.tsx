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
          <div className="empty-state-icon">✨</div>
          <div className="empty-state-title">Todo System</div>
          <div className="empty-state-description">
            Create a page to get started
          </div>
          <form
            action={async () => {
              "use server";
              const page = await createPage({ title: "Untitled" });
              redirect(`/pages/${page.id}`);
            }}
          >
            <button type="submit" className="btn btn-secondary" style={{ marginTop: "24px" }}>
              Create Page
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
