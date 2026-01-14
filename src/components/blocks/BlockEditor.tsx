"use client";

import { useState, useCallback, useTransition } from "react";
import BlockRenderer from "./BlockRenderer";
import type { Block, BlockType, BlockProps } from "@/types/block";
import { createBlock } from "@/actions/block.actions";

interface BlockEditorProps {
  pageId: string;
  initialBlocks: Block[];
}

export default function BlockEditor({ pageId, initialBlocks }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleRefresh = useCallback(() => {
    // 실제로는 서버에서 새로고침
    window.location.reload();
  }, []);

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
    { type: "divider", label: "구분선", icon: "—" },
  ];

  return (
    <div className="blocks-container">
      {blocks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">비어있는 페이지</div>
          <div className="empty-state-description">
            아래 버튼을 클릭하거나 타이핑을 시작하세요
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: "16px" }}
            onClick={() => handleAddBlock("paragraph")}
          >
            + 블록 추가
          </button>
        </div>
      ) : (
        <>
          {blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              pageId={pageId}
              onUpdate={handleRefresh}
            />
          ))}

          {/* Add Block Button */}
          <div
            className="block"
            style={{
              opacity: 0.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 4px",
              color: "var(--text-muted)",
              fontSize: "14px",
            }}
            onClick={() => handleAddBlock("paragraph")}
          >
            <span>+</span>
            <span>블록 추가 또는 / 입력</span>
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
