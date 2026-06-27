"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { TMCourse, CourseSlot } from "@/lib/courses";
import { IndividualAppointment } from "./events";
import { formatEventDate } from "@/lib/events";

const LOCALE_BCP47: Record<string, string> = {
  de: "de-DE", en: "en-GB", fr: "fr-FR", es: "es-ES",
};

function formatFollowUp(isoDate: string, time: string, locale: string): string {
  const bcp47 = LOCALE_BCP47[locale] ?? "de-DE";
  const d = new Date(`${isoDate}T12:00:00`);
  const weekday = d.toLocaleDateString(bcp47, { weekday: "short" }).replace(".", "");
  const day = d.getDate();
  const month = d.toLocaleDateString(bcp47, { month: "long" });
  return `${weekday} ${time}, ${day}. ${month}`;
}

function uniqueFirstNames(slots: CourseSlot[]): string {
  const names = [...new Set(slots.map(s => s.teacherName.split(" ")[0]))];
  return names.join(" & ");
}

type SlotGroup = {
  gender: "F" | "M" | null;
  teacher: CourseSlot;
  slots: CourseSlot[];
};

function groupSlots(slots: CourseSlot[], genderRestricted: boolean): SlotGroup[] {
  if (!genderRestricted) return [{ gender: null, teacher: slots[0], slots }];
  const F = slots.filter(s => s.teacherGender === "F");
  const M = slots.filter(s => s.teacherGender === "M");
  const groups: SlotGroup[] = [];
  if (F.length > 0) groups.push({ gender: "F", teacher: F[0], slots: F });
  if (M.length > 0) groups.push({ gender: "M", teacher: M[0], slots: M });
  return groups;
}

// ── Slot grid for one teacher group ─────────────────────────────────────────

