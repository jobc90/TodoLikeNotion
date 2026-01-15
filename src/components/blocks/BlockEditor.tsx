"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Reorder } from "framer-motion";
import BlockRenderer from "./BlockRenderer";
import FormattingToolbar from "./FormattingToolbar";
import EmptyState from "@/components/ui/EmptyState";
import type { Block, BlockType } from "@/types/block";
import { createBlock, deleteBlockQuiet, reorderBlocksQuiet } from "@/actions/block.actions";

interface BlockEditorProps {
  pageId: string;
  initialBlocks: Block[];
}

export default function BlockEditor({ pageId, initialBlocks }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const router = useRouter();

  // Use router.refresh() instead of window.location.reload()
  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  // Handle block deletion with optimistic update
  // router.refresh() 제거 - 로컬 상태가 이미 최신이므로 불필요
  const handleDeleteBlock = useCallback(
    async (blockId: string) => {
      // Optimistic update - 즉시 UI 반영
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));

      // 서버만 동기화 (revalidatePath 없는 경량 액션)
      startTransition(async () => {
        await deleteBlockQuiet(blockId);
        // router.refresh() 제거!
      });
    },
    []
  );

  // Handle drag and drop reorder
  // router.refresh() 제거 - 로컬 상태가 이미 최신이므로 불필요
  const handleReorder = useCallback(
    (newBlocks: Block[]) => {
      // Optimistic update - 즉시 UI 반영
      setBlocks(newBlocks);

      // 서버만 동기화 (revalidatePath 없는 경량 액션)
      startTransition(async () => {
        const blockOrders = newBlocks.map((b, idx) => ({ id: b.id, order: idx }));
        await reorderBlocksQuiet(blockOrders);
        // router.refresh() 제거!
      });
    },
    []
  );

  // Handle block reorder with optimistic update (for keyboard controls)
  // router.refresh() 제거 - 로컬 상태가 이미 최신이므로 불필요
  const handleMoveBlock = useCallback(
    async (blockId: string, direction: "up" | "down") => {
      const currentIndex = blocks.findIndex((b) => b.id === blockId);
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return;

      // Optimistic update - 즉시 UI 반영
      const newBlocks = [...blocks];
      const [removed] = newBlocks.splice(currentIndex, 1);
      newBlocks.splice(newIndex, 0, removed);
      setBlocks(newBlocks);

      // 서버만 동기화 (revalidatePath 없는 경량 액션)
      startTransition(async () => {
        const blockOrders = newBlocks.map((b, idx) => ({ id: b.id, order: idx }));
        await reorderBlocksQuiet(blockOrders);
        // router.refresh() 제거!
      });
    },
    [blocks]
  );

  const handleAddBlock = useCallback(
    async (type: BlockType = "paragraph") => {
      startTransition(async () => {
        const newBlock = await createBlock({
          pageId,
          type,
          order: blocks.length,
        });
        setBlocks((prev) => [...prev, newBlock as unknown as Block]);
        setShowMenu(false);
      });
    },
    [pageId, blocks.length]
  );

  const blockTypes: { type: BlockType; label: string; icon: string }[] = [
    { type: "paragraph", label: "Text", icon: "T" },
    { type: "heading1", label: "Heading 1", icon: "H1" },
    { type: "heading2", label: "Heading 2", icon: "H2" },
    { type: "heading3", label: "Heading 3", icon: "H3" },
    { type: "todo", label: "To-do", icon: "☑" },
    { type: "bullet", label: "Bulleted List", icon: "•" },
    { type: "quote", label: "Quote", icon: "“" },
    { type: "divider", label: "Divider", icon: "—" },
  ];

  return (
    <div className="blocks-container">
      <FormattingToolbar />

      {blocks.length === 0 ? (
        <EmptyState
          title="Empty Page"
          description="Type '/' for commands"
          icon="📄"
          action={{
            label: "Add Text Block",
            onClick: () => handleAddBlock("paragraph"),
          }}
        />
      ) : (
        <>
          <Reorder.Group
            axis="y"
            values={blocks}
            onReorder={handleReorder}
            layoutScroll
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {blocks.map((block, index) => (
              <Reorder.Item
                key={block.id}
                value={block}
                onDragStart={() => setDraggedBlockId(block.id)}
                onDragEnd={() => setDraggedBlockId(null)}
                initial={false}
                style={{ listStyle: "none", position: "relative" }}
                whileDrag={{
                  scale: 1.02,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  zIndex: 50,
                  cursor: "grabbing",
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              >
                <BlockRenderer
                  block={block}
                  pageId={pageId}
                  onUpdate={handleRefresh}
                  onDelete={handleDeleteBlock}
                  onMoveUp={index > 0 ? () => handleMoveBlock(block.id, "up") : undefined}
                  onMoveDown={index < blocks.length - 1 ? () => handleMoveBlock(block.id, "down") : undefined}
                  isDragging={draggedBlockId === block.id}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* Subtle Add Block Trigger */}
          <div
            className="block-add-trigger"
            onClick={() => handleAddBlock("paragraph")}
            style={{
              padding: "12px 0",
              opacity: 0,
              cursor: "text",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
          >
            <span style={{ color: "var(--ink-tertiary)", fontSize: "14px" }}>+ Click to add block</span>
          </div>
        </>
      )}

      {/* Block Type Menu */}
      {showMenu && (
        <div
          className="block-menu"
          style={{
            position: "absolute",
            top: menuPosition.top,
            left: menuPosition.left,
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "4px",
            zIndex: 1000,
            minWidth: "180px",
          }}
        >
          {blockTypes.map(({ type, label, icon }) => (
            <button
              key={type}
              className="btn btn-ghost"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                padding: "6px 10px",
                fontSize: "13px",
                gap: "8px",
              }}
              onClick={() => handleAddBlock(type)}
            >
              <span style={{ width: "20px", textAlign: "center", color: "var(--ink-secondary)" }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
