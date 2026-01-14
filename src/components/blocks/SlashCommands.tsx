"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlockType } from "@/types/block";

interface CommandOption {
  type: BlockType;
  label: string;
  description: string;
  icon: JSX.Element;
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
    label: "Text",
    description: "Just start writing with plain text.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>
    ),
    keywords: ["text", "paragraph", "p"],
  },
  {
    type: "heading1",
    label: "Heading 1",
    description: "Big section heading.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/></svg>
    ),
    keywords: ["heading", "h1", "title"],
  },
  {
    type: "heading2",
    label: "Heading 2",
    description: "Medium section heading.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>
    ),
    keywords: ["heading", "h2", "subtitle"],
  },
  {
    type: "heading3",
    label: "Heading 3",
    description: "Small section heading.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/></svg>
    ),
    keywords: ["heading", "h3"],
  },
  {
    type: "todo",
    label: "To-do List",
    description: "Track tasks with a todo list.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>
    ),
    keywords: ["todo", "task", "checkbox", "check"],
  },
  {
    type: "bullet",
    label: "Bulleted List",
    description: "Create a simple bulleted list.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
    ),
    keywords: ["bullet", "list", "ul"],
  },
  {
    type: "numbered",
    label: "Numbered List",
    description: "Create a list with numbering.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 6h11"/><path d="M10 12h11"/><path d="M10 18h11"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
    ),
    keywords: ["numbered", "number", "list", "ol"],
  },
  {
    type: "toggle",
    label: "Toggle List",
    description: "Toggles can hide and show content inside.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m10 8 4 4-4 4"/></svg>
    ),
    keywords: ["toggle", "collapse", "dropdown"],
  },
  {
    type: "quote",
    label: "Quote",
    description: "Capture a quote.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>
    ),
    keywords: ["quote", "blockquote", "cite"],
  },
  {
    type: "divider",
    label: "Divider",
    description: "Visually divide blocks.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M19 5H5"/><path d="M19 19H5"/></svg>
    ),
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

  // Empty State
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
          <div className="slash-commands-empty-text">No results</div>
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
      <div className="slash-commands-header">
        <span className="slash-commands-header-label">Basic Blocks</span>
      </div>

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
    </motion.div>
  );
}
