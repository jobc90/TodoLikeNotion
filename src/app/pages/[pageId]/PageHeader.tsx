"use client";

import { useState, useCallback, useRef } from "react";
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

  // Common emojis
  const commonEmojis = [
    "📄", "📝", "📋", "📌", "📎", "📊", "📈", "💡", "🎯", "⭐", "❤️", "🔥", "✅", "🚀", "💼"
  ];

  return (
    <div className="page-header" style={{ position: "relative" }}>
      <div
        className="page-icon"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        title="Change Icon"
      >
        {localIcon}
      </div>

      {showEmojiPicker && (
        <>
          <div 
            className="dropdown-overlay" 
            onClick={() => setShowEmojiPicker(false)}
            style={{ background: "transparent" }}
          />
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "0",
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-md)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "8px",
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "4px",
              zIndex: 100,
              width: "200px",
            }}
          >
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleIconChange(emoji)}
                style={{
                  fontSize: "20px",
                  padding: "6px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-subtle)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
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
