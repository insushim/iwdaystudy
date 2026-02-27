import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isMobileNavOpen: boolean;
  isSoundEnabled: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  toggleMobileNav: () => void;
  toggleSound: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isMobileNavOpen: false,
  isSoundEnabled: true,
  theme: 'light',
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  toggleMobileNav: () => set((s) => ({ isMobileNavOpen: !s.isMobileNavOpen })),
  toggleSound: () => set((s) => ({ isSoundEnabled: !s.isSoundEnabled })),
  setTheme: (theme) => set({ theme }),
}));
