"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { type HeroImage } from "../content";

export default function HeroBackground({ images }: { images: HeroImage[] }) {
  const [current, setCurrent] = useState<HeroImage | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrent(images[Math.floor(Math.random() * images.length)]);
  }, [images]);

  // If the image was already cached, onLoad won't fire — reveal it directly.
  useEffect(() => {
    if (imgRef.current?.complete) {
      imgRef.current.style.opacity = "1";
    }
  }, [current]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #d4c5a9 0%, #9e8c72 60%, #7a6a54 100%)" }}
    >
      {current && (
        <Image
          ref={imgRef}
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
