"use client";

import { type ReactNode } from "react";
import { useNavContext } from "@/contexts/nav-context";

export default function MainOffset({ children }: { children: ReactNode }) {
  const { isOpen, panelHeight } = useNavContext();
  return (
    <div
      style={{ paddingTop: isOpen ? `${panelHeight}px` : "0px" }}
      className="transition-[padding-top] duration-300 ease-out"
    >
      {children}
    </div>
  );
}
