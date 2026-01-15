import { getPages, getPageWithBlocks } from "@/actions/page.actions";
import GraphView from "@/components/graph/GraphView";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface GraphNode {
  id: string;
  title: string;
  icon?: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

// Parse [[Page Name]] links from block text
function parsePageLinks(text: string): string[] {
  const linkPattern = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    links.push(match[1]);
  }

  return links;
}

export default async function GraphPage() {
  // Fetch all pages
  const pages = await getPages();

  // Create node map for quick lookup
  const nodeMap = new Map<string, GraphNode>();
  const titleToIdMap = new Map<string, string>();

  pages.forEach((page) => {
    nodeMap.set(page.id, {
      id: page.id,
      title: page.title || "Untitled",
      icon: page.icon || "📄",
    });
    titleToIdMap.set(page.title || "Untitled", page.id);
  });

  // Fetch all pages with blocks to extract links
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>(); // To avoid duplicate edges

  await Promise.all(
    pages.map(async (page) => {
      const pageWithBlocks = await getPageWithBlocks(page.id);
      if (!pageWithBlocks?.blocks) return;

      // Extract links from all blocks
      for (const block of pageWithBlocks.blocks) {
        let props;
        try {
          props = typeof block.props === "string" ? JSON.parse(block.props) : block.props;
        } catch {
          continue;
        }

        const text = props.text || "";
        const linkedPageTitles = parsePageLinks(text);

        // Create edges for each linked page
        for (const linkedTitle of linkedPageTitles) {
          const targetId = titleToIdMap.get(linkedTitle);
          if (targetId && targetId !== page.id) {
            const edgeKey = `${page.id}->${targetId}`;
            if (!edgeSet.has(edgeKey)) {
              edges.push({
                source: page.id,
                target: targetId,
              });
              edgeSet.add(edgeKey);
            }
          }
        }
      }
    })
  );

  const nodes = Array.from(nodeMap.values());

  return (
    <div className="h-screen w-full">
      <div className="flex h-full flex-col">
        <header className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Graph View</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Visualize connections between pages
          </p>
        </header>
        <div className="flex-1">
          <GraphView nodes={nodes} edges={edges} />
        </div>
      </div>
    </div>
  );
}
