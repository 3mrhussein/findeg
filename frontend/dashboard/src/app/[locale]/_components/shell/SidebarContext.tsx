'use client';

import * as React from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('findeg-admin-sidebar');
    return stored === 'true';
  });

  const toggleSidebar = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem('findeg-admin-sidebar', String(newState));
      return newState;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
