import { notFound } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import BlockEditor from "@/components/blocks/BlockEditor";
import PageHeader from "./PageHeader";
import { getPages, getPageWithBlocks } from "@/actions/page.actions";
import type { Block, BlockProps } from "@/types/block";

interface PageProps {
  params: Promise<{ pageId: string }>;
}

export default async function PageView({ params }: PageProps) {
  const { pageId } = await params;
  const [pages, pageData] = await Promise.all([
    getPages(),
    getPageWithBlocks(pageId),
  ]);

  if (!pageData) {
    notFound();
  }

  // blocks props 파싱
  const blocks: Block[] = pageData.blocks.map((block) => ({
    ...block,
    props: JSON.parse(block.props) as BlockProps,
  }));

  return (
    <div className="app-container">
      <Sidebar pages={pages} />
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
