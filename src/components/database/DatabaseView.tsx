"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  updateDatabase,
  addProperty,
  addRow,
  deleteRow,
  duplicateRow,
  updateCell,
  updateProperty,
  deleteProperty,
  reorderProperties,
  reorderRows,
  updateView,
} from "@/actions/database.actions";
import {
  PropertyType,
  parsePropertyOptions,
  parseViewConfig,
  generateOptionId,
  type SelectOption,
  type SelectColor,
  type FilterCondition,
  type SortCondition,
  type ViewConfig,
} from "@/types/database";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import PropertyMenu from "./PropertyMenu";
import RowDetailModal from "./RowDetailModal";
import FilterSort from "./FilterSort";
import BoardView from "./BoardView";
import CalendarView from "./CalendarView";

interface DatabaseViewProps {
  database: {
    id: string;
    title: string;
    icon: string | null;
    properties: Array<{
      id: string;
      name: string;
      type: string;
      options: string;
      order: number;
      width: number;
    }>;
    rows: Array<{
      id: string;
      order: number;
      cells: Array<{
        id: string;
        propertyId: string;
        value: string;
      }>;
    }>;
    views: Array<{
      id: string;
      name: string;
      type: string;
      config: string;
      order: number;
    }>;
  };
}

export default function DatabaseView({ database }: DatabaseViewProps) {
  // Get current view (use first view as default)
  const currentView = database.views[0];
  const initialViewConfig = currentView ? parseViewConfig(currentView.config) : {};

  const [title, setTitle] = useState(database.title);
  const [showPropertyMenu, setShowPropertyMenu] = useState(false);
  const [propertyMenuPosition, setPropertyMenuPosition] = useState({ x: 0, y: 0 });
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterCondition[]>(initialViewConfig.filters || []);
  const [sorts, setSorts] = useState<SortCondition[]>(initialViewConfig.sorts || []);

  // New state for enhanced features
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(initialViewConfig.hiddenColumns || []);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);
  const [showHiddenColumnsMenu, setShowHiddenColumnsMenu] = useState(false);

  // View type state (table, board, or calendar)
  const [viewType, setViewType] = useState<"table" | "board" | "calendar">(
    (currentView?.type as "table" | "board" | "calendar") || "table"
  );
  const [groupByPropertyId, setGroupByPropertyId] = useState<string | null>(
    initialViewConfig.groupBy || null
  );

  // Parse properties with options
  const properties = useMemo(() =>
    database.properties.map((prop) => ({
      ...prop,
      type: prop.type as PropertyType,
      parsedOptions: parsePropertyOptions(prop.options),
    })),
    [database.properties]
  );

  // Calendar view state - auto-select first date property
  const firstDateProperty = useMemo(
    () => properties.find((p) => p.type === "date"),
    [properties]
  );
  const [datePropertyId, setDatePropertyId] = useState<string | null>(
    initialViewConfig.dateProperty || firstDateProperty?.id || null
  );

  // Save view config when filters, sorts, hidden columns, groupBy, or dateProperty change
  useEffect(() => {
    if (!currentView) return;

    const saveTimeout = setTimeout(async () => {
      const config: ViewConfig = {
        filters,
        sorts,
        hiddenColumns,
        groupBy: groupByPropertyId ?? undefined,
        dateProperty: datePropertyId ?? undefined,
      };
      await updateView(currentView.id, {
        type: viewType,
        config,
      });
    }, 500); // Debounce save by 500ms

    return () => clearTimeout(saveTimeout);
  }, [filters, sorts, hiddenColumns, groupByPropertyId, datePropertyId, viewType, currentView]);

  // Filter visible properties
  const visibleProperties = useMemo(() =>
    properties.filter((p) => !hiddenColumns.includes(p.id)),
    [properties, hiddenColumns]
  );

  // Filter and sort rows
  const filteredAndSortedRows = useMemo(() => {
    let result = [...database.rows];

    // Apply filters
    if (filters.length > 0) {
      result = result.filter((row) => {
        return filters.every((filter) => {
          const cell = row.cells.find((c) => c.propertyId === filter.propertyId);
          const value = cell?.value || "";
          const property = properties.find((p) => p.id === filter.propertyId);

          switch (filter.operator) {
            case "equals":
              return value === filter.value;
            case "not_equals":
              return value !== filter.value;
            case "contains":
              return value.toLowerCase().includes(filter.value.toLowerCase());
            case "not_contains":
              return !value.toLowerCase().includes(filter.value.toLowerCase());
            case "is_empty":
              return !value || value === "";
            case "is_not_empty":
              return value && value !== "";
            case "greater_than":
              if (property?.type === "number") {
                return parseFloat(value) > parseFloat(filter.value);
              }
              if (property?.type === "date") {
                return new Date(value) > new Date(filter.value);
              }
              return value > filter.value;
            case "less_than":
              if (property?.type === "number") {
                return parseFloat(value) < parseFloat(filter.value);
              }
              if (property?.type === "date") {
                return new Date(value) < new Date(filter.value);
              }
              return value < filter.value;
            default:
              return true;
          }
        });
      });
    }

    // Apply sorts
    if (sorts.length > 0) {
      result.sort((a, b) => {
        for (const sort of sorts) {
          const cellA = a.cells.find((c) => c.propertyId === sort.propertyId);
          const cellB = b.cells.find((c) => c.propertyId === sort.propertyId);
          const valueA = cellA?.value || "";
          const valueB = cellB?.value || "";
          const property = properties.find((p) => p.id === sort.propertyId);

          let comparison = 0;

          if (property?.type === "number") {
            comparison = (parseFloat(valueA) || 0) - (parseFloat(valueB) || 0);
          } else if (property?.type === "date") {
            comparison = new Date(valueA).getTime() - new Date(valueB).getTime();
          } else if (property?.type === "checkbox") {
            comparison = (valueA === "true" ? 1 : 0) - (valueB === "true" ? 1 : 0);
          } else {
            comparison = valueA.localeCompare(valueB, "ko");
          }

          if (comparison !== 0) {
            return sort.direction === "asc" ? comparison : -comparison;
          }
        }
        return 0;
      });
    }

    return result;
  }, [database.rows, filters, sorts, properties]);

  // Handle title change
  const handleTitleChange = useCallback(async (newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const handleTitleBlur = useCallback(async () => {
    if (title !== database.title) {
      await updateDatabase(database.id, { title });
    }
  }, [database.id, database.title, title]);

  // Handle add property
  const handleAddProperty = useCallback(
    async (name: string, type: PropertyType) => {
      await addProperty(database.id, name, type);
      setShowPropertyMenu(false);
    },
    [database.id]
  );

  // Handle property click (for editing)
  const handlePropertyClick = useCallback(
    (propertyId: string, e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect?.();
      if (rect) {
        setPropertyMenuPosition({ x: rect.left, y: rect.bottom });
      } else {
        setPropertyMenuPosition({ x: 100, y: 100 });
      }
      setEditingPropertyId(propertyId);
      setShowPropertyMenu(true);
    },
    []
  );

  // Handle add column button click
  const handleAddColumnClick = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPropertyMenuPosition({ x: rect.left, y: rect.bottom });
    setEditingPropertyId(null);
    setShowPropertyMenu(true);
  }, []);

  // Handle property update
  const handlePropertyUpdate = useCallback(
    async (propertyId: string, data: { name?: string; type?: PropertyType; options?: SelectOption[] }) => {
      await updateProperty(propertyId, data);
    },
    []
  );

  // Handle property delete
  const handlePropertyDelete = useCallback(async (propertyId: string) => {
    await deleteProperty(propertyId);
    setShowPropertyMenu(false);
    setEditingPropertyId(null);
  }, []);

  // Handle property resize
  const handlePropertyResize = useCallback(
    async (propertyId: string, width: number) => {
      await updateProperty(propertyId, { width });
    },
    []
  );

  // Handle properties reorder
  const handlePropertiesReorder = useCallback(
    async (propertyIds: string[]) => {
      await reorderProperties(database.id, propertyIds);
    },
    [database.id]
  );

  // Handle column visibility toggle
  const handleToggleColumnVisibility = useCallback((propertyId: string) => {
    setHiddenColumns((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      }
      return [...prev, propertyId];
    });
  }, []);

  // Handle add row (with optional initial cells for board view)
  const handleAddRow = useCallback(
    async (initialCells?: { propertyId: string; value: string }[]) => {
      await addRow(database.id, initialCells);
    },
    [database.id]
  );

  // Handle insert row at position
  const handleInsertRowAbove = useCallback(
    async (rowId: string) => {
      // For simplicity, just add a new row (proper insertion would require server-side order adjustment)
      await addRow(database.id);
    },
    [database.id]
  );

  const handleInsertRowBelow = useCallback(
    async (rowId: string) => {
      await addRow(database.id);
    },
    [database.id]
  );

  // Handle delete row
  const handleDeleteRow = useCallback(async (rowId: string) => {
    await deleteRow(rowId);
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
  }, []);

  // Handle duplicate row
  const handleDuplicateRow = useCallback(async (rowId: string) => {
    await duplicateRow(rowId);
  }, []);

  // Handle cell update
  const handleCellUpdate = useCallback(
    async (rowId: string, propertyId: string, value: string) => {
      await updateCell(rowId, propertyId, value);
    },
    []
  );

  // Handle add select option
  const handleAddSelectOption = useCallback(
    async (propertyId: string, optionName: string, color: SelectColor = "default") => {
      const property = properties.find((p) => p.id === propertyId);
      if (!property) return;

      const existingOptions = property.parsedOptions.options || [];
      const newOption: SelectOption = {
        id: generateOptionId(),
        name: optionName,
        color,
      };

      await updateProperty(propertyId, {
        options: [...existingOptions, newOption],
      });
    },
    [properties]
  );

  // Handle row click (open modal)
  const handleRowClick = useCallback((rowId: string) => {
    setSelectedRowId(rowId);
  }, []);

  // Close property menu
  const handleClosePropertyMenu = useCallback(() => {
    setShowPropertyMenu(false);
    setEditingPropertyId(null);
  }, []);

  // Row selection
  const handleSelectRow = useCallback((rowId: string, selected: boolean) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(rowId);
      } else {
        next.delete(rowId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedRows(new Set(filteredAndSortedRows.map((r) => r.id)));
      } else {
        setSelectedRows(new Set());
      }
    },
    [filteredAndSortedRows]
  );

  const allSelected =
    filteredAndSortedRows.length > 0 &&
    filteredAndSortedRows.every((r) => selectedRows.has(r.id));

  // Row drag & drop
  const handleRowDragStart = useCallback((rowId: string, e: React.DragEvent) => {
    setDraggingRowId(rowId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", rowId);
  }, []);

  const handleRowDragOver = useCallback(
    (rowId: string, e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggingRowId && rowId !== draggingRowId) {
        setDragOverRowId(rowId);
      }
    },
    [draggingRowId]
  );

  const handleRowDragLeave = useCallback(() => {
    setDragOverRowId(null);
  }, []);

  const handleRowDrop = useCallback(
    async (targetRowId: string, e: React.DragEvent) => {
      e.preventDefault();
      const sourceRowId = e.dataTransfer.getData("text/plain");

      if (sourceRowId && sourceRowId !== targetRowId) {
        const currentOrder = filteredAndSortedRows.map((r) => r.id);
        const sourceIndex = currentOrder.indexOf(sourceRowId);
        const targetIndex = currentOrder.indexOf(targetRowId);

        if (sourceIndex !== -1 && targetIndex !== -1) {
          currentOrder.splice(sourceIndex, 1);
          currentOrder.splice(targetIndex, 0, sourceRowId);
          await reorderRows(database.id, currentOrder);
        }
      }

      setDraggingRowId(null);
      setDragOverRowId(null);
    },
    [filteredAndSortedRows, database.id]
  );

  const handleRowDragEnd = useCallback(() => {
    setDraggingRowId(null);
    setDragOverRowId(null);
  }, []);

  // Handle row-to-row keyboard navigation
  const handleNavigateRow = useCallback(
    (sourceRowIndex: number, direction: "up" | "down", columnIndex: number) => {
      const targetRowIndex = direction === "down" ? sourceRowIndex + 1 : sourceRowIndex - 1;
      if (targetRowIndex < 0 || targetRowIndex >= filteredAndSortedRows.length) return;

      const targetRowId = filteredAndSortedRows[targetRowIndex].id;
      const targetRow = document.querySelector(`[data-row-id="${targetRowId}"]`);
      if (!targetRow) return;

      const cells = targetRow.querySelectorAll(".table-cell");
      const targetCell = cells[columnIndex] as HTMLElement;
      targetCell?.focus();
    },
    [filteredAndSortedRows]
  );

  // Bulk delete selected rows
  const handleBulkDelete = useCallback(async () => {
    if (selectedRows.size === 0) return;

    const confirmDelete = window.confirm(
      `${selectedRows.size}개의 행을 삭제하시겠습니까?`
    );

    if (confirmDelete) {
      for (const rowId of selectedRows) {
        await deleteRow(rowId);
      }
      setSelectedRows(new Set());
    }
  }, [selectedRows]);

  // Get selected row data
  const selectedRow = selectedRowId
    ? database.rows.find((r) => r.id === selectedRowId)
    : null;

  return (
    <div className="database-container">
      {/* Database Header */}
      <div className="database-header">
        <span className="database-icon">{database.icon || "📊"}</span>
        <input
          type="text"
          className="database-title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Untitled"
        />
      </div>

      {/* Toolbar with Filter & Sort */}
      <div className="database-toolbar">
        {/* View Type Selector */}
        <div className="view-type-selector">
          <button
            className={`view-type-btn ${viewType === "table" ? "active" : ""}`}
            onClick={() => setViewType("table")}
            title="Table View"
          >
            <span className="view-type-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="12" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
                <rect x="1" y="5" width="12" height="3" rx="0.5" fill="currentColor"/>
                <rect x="1" y="9" width="12" height="3" rx="0.5" fill="currentColor" opacity="0.6"/>
              </svg>
            </span>
            <span>Table</span>
          </button>
          <button
            className={`view-type-btn ${viewType === "board" ? "active" : ""}`}
            onClick={() => setViewType("board")}
            title="Board View"
          >
            <span className="view-type-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="3.5" height="12" rx="0.5" fill="currentColor" opacity="0.3"/>
                <rect x="5.25" y="1" width="3.5" height="8" rx="0.5" fill="currentColor"/>
                <rect x="9.5" y="1" width="3.5" height="10" rx="0.5" fill="currentColor" opacity="0.6"/>
              </svg>
            </span>
            <span>Board</span>
          </button>
          {firstDateProperty && (
            <button
              className={`view-type-btn ${viewType === "calendar" ? "active" : ""}`}
              onClick={() => setViewType("calendar")}
              title="Calendar View"
            >
              <span className="view-type-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="2" width="12" height="11" rx="1" stroke="currentColor" fill="none"/>
                  <line x1="1" y1="5" x2="13" y2="5" stroke="currentColor"/>
                  <line x1="4" y1="1" x2="4" y2="3" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="10" y1="1" x2="10" y2="3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </span>
              <span>Calendar</span>
            </button>
          )}
        </div>

        <div className="toolbar-divider" />

        <FilterSort
          properties={properties}
          filters={filters}
          sorts={sorts}
          onFiltersChange={setFilters}
          onSortsChange={setSorts}
        />

        {/* Hidden columns toggle (only in table view) */}
        {viewType === "table" && hiddenColumns.length > 0 && (
          <div style={{ position: "relative" }}>
            <button
              className="database-toolbar-btn"
              onClick={() => setShowHiddenColumnsMenu(!showHiddenColumnsMenu)}
            >
              <span>👁️</span>
              <span>숨긴 열 ({hiddenColumns.length})</span>
            </button>
            {showHiddenColumnsMenu && (
              <>
                <div
                  className="dropdown-overlay"
                  onClick={() => setShowHiddenColumnsMenu(false)}
                  style={{ background: "transparent" }}
                />
                <div
                  className="dropdown-menu"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: 4,
                    minWidth: 180,
                  }}
                >
                  <div className="dropdown-section-title">숨긴 열</div>
                  {properties
                    .filter((p) => hiddenColumns.includes(p.id))
                    .map((property) => (
                      <div
                        key={property.id}
                        className="dropdown-item"
                        onClick={() => {
                          handleToggleColumnVisibility(property.id);
                        }}
                      >
                        <span className="dropdown-item-icon">👁️</span>
                        <span>{property.name}</span>
                        <span style={{ marginLeft: "auto", fontSize: 12 }}>표시</span>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Bulk actions (only in table view) */}
        {viewType === "table" && selectedRows.size > 0 && (
          <button
            className="database-toolbar-btn"
            onClick={handleBulkDelete}
            style={{ color: "var(--destructive)" }}
          >
            <span>🗑️</span>
            <span>{selectedRows.size}개 삭제</span>
          </button>
        )}

        <div style={{ flex: 1 }} />

        {/* Row count */}
        <span style={{ fontSize: 13, color: "var(--ink-tertiary)" }}>
          {filteredAndSortedRows.length}개 항목
          {filters.length > 0 && ` (전체 ${database.rows.length}개)`}
        </span>
      </div>

      {/* Conditional View Rendering */}
      {viewType === "table" ? (
        /* Table View */
        <table className="database-table">
          <thead>
            <TableHeader
              properties={properties}
              hiddenColumns={hiddenColumns}
              onPropertyClick={handlePropertyClick}
              onAddColumnClick={handleAddColumnClick}
              onPropertyResize={handlePropertyResize}
              onPropertiesReorder={handlePropertiesReorder}
              onToggleColumnVisibility={handleToggleColumnVisibility}
              onDeleteProperty={handlePropertyDelete}
              onSelectAll={handleSelectAll}
              allSelected={allSelected}
            />
          </thead>
          <tbody>
            {filteredAndSortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleProperties.length + 2}
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "var(--ink-tertiary)",
                  }}
                >
                  {database.rows.length === 0 ? (
                    <div>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                      <div style={{ fontSize: 16, marginBottom: 8 }}>
                        데이터가 없습니다
                      </div>
                      <div style={{ fontSize: 13 }}>
                        아래 &quot;새 항목&quot; 버튼을 눌러 첫 번째 데이터를 추가하세요
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 16 }}>
                        필터 조건에 맞는 항목이 없습니다
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{ marginTop: 12 }}
                        onClick={() => setFilters([])}
                      >
                        필터 초기화
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredAndSortedRows.map((row, index) => (
                <TableRow
                  key={row.id}
                  row={row}
                  rowIndex={index}
                  properties={properties}
                  hiddenColumns={hiddenColumns}
                  isSelected={selectedRows.has(row.id)}
                  isDragging={draggingRowId === row.id}
                  isDragOver={dragOverRowId === row.id}
                  onCellUpdate={handleCellUpdate}
                  onRowClick={handleRowClick}
                  onDeleteRow={handleDeleteRow}
                  onDuplicateRow={handleDuplicateRow}
                  onAddSelectOption={handleAddSelectOption}
                  onSelectRow={handleSelectRow}
                  onDragStart={handleRowDragStart}
                  onDragOver={handleRowDragOver}
                  onDragLeave={handleRowDragLeave}
                  onDrop={handleRowDrop}
                  onDragEnd={handleRowDragEnd}
                  onInsertRowAbove={handleInsertRowAbove}
                  onInsertRowBelow={handleInsertRowBelow}
                  onNavigateRow={(direction, columnIndex) => handleNavigateRow(index, direction, columnIndex)}
                  totalRows={filteredAndSortedRows.length}
                />
              ))
            )}
            {/* Add Row Button */}
            <tr className="table-add-row">
              <td colSpan={visibleProperties.length + 2}>
                <button className="table-add-row-btn" onClick={() => handleAddRow()}>
                  <span>+</span>
                  <span>새 항목</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      ) : viewType === "board" ? (
        /* Board View */
        <BoardView
          rows={filteredAndSortedRows}
          properties={properties}
          groupByPropertyId={groupByPropertyId}
          onGroupByChange={setGroupByPropertyId}
          onCellUpdate={handleCellUpdate}
          onRowClick={handleRowClick}
          onAddRow={handleAddRow}
          onAddSelectOption={handleAddSelectOption}
        />
      ) : viewType === "calendar" && datePropertyId ? (
        /* Calendar View */
        <CalendarView
          rows={filteredAndSortedRows}
          properties={properties}
          datePropertyId={datePropertyId}
          onCellUpdate={handleCellUpdate}
          onAddRow={handleAddRow}
          onRowClick={handleRowClick}
        />
      ) : null}

      {/* Property Menu */}
      {showPropertyMenu && (
        <PropertyMenu
          position={propertyMenuPosition}
          editingProperty={
            editingPropertyId
              ? properties.find((p) => p.id === editingPropertyId) ?? null
              : null
          }
          onClose={handleClosePropertyMenu}
          onAddProperty={handleAddProperty}
          onUpdateProperty={handlePropertyUpdate}
          onDeleteProperty={handlePropertyDelete}
        />
      )}

      {/* Row Detail Modal */}
      {selectedRow && (
        <RowDetailModal
          row={selectedRow}
          properties={properties}
          onClose={() => setSelectedRowId(null)}
          onCellUpdate={handleCellUpdate}
          onAddSelectOption={handleAddSelectOption}
        />
      )}
    </div>
  );
}
