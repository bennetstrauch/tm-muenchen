"use client";

import { useTranslations } from "next-intl";
import { useNavContext } from "@/contexts/nav-context";

export default function NavMenu() {
  const t = useTranslations("Nav");
  const { isOpen, setIsOpen } = useNavContext();

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? t("closeMenu") : t("openMenu")}
      aria-expanded={isOpen}
      className="flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-full hover:bg-[#1A3352]/8 transition-all duration-200 focus-visible:outline-none flex-shrink-0"
    >
      <span className={`block w-4 h-[1.5px] bg-[#1A3352] transition-all duration-300 origin-center ${isOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
      <span className={`block w-4 h-[1.5px] bg-[#1A3352] transition-all duration-200 ${isOpen ? "opacity-0 scale-x-0" : ""}`} />
      <span className={`block w-4 h-[1.5px] bg-[#1A3352] transition-all duration-300 origin-center ${isOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
    </button>
  );
}
