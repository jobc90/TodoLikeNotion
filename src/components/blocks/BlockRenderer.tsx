"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import type { Block, BlockType, BlockProps } from "@/types/block";
import { updateBlock, createBlock, deleteBlock } from "@/actions/block.actions";

interface BlockRendererProps {
  block: Block;
  pageId: string;
  onUpdate?: () => void;
}

export default function BlockRenderer({ block, pageId, onUpdate }: BlockRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localProps, setLocalProps] = useState<BlockProps>(block.props);

  const handleContentChange = useCallback(
    async (newText: string) => {
      setLocalProps((prev) => ({ ...prev, text: newText }));
    },
    []
  );

  const handleBlur = useCallback(async () => {
    setIsEditing(false);
    if (localProps.text !== block.props.text) {
      await updateBlock(block.id, { props: { text: localProps.text } });
      onUpdate?.();
    }
  }, [block.id, block.props.text, localProps.text, onUpdate]);

  const handleCheckboxToggle = useCallback(async () => {
    const newChecked = !localProps.checked;
    setLocalProps((prev) => ({ ...prev, checked: newChecked }));
    await updateBlock(block.id, { props: { checked: newChecked } });
    onUpdate?.();
  }, [block.id, localProps.checked, onUpdate]);

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        // 새 블록 생성
        await createBlock({
          pageId,
          type: "paragraph",
          order: block.order + 1,
        });
        onUpdate?.();
      } else if (e.key === "Backspace" && localProps.text === "") {
        e.preventDefault();
        // 빈 블록 삭제
        await deleteBlock(block.id);
        onUpdate?.();
      }
    },
    [pageId, block.order, block.id, localProps.text, onUpdate]
  );

  const renderBlockContent = () => {
    const commonProps = {
      contentEditable: true,
      suppressContentEditableWarning: true,
      className: `block-content ${block.type === "todo" && localProps.checked ? "checked" : ""}`,
      "data-placeholder": getPlaceholder(block.type),
      onInput: (e: React.FormEvent<HTMLDivElement>) => {
        handleContentChange(e.currentTarget.textContent || "");
      },
      onBlur: handleBlur,
      onFocus: () => setIsEditing(true),
      onKeyDown: handleKeyDown,
    };

    switch (block.type) {
      case "heading1":
        return (
          <div className="block-heading1" {...commonProps}>
            {localProps.text}
          </div>
        );
      case "heading2":
        return (
          <div className="block-heading2" {...commonProps}>
            {localProps.text}
          </div>
        );
      case "heading3":
        return (
          <div className="block-heading3" {...commonProps}>
            {localProps.text}
          </div>
        );
      case "todo":
        return (
          <div className="block-todo">
            <div
              className={`block-todo-checkbox ${localProps.checked ? "checked" : ""}`}
              onClick={handleCheckboxToggle}
            />
            <div {...commonProps}>{localProps.text}</div>
          </div>
        );
      case "bullet":
        return (
          <div className="block-bullet">
            <div {...commonProps}>{localProps.text}</div>
          </div>
        );
      case "quote":
        return (
          <div className="block-quote" {...commonProps}>
            {localProps.text}
          </div>
        );
      case "divider":
        return <div className="block-divider" />;
      default:
        return (
          <div className="block-paragraph" {...commonProps}>
            {localProps.text}
          </div>
        );
    }
  };

  return (
    <div className="block">
      <div className="block-handle" title="드래그하여 이동">
        ⋮⋮
      </div>
      {renderBlockContent()}
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
    case "bullet":
      return "목록";
    case "quote":
      return "인용문";
    default:
      return "'/' 명령어 또는 텍스트 입력...";
  }
}
