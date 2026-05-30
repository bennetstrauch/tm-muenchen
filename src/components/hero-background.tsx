"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { type HeroImage } from "../content";

export default function HeroBackground({ images }: { images: HeroImage[] }) {
  const [current, setCurrent] = useState<HeroImage | null>(null);

  useEffect(() => {
    setCurrent(images[Math.floor(Math.random() * images.length)]);
  }, [images]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #d4c5a9 0%, #9e8c72 60%, #7a6a54 100%)" }}
    >
      {current && (
        <Image
          src={current.src}
          alt=""
          fill
          className="object-cover opacity-0 transition-opacity duration-700"
          style={{ objectPosition: current.focus ?? "center" }}
          priority
          sizes="100vw"
          onLoad={e => { (e.currentTarget as HTMLImageElement).style.opacity = "1"; }}
        />
      )}
    </div>
  );
}
