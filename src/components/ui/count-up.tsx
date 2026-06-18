"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
};

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function CountUp({ value, prefix = "", suffix = "", duration = 1500 }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setDisplayed(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return;
        triggered.current = true;
        observer.disconnect();

        const start = performance.now();
        function tick(now: number) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          setDisplayed(Math.round(easeOut(progress) * value));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref}>
      {prefix}{displayed}{suffix}
    </span>
  );
}
