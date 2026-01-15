import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  commandPaletteOpen: boolean;
  activeModal: string | null;
  toasts: Toast[];

  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  commandPaletteOpen: false,
  activeModal: null,
  toasts: [],

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  addToast: (message, type) => set((state) => ({
    toasts: [...state.toasts, { id: crypto.randomUUID(), message, type }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
}));
