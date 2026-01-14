"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PropertyType,
  type SelectOption,
  type SelectColor,
} from "@/types/database";

interface Property {
  id: string;
  name: string;
  type: PropertyType;
  width: number;
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
  order: number;
  cells: Cell[];
}

interface BoardViewProps {
  rows: Row[];
  properties: Property[];
  groupByPropertyId: string | null;
  onGroupByChange: (propertyId: string | null) => void;
  onCellUpdate: (rowId: string, propertyId: string, value: string) => void;
  onRowClick: (rowId: string) => void;
  onAddRow: (initialCells?: { propertyId: string; value: string }[]) => void;
  onAddSelectOption: (propertyId: string, name: string, color?: SelectColor) => void;
}

// Uncategorized column constant
const UNCATEGORIZED_ID = "__uncategorized__";

export default function BoardView({
  rows,
  properties,
  groupByPropertyId,
  onGroupByChange,
  onCellUpdate,
  onRowClick,
  onAddRow,
  onAddSelectOption,
}: BoardViewProps) {
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Get select properties for grouping
  const selectProperties = useMemo(
    () => properties.filter((p) => p.type === "select"),
    [properties]
  );

  // Get current group by property
  const groupByProperty = useMemo(
    () =>
      groupByPropertyId
        ? properties.find((p) => p.id === groupByPropertyId)
        : selectProperties[0] || null,
    [groupByPropertyId, properties, selectProperties]
  );

  // Get columns from select options
  const columns = useMemo(() => {
    if (!groupByProperty || groupByProperty.type !== "select") {
      return [{ id: UNCATEGORIZED_ID, name: "All Items", color: "default" as SelectColor }];
    }

    const options = groupByProperty.parsedOptions.options || [];
    return [
      ...options,
      { id: UNCATEGORIZED_ID, name: "No Status", color: "gray" as SelectColor },
    ];
  }, [groupByProperty]);

  // Get title property (first text property)
  const titleProperty = useMemo(
    () => properties.find((p) => p.type === "text"),
    [properties]
  );

  // Group rows by column
  const rowsByColumn = useMemo(() => {
    const grouped: Record<string, Row[]> = {};

    columns.forEach((col) => {
      grouped[col.id] = [];
    });

    rows.forEach((row) => {
      if (!groupByProperty) {
        grouped[UNCATEGORIZED_ID]?.push(row);
        return;
      }

      const cell = row.cells.find((c) => c.propertyId === groupByProperty.id);
      const columnId = cell?.value || UNCATEGORIZED_ID;

      if (grouped[columnId]) {
        grouped[columnId].push(row);
      } else {
        grouped[UNCATEGORIZED_ID]?.push(row);
      }
    });

    return grouped;
  }, [rows, columns, groupByProperty]);

  // Get cell value for a row
  const getCellValue = useCallback(
    (row: Row, propertyId: string) => {
      const cell = row.cells.find((c) => c.propertyId === propertyId);
      return cell?.value || "";
    },
    []
  );

  // Get card title
  const getCardTitle = useCallback(
    (row: Row) => {
      if (!titleProperty) return "Untitled";
      return getCellValue(row, titleProperty.id) || "Untitled";
    },
    [titleProperty, getCellValue]
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent, rowId: string) => {
      setDraggedCardId(rowId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", rowId);

      // Add dragging class for visual feedback
      const target = e.target as HTMLElement;
      target.style.opacity = "0.5";
    },
    []
  );

  // Handle drag end
  const handleDragEnd = useCallback((e?: React.DragEvent) => {
    setDraggedCardId(null);
    setDragOverColumnId(null);
    if (e) {
      const target = e.target as HTMLElement;
      target.style.opacity = "1";
    }
  }, []);

  // Handle drag over column
  const handleDragOver = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverColumnId(columnId);
    },
    []
  );

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverColumnId(null);
  }, []);

  // Handle drop on column
  const handleDrop = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      const rowId = e.dataTransfer.getData("text/plain");

      if (!rowId || !groupByProperty) return;

      // Update the cell value to move to new column
      const newValue = columnId === UNCATEGORIZED_ID ? "" : columnId;
      onCellUpdate(rowId, groupByProperty.id, newValue);

      setDraggedCardId(null);
      setDragOverColumnId(null);
    },
    [groupByProperty, onCellUpdate]
  );

  // Handle add card to column
  const handleAddCard = useCallback(
    (columnId: string) => {
      if (!groupByProperty) {
        onAddRow();
        return;
      }

      const initialValue = columnId === UNCATEGORIZED_ID ? "" : columnId;
      onAddRow([{ propertyId: groupByProperty.id, value: initialValue }]);
    },
    [groupByProperty, onAddRow]
  );

  // Render property tags on card
  const renderCardProperties = useCallback(
    (row: Row) => {
      const displayProperties = properties.filter(
        (p) =>
          p.id !== titleProperty?.id &&
          p.id !== groupByProperty?.id &&
          p.type !== "checkbox"
      );

      return displayProperties.slice(0, 3).map((prop) => {
        const value = getCellValue(row, prop.id);
        if (!value) return null;

        switch (prop.type) {
          case "select":
          case "multi_select": {
            const selectedIds = value.split(",").filter(Boolean);
            const options = prop.parsedOptions.options || [];
            const selectedOptions = options.filter((opt) =>
              selectedIds.includes(opt.id)
            );

            return selectedOptions.map((opt) => (
              <span
                key={`${prop.id}-${opt.id}`}
                className={`select-tag color-${opt.color}`}
                style={{ fontSize: 11, padding: "1px 6px" }}
              >
                {opt.name}
              </span>
            ));
          }

          case "date":
            return (
              <span
                key={prop.id}
                className="board-card-date"
                style={{
                  fontSize: 11,
                  color: "var(--ink-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>📅</span>
                {formatDate(value)}
              </span>
            );

          case "number":
            return (
              <span
                key={prop.id}
                style={{
                  fontSize: 11,
                  color: "var(--ink-secondary)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value}
              </span>
            );

          default:
            return null;
        }
      });
    },
    [properties, titleProperty, groupByProperty, getCellValue]
  );

  // No select properties message
  if (selectProperties.length === 0) {
    return (
      <div className="board-empty-state">
        <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
        <div className="board-empty-title">Select 속성이 필요합니다</div>
        <div className="board-empty-description">
          보드 뷰를 사용하려면 먼저 Select 타입의 속성을 추가해주세요.
          <br />
          Select 속성의 옵션들이 보드의 열(Column)이 됩니다.
        </div>
      </div>
    );
  }

  return (
    <div className="board-view-container">
      {/* Group By Selector */}
      <div className="board-group-by">
        <span className="board-group-by-label">그룹화 기준:</span>
        <select
          className="board-group-by-select"
          value={groupByProperty?.id || ""}
          onChange={(e) => onGroupByChange(e.target.value || null)}
        >
          {selectProperties.map((prop) => (
            <option key={prop.id} value={prop.id}>
              {prop.name}
            </option>
          ))}
        </select>
      </div>

      {/* Board Container */}
      <div className="board-container">
        <AnimatePresence mode="popLayout">
          {columns.map((column) => {
            const columnRows = rowsByColumn[column.id] || [];
            const isUncategorized = column.id === UNCATEGORIZED_ID;
            const isDragOver = dragOverColumnId === column.id;

            return (
              <motion.div
                key={column.id}
                className={`board-column ${isDragOver ? "drag-over" : ""}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="board-column-header">
                  <div className="board-column-title">
                    {!isUncategorized && (
                      <span
                        className="board-column-color"
                        style={{
                          background: getColorValue(column.color),
                        }}
                      />
                    )}
                    <span>{column.name}</span>
                    <span className="board-column-count">{columnRows.length}</span>
                  </div>
                  <button
                    className="board-column-add-btn"
                    onClick={() => handleAddCard(column.id)}
                    title="Add card"
                  >
                    +
                  </button>
                </div>

                {/* Cards */}
                <div className="board-cards">
                  <AnimatePresence mode="popLayout">
                    {columnRows.map((row) => {
                      const isDragging = draggedCardId === row.id;

                      return (
                        <motion.div
                          key={row.id}
                          className={`board-card ${isDragging ? "dragging" : ""}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, row.id)}
                          onDragEnd={() => handleDragEnd()}
                          onClick={() => onRowClick(row.id)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          layout
                        >
                          <div className="board-card-title">{getCardTitle(row)}</div>
                          <div className="board-card-props">
                            {renderCardProperties(row)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Empty Column State */}
                  {columnRows.length === 0 && (
                    <div className="board-column-empty">
                      <span>No items</span>
                    </div>
                  )}
                </div>

                {/* Add Card Button at Bottom */}
                <div
                  className="board-add-card"
                  onClick={() => handleAddCard(column.id)}
                >
                  <span>+ New</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Utility: Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

// Utility: Get color value from color name
function getColorValue(color: SelectColor): string {
  const colorMap: Record<SelectColor, string> = {
    default: "#e3e2e0",
    gray: "#9b9b9b",
    brown: "#64473a",
    orange: "#d9730d",
    yellow: "#cb912f",
    green: "#448361",
    blue: "#337ea9",
    purple: "#9065b0",
    pink: "#c14c8a",
    red: "#e03e3e",
  };
  return colorMap[color] || colorMap.default;
}
