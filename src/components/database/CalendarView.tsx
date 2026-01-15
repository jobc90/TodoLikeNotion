"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyType } from "@/types/database";

interface SelectOption {
  id: string;
  name: string;
  color: string;
}

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

interface CalendarViewProps {
  rows: Row[];
  properties: Property[];
  datePropertyId: string;
  onCellUpdate: (rowId: string, propertyId: string, value: string) => void;
  onAddRow: (initialCells?: { propertyId: string; value: string }[]) => void;
  onRowClick?: (rowId: string) => void;
}

type CalendarViewType = "week" | "month";

interface CalendarEvent {
  row: Row;
  date: Date;
  title: string;
}

export default function CalendarView({
  rows,
  properties,
  datePropertyId,
  onCellUpdate,
  onAddRow,
  onRowClick,
}: CalendarViewProps) {
  const [viewType, setViewType] = useState<CalendarViewType>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  // Get date property
  const dateProperty = useMemo(
    () => properties.find((p) => p.id === datePropertyId),
    [properties, datePropertyId]
  );

  // Get title property (first text property)
  const titleProperty = useMemo(
    () => properties.find((p) => p.type === "text"),
    [properties]
  );

  // Get cell value for a row
  const getCellValue = useCallback(
    (row: Row, propertyId: string) => {
      const cell = row.cells.find((c) => c.propertyId === propertyId);
      return cell?.value || "";
    },
    []
  );

  // Get event title
  const getEventTitle = useCallback(
    (row: Row) => {
      if (!titleProperty) return "Untitled";
      return getCellValue(row, titleProperty.id) || "Untitled";
    },
    [titleProperty, getCellValue]
  );

  // Parse events from rows
  const events = useMemo(() => {
    if (!dateProperty) return [];

    return rows
      .map((row) => {
        const dateValue = getCellValue(row, dateProperty.id);
        if (!dateValue) return null;

        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return null;

        return {
          row,
          date,
          title: getEventTitle(row),
        };
      })
      .filter((e): e is CalendarEvent => e !== null);
  }, [rows, dateProperty, getCellValue, getEventTitle]);

  // Get week start (Monday)
  const getWeekStart = useCallback((date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Adjust to Monday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Get month start
  const getMonthStart = useCallback((date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Get week days
  const weekDays = useMemo(() => {
    const start = getWeekStart(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate, getWeekStart]);

  // Get month days
  const monthDays = useMemo(() => {
    const start = getMonthStart(currentDate);

    // Get first day of month (0 = Sunday)
    const firstDayOfWeek = start.getDay();
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Adjust for Monday start

    // Calculate calendar start (include previous month days)
    const calendarStart = new Date(start);
    calendarStart.setDate(start.getDate() - startOffset);

    // Calculate total days to show (6 weeks max)
    const totalDays = 42;

    return Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(calendarStart);
      d.setDate(calendarStart.getDate() + i);
      return {
        date: d,
        isCurrentMonth: d.getMonth() === currentDate.getMonth(),
      };
    });
  }, [currentDate, getMonthStart]);

  // Get events for a specific date
  const getEventsForDate = useCallback(
    (date: Date) => {
      return events.filter((event) => isSameDay(event.date, date));
    },
    [events]
  );

  // Navigation
  const goToPrevious = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewType === "week") {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setMonth(prev.getMonth() - 1);
      }
      return newDate;
    });
  }, [viewType]);

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewType === "week") {
        newDate.setDate(prev.getDate() + 7);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  }, [viewType]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((event: CalendarEvent) => {
    setDraggedEvent(event);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedEvent(null);
  }, []);

  const handleDrop = useCallback(
    (date: Date) => {
      if (!draggedEvent || !dateProperty) return;

      const newDateStr = date.toISOString().split("T")[0];
      onCellUpdate(draggedEvent.row.id, dateProperty.id, newDateStr);
      setDraggedEvent(null);
    },
    [draggedEvent, dateProperty, onCellUpdate]
  );

  // Handle date click to add new event
  const handleDateClick = useCallback(
    (date: Date) => {
      if (!dateProperty) return;

      const dateStr = date.toISOString().split("T")[0];
      onAddRow([{ propertyId: dateProperty.id, value: dateStr }]);
    },
    [dateProperty, onAddRow]
  );

  // Handle event click
  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      onRowClick?.(event.row.id);
    },
    [onRowClick]
  );

  // Get current period label
  const periodLabel = useMemo(() => {
    if (viewType === "week") {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startMonth = weekStart.toLocaleDateString("ko-KR", {
        month: "long",
      });
      const endMonth = weekEnd.toLocaleDateString("ko-KR", { month: "long" });
      const year = weekStart.getFullYear();

      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${year}년 ${startMonth}`;
      }
      return `${year}년 ${startMonth} - ${endMonth}`;
    } else {
      return currentDate.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
      });
    }
  }, [viewType, currentDate, getWeekStart]);

  // No date property message
  if (!dateProperty) {
    return (
      <div className="calendar-empty-state">
        <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
        <div className="calendar-empty-title">Date 속성이 필요합니다</div>
        <div className="calendar-empty-description">
          캘린더 뷰를 사용하려면 Date 타입의 속성을 선택해주세요.
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-view-container">
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button
            className="calendar-nav-btn"
            onClick={goToPrevious}
            title={viewType === "week" ? "Previous week" : "Previous month"}
          >
            ‹
          </button>
          <button className="calendar-today-btn" onClick={goToToday}>
            오늘
          </button>
          <button
            className="calendar-nav-btn"
            onClick={goToNext}
            title={viewType === "week" ? "Next week" : "Next month"}
          >
            ›
          </button>
          <div className="calendar-period-label">{periodLabel}</div>
        </div>

        <div className="calendar-view-switch">
          <button
            className={`calendar-view-btn ${
              viewType === "week" ? "active" : ""
            }`}
            onClick={() => setViewType("week")}
          >
            주간
          </button>
          <button
            className={`calendar-view-btn ${
              viewType === "month" ? "active" : ""
            }`}
            onClick={() => setViewType("month")}
          >
            월간
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`calendar-grid ${viewType}`}>
        {/* Weekday headers */}
        <div className="calendar-weekday-header">
          {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Week View */}
        {viewType === "week" && (
          <div className="calendar-week-view">
            <AnimatePresence mode="wait">
              <motion.div
                key={weekDays[0].toISOString()}
                className="calendar-week-grid"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {weekDays.map((date) => {
                  const dayEvents = getEventsForDate(date);
                  const isToday = isSameDay(date, new Date());

                  return (
                    <div
                      key={date.toISOString()}
                      className={`calendar-day ${isToday ? "today" : ""}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(date)}
                    >
                      <div className="calendar-day-header">
                        <div className="calendar-day-number">
                          {date.getDate()}
                        </div>
                        <button
                          className="calendar-add-event-btn"
                          onClick={() => handleDateClick(date)}
                          title="Add event"
                        >
                          +
                        </button>
                      </div>

                      <div className="calendar-events">
                        <AnimatePresence>
                          {dayEvents.map((event) => (
                            <motion.div
                              key={event.row.id}
                              className="calendar-event"
                              draggable
                              onDragStart={() => handleDragStart(event)}
                              onDragEnd={handleDragEnd}
                              onClick={() => handleEventClick(event)}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="calendar-event-title">
                                {event.title}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Month View */}
        {viewType === "month" && (
          <AnimatePresence mode="wait">
            <motion.div
              key={getMonthStart(currentDate).toISOString()}
              className="calendar-month-grid"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {monthDays.map(({ date, isCurrentMonth }) => {
                const dayEvents = getEventsForDate(date);
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    key={date.toISOString()}
                    className={`calendar-day ${isToday ? "today" : ""} ${
                      !isCurrentMonth ? "other-month" : ""
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(date)}
                    onClick={() => handleDateClick(date)}
                  >
                    <div className="calendar-day-number">{date.getDate()}</div>

                    <div className="calendar-events">
                      <AnimatePresence>
                        {dayEvents.slice(0, 3).map((event) => (
                          <motion.div
                            key={event.row.id}
                            className="calendar-event"
                            draggable
                            onDragStart={() => handleDragStart(event)}
                            onDragEnd={handleDragEnd}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                          >
                            <div className="calendar-event-dot" />
                            <div className="calendar-event-title">
                              {event.title}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {dayEvents.length > 3 && (
                        <div className="calendar-event-more">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// Utility: Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
