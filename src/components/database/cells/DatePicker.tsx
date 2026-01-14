"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface DatePickerProps {
  position: { x: number; y: number };
  value: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

export default function DatePicker({
  position,
  value,
  onSelect,
  onClose,
}: DatePickerProps) {
  const today = new Date();
  const selectedDate = value ? new Date(value) : null;

  const [viewDate, setViewDate] = useState(
    selectedDate || today
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handlePrevMonth = useCallback(() => {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }, []);

  const handleSelectDate = useCallback(
    (date: Date) => {
      const isoDate = date.toISOString().split("T")[0];
      onSelect(isoDate);
    },
    [onSelect]
  );

  const handleClear = useCallback(() => {
    onSelect("");
  }, [onSelect]);

  const handleToday = useCallback(() => {
    handleSelectDate(today);
  }, [handleSelectDate, today]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Calculate position to stay within viewport
  const menuStyle: React.CSSProperties = {
    left: Math.min(position.x, window.innerWidth - 260),
    top: Math.min(position.y, window.innerHeight - 320),
  };

  return (
    <div
      ref={dropdownRef}
      className="date-picker-dropdown"
      style={menuStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="date-picker-header">
        <button className="date-picker-nav" onClick={handlePrevMonth}>
          ‹
        </button>
        <span className="date-picker-month">
          {viewDate.getFullYear()}년 {MONTHS[viewDate.getMonth()]}
        </span>
        <button className="date-picker-nav" onClick={handleNextMonth}>
          ›
        </button>
      </div>

      {/* Day Labels */}
      <div className="date-picker-grid">
        {DAYS.map((day) => (
          <div key={day} className="date-picker-day-label">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="date-picker-grid">
        {generateCalendarDays().map((day, index) => (
          <button
            key={index}
            className={`date-picker-day ${!day.isCurrentMonth ? "other-month" : ""} ${isToday(day.date) ? "today" : ""} ${isSelected(day.date) ? "selected" : ""}`}
            onClick={() => handleSelectDate(day.date)}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 0 0",
          borderTop: "1px solid var(--border)",
          marginTop: 8,
        }}
      >
        <button
          className="database-toolbar-btn"
          onClick={handleToday}
          style={{ fontSize: 12 }}
        >
          오늘
        </button>
        <button
          className="database-toolbar-btn"
          onClick={handleClear}
          style={{ fontSize: 12 }}
        >
          지우기
        </button>
      </div>
    </div>
  );
}
