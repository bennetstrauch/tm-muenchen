"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { type HeroImage } from "../content";

export default function HeroBackground({ images }: { images: HeroImage[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    setIndex(Math.floor(Math.random() * images.length));
  }, [images]);

  const current = images[index] ?? images[0];

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #d4c5a9 0%, #9e8c72 60%, #7a6a54 100%)" }}
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
    </div>
  );
}