function TeacherSlotGroup({
  group,
  genderLabel,
  selectedPk,
  onSelect,
}: {
  group: SlotGroup;
  genderLabel: string | null;
  selectedPk: number | null;
  onSelect: (slot: CourseSlot) => void;
}) {
  return (
    <div>
      {genderLabel && (
        <p className="text-[0.7rem] tracking-[0.14em] uppercase font-medium text-[#3D5573] mb-3">
          {genderLabel}
        </p>
      )}
      <div className="flex items-start gap-4 mb-5">
        {/* Teacher photo + name */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={group.teacher.teacherImage}
            alt={group.teacher.teacherName}
            className="w-14 h-14 rounded-full object-cover border border-[#DBEAFE]"
          />
          <span className="text-[0.65rem] text-[#3D5573] text-center leading-tight">
            {group.teacher.teacherName.split(" ")[0]}
          </span>
        </div>

        {/* Slot buttons */}
        <div className="flex flex-wrap gap-2 flex-1">
          {group.slots.map(slot => (
            <button
              key={slot.pk}
              type="button"
              onClick={() => onSelect(slot)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A5C3D7]
                ${selectedPk === slot.pk
                  ? "bg-[#1A3352] text-white shadow-md"
                  : "bg-[#F0F5F9] text-[#1A3352] hover:bg-[#DBEAFE]"
                }
              `}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 1: slot selection ───────────────────────────────────────────────────

function SlotStep({
  course,
  selectedSlot,
  onSelect,
  onShowAlternative,
}: {
  course: TMCourse;
  selectedSlot: CourseSlot | null;
  onSelect: (slot: CourseSlot) => void;
  onShowAlternative: () => void;
}) {
  const t = useTranslations("Courses");
  const locale = useLocale();
  const groups = groupSlots(course.slots, course.genderRestricted);

  return (
    <div className="mt-5 pt-5 border-t border-[#DBEAFE]">
      {groups.map((group, i) => (
        <TeacherSlotGroup
          key={i}
          group={group}
          genderLabel={
            course.genderRestricted
              ? group.gender === "F" ? t("forWomen") : t("forMen")
              : null
          }
          selectedPk={selectedSlot?.pk ?? null}
          onSelect={onSelect}
        />
      ))}

      {/* Folgetreffen bar */}
      {course.followUps.length > 0 && (
        <div className="mb-4">
          <span className="text-[0.65rem] tracking-[0.12em] uppercase font-medium text-[#3D5573] mr-2">
            {t("followUpLabel")}:
          </span>
          <span className="text-[0.78rem] text-[#3D5573]">
            {course.followUps.map((fu, i) => (
              <span key={i}>
                {i > 0 && " · "}
                {formatFollowUp(fu.date, fu.time, locale)}
              </span>
            ))}
          </span>
        </div>
      )}

      {/* Alternative link */}
      <button
        type="button"
        onClick={onShowAlternative}
        className="text-[0.72rem] text-[#A5C3D7] hover:text-[#1A3352] underline underline-offset-2 transition-colors"
      >
        {t("alternativeLink")}
      </button>
    </div>
  );
}

// ── Course row (collapsed + expanded) ───────────────────────────────────────

type Step = 1 | 2 | 3;

function CourseCard({
  course,
  isOpen,
  onToggle,
}: {
  course: TMCourse;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("Courses");
  const locale = useLocale();
  const { weekday, date } = formatEventDate(course.date, locale);
  const teacherNames = uniqueFirstNames(course.slots);

  const [selectedSlot, setSelectedSlot] = useState<CourseSlot | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [showAlternative, setShowAlternative] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);
  const cardRef = useRef<HTMLLIElement>(null);

  // Reset state when card closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSlot(null);
      setStep(1);
      setShowAlternative(false);
    }
  }, [isOpen]);

  // IntersectionObserver for sticky CTA visibility
  useEffect(() => {
    if (!isOpen || !cardRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setCardVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, [isOpen]);

  const showStickyCta = selectedSlot !== null && step === 1 && cardVisible && !showAlternative;

  return (
    <li className="py-6 border-b border-[#DBEAFE] last:border-0" ref={cardRef}>
      {/* Collapsed row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[0.9rem] tracking-[0.12em] uppercase text-[#1A3352]/60 whitespace-nowrap">
              {weekday}
            </span>
            <span className="font-[family-name:var(--font-jakarta)] font-semibold text-[1.05rem] text-[#1A3352] leading-snug whitespace-nowrap">
              {date}
            </span>
          </div>
          {teacherNames && (
            <span className="text-[0.75rem] text-[#3D5573] italic">{teacherNames}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="
            inline-flex items-center gap-2 flex-shrink-0
            px-5 py-2.5
            bg-[#1A3352] text-white
            text-[0.65rem] tracking-[0.16em] uppercase font-medium rounded-full
            transition-all duration-200
            hover:bg-[#2a4d72] hover:shadow-[0_4px_12px_rgba(26,51,82,0.25)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3352] focus-visible:ring-offset-2
          "
        >
          {isOpen ? t("close") : t("chooseSlot")}
        </button>
      </div>

      {/* Expanded content */}
      {isOpen && (
        <div>
          {step === 1 && !showAlternative && (
            <SlotStep
              course={course}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
              onShowAlternative={() => setShowAlternative(true)}
            />
          )}

          {step === 1 && showAlternative && (
            <div className="mt-5 pt-5 border-t border-[#DBEAFE]">
              <IndividualAppointment initialOpen />
            </div>
          )}

          {/* Steps 2 + 3 rendered by future slices — placeholder */}
          {step === 2 && null}
          {step === 3 && null}
        </div>
      )}

      {/* Sticky "Weiter" CTA — fixed at bottom of viewport */}
      {showStickyCta && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
          <div className="w-full max-w-md px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white to-transparent">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="
                w-full py-4
                bg-[#A5C3D7] text-[#1A3352]
                text-[0.72rem] tracking-[0.2em] uppercase font-medium
                rounded-full shadow-lg
                transition-all duration-200
                hover:bg-[#8BAAC3] hover:shadow-xl
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A5C3D7]
              "
            >
              {t("continueButton")}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export default function Courses({ courses, locale }: { courses: TMCourse[]; locale: string }) {
  const t = useTranslations("Courses");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIdx(openIdx === i ? null : i);
  }

  if (courses.length === 0) {
    return (
      <section className="section bg-[#F8F5EF] pt-6 sm:pt-10">
        <div className="section-inner">
          <div className="text-center mb-6">
            <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight mb-3">
              {t("heading")}
            </h2>
          </div>
          <IndividualAppointment initialOpen />
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-[#F8F5EF] pt-6 sm:pt-10">
      <div className="section-inner">
        <div className="text-center mb-6">
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight mb-3">
            {t("heading")}
          </h2>
        </div>

        <ul className="px-4">
          {courses.map((course, i) => (
            <CourseCard
              key={`${course.date}-${i}`}
              course={course}
              isOpen={openIdx === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
