"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { updatePage } from "@/actions/page.actions";

interface PageHeaderProps {
  pageId: string;
  title: string;
  icon: string | null;
}

export default function PageHeader({ pageId, title, icon }: PageHeaderProps) {
  const [localTitle, setLocalTitle] = useState(title);
  const [localIcon, setLocalIcon] = useState(icon || "📄");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      setLocalTitle(newTitle);
      // Debounced update
      await updatePage(pageId, { title: newTitle });
    },
    [pageId]
  );

  const handleIconChange = useCallback(
    async (newIcon: string) => {
      setLocalIcon(newIcon);
      setShowEmojiPicker(false);
      await updatePage(pageId, { icon: newIcon });
    },
    [pageId]
  );

  // 일반적인 이모지 목록
  const commonEmojis = [
    "📄", "📝", "📓", "📒", "📕", "📗", "📘", "📙",
    "✅", "⭐", "💡", "🎯", "🚀", "💻", "🔧", "📊",
    "📈", "📉", "🗂️", "📁", "📂", "🗃️", "💼", "📋",
    "🎨", "🎵", "🎬", "📷", "🔗", "💬", "📌", "🔖",
  ];

  return (
    <div className="page-header">
      <div
        className="page-icon"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        title="아이콘 변경"
      >
        {localIcon}
      </div>

      {showEmojiPicker && (
        <div
          style={{
            position: "absolute",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            padding: "12px",
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: "4px",
            zIndex: 100,
          }}
        >
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleIconChange(emoji)}
              style={{
                fontSize: "24px",
                padding: "4px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                background: "transparent",
                border: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <input
        ref={titleRef}
        className="page-title"
        value={localTitle}
        onChange={(e) => setLocalTitle(e.target.value)}
        onBlur={() => handleTitleChange(localTitle)}
        placeholder="Untitled"
      />
    </div>
  );
}
