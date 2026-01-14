import { notFound } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import BlockEditor from "@/components/blocks/BlockEditor";
import PageHeader from "./PageHeader";
import { getPages, getPageWithBlocks } from "@/actions/page.actions";
import { getDatabases } from "@/actions/database.actions";
import type { Block, BlockProps } from "@/types/block";

interface PageProps {
  params: Promise<{ pageId: string }>;
}

export default async function PageView({ params }: PageProps) {
  const { pageId } = await params;
  const [pages, databases, pageData] = await Promise.all([
    getPages(),
    getDatabases(),
    getPageWithBlocks(pageId),
  ]);

  if (!pageData) {
    notFound();
  }

  // blocks props 파싱
  const blocks = pageData.blocks.map((block) => ({
    ...block,
    type: block.type as Block["type"],
    props: JSON.parse(block.props) as BlockProps,
  }));

  return (
    <div className="app-container">
      <Sidebar pages={pages} databases={databases} />
      <main className="main-content">
        <PageHeader
          pageId={pageData.id}
          title={pageData.title}
          icon={pageData.icon}
        />
        <BlockEditor pageId={pageData.id} initialBlocks={blocks} />
      </main>
    </div>
  );
}
