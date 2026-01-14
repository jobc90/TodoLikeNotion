"use client";

import { useState, useCallback, useEffect } from "react";
import {
  PropertyType,
  type SelectOption,
  type SelectColor,
  PROPERTY_TYPE_ICONS,
} from "@/types/database";
import SelectDropdown from "./cells/SelectDropdown";
import DatePicker from "./cells/DatePicker";

interface Property {
  id: string;
  name: string;
  type: PropertyType;
  parsedOptions: {
    options?: SelectOption[];
  };
}

interface Cell {
  id: string;
  propertyId: string;
  value: string;
}

interface Row {
  id: string;
  cells: Cell[];
}

interface RowDetailModalProps {
  row: Row;
  properties: Property[];
  onClose: () => void;
  onCellUpdate: (rowId: string, propertyId: string, value: string) => void;
  onAddSelectOption: (propertyId: string, name: string, color?: SelectColor) => void;
}

export default function RowDetailModal({
  row,
  properties,
  onClose,
  onCellUpdate,
  onAddSelectOption,
}: RowDetailModalProps) {
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const getCellValue = useCallback(
    (propertyId: string) => {
      const cell = row.cells.find((c) => c.propertyId === propertyId);
      return cell?.value || "";
    },
    [row.cells]
  );

  const handleCellUpdate = useCallback(
    (propertyId: string, value: string) => {
      onCellUpdate(row.id, propertyId, value);
    },
    [row.id, onCellUpdate]
  );

  const handleOpenDropdown = useCallback(
    (propertyId: string, e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDropdownPosition({ x: rect.left, y: rect.bottom });
      setEditingPropertyId(propertyId);
    },
    []
  );

  const getTitle = () => {
    const firstTextProp = properties.find((p) => p.type === "text");
    if (firstTextProp) {
      return getCellValue(firstTextProp.id) || "제목 없음";
    }
    return "제목 없음";
  };

  const renderPropertyValue = (property: Property) => {
    const value = getCellValue(property.id);

    switch (property.type) {
      case "checkbox":
        return (
          <div className="modal-property-value">
            <input
              type="checkbox"
              checked={value === "true"}
              onChange={() => handleCellUpdate(property.id, value === "true" ? "false" : "true")}
              style={{ width: 18, height: 18 }}
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
          <div
            className="modal-property-value cell-select"
            onClick={(e) => handleOpenDropdown(property.id, e)}
            style={{ cursor: "pointer", minHeight: 32 }}
          >
            {selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <span key={opt.id} className={`select-tag color-${opt.color}`}>
                  {opt.name}
                </span>
              ))
            ) : (
              <span style={{ color: "var(--ink-tertiary)" }}>선택...</span>
            )}
          </div>
        );
      }

      case "date":
        return (
          <div
            className="modal-property-value"
            onClick={(e) => handleOpenDropdown(property.id, e)}
            style={{ cursor: "pointer" }}
          >
            <div className="modal-property-input" style={{ background: "transparent" }}>
              {value ? formatDate(value) : "날짜 선택..."}
            </div>
          </div>
        );

      case "url":
        return (
          <div className="modal-property-value">
            <input
              type="text"
              className="modal-property-input"
              value={value}
              onChange={(e) => handleCellUpdate(property.id, e.target.value)}
              placeholder="URL 입력..."
            />
            {value && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--accent)",
                  fontSize: 12,
                  marginTop: 4,
                  display: "inline-block",
                }}
              >
                링크 열기 ↗
              </a>
            )}
          </div>
        );

      case "number":
        return (
          <div className="modal-property-value">
            <input
              type="number"
              className="modal-property-input"
              value={value}
              onChange={(e) => handleCellUpdate(property.id, e.target.value)}
              placeholder="숫자 입력..."
            />
          </div>
        );

      case "text":
      default:
        return (
          <div className="modal-property-value">
            <input
              type="text"
              className="modal-property-input"
              value={value}
              onChange={(e) => handleCellUpdate(property.id, e.target.value)}
              placeholder="텍스트 입력..."
            />
          </div>
        );
    }
  };

  const editingProperty = editingPropertyId
    ? properties.find((p) => p.id === editingPropertyId)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{getTitle()}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {properties.map((property) => (
            <div key={property.id} className="modal-property-row">
              <div className="modal-property-label">
                <span style={{ marginRight: 6 }}>{PROPERTY_TYPE_ICONS[property.type]}</span>
                {property.name}
              </div>
              {renderPropertyValue(property)}
            </div>
          ))}
        </div>
      </div>

      {/* Select Dropdown */}
      {editingProperty &&
        (editingProperty.type === "select" || editingProperty.type === "multi_select") && (
          <SelectDropdown
            position={dropdownPosition}
            options={editingProperty.parsedOptions.options || []}
            selectedIds={getCellValue(editingProperty.id)?.split(",").filter(Boolean) || []}
            multiSelect={editingProperty.type === "multi_select"}
            onSelect={(optionId) => {
              const currentValue = getCellValue(editingProperty.id);
              if (editingProperty.type === "multi_select") {
                const currentValues = currentValue ? currentValue.split(",") : [];
                const newValues = currentValues.includes(optionId)
                  ? currentValues.filter((v) => v !== optionId)
                  : [...currentValues, optionId];
                handleCellUpdate(editingProperty.id, newValues.join(","));
              } else {
                handleCellUpdate(editingProperty.id, optionId);
                setEditingPropertyId(null);
              }
            }}
            onAddOption={(name, color) => onAddSelectOption(editingProperty.id, name, color)}
            onClose={() => setEditingPropertyId(null)}
          />
        )}

      {/* Date Picker */}
      {editingProperty && editingProperty.type === "date" && (
        <DatePicker
          position={dropdownPosition}
          value={getCellValue(editingProperty.id)}
          onSelect={(date) => {
            handleCellUpdate(editingProperty.id, date);
            setEditingPropertyId(null);
          }}
          onClose={() => setEditingPropertyId(null)}
        />
      )}
    </div>
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
