'use client';

import { useState, useEffect, type ReactNode } from 'react';

export default function ScrollHeader({
  transparent = false,
  children,
}: {
  transparent?: boolean;
  children: ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent]);

  const isTransparent = transparent && !scrolled;

  return (
    <header
      data-transparent={isTransparent}
      className={`group fixed top-0 left-0 right-0 z-[9998] h-14 flex items-center px-5 transition-all duration-[250ms] ${
        isTransparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-white/10 backdrop-blur-md border-b border-white/15'
      }`}
    >
      {children}
    </header>
  );
}
