"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { type HeroImage } from "../content";

const TRANSITION_MS = 1000;
const SLIDESHOW_MS  = 6000;

export default function HeroBackground({ images }: { images: HeroImage[] }) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  // After hydration: jump to a random index, then proceed in order from there
  useEffect(() => {
    if (images.length <= 1) return;
    let intervalId: ReturnType<typeof setInterval>;

    const timeoutId = setTimeout(() => {
      const start = Math.floor(Math.random() * images.length);
      indexRef.current = start;
      setIndex(start);

      intervalId = setInterval(() => {
        const next = (indexRef.current + 1) % images.length;
        indexRef.current = next;
        setIndex(next);
      }, SLIDESHOW_MS);
    }, SLIDESHOW_MS);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [images]);

  const current = images[index] ?? images[0];

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #d4c5a9 0%, #9e8c72 60%, #7a6a54 100%)" }}
    >
      <AnimatePresence>
        <motion.div
          key={current.src}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(24px)" }}
          transition={{ duration: TRANSITION_MS / 1000, ease: "easeInOut" }}
        >
          <Image
            src={current.src}
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: current.focus ?? "center" }}
            priority
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
