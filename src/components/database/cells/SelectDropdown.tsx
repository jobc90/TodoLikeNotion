"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { type SelectOption, type SelectColor, SELECT_COLOR_STYLES } from "@/types/database";

interface SelectDropdownProps {
  position: { x: number; y: number };
  options: SelectOption[];
  selectedIds: string[];
  multiSelect: boolean;
  onSelect: (optionId: string) => void;
  onAddOption: (name: string, color?: SelectColor) => void;
  onClose: () => void;
}

const COLORS: SelectColor[] = [
  "default",
  "gray",
  "brown",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
];

export default function SelectDropdown({
  position,
  options,
  selectedIds,
  multiSelect,
  onSelect,
  onAddOption,
  onClose,
}: SelectDropdownProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOption = useCallback(
    (color: SelectColor = "default") => {
      if (searchTerm.trim()) {
        onAddOption(searchTerm.trim(), color);
        setSearchTerm("");
        setShowColorPicker(false);
      }
    },
    [searchTerm, onAddOption]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && searchTerm.trim()) {
        // Check if option already exists
        const exists = options.some(
          (opt) => opt.name.toLowerCase() === searchTerm.toLowerCase()
        );
        if (!exists) {
          setShowColorPicker(true);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [searchTerm, options, onClose]
  );

  // Calculate position to stay within viewport
  const menuStyle: React.CSSProperties = {
    left: Math.min(position.x, window.innerWidth - 220),
    top: Math.min(position.y, window.innerHeight - 300),
  };

  return (
    <div
      ref={dropdownRef}
      className="dropdown-menu select-dropdown"
      style={menuStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search Input */}
      <div style={{ padding: "8px 10px" }}>
        <input
          ref={inputRef}
          type="text"
          className="property-menu-input"
          placeholder="검색 또는 새로 만들기..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Options List */}
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {filteredOptions.map((option) => (
          <div
            key={option.id}
            className={`select-option ${selectedIds.includes(option.id) ? "selected" : ""}`}
            onClick={() => onSelect(option.id)}
          >
            <span className={`select-tag color-${option.color}`}>{option.name}</span>
            {multiSelect && selectedIds.includes(option.id) && (
              <span style={{ marginLeft: "auto" }}>✓</span>
            )}
          </div>
        ))}
      </div>

      {/* Add New Option */}
      {searchTerm.trim() &&
        !options.some((opt) => opt.name.toLowerCase() === searchTerm.toLowerCase()) && (
          <>
            {showColorPicker ? (
              <div style={{ padding: "8px 10px", borderTop: "1px solid var(--border)" }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 8,
                  }}
                >
                  색상 선택
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleAddOption(color)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        background: SELECT_COLOR_STYLES[color].bg,
                        border: "none",
                        cursor: "pointer",
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="select-add-option" onClick={() => setShowColorPicker(true)}>
                <span>+</span>
                <span>&quot;{searchTerm}&quot; 만들기</span>
              </div>
            )}
          </>
        )}
    </div>
  );
}
