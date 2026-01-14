"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  PropertyType,
  PROPERTY_TYPE_ICONS,
  PROPERTY_TYPE_LABELS,
  type SelectOption,
} from "@/types/database";

interface Property {
  id: string;
  name: string;
  type: PropertyType;
  parsedOptions: {
    options?: SelectOption[];
  };
}

interface PropertyMenuProps {
  position: { x: number; y: number };
  editingProperty: Property | null;
  onClose: () => void;
  onAddProperty: (name: string, type: PropertyType) => void;
  onUpdateProperty: (
    propertyId: string,
    data: { name?: string; type?: PropertyType; options?: SelectOption[] }
  ) => void;
  onDeleteProperty: (propertyId: string) => void;
}

const PROPERTY_TYPES: PropertyType[] = [
  "text",
  "number",
  "select",
  "multi_select",
  "date",
  "checkbox",
  "url",
];

export default function PropertyMenu({
  position,
  editingProperty,
  onClose,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
}: PropertyMenuProps) {
  const [name, setName] = useState(editingProperty?.name || "");
  const [selectedType, setSelectedType] = useState<PropertyType>(
    editingProperty?.type || "text"
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProperty) {
      setName(editingProperty.name);
      setSelectedType(editingProperty.type);
    } else {
      setName("");
      setSelectedType("text");
    }
  }, [editingProperty]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return;

    if (editingProperty) {
      onUpdateProperty(editingProperty.id, {
        name: name.trim(),
        type: selectedType,
      });
    } else {
      onAddProperty(name.trim(), selectedType);
    }
    onClose();
  }, [name, selectedType, editingProperty, onAddProperty, onUpdateProperty, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmit();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [handleSubmit, onClose]
  );

  const handleDelete = useCallback(() => {
    if (editingProperty) {
      onDeleteProperty(editingProperty.id);
    }
  }, [editingProperty, onDeleteProperty]);

  // Calculate position to stay within viewport
  const menuStyle: React.CSSProperties = {
    left: Math.min(position.x, window.innerWidth - 260),
    top: Math.min(position.y, window.innerHeight - 400),
  };

  return (
    <>
      <div className="dropdown-overlay" onClick={onClose} />
      <div
        ref={menuRef}
        className="dropdown-menu property-menu"
        style={menuStyle}
      >
        {/* Property Name Input */}
        <div className="property-menu-header">
          <input
            ref={inputRef}
            type="text"
            className="property-menu-input"
            placeholder="속성 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Property Type Selection */}
        <div className="dropdown-section-title">속성 유형</div>
        <div className="property-type-list">
          {PROPERTY_TYPES.map((type) => (
            <div
              key={type}
              className={`property-type-item ${selectedType === type ? "selected" : ""}`}
              onClick={() => setSelectedType(type)}
            >
              <span className="property-type-icon">
                {PROPERTY_TYPE_ICONS[type]}
              </span>
              <span>{PROPERTY_TYPE_LABELS[type]}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="dropdown-divider" />
        <div
          className="dropdown-item"
          onClick={handleSubmit}
          style={{ color: "var(--accent)" }}
        >
          <span>{editingProperty ? "저장" : "추가"}</span>
        </div>

        {editingProperty && (
          <div
            className="dropdown-item"
            onClick={handleDelete}
            style={{ color: "var(--destructive)" }}
          >
            <span>삭제</span>
          </div>
        )}
      </div>
    </>
  );
}
