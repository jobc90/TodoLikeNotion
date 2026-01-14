"use client";

import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  if (!mounted) return <div className="theme-toggle-placeholder" />;

  return (
    <motion.button
      className="relative flex items-center p-1 cursor-pointer"
      onClick={toggleTheme}
      style={{
        width: "52px",
        height: "28px",
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
        border: "1px solid var(--border)",
        borderRadius: "30px", // Enforce roundness
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute top-[2px] bottom-[2px] flex items-center justify-center shadow-sm"
        style={{
          width: "22px",
          height: "22px",
          backgroundColor: isDark ? "#000000" : "#FFFFFF",
          borderRadius: "50%", // Enforce circle
        }}
        initial={false}
        animate={{
          x: isDark ? 24 : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Sun Icon */}
          <motion.svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute text-yellow-500"
            style={{ color: "#F59E0B" }} // Amber-500
            initial={false}
            animate={{
              scale: isDark ? 0 : 1,
              opacity: isDark ? 0 : 1,
            }}
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </motion.svg>

          {/* Moon Icon */}
          <motion.svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute text-white"
            style={{ color: "#FFFFFF" }}
            initial={false}
            animate={{
              scale: isDark ? 1 : 0,
              opacity: isDark ? 1 : 0,
            }}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </motion.svg>
        </div>
      </motion.div>
    </motion.button>
  );
}
