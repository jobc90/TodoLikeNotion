"use client";

import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button className="theme-toggle" aria-label="Toggle theme">
        <span className="theme-toggle-track">
          <span className="theme-toggle-thumb" />
        </span>
      </button>
    );
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span className="theme-toggle-track" data-theme={theme}>
        <span className="theme-toggle-thumb">
          <span className="theme-toggle-icon">
            {theme === "dark" ? "🌙" : "☀️"}
          </span>
        </span>
      </span>
    </button>
  );
}
