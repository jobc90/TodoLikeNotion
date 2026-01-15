/**
 * CalendarView Component - Usage Example
 *
 * This file demonstrates how to integrate CalendarView into DatabaseView
 */

import CalendarView from "./CalendarView";

// Example integration into DatabaseView.tsx:
/*

// 1. Add import
import CalendarView from "./CalendarView";

// 2. Add state for date property selection
const [calendarDatePropertyId, setCalendarDatePropertyId] = useState<string | null>(null);

// 3. Add calendar view rendering in the view switcher
{currentView.type === "calendar" && (
  <CalendarView
    rows={filteredAndSortedRows}
    properties={parsedProperties}
    datePropertyId={
      calendarDatePropertyId ||
      parsedProperties.find((p) => p.type === "date")?.id ||
      ""
    }
    onCellUpdate={handleCellUpdate}
    onAddRow={handleAddRow}
    onRowClick={(rowId) => {
      setSelectedRowId(rowId);
      setIsRowModalOpen(true);
    }}
  />
)}

// 4. Add date property selector in toolbar (optional)
{currentView.type === "calendar" && (
  <select
    value={calendarDatePropertyId || ""}
    onChange={(e) => setCalendarDatePropertyId(e.target.value)}
  >
    {parsedProperties
      .filter((p) => p.type === "date")
      .map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
  </select>
)}

*/

// Example standalone usage:
export function CalendarViewExample() {
  const rows = [
    {
      id: "row1",
      order: 0,
      cells: [
        { id: "cell1", propertyId: "title", value: "Meeting with team" },
        { id: "cell2", propertyId: "date", value: "2026-01-15" },
      ],
    },
    {
      id: "row2",
      order: 1,
      cells: [
        { id: "cell3", propertyId: "title", value: "Project deadline" },
        { id: "cell4", propertyId: "date", value: "2026-01-20" },
      ],
    },
  ];

  const properties = [
    {
      id: "title",
      name: "Title",
      type: "text" as const,
      width: 200,
      parsedOptions: {},
    },
    {
      id: "date",
      name: "Date",
      type: "date" as const,
      width: 150,
      parsedOptions: {},
    },
  ];

  return (
    <CalendarView
      rows={rows}
      properties={properties}
      datePropertyId="date"
      onCellUpdate={(rowId, propertyId, value) => {
        console.log("Cell updated:", { rowId, propertyId, value });
      }}
      onAddRow={(initialCells) => {
        console.log("Add row with initial cells:", initialCells);
      }}
      onRowClick={(rowId) => {
        console.log("Row clicked:", rowId);
      }}
    />
  );
}
