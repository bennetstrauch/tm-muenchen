"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "tm_cookie_consent";
const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID!;

function loadPixel() {
  if (typeof window === "undefined" || window.fbq) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const n: any = function (...args: unknown[]) {
    n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
  };
  window.fbq = n;
  window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq!("init", PIXEL_ID);
  window.fbq!("track", "PageView");
}

export default function CookieBanner() {
  const t = useTranslations("CookieBanner");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "accepted") {
      loadPixel();
    } else if (!stored) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
    loadPixel();
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-[#1A3352] text-white px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <p className="text-xs text-white/80 max-w-xl leading-relaxed">
        {t("text")}
      </p>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={accept}
          className="text-[0.68rem] tracking-[0.15em] uppercase font-medium px-4 py-2 rounded-full bg-[#F59E0B] text-[#1A3352] hover:bg-[#FDE68A] transition-colors"
        >
          {t("accept")}
        </button>
        <button
          onClick={decline}
          className="text-[0.68rem] tracking-[0.15em] uppercase font-medium text-white/60 hover:text-white transition-colors"
        >
          {t("decline")}
        </button>
      </div>
    </div>
  );
}
