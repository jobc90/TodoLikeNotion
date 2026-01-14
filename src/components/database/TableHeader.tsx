"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { PropertyType, PROPERTY_TYPE_ICONS } from "@/types/database";

interface Property {
  id: string;
  name: string;
  type: PropertyType;
  width: number;
}

interface TableHeaderProps {
  properties: Property[];
  hiddenColumns: string[];
  onPropertyClick: (propertyId: string, e: React.MouseEvent) => void;
  onAddColumnClick: (e: React.MouseEvent) => void;
  onPropertyResize: (propertyId: string, width: number) => void;
  onPropertiesReorder: (propertyIds: string[]) => void;
  onToggleColumnVisibility: (propertyId: string) => void;
  onDeleteProperty: (propertyId: string) => void;
  onSelectAll: (selected: boolean) => void;
  allSelected: boolean;
}

export default function TableHeader({
  properties,
  hiddenColumns,
  onPropertyClick,
  onAddColumnClick,
  onPropertyResize,
  onPropertiesReorder,
  onToggleColumnVisibility,
  onDeleteProperty,
  onSelectAll,
  allSelected,
}: TableHeaderProps) {
  const [resizing, setResizing] = useState<string | null>(null);
  const [resizeWidth, setResizeWidth] = useState<number>(0);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<{
    propertyId: string;
    x: number;
    y: number;
  } | null>(null);

  // Filter visible properties
  const visibleProperties = properties.filter(
    (p) => !hiddenColumns.includes(p.id)
  );

  // Column resize with persistence
  const handleResizeStart = useCallback(
    (propertyId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing(propertyId);

      const startX = e.clientX;
      const property = properties.find((p) => p.id === propertyId);
      const startWidth = property?.width || 150;
      setResizeWidth(startWidth);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const diff = moveEvent.clientX - startX;
        const newWidth = Math.max(80, Math.min(500, startWidth + diff));
        setResizeWidth(newWidth);

        const th = document.querySelector(`[data-property-id="${propertyId}"]`) as HTMLElement;
        if (th) {
          th.style.width = `${newWidth}px`;
        }
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        const diff = upEvent.clientX - startX;
        const finalWidth = Math.max(80, Math.min(500, startWidth + diff));
        onPropertyResize(propertyId, finalWidth);
        setResizing(null);
        setResizeWidth(0);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [properties, onPropertyResize]
  );

  // Drag & Drop for column reordering
  const handleDragStart = useCallback(
    (propertyId: string, e: React.DragEvent) => {
      setDragging(propertyId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", propertyId);
      const target = e.currentTarget as HTMLElement;
      if (target) {
        e.dataTransfer.setDragImage(target, 50, 20);
      }
    },
    []
  );

  const handleDragOver = useCallback(
    (propertyId: string, e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragging && propertyId !== dragging) {
        setDragOverId(propertyId);
      }
    },
    [dragging]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (targetPropertyId: string, e: React.DragEvent) => {
      e.preventDefault();
      const sourcePropertyId = e.dataTransfer.getData("text/plain");

      if (sourcePropertyId && sourcePropertyId !== targetPropertyId) {
        const currentOrder = visibleProperties.map((p) => p.id);
        const sourceIndex = currentOrder.indexOf(sourcePropertyId);
        const targetIndex = currentOrder.indexOf(targetPropertyId);

        if (sourceIndex !== -1 && targetIndex !== -1) {
          currentOrder.splice(sourceIndex, 1);
          currentOrder.splice(targetIndex, 0, sourcePropertyId);
          onPropertiesReorder(currentOrder);
        }
      }

      setDragging(null);
      setDragOverId(null);
    },
    [visibleProperties, onPropertiesReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDragging(null);
    setDragOverId(null);
  }, []);

  // Hover menu handlers
  const handleMenuClick = useCallback((propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuOpen({
      propertyId,
      x: rect.left,
      y: rect.bottom + 4,
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(null);
  }, []);

  const handleEditColumn = useCallback(() => {
    if (menuOpen) {
      // Find the column header to get correct position
      const th = document.querySelector(`[data-property-id="${menuOpen.propertyId}"]`) as HTMLElement;
      if (th) {
        const rect = th.getBoundingClientRect();
        // Create a synthetic event-like object with the correct currentTarget
        const syntheticEvent = {
          currentTarget: { getBoundingClientRect: () => rect }
        } as React.MouseEvent;
        onPropertyClick(menuOpen.propertyId, syntheticEvent);
      } else {
        // Fallback - create event with menu position
        const syntheticEvent = {
          currentTarget: { getBoundingClientRect: () => ({ left: menuOpen.x, bottom: menuOpen.y }) }
        } as React.MouseEvent;
        onPropertyClick(menuOpen.propertyId, syntheticEvent);
      }
      closeMenu();
    }
  }, [menuOpen, onPropertyClick, closeMenu]);

  const handleHideColumn = useCallback(() => {
    if (menuOpen) {
      onToggleColumnVisibility(menuOpen.propertyId);
      closeMenu();
    }
  }, [menuOpen, onToggleColumnVisibility, closeMenu]);

  const handleDeleteColumn = useCallback(() => {
    if (menuOpen) {
      onDeleteProperty(menuOpen.propertyId);
      closeMenu();
    }
  }, [menuOpen, onDeleteProperty, closeMenu]);

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
          minWidth: 160,
        }}
      >
        <div className="dropdown-item" onClick={handleEditColumn}>
          <span className="dropdown-item-icon">✏️</span>
          <span>속성 편집</span>
        </div>
        <div className="dropdown-item" onClick={handleHideColumn}>
          <span className="dropdown-item-icon">👁️</span>
          <span>숨기기</span>
        </div>
        <div className="dropdown-divider" />
        <div
          className="dropdown-item"
          onClick={handleDeleteColumn}
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
      <tr className="table-header-row">
        {/* Row select checkbox header */}
        <th className="table-row-select">
          <div className="table-row-checkbox">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
            />
          </div>
        </th>

        {/* Property columns */}
        {visibleProperties.map((property) => (
          <th
            key={property.id}
            data-property-id={property.id}
            className={`table-header-cell ${dragging === property.id ? "dragging" : ""} ${dragOverId === property.id ? "drag-over" : ""}`}
            style={{ width: resizing === property.id ? resizeWidth : property.width }}
            draggable
            onDragStart={(e) => handleDragStart(property.id, e)}
            onDragOver={(e) => handleDragOver(property.id, e)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(property.id, e)}
            onDragEnd={handleDragEnd}
            onMouseEnter={() => setHoveredColumnId(property.id)}
            onMouseLeave={() => setHoveredColumnId(null)}
          >
            <div className="table-header-content">
              {/* Hover menu button (3 dots) - Sliding Effect */}
              <button
                className={`sliding-menu-btn ${hoveredColumnId === property.id || menuOpen?.propertyId === property.id ? "visible" : ""}`}
                onClick={(e) => handleMenuClick(property.id, e)}
                title="옵션"
              >
                ⋮
              </button>
              <span className="table-header-icon">
                {PROPERTY_TYPE_ICONS[property.type]}
              </span>
              <span className="table-header-name">{property.name}</span>
            </div>
            <div
              className={`table-header-resize ${resizing === property.id ? "resizing" : ""}`}
              onMouseDown={(e) => handleResizeStart(property.id, e)}
            />
          </th>
        ))}

        {/* Add column button */}
        <th className="table-add-column">
          <button className="table-add-column-btn" onClick={onAddColumnClick}>
            +
          </button>
        </th>
      </tr>

      {/* Menu (rendered via portal) */}
      {menuPortal}
    </>
  );
}
