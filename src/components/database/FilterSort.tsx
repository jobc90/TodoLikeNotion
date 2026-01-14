"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  PropertyType,
  PROPERTY_TYPE_ICONS,
  type SelectOption,
  type FilterCondition,
  type SortCondition,
} from "@/types/database";

interface Property {
  id: string;
  name: string;
  type: PropertyType;
  parsedOptions: {
    options?: SelectOption[];
  };
}

interface FilterSortProps {
  properties: Property[];
  filters: FilterCondition[];
  sorts: SortCondition[];
  onFiltersChange: (filters: FilterCondition[]) => void;
  onSortsChange: (sorts: SortCondition[]) => void;
}

const FILTER_OPERATORS: Record<string, Array<{ value: string; label: string }>> = {
  text: [
    { value: "contains", label: "포함" },
    { value: "not_contains", label: "포함하지 않음" },
    { value: "equals", label: "같음" },
    { value: "not_equals", label: "같지 않음" },
    { value: "is_empty", label: "비어있음" },
    { value: "is_not_empty", label: "비어있지 않음" },
  ],
  number: [
    { value: "equals", label: "같음" },
    { value: "not_equals", label: "같지 않음" },
    { value: "greater_than", label: "보다 큼" },
    { value: "less_than", label: "보다 작음" },
    { value: "is_empty", label: "비어있음" },
    { value: "is_not_empty", label: "비어있지 않음" },
  ],
  select: [
    { value: "equals", label: "같음" },
    { value: "not_equals", label: "같지 않음" },
    { value: "is_empty", label: "비어있음" },
    { value: "is_not_empty", label: "비어있지 않음" },
  ],
  multi_select: [
    { value: "contains", label: "포함" },
    { value: "not_contains", label: "포함하지 않음" },
    { value: "is_empty", label: "비어있음" },
    { value: "is_not_empty", label: "비어있지 않음" },
  ],
  date: [
    { value: "equals", label: "같음" },
    { value: "not_equals", label: "같지 않음" },
    { value: "greater_than", label: "이후" },
    { value: "less_than", label: "이전" },
    { value: "is_empty", label: "비어있음" },
    { value: "is_not_empty", label: "비어있지 않음" },
  ],
  checkbox: [
    { value: "equals", label: "같음" },
  ],
  url: [
    { value: "contains", label: "포함" },
    { value: "is_empty", label: "비어있음" },
    { value: "is_not_empty", label: "비어있지 않음" },
  ],
};

