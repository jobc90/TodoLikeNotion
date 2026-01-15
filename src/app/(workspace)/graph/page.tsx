import { getPages, getPageWithBlocks } from "@/actions/page.actions";
import { getDatabases } from "@/actions/database.actions";
import GraphView from "@/components/graph/GraphView";
import WorkspaceLayout from "@/components/layout/WorkspaceLayout";

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
  // Fetch all pages and databases
  const [pages, databases] = await Promise.all([getPages(), getDatabases()]);

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
    <WorkspaceLayout pages={pages} databases={databases}>
      <div className="graph-page">
        <header className="graph-header">
          <h1 className="graph-title">Graph View</h1>
          <p className="graph-subtitle">
            Visualize connections between pages
          </p>
        </header>
        <div className="graph-container">
          <GraphView nodes={nodes} edges={edges} />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
