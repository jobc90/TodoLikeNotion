"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { useRouter } from "next/navigation";
import { createPage } from "@/actions/page.actions";

export interface KeyboardShortcutsOptions {
  enableNavigation?: boolean;
}

/**
 * Global keyboard shortcuts hook for the Notion-like app
 *
 * Shortcuts:
 * - Cmd/Ctrl+K: Open command palette
 * - Cmd/Ctrl+N: Create new page
 * - Cmd/Ctrl+Shift+N: Create new database
 * - Cmd/Ctrl+/: Show slash commands
 * - Escape: Close any open modal/menu
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const router = useRouter();

  // Cmd/Ctrl+K: Open command palette
  useHotkeys(
    "mod+k",
    (e) => {
      e.preventDefault();
      dispatchEvent(new CustomEvent("openCommandPalette"));
    },
    {
      enableOnFormTags: true,
      description: "Open command palette",
    }
  );

  // Cmd/Ctrl+N: Create new page
  useHotkeys(
    "mod+n",
    async (e) => {
      e.preventDefault();
      try {
        const page = await createPage();
        router.push(`/workspace/${page.id}`);
      } catch (error) {
        console.error("Failed to create page:", error);
      }
    },
    {
      enableOnFormTags: false,
      description: "Create new page",
    }
  );

  // Cmd/Ctrl+Shift+N: Create new database
  useHotkeys(
    "mod+shift+n",
    (e) => {
      e.preventDefault();
      dispatchEvent(new CustomEvent("createDatabase"));
    },
    {
      enableOnFormTags: false,
      description: "Create new database",
    }
  );

  // Cmd/Ctrl+/: Show slash commands
  useHotkeys(
    "mod+/",
    (e) => {
      e.preventDefault();
      dispatchEvent(new CustomEvent("showSlashCommands"));
    },
    {
      enableOnFormTags: true,
      description: "Show slash commands",
    }
  );

  // Escape: Close any open modal/menu
  useHotkeys(
    "escape",
    (e) => {
      dispatchEvent(new CustomEvent("closeModal"));
    },
    {
      enableOnFormTags: true,
      description: "Close modal/menu",
    }
  );

  return null;
}