export default function FilterSort({
  properties,
  filters,
  sorts,
  onFiltersChange,
  onSortsChange,
}: FilterSortProps) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterMenuPosition, setFilterMenuPosition] = useState({ x: 0, y: 0 });
  const [sortMenuPosition, setSortMenuPosition] = useState({ x: 0, y: 0 });

  const handleAddFilter = useCallback(
    (propertyId: string) => {
      const property = properties.find((p) => p.id === propertyId);
      if (!property) return;

      const operators = FILTER_OPERATORS[property.type] || FILTER_OPERATORS.text;
      const newFilter: FilterCondition = {
        propertyId,
        operator: operators[0].value as FilterCondition["operator"],
        value: "",
      };

      onFiltersChange([...filters, newFilter]);
      setShowFilterMenu(false);
    },
    [properties, filters, onFiltersChange]
  );

  const handleUpdateFilter = useCallback(
    (index: number, updates: Partial<FilterCondition>) => {
      const newFilters = [...filters];
      newFilters[index] = { ...newFilters[index], ...updates };
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleRemoveFilter = useCallback(
    (index: number) => {
      const newFilters = filters.filter((_, i) => i !== index);
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleAddSort = useCallback(
    (propertyId: string) => {
      const newSort: SortCondition = {
        propertyId,
        direction: "asc",
      };

      onSortsChange([...sorts, newSort]);
      setShowSortMenu(false);
    },
    [sorts, onSortsChange]
  );

  const handleUpdateSort = useCallback(
    (index: number, direction: "asc" | "desc") => {
      const newSorts = [...sorts];
      newSorts[index] = { ...newSorts[index], direction };
      onSortsChange(newSorts);
    },
    [sorts, onSortsChange]
  );

  const handleRemoveSort = useCallback(
    (index: number) => {
      const newSorts = sorts.filter((_, i) => i !== index);
      onSortsChange(newSorts);
    },
    [sorts, onSortsChange]
  );

  const handleFilterButtonClick = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFilterMenuPosition({ x: rect.left, y: rect.bottom + 4 });
    setShowFilterMenu(true);
  }, []);

  const handleSortButtonClick = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSortMenuPosition({ x: rect.left, y: rect.bottom + 4 });
    setShowSortMenu(true);
  }, []);

  const getPropertyById = (id: string) => properties.find((p) => p.id === id);

  return (
    <>
      {/* Toolbar Buttons */}
      <button
        className={`database-toolbar-btn ${filters.length > 0 ? "active" : ""}`}
        onClick={handleFilterButtonClick}
      >
        <span>⚡</span>
        <span>필터 {filters.length > 0 && `(${filters.length})`}</span>
      </button>
      <button
        className={`database-toolbar-btn ${sorts.length > 0 ? "active" : ""}`}
        onClick={handleSortButtonClick}
      >
        <span>↕</span>
        <span>정렬 {sorts.length > 0 && `(${sorts.length})`}</span>
      </button>

      {/* Active Filters Display */}
      {(filters.length > 0 || sorts.length > 0) && (
        <div className="filter-sort-container">
          {filters.map((filter, index) => {
            const property = getPropertyById(filter.propertyId);
            if (!property) return null;

            const operators = FILTER_OPERATORS[property.type] || FILTER_OPERATORS.text;
            const operatorLabel = operators.find((o) => o.value === filter.operator)?.label || filter.operator;

            return (
              <div key={`filter-${index}`} className="filter-tag">
                <span>{property.name}</span>
                <select
                  value={filter.operator}
                  onChange={(e) =>
                    handleUpdateFilter(index, { operator: e.target.value as FilterCondition["operator"] })
                  }
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    fontSize: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {operators.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
                {!["is_empty", "is_not_empty"].includes(filter.operator) && (
                  <input
                    type={property.type === "number" ? "number" : property.type === "date" ? "date" : "text"}
                    value={filter.value}
                    onChange={(e) => handleUpdateFilter(index, { value: e.target.value })}
                    placeholder="값..."
                    style={{
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      padding: "2px 6px",
                      fontSize: 12,
                      width: 80,
                    }}
                  />
                )}
                <button
                  className="filter-tag-remove"
                  onClick={() => handleRemoveFilter(index)}
                >
                  ✕
                </button>
              </div>
            );
          })}

          {sorts.map((sort, index) => {
            const property = getPropertyById(sort.propertyId);
            if (!property) return null;

            return (
              <div key={`sort-${index}`} className="filter-tag">
                <span>↕ {property.name}</span>
                <select
                  value={sort.direction}
                  onChange={(e) => handleUpdateSort(index, e.target.value as "asc" | "desc")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    fontSize: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <option value="asc">오름차순</option>
                  <option value="desc">내림차순</option>
                </select>
                <button
                  className="filter-tag-remove"
                  onClick={() => handleRemoveSort(index)}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Menu */}
      {showFilterMenu && (
        <PropertySelectMenu
          position={filterMenuPosition}
          properties={properties}
          onSelect={handleAddFilter}
          onClose={() => setShowFilterMenu(false)}
          title="필터 추가"
        />
      )}

      {/* Sort Menu */}
      {showSortMenu && (
        <PropertySelectMenu
          position={sortMenuPosition}
          properties={properties}
          onSelect={handleAddSort}
          onClose={() => setShowSortMenu(false)}
          title="정렬 추가"
        />
      )}
    </>
  );
}

// Property Select Menu Component
function PropertySelectMenu({
  position,
  properties,
  onSelect,
  onClose,
  title,
}: {
  position: { x: number; y: number };
  properties: Property[];
  onSelect: (propertyId: string) => void;
  onClose: () => void;
  title: string;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const menuStyle: React.CSSProperties = {
    left: Math.min(position.x, window.innerWidth - 220),
    top: Math.min(position.y, window.innerHeight - 300),
  };

  return (
    <>
      <div className="dropdown-overlay" onClick={onClose} />
      <div ref={menuRef} className="dropdown-menu" style={menuStyle}>
        <div className="dropdown-section-title">{title}</div>
        {properties.map((property) => (
          <div
            key={property.id}
            className="dropdown-item"
            onClick={() => onSelect(property.id)}
          >
            <span className="dropdown-item-icon">{PROPERTY_TYPE_ICONS[property.type]}</span>
            <span>{property.name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
