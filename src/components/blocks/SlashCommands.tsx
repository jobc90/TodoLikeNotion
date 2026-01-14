"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlockType } from "@/types/block";

interface CommandOption {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  keywords: string[];
}

interface SlashCommandsProps {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  position: { x: number; y: number };
  searchQuery?: string;
}

const COMMAND_OPTIONS: CommandOption[] = [
  {
    type: "paragraph",
    label: "텍스트",
    description: "일반 텍스트로 작성을 시작하세요.",
    icon: "📝",
    keywords: ["text", "paragraph", "p"],
  },
  {
    type: "heading1",
    label: "제목 1",
    description: "큰 섹션 제목.",
    icon: "H1",
    keywords: ["heading", "h1", "title"],
  },
  {
    type: "heading2",
    label: "제목 2",
    description: "중간 섹션 제목.",
    icon: "H2",
    keywords: ["heading", "h2", "subtitle"],
  },
  {
    type: "heading3",
    label: "제목 3",
    description: "작은 섹션 제목.",
    icon: "H3",
    keywords: ["heading", "h3"],
  },
  {
    type: "todo",
    label: "할 일",
    description: "체크박스로 할 일을 관리하세요.",
    icon: "☑️",
    keywords: ["todo", "task", "checkbox", "check"],
  },
  {
    type: "bullet",
    label: "글머리 기호 목록",
    description: "간단한 글머리 기호 목록을 만드세요.",
    icon: "•",
    keywords: ["bullet", "list", "ul"],
  },
  {
    type: "numbered",
    label: "번호 매기기 목록",
    description: "번호가 매겨진 목록을 만드세요.",
    icon: "🔢",
    keywords: ["numbered", "number", "list", "ol"],
  },
  {
    type: "toggle",
    label: "토글 목록",
    description: "내용을 숨기거나 표시할 수 있습니다.",
    icon: "▶️",
    keywords: ["toggle", "collapse", "dropdown"],
  },
  {
    type: "quote",
    label: "인용",
    description: "인용문을 작성하세요.",
    icon: "❝",
    keywords: ["quote", "blockquote", "cite"],
  },
  {
    type: "divider",
    label: "구분선",
    description: "블록을 시각적으로 구분하세요.",
    icon: "➖",
    keywords: ["divider", "hr", "separator", "line"],
  },
];

export default function SlashCommands({
  onSelect,
  onClose,
  position,
  searchQuery = "",
}: SlashCommandsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredOptions, setFilteredOptions] = useState(COMMAND_OPTIONS);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // Filter options based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredOptions(COMMAND_OPTIONS);
      setSelectedIndex(0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = COMMAND_OPTIONS.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.description.toLowerCase().includes(query) ||
        option.keywords.some((keyword) => keyword.toLowerCase().includes(query))
    );

    setFilteredOptions(filtered);
    setSelectedIndex(0);
  }, [searchQuery]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const selected = selectedRef.current;
      const containerRect = container.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();

      if (selectedRect.bottom > containerRect.bottom) {
        selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else if (selectedRect.top < containerRect.top) {
        selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (filteredOptions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredOptions[selectedIndex]) {
            onSelect(filteredOptions[selectedIndex].type);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredOptions, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Calculate position to keep menu in viewport
  const getMenuPosition = () => {
    const menuWidth = 320;
    const menuHeight = Math.min(filteredOptions.length * 64 + 16, 480);
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + menuWidth > viewportWidth - 20) {
      x = viewportWidth - menuWidth - 20;
    }

    // Adjust vertical position
    if (y + menuHeight > viewportHeight - 20) {
      y = Math.max(20, viewportHeight - menuHeight - 20);
    }

    return { x, y };
  };

  const menuPosition = getMenuPosition();

  if (filteredOptions.length === 0) {
    return (
      <motion.div
        ref={containerRef}
        className="slash-commands-menu"
        style={{
          position: "fixed",
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`,
        }}
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="slash-commands-empty">
          <div className="slash-commands-empty-icon">🔍</div>
          <div className="slash-commands-empty-text">검색 결과 없음</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className="slash-commands-menu"
      style={{
        position: "fixed",
        left: `${menuPosition.x}px`,
        top: `${menuPosition.y}px`,
      }}
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {searchQuery && (
        <motion.div
          className="slash-commands-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <span className="slash-commands-header-label">블록</span>
        </motion.div>
      )}

      <div className="slash-commands-list">
        <AnimatePresence mode="popLayout">
          {filteredOptions.map((option, index) => (
            <motion.div
              key={option.type}
              ref={index === selectedIndex ? selectedRef : null}
              className={`slash-command-item ${
                index === selectedIndex ? "selected" : ""
              }`}
              onClick={() => onSelect(option.type)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{
                duration: 0.15,
                delay: index * 0.02,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="slash-command-icon">
                <div className="slash-command-icon-bg">{option.icon}</div>
              </div>
              <div className="slash-command-content">
                <div className="slash-command-label">{option.label}</div>
                <div className="slash-command-description">
                  {option.description}
                </div>
              </div>
              {index === selectedIndex && (
                <motion.div
                  className="slash-command-selected-indicator"
                  layoutId="selectedIndicator"
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        className="slash-commands-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className="slash-commands-footer-hint">
          <kbd>↑</kbd>
          <kbd>↓</kbd> 탐색
        </span>
        <span className="slash-commands-footer-hint">
          <kbd>↵</kbd> 선택
        </span>
        <span className="slash-commands-footer-hint">
          <kbd>esc</kbd> 닫기
        </span>
      </motion.div>
    </motion.div>
  );
}
