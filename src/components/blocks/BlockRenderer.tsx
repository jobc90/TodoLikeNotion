"use client";

import { useState, useCallback, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import sanitizeHtml from "sanitize-html";
import type { Block, BlockType, BlockProps } from "@/types/block";
import { updateBlock, createBlock, deleteBlock } from "@/actions/block.actions";
import SlashCommands from "./SlashCommands";

// HTML sanitization options - allow basic formatting tags
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: ["b", "i", "u", "em", "strong", "code", "a", "br", "span"],
  allowedAttributes: {
    a: ["href", "target"],
    span: ["style"],
  },
  allowedStyles: {
    span: {
      "background-color": [/.*/],
      color: [/.*/],
    },
  },
};

interface BlockRendererProps {
  block: Block;
  pageId: string;
  onUpdate?: () => void;
  onDelete?: (blockId: string) => void;
  onMoveUp?: (blockId: string) => void;
  onMoveDown?: (blockId: string) => void;
  isDragging?: boolean;
  dragControls?: any;
}

export default function BlockRenderer({
  block,
  pageId,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isDragging = false,
  dragControls: externalDragControls,
}: BlockRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localProps, setLocalProps] = useState<BlockProps>(block.props);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [slashQuery, setSlashQuery] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<string>(block.props.text || "");
  const localDragControls = useDragControls();
  const dragControls = externalDragControls || localDragControls;

  // Sync local state when block props change from server
  useEffect(() => {
    setLocalProps(block.props);
    textRef.current = block.props.text || "";
  }, [block.props]);

  // Save text when component unmounts or before page navigation
  useEffect(() => {
    const saveCurrentText = () => {
      const currentText = textRef.current;
      if (currentText !== block.props.text) {
        // Use synchronous update for beforeunload
        updateBlock(block.id, { props: { text: currentText } });
      }
    };

    // Handle browser navigation/close
    const handleBeforeUnload = () => {
      saveCurrentText();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup - save on unmount (page navigation within app)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveCurrentText();
    };
  }, [block.id, block.props.text]);

  const handleContentChange = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const newText = e.currentTarget.textContent || "";
      textRef.current = newText;

      // Detect slash command at start or after space
      const selection = window.getSelection();
      if (!selection || !contentRef.current) return;

      const text = newText;
      const cursorPos = selection.anchorOffset;

      // Check if "/" was just typed at start or after space
      if (text.endsWith("/") || text.includes(" /")) {
        const lastSlashIndex = text.lastIndexOf("/");
        const beforeSlash = text.substring(0, lastSlashIndex);

        // Only show menu if "/" is at start or after space
        if (lastSlashIndex === 0 || beforeSlash.endsWith(" ")) {
          const rect = contentRef.current.getBoundingClientRect();
          setSlashMenuPosition({
            x: rect.left,
            y: rect.bottom + 4,
          });
          setSlashQuery("");
          setShowSlashMenu(true);
        }
      } else if (showSlashMenu) {
        // Update search query if menu is already open
        const lastSlashIndex = text.lastIndexOf("/");
        if (lastSlashIndex !== -1) {
          const query = text.substring(lastSlashIndex + 1);
          setSlashQuery(query);
        } else {
          setShowSlashMenu(false);
        }
      }
    },
    [showSlashMenu]
  );

  const handleBlur = useCallback(async () => {
    setIsEditing(false);
    const newText = textRef.current;
    if (newText !== block.props.text) {
      setLocalProps((prev) => ({ ...prev, text: newText }));
      await updateBlock(block.id, { props: { text: newText } });
    }
  }, [block.id, block.props.text]);

  const handleCheckboxToggle = useCallback(async () => {
    const newChecked = !localProps.checked;
    setLocalProps((prev) => ({ ...prev, checked: newChecked }));
    await updateBlock(block.id, { props: { checked: newChecked } });
  }, [block.id, localProps.checked]);

  const handleToggleExpand = useCallback(async () => {
    const newExpanded = !localProps.expanded;
    setLocalProps((prev) => ({ ...prev, expanded: newExpanded }));
    await updateBlock(block.id, { props: { expanded: newExpanded } });
  }, [block.id, localProps.expanded]);

  const handleSlashCommandSelect = useCallback(
    async (type: BlockType) => {
      setShowSlashMenu(false);

      // Remove the "/" and any text after it
      const text = textRef.current;
      const lastSlashIndex = text.lastIndexOf("/");
      const textBeforeSlash = text.substring(0, lastSlashIndex);

      // Update the current block's type and text
      await updateBlock(block.id, {
        type,
        props: { text: textBeforeSlash.trim() },
      });

      onUpdate?.();

      // Focus back on the content
      setTimeout(() => {
        contentRef.current?.focus();
      }, 100);
    },
    [block.id, onUpdate]
  );

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent<HTMLDivElement>) => {
      // Don't handle Enter/Escape/Arrow keys if slash menu is open
      if (
        showSlashMenu &&
        (e.key === "Enter" ||
          e.key === "Escape" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowDown")
      ) {
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        // Save current content first
        const currentText = textRef.current;
        if (currentText !== block.props.text) {
          await updateBlock(block.id, { props: { text: currentText } });
        }
        // Create new block
        await createBlock({
          pageId,
          type: "paragraph",
          order: block.order + 1,
        });
        onUpdate?.();
      } else if (e.key === "Backspace" && textRef.current === "") {
        e.preventDefault();
        // Delete empty block
        await deleteBlock(block.id);
        onUpdate?.();
      }
    },
    [pageId, block.order, block.id, block.props.text, onUpdate, showSlashMenu]
  );

  // Context menu handlers
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  }, []);

  const handleDeleteBlock = useCallback(async () => {
    setShowContextMenu(false);
    await deleteBlock(block.id);
    onUpdate?.();
  }, [block.id, onUpdate]);

  const renderBlockContent = () => {
    const getCommonProps = (additionalClassName?: string) => ({
      ref: contentRef,
      contentEditable: true,
      suppressContentEditableWarning: true,
      className: `block-content ${additionalClassName || ""} ${block.type === "todo" && localProps.checked ? "checked" : ""}`.trim(),
      "data-placeholder": getPlaceholder(block.type),
      onInput: handleContentChange,
      onBlur: handleBlur,
      onFocus: () => setIsEditing(true),
      onKeyDown: handleKeyDown,
      dangerouslySetInnerHTML: { __html: sanitizeHtml(block.props.text || "", sanitizeOptions) },
    });

    switch (block.type) {
      case "heading1":
        return <div {...getCommonProps("block-heading1")} />;
      case "heading2":
        return <div {...getCommonProps("block-heading2")} />;
      case "heading3":
        return <div {...getCommonProps("block-heading3")} />;
      case "todo":
        return (
          <div className="block-todo">
            <div
              className={`block-todo-checkbox ${localProps.checked ? "checked" : ""}`}
              onClick={handleCheckboxToggle}
            />
            <div {...getCommonProps()} />
          </div>
        );
      case "toggle":
        return (
          <div className="block-toggle">
            <div className="block-toggle-header" onClick={handleToggleExpand}>
              <motion.div
                className={`block-toggle-icon ${localProps.expanded ? "expanded" : ""}`}
                animate={{ rotate: localProps.expanded ? 90 : 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                ▸
              </motion.div>
              <div {...getCommonProps()} onClick={(e) => e.stopPropagation()} />
            </div>
            <AnimatePresence initial={false}>
              {localProps.expanded && (
                <motion.div
                  className="block-toggle-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div style={{ padding: "8px 0", color: "var(--text-muted)", fontSize: "14px" }}>
                    Nested content coming soon...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      case "bullet":
        return (
          <div className="block-bullet">
            <div {...getCommonProps()} />
          </div>
        );
      case "quote":
        return <div {...getCommonProps("block-quote")} />;
      case "divider":
        return <div className="block-divider" />;
      default:
        return <div {...getCommonProps("block-paragraph")} />;
    }
  };

  return (
    <div className={`block ${isDragging ? "dragging" : ""}`} onContextMenu={handleContextMenu}>
      <div
        className="block-handle"
        title="드래그하여 이동"
        onPointerDown={(e) => dragControls.start(e)}
        style={{ touchAction: "none" }}
      >
        ⋮⋮
      </div>
      {renderBlockContent()}

      {/* Slash Commands Menu */}
      {showSlashMenu && (
        <SlashCommands
          onSelect={handleSlashCommandSelect}
          onClose={() => setShowSlashMenu(false)}
          position={slashMenuPosition}
          searchQuery={slashQuery}
        />
      )}

      {/* Block Context Menu */}
      {showContextMenu && (
        <>
          <div
            className="dropdown-overlay"
            onClick={() => setShowContextMenu(false)}
            style={{ background: "transparent" }}
          />
          <div
            className="dropdown-menu"
            style={{
              position: "fixed",
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
              minWidth: 160,
            }}
          >
            <div
              className="dropdown-item"
              onClick={handleDeleteBlock}
              style={{ color: "var(--destructive)" }}
            >
              <span className="dropdown-item-icon">🗑️</span>
              <span>삭제</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getPlaceholder(type: BlockType): string {
  switch (type) {
    case "heading1":
      return "제목 1";
    case "heading2":
      return "제목 2";
    case "heading3":
      return "제목 3";
    case "todo":
      return "할 일";
    case "toggle":
      return "토글";
    case "bullet":
      return "목록";
    case "quote":
      return "인용";
    default:
      return "'/' 명령어 또는 텍스트 입력...";
  }
}
