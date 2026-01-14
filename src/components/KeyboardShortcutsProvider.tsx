"use client";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

/**
 * Global keyboard shortcuts provider
 *
 * Wraps the application and enables keyboard shortcuts throughout.
 * Must be a client component to use hooks.
 */
export default function KeyboardShortcutsProvider({
  children,
}: KeyboardShortcutsProviderProps) {
  // Initialize global keyboard shortcuts
  useKeyboardShortcuts();

  return <>{children}</>;
}
