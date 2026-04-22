"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type NavContextValue = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  panelHeight: number;
  setPanelHeight: (h: number) => void;
};

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);
  return (
    <NavContext.Provider value={{ isOpen, setIsOpen, panelHeight, setPanelHeight }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavContext() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNavContext must be used within NavProvider");
  return ctx;
}
