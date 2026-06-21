"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Carousel from "./carousel";
import { type TMTeacher } from "../lib/teachers";

const AUTO_MS = 5000;

function TeacherCard({
  teacher,
  expanded,
  onToggle,
}: {
  teacher: TMTeacher;
  expanded: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("Teachers");

  return (
    <div className="flex flex-col items-center text-center px-4 py-2">

      <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-[#DBEAFE] ring-offset-2 mb-4 flex-shrink-0">
        <Image
          src={teacher.imageUrl}
          alt={teacher.name}
          fill
          unoptimized
          className="object-cover"
          sizes="96px"
        />
      </div>

      <p className="font-semibold text-[#1A3352] text-[0.95rem] leading-snug mb-2">
        {teacher.name}
      </p>

      <p className={`text-sm text-[#3D5573] leading-relaxed ${!expanded ? "line-clamp-3 md:line-clamp-1" : "text-left"}`}>
        {teacher.bio}
      </p>

      <button
        onClick={onToggle}
        className="mt-2 inline-flex items-center gap-1 text-[0.7rem] tracking-[0.12em] uppercase text-[#1A3352]/50 hover:text-[#1A3352] transition-colors duration-200 focus-visible:outline-none"
      >
        {expanded ? <>{t("collapse")} <span>↑</span></> : <>{t("readMore")} <span>↓</span></>}
      </button>

    </div>
  );
}

export default function Teachers({ teachers, centerName }: { teachers: TMTeacher[]; centerName?: string }) {
  const t = useTranslations("Teachers");
  const totalMobile  = teachers.length;
  const totalDesktop = Math.ceil(teachers.length / 3);

  const [mobileIdx,  setMobileIdx]  = useState(0);
  const [desktopIdx, setDesktopIdx] = useState(0);
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setExpandedName(null);
      setMobileIdx(i  => (i + 1) % totalMobile);
      setDesktopIdx(i => (i + 1) % totalDesktop);
    }, AUTO_MS);
  }, [totalMobile, totalDesktop]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (teachers.length === 0) return;
    startTimer();
    return stopTimer;
  }, [startTimer, stopTimer, teachers.length]);

  function handleToggle(name: string) {
    const willExpand = expandedName !== name;
    setExpandedName(willExpand ? name : null);
    if (willExpand) stopTimer();
    else startTimer();
  }

  function handleMobileNav(i: number) {
    setExpandedName(null);
    setMobileIdx(i);
    startTimer();
  }

  function handleDesktopNav(i: number) {
    setExpandedName(null);
    setDesktopIdx(i);
    startTimer();
  }

  if (teachers.length === 0) return null;

  return (
    <section id="lehrer" className="section bg-[#EFF6FF]">
      <div className="section-inner">

        <div className="text-center mb-10">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#3D5573] mb-4">
            {centerName ?? t("eyebrow")}
          </p>
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight">
            {t("heading")}
          </h2>
        </div>

        <div className="md:hidden">
          <Carousel
            activeIndex={mobileIdx}
            onIndexChange={handleMobileNav}
            arrowOffsetPx={48}
          >
            {teachers.map(teacher => (
              <TeacherCard
                key={teacher.name}
                teacher={teacher}
                expanded={expandedName === teacher.name}
                onToggle={() => handleToggle(teacher.name)}
              />
            ))}
          </Carousel>
        </div>

        <div className="hidden md:block">
          <Carousel
            activeIndex={desktopIdx}
            onIndexChange={handleDesktopNav}
            arrowOffsetPx={48}
          >
            {Array.from({ length: totalDesktop }, (_, i) => (
              <div key={i} className="flex justify-center gap-6">
                {teachers.slice(i * 3, i * 3 + 3).map(teacher => (
                  <div key={teacher.name} className="w-full max-w-xs">
                    <TeacherCard
                      teacher={teacher}
                      expanded={expandedName === teacher.name}
                      onToggle={() => handleToggle(teacher.name)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </Carousel>
        </div>

      </div>
    </section>
  );
}
