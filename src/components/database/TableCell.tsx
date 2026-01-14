"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  PropertyType,
  type SelectOption,
  type SelectColor,
  SELECT_COLOR_STYLES,
} from "@/types/database";
import SelectDropdown from "./cells/SelectDropdown";
import DatePicker from "./cells/DatePicker";

interface Property {
  id: string;
  name: string;
  type: PropertyType;
  width: number;
  parsedOptions: {
    options?: SelectOption[];
  };
}

interface TableCellProps {
  property: Property;
  value: string;
  onUpdate: (value: string) => void;
  onAddSelectOption: (name: string, color?: SelectColor) => void;
  onNavigate?: (direction: "left" | "right" | "up" | "down") => void;
  tabIndex?: number;
}

export default function TableCell({
  property,
  value,
  onUpdate,
  onAddSelectOption,
  onNavigate,
  tabIndex,
}: TableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [validationError, setValidationError] = useState<string | null>(null);
  const cellRef = useRef<HTMLTableCellElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validation functions
  const validateValue = useCallback((val: string): string | null => {
    if (property.type === "number" && val !== "") {
      if (isNaN(Number(val))) {
        return "숫자를 입력해주세요";
      }
    }
    if (property.type === "url" && val !== "") {
      try {
        new URL(val);
      } catch {
        // Allow partial URLs during editing
        if (!val.startsWith("http://") && !val.startsWith("https://") && !val.startsWith("/")) {
          return "올바른 URL 형식이 아닙니다";
        }
      }
    }
    return null;
  }, [property.type]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Handle text/number editing
  const handleStartEditing = useCallback(() => {
    if (property.type === "checkbox") return;
    if (property.type === "select" || property.type === "multi_select") {
      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect();
        setDropdownPosition({ x: rect.left, y: rect.bottom });
      }
      setShowDropdown(true);
      return;
    }
    if (property.type === "date") {
      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect();
        setDropdownPosition({ x: rect.left, y: rect.bottom });
      }
      setShowDropdown(true);
      return;
    }
    setIsEditing(true);
    setEditValue(value);
  }, [property.type, value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    const error = validateValue(editValue);
    if (error) {
      setValidationError(error);
      // Show error briefly then revert
      setTimeout(() => {
        setValidationError(null);
        setEditValue(value);
      }, 2000);
      return;
    }
    setValidationError(null);
    if (editValue !== value) {
      onUpdate(editValue);
    }
  }, [editValue, value, onUpdate, validateValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleBlur();
      } else if (e.key === "Escape") {
        setIsEditing(false);
        setEditValue(value);
      } else if (e.key === "Tab") {
        e.preventDefault();
        handleBlur();
        onNavigate?.(e.shiftKey ? "left" : "right");
      }
    },
    [handleBlur, value, onNavigate]
  );

  // Handle cell-level keyboard navigation (when not editing)
  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isEditing || showDropdown) return;

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          handleStartEditing();
          break;
        case "Tab":
          e.preventDefault();
          onNavigate?.(e.shiftKey ? "left" : "right");
          break;
        case "ArrowUp":
          e.preventDefault();
          onNavigate?.("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          onNavigate?.("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          onNavigate?.("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          onNavigate?.("right");
          break;
      }
    },
    [isEditing, showDropdown, handleStartEditing, onNavigate]
  );

  // Handle checkbox toggle
  const handleCheckboxToggle = useCallback(() => {
    const newValue = value === "true" ? "false" : "true";
    onUpdate(newValue);
  }, [value, onUpdate]);

  // Handle select option selection
  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (property.type === "multi_select") {
        const currentValues = value ? value.split(",") : [];
        const newValues = currentValues.includes(optionId)
          ? currentValues.filter((v) => v !== optionId)
          : [...currentValues, optionId];
        onUpdate(newValues.join(","));
      } else {
        onUpdate(optionId);
        setShowDropdown(false);
      }
    },
    [property.type, value, onUpdate]
  );

  // Handle date selection
  const handleDateSelect = useCallback(
    (date: string) => {
      onUpdate(date);
      setShowDropdown(false);
    },
    [onUpdate]
  );

  // Render cell content based on type
  const renderContent = () => {
    switch (property.type) {
      case "checkbox":
        return (
          <div className="cell-checkbox">
            <input
              type="checkbox"
              checked={value === "true"}
              onChange={handleCheckboxToggle}
            />
          </div>
        );

      case "select":
      case "multi_select": {
        const selectedIds = value ? value.split(",") : [];
        const selectedOptions = (property.parsedOptions.options || []).filter(
          (opt) => selectedIds.includes(opt.id)
        );

        return (
          <div className="cell-select" onClick={handleStartEditing}>
            {selectedOptions.map((opt) => (
              <span key={opt.id} className={`select-tag color-${opt.color}`}>
                {opt.name}
              </span>
            ))}
          </div>
        );
      }

      case "date":
        return (
          <div
            className="table-cell-content cell-date"
            onClick={handleStartEditing}
          >
            {value ? formatDate(value) : ""}
          </div>
        );

      case "url":
        return isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="table-cell-content cell-url editing"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div className="table-cell-content cell-url" onClick={handleStartEditing}>
            {value && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {value}
              </a>
            )}
          </div>
        );

      case "number":
        return isEditing ? (
          <input
            ref={inputRef}
            type="number"
            className="table-cell-content cell-number editing"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div
            className="table-cell-content cell-number"
            onClick={handleStartEditing}
          >
            {value}
          </div>
        );

      case "text":
      default:
        return isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="table-cell-content cell-text editing"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div
            className="table-cell-content cell-text"
            onClick={handleStartEditing}
          >
            {value}
          </div>
        );
    }
  };

  return (
    <td
      ref={cellRef}
      className={`table-cell ${validationError ? "has-error" : ""}`}
      style={{ width: property.width }}
      tabIndex={tabIndex ?? 0}
      onKeyDown={handleCellKeyDown}
    >
      {renderContent()}

      {/* Validation Error Tooltip */}
      {validationError && (
        <div className="cell-validation-error">
          {validationError}
        </div>
      )}

      {/* Select Dropdown */}
      {showDropdown &&
        (property.type === "select" || property.type === "multi_select") && (
          <SelectDropdown
            position={dropdownPosition}
            options={property.parsedOptions.options || []}
            selectedIds={value ? value.split(",") : []}
            multiSelect={property.type === "multi_select"}
            onSelect={handleSelectOption}
            onAddOption={onAddSelectOption}
            onClose={() => setShowDropdown(false)}
          />
        )}

      {/* Date Picker */}
      {showDropdown && property.type === "date" && (
        <DatePicker
          position={dropdownPosition}
          value={value}
          onSelect={handleDateSelect}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </td>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
