"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Reorder } from "framer-motion";
import BlockRenderer from "./BlockRenderer";
import FormattingToolbar from "./FormattingToolbar";
import type { Block, BlockType } from "@/types/block";
import { createBlock, deleteBlock, reorderBlocks } from "@/actions/block.actions";

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
  const handleDeleteBlock = useCallback(
    async (blockId: string) => {
      // Optimistic update
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));

      startTransition(async () => {
        await deleteBlock(blockId);
        router.refresh();
      });
    },
    [router]
  );

  // Handle drag and drop reorder
  const handleReorder = useCallback(
    (newBlocks: Block[]) => {
      setBlocks(newBlocks);

      // Debounce server update
      startTransition(async () => {
        const blockOrders = newBlocks.map((b, idx) => ({ id: b.id, order: idx }));
        await reorderBlocks(pageId, blockOrders);
        router.refresh();
      });
    },
    [pageId, router]
  );

  // Handle block reorder with optimistic update (for keyboard controls)
  const handleMoveBlock = useCallback(
    async (blockId: string, direction: "up" | "down") => {
      const currentIndex = blocks.findIndex((b) => b.id === blockId);
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return;

      // Optimistic update
      const newBlocks = [...blocks];
      const [removed] = newBlocks.splice(currentIndex, 1);
      newBlocks.splice(newIndex, 0, removed);
      setBlocks(newBlocks);

      // Update orders on server
      startTransition(async () => {
        const blockOrders = newBlocks.map((b, idx) => ({ id: b.id, order: idx }));
        await reorderBlocks(pageId, blockOrders);
        router.refresh();
      });
    },
    [blocks, pageId, router]
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
    { type: "paragraph", label: "텍스트", icon: "📝" },
    { type: "heading1", label: "제목 1", icon: "H1" },
    { type: "heading2", label: "제목 2", icon: "H2" },
    { type: "heading3", label: "제목 3", icon: "H3" },
    { type: "todo", label: "할 일", icon: "☑️" },
    { type: "bullet", label: "글머리 기호", icon: "•" },
    { type: "quote", label: "인용", icon: "❝" },
    { type: "divider", label: "구분선", icon: "➖" },
  ];

  return (
    <div className="blocks-container">
      <FormattingToolbar />

      {blocks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">빈 페이지</div>
          <div className="empty-state-description">
            Enter를 눌러 작성하거나, /를 입력해 명령어를 사용하세요
          </div>
          <button
            className="btn btn-secondary"
            style={{ marginTop: "24px" }}
            onClick={() => handleAddBlock("paragraph")}
          >
            블록 추가
          </button>
        </div>
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
                style={{ listStyle: "none" }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
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

          {/* Add Block Button */}
          <div
            className="block"
            style={{
              cursor: "pointer",
              padding: "8px 0",
              color: "var(--ink-tertiary)",
              fontSize: "14px",
            }}
            onClick={() => handleAddBlock("paragraph")}
          >
            <span style={{ opacity: 0.6 }}>+</span>
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
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            padding: "4px",
            zIndex: 1000,
          }}
        >
          {blockTypes.map(({ type, label, icon }) => (
            <button
              key={type}
              className="btn btn-ghost"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                padding: "8px 12px",
              }}
              onClick={() => handleAddBlock(type)}
            >
              <span style={{ width: "24px" }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
