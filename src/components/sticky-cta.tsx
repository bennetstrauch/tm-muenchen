"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { content } from "../content";

const SUPPRESSED_IDS = [
  "infoabend",
  "anmeldung",
  "wissenschaft",
  "lehrer",
  "wie-es-funktioniert",
  "abschluss-cta",
  "kurse",
];

export default function StickyCta() {
  const t = useTranslations("Hero");
  const tSticky = useTranslations("StickyCta");
  const { hero } = content;
  const pathname = usePathname();
  const [hidden, setHidden] = useState(true);
  const [suppressed, setSuppressed] = useState(false);
  const [released, setReleased] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [ctaHref, setCtaHref] = useState<string>("#infoabend");

  useEffect(() => {
    if (!localStorage.getItem("tm_cookie_consent")) {
      setBannerVisible(true);
      const handler = () => setBannerVisible(false);
      window.addEventListener("cookie-consent-dismissed", handler);
      return () => window.removeEventListener("cookie-consent-dismissed", handler);
    }
  }, []);

  useEffect(() => {
    setHidden(true);
    const heroEl = document.getElementById("hero");
    if (!heroEl) return;
    const heroObserver = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.6 }
    );
    heroObserver.observe(heroEl);
    return () => heroObserver.disconnect();
  }, [pathname]);

  useEffect(() => {
    const counts = new Map<string, boolean>();
    const observers: IntersectionObserver[] = [];

    for (const id of SUPPRESSED_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const obs = new IntersectionObserver(([entry]) => {
        counts.set(id, entry.isIntersecting);
        setSuppressed([...counts.values()].some(Boolean));
      }, { threshold: 0 });
      obs.observe(el);
      observers.push(obs);
    }

    return () => observers.forEach(o => o.disconnect());
  }, [pathname]);

  useEffect(() => {
    const el = document.getElementById("fuer-wen");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setReleased(entry.isIntersecting),
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [pathname]);

  useEffect(() => {
    const infoEl = document.getElementById("infoabend");
    if (!infoEl) return;
    const infoObserver = new IntersectionObserver(([entry]) => {
      setCtaHref(!entry.isIntersecting && entry.boundingClientRect.top > 0 ? "#infoabend" : "#anmeldung");
    }, { threshold: 0 });
    infoObserver.observe(infoEl);
    return () => infoObserver.disconnect();
  }, []);

  const visible = !hidden && (!suppressed || released) && !bannerVisible;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <a
        href={ctaHref}
        className="
          inline-flex items-center gap-3
          px-9 py-4
          bg-[#A5C3D7] text-[#1A3352]
          text-[0.7rem] tracking-[0.22em] uppercase font-medium
          rounded-full whitespace-nowrap shadow-[0_4px_24px_rgba(165,195,215,0.6)]
          transition-all duration-300
          hover:bg-[#8BAAC3] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(165,195,215,0.65)]
          active:translate-y-0
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A5C3D7] focus-visible:ring-offset-2
        "
      >
        {ctaHref === "#anmeldung" ? tSticky("nextTermine") : t("cta")}
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
