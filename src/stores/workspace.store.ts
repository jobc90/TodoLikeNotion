import { create } from 'zustand';

interface WorkspaceState {
  currentPageId: string | null;
  currentDatabaseId: string | null;
  sidebarCollapsed: boolean;

  setCurrentPage: (id: string | null) => void;
  setCurrentDatabase: (id: string | null) => void;
  toggleSidebar: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentPageId: null,
  currentDatabaseId: null,
  sidebarCollapsed: false,

  setCurrentPage: (id) => set({ currentPageId: id, currentDatabaseId: null }),
  setCurrentDatabase: (id) => set({ currentDatabaseId: id, currentPageId: null }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
