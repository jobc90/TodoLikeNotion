"use client";

import { useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PropertyType, type SelectOption, type SelectColor } from "@/types/database";
import TableCell from "./TableCell";

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

interface TableRowProps {
  row: Row;
  rowIndex: number;
  properties: Property[];
  hiddenColumns: string[];
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onCellUpdate: (rowId: string, propertyId: string, value: string) => void;
  onRowClick: (rowId: string) => void;
  onDeleteRow: (rowId: string) => void;
  onDuplicateRow: (rowId: string) => void;
  onAddSelectOption: (propertyId: string, optionName: string, color?: SelectColor) => void;
  onSelectRow: (rowId: string, selected: boolean) => void;
  onDragStart: (rowId: string, e: React.DragEvent) => void;
  onDragOver: (rowId: string, e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (rowId: string, e: React.DragEvent) => void;
  onDragEnd: () => void;
  onInsertRowAbove: (rowId: string) => void;
  onInsertRowBelow: (rowId: string) => void;
  onNavigateRow?: (direction: "up" | "down", columnIndex: number) => void;
  totalRows?: number;
}

export default function TableRow({
  row,
  rowIndex,
  properties,
  hiddenColumns,
  isSelected,
  isDragging,
  isDragOver,
  onCellUpdate,
  onRowClick,
  onDeleteRow,
  onDuplicateRow,
  onAddSelectOption,
  onSelectRow,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onInsertRowAbove,
  onInsertRowBelow,
  onNavigateRow,
  totalRows,
}: TableRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState<{ x: number; y: number } | null>(null);

  // Filter visible properties
  const visibleProperties = properties.filter(
    (p) => !hiddenColumns.includes(p.id)
  );

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

  // Handle cell navigation
  const handleCellNavigate = useCallback(
    (columnIndex: number, direction: "left" | "right" | "up" | "down") => {
      const rowRef = document.querySelector(`[data-row-id="${row.id}"]`);
      if (!rowRef) return;

      if (direction === "left" || direction === "right") {
        const newIndex = direction === "right" ? columnIndex + 1 : columnIndex - 1;
        if (newIndex >= 0 && newIndex < visibleProperties.length) {
          const nextCell = rowRef.querySelectorAll(".table-cell")[newIndex] as HTMLElement;
          nextCell?.focus();
        } else if (direction === "right" && onNavigateRow && rowIndex < (totalRows ?? 0) - 1) {
          // Move to next row, first cell
          onNavigateRow("down", 0);
        } else if (direction === "left" && onNavigateRow && rowIndex > 0) {
          // Move to previous row, last cell
          onNavigateRow("up", visibleProperties.length - 1);
        }
      } else if (direction === "up" || direction === "down") {
        onNavigateRow?.(direction, columnIndex);
      }
    },
    [row.id, visibleProperties.length, rowIndex, totalRows, onNavigateRow]
  );

  const handleRowDoubleClick = useCallback(() => {
    onRowClick(row.id);
  }, [row.id, onRowClick]);

  // Hover menu click handler
  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuOpen({ x: rect.left, y: rect.bottom + 4 });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(null);
  }, []);

  // State for portal mounting
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Menu portal content
  const menuPortal = mounted && menuOpen && createPortal(
    <>
      <div
        className="dropdown-overlay"
        onClick={closeMenu}
        style={{ background: "transparent" }}
      />
      <div
        className="dropdown-menu"
        style={{
          position: "fixed",
          left: menuOpen.x,
          top: menuOpen.y,
          minWidth: 180,
        }}
      >
        <div
          className="dropdown-item"
          onClick={() => {
            onRowClick(row.id);
            closeMenu();
          }}
        >
          <span className="dropdown-item-icon">📄</span>
          <span>상세 보기</span>
        </div>
        <div className="dropdown-divider" />
        <div
          className="dropdown-item"
          onClick={() => {
            onInsertRowAbove(row.id);
            closeMenu();
          }}
        >
          <span className="dropdown-item-icon">⬆️</span>
          <span>위에 행 추가</span>
        </div>
        <div
          className="dropdown-item"
          onClick={() => {
            onInsertRowBelow(row.id);
            closeMenu();
          }}
        >
          <span className="dropdown-item-icon">⬇️</span>
          <span>아래에 행 추가</span>
        </div>
        <div className="dropdown-divider" />
        <div
          className="dropdown-item"
          onClick={() => {
            onDuplicateRow(row.id);
            closeMenu();
          }}
        >
          <span className="dropdown-item-icon">📋</span>
          <span>복제</span>
        </div>
        <div
          className="dropdown-item"
          onClick={() => {
            onDeleteRow(row.id);
            closeMenu();
          }}
          style={{ color: "var(--destructive)" }}
        >
          <span className="dropdown-item-icon">🗑️</span>
          <span>삭제</span>
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <>
      <tr
        data-row-id={row.id}
        className={`table-row ${isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""} ${isDragOver ? "drag-over" : ""}`}
        onDoubleClick={handleRowDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={(e) => onDragStart(row.id, e)}
        onDragOver={(e) => onDragOver(row.id, e)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(row.id, e)}
        onDragEnd={onDragEnd}
      >
        {/* Row select checkbox with hover menu */}
        <td className="table-row-select">
          <div className="table-row-checkbox">
            {/* Hover menu button (3 dots) - Sliding Effect */}
            <button
              className={`sliding-menu-btn ${isHovered || menuOpen ? "visible" : ""}`}
              onClick={handleMenuClick}
              title="옵션"
            >
              ⋮
            </button>
            <span className="table-row-drag-handle" title="드래그하여 순서 변경">
              ⋮⋮
            </span>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelectRow(row.id, e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </td>

        {/* Cells */}
        {visibleProperties.map((property, columnIndex) => (
          <TableCell
            key={property.id}
            property={property}
            value={getCellValue(property.id)}
            onUpdate={(value) => handleCellUpdate(property.id, value)}
            onAddSelectOption={(name, color) => onAddSelectOption(property.id, name, color)}
            onNavigate={(direction) => handleCellNavigate(columnIndex, direction)}
            tabIndex={rowIndex * visibleProperties.length + columnIndex}
          />
        ))}

        {/* Empty cell for add column */}
        <td className="table-add-column" />
      </tr>

      {/* Row Menu (rendered via portal) */}
      {menuPortal}
    </>
  );
}
