"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { type HeroImage } from "../content";

const TRANSITION_MS = 1000;
const SLIDESHOW_MS  = 6000;

function pickRandom(pool: HeroImage[], exclude?: HeroImage): HeroImage {
  const candidates = pool.length > 1 && exclude ? pool.filter(x => x !== exclude) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function HeroBackground({ images }: { images: HeroImage[] }) {
  const [current, setCurrent] = useState<HeroImage>(images[0]);
  const currentRef = useRef(current);
  const poolRef    = useRef(images);
  poolRef.current  = images;

  useEffect(() => {
    if (images.length <= 1) return;
    const start = pickRandom(images);
    currentRef.current = start;
    setCurrent(start);
  }, [images]);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      const next = pickRandom(poolRef.current, currentRef.current);
      currentRef.current = next;
      setCurrent(next);
    }, SLIDESHOW_MS);
    return () => clearInterval(id);
  }, [images]);

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
