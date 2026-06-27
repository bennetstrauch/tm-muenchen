"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { TMCourse, CourseSlot } from "@/lib/courses";
import { IndividualAppointment } from "./events";
import { formatEventDate } from "@/lib/events";
import { lookupCityByPlz } from "@/lib/plz-city";

const INITIAL_COUNT = 3;

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

// ── Contact form types ───────────────────────────────────────────────────────

export type ContactData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: "F" | "M" | "X" | "";
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  plz: string;
  city: string;
  address1: string;
};

const EMPTY_CONTACT: ContactData = {
  firstName: "", lastName: "", email: "", phone: "",
  gender: "", dobDay: "", dobMonth: "", dobYear: "",
  plz: "", city: "", address1: "",
};

const INPUT_CLS = `
  w-full border border-[#DBEAFE] rounded-md px-4 py-2.5
  text-sm text-[#1A3352] placeholder-[#7A9BB5]
  focus:outline-none focus:border-[#A5C3D7]
  bg-white
`;

// ── DobInput: three-field DD / MM / YYYY auto-advance ────────────────────────

function DobInput({
  day, month, year,
  onChange,
}: {
  day: string; month: string; year: string;
  onChange: (field: "dobDay" | "dobMonth" | "dobYear", value: string) => void;
}) {
  const t = useTranslations("Courses");
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  return (
    <fieldset className="flex gap-2">
      <legend className="sr-only">{t("contactDob")}</legend>
      <div className="flex-1">
        <label className="sr-only">{t("dobDay")}</label>
        <input
          type="text" inputMode="numeric" maxLength={2}
          placeholder="TT"
          value={day}
          className={INPUT_CLS}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 2);
            onChange("dobDay", v);
            if (v.length === 2) monthRef.current?.focus();
          }}
        />
      </div>
      <div className="flex-1">
        <label className="sr-only">{t("dobMonth")}</label>
        <input
          ref={monthRef}
          type="text" inputMode="numeric" maxLength={2}
          placeholder="MM"
          value={month}
          className={INPUT_CLS}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 2);
            onChange("dobMonth", v);
            if (v.length === 2) yearRef.current?.focus();
          }}
        />
      </div>
      <div className="flex-[2]">
        <label className="sr-only">{t("dobYear")}</label>
        <input
          ref={yearRef}
          type="text" inputMode="numeric" maxLength={4}
          placeholder="JJJJ"
          value={year}
          className={INPUT_CLS}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            onChange("dobYear", v);
          }}
        />
      </div>
    </fieldset>
  );
}

// ── ContactStep (no newsletter — newsletter is step 3 only) ─────────────────

function ContactStep({
  data,
  onChange,
  onBack,
  onNext,
}: {
  data: ContactData;
  onChange: (field: keyof ContactData, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("Courses");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: keyof ContactData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange(field, e.target.value);
  }

  async function handlePlzChange(e: React.ChangeEvent<HTMLInputElement>) {
    const plz = e.target.value.replace(/\D/g, "").slice(0, 5);
    onChange("plz", plz);
    if (plz.length === 5) {
      // Local lookup first (major cities), API fallback for everything else
      const local = lookupCityByPlz(plz);
      if (local) {
        onChange("city", local);
      } else {
        try {
          const res = await fetch(
            `https://openplzapi.org/de/Localities?postalCode=${plz}&page=1&pageSize=1`,
          );
          if (res.ok) {
            const data = await res.json() as { name?: string }[];
            if (data[0]?.name) onChange("city", data[0].name);
          }
        } catch {
          // silently ignore — user can type city manually
        }
      }
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!data.firstName.trim()) errs.firstName = "Pflichtfeld";
    if (!data.lastName.trim()) errs.lastName = "Pflichtfeld";
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Gültige E-Mail erforderlich";
    if (!data.gender) errs.gender = "Pflichtfeld";
    if (!data.dobDay || !data.dobMonth || !data.dobYear || data.dobYear.length < 4) errs.dob = "Vollständiges Geburtsdatum erforderlich";
    if (!data.plz.trim()) errs.plz = "Pflichtfeld";
    if (!data.city.trim()) errs.city = "Pflichtfeld";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  return (
    <div className="mt-5 pt-5 border-t border-[#DBEAFE] space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <input placeholder={t("contactFirstName")} value={data.firstName}
            onChange={set("firstName")} className={`${INPUT_CLS} ${errors.firstName ? "border-red-400" : ""}`} />
          {errors.firstName && <p className="text-xs text-red-500 mt-0.5">{errors.firstName}</p>}
        </div>
        <div>
          <input placeholder={t("contactLastName")} value={data.lastName}
            onChange={set("lastName")} className={`${INPUT_CLS} ${errors.lastName ? "border-red-400" : ""}`} />
          {errors.lastName && <p className="text-xs text-red-500 mt-0.5">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <input type="email" placeholder={t("contactEmail")} value={data.email}
          onChange={set("email")} className={`${INPUT_CLS} ${errors.email ? "border-red-400" : ""}`} />
        {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
      </div>

      <input type="tel" placeholder={t("contactPhone")} value={data.phone}
        onChange={set("phone")} className={INPUT_CLS} />

      <div>
        <select value={data.gender} onChange={set("gender")}
          className={`${INPUT_CLS} ${errors.gender ? "border-red-400" : ""}`}>
          <option value="">{t("contactGender")}</option>
          <option value="F">{t("genderFemale")}</option>
          <option value="M">{t("genderMale")}</option>
          <option value="X">{t("genderDiverse")}</option>
        </select>
        {errors.gender && <p className="text-xs text-red-500 mt-0.5">{errors.gender}</p>}
      </div>

      <div>
        <p className="text-xs text-[#7A9BB5] mb-1">{t("contactDob")}</p>
        <DobInput
          day={data.dobDay} month={data.dobMonth} year={data.dobYear}
          onChange={(f, v) => onChange(f, v)}
        />
        {errors.dob && <p className="text-xs text-red-500 mt-0.5">{errors.dob}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <input placeholder={t("contactPlz")} value={data.plz} inputMode="numeric" maxLength={5}
            onChange={handlePlzChange} className={`${INPUT_CLS} ${errors.plz ? "border-red-400" : ""}`} />
          {errors.plz && <p className="text-xs text-red-500 mt-0.5">{errors.plz}</p>}
        </div>
        <div>
          <input placeholder={t("contactCity")} value={data.city} autoComplete="address-level2"
            onChange={set("city")} className={`${INPUT_CLS} ${errors.city ? "border-red-400" : ""}`} />
          {errors.city && <p className="text-xs text-red-500 mt-0.5">{errors.city}</p>}
        </div>
      </div>

      <input placeholder={t("contactStreet")} value={data.address1} autoComplete="address-line1"
        onChange={set("address1")} className={INPUT_CLS} />

      <div className="flex items-center gap-4 pt-2">
        <button
          type="button"
          onClick={() => { if (validate()) onNext(); }}
          className="
            px-8 py-3 bg-[#2D6A4F] text-white
            text-[0.68rem] tracking-[0.18em] uppercase font-medium rounded-full
            transition-all duration-200 hover:bg-[#245a41] hover:shadow-md
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]
          "
        >
          {t("continueButton")}
        </button>
        <button type="button" onClick={onBack}
          className="text-[0.68rem] tracking-[0.12em] uppercase text-[#3D5573] hover:text-[#1A3352] transition-colors">
          {t("backButton")}
        </button>
      </div>
    </div>
  );
}

// ── Kursgebühr modal ────────────────────────────────────────────────────────

function KursgebührModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Courses");

  const tiers = [
    { name: t("feeNormal"), amount: t("feeNormalAmount"), desc: t("feeNormalDesc") },
    { name: t("feeFamily"), amount: t("feeFamilyAmount"), desc: t("feeFamilyDesc") },
    { name: t("feeScholarship"), amount: t("feeScholarshipAmount"), desc: t("feeScholarshipDesc") },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog" aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#3D5573] hover:text-[#1A3352] text-lg leading-none"
          aria-label="Schließen"
        >
          ×
        </button>
        <h3 className="text-base font-semibold text-[#1A3352] mb-4">{t("feeModalHeading")}</h3>
        <div className="space-y-4">
          {tiers.map(tier => (
            <div key={tier.name} className="border border-[#DBEAFE] rounded-xl px-4 py-3">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-medium text-[#1A3352]">{tier.name}</span>
                <span className="text-base font-semibold text-[#1A3352]">{tier.amount}</span>
              </div>
              <p className="text-xs text-[#3D5573] leading-relaxed">{tier.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ReviewStep (newsletter only here) ───────────────────────────────────────

function ReviewStep({
  course,
  slot,
  contact,
  onBack,
  onSuccess,
}: {
  course: TMCourse;
  slot: CourseSlot;
  contact: ContactData;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("Courses");
  const locale = useLocale();

  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [newsSubscribed, setNewsSubscribed] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // "Herr"/"Frau", nothing for divers
  const salutation = contact.gender === "F" ? "Frau" : contact.gender === "M" ? "Herr" : "";
  const birthdate = `${contact.dobDay.padStart(2, "0")}.${contact.dobMonth.padStart(2, "0")}.${contact.dobYear}`;
  const { weekday: slotWeekday, date: slotDate } = formatEventDate(course.date, locale);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/coursebooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: slot.pk,
          first_name: contact.firstName,
          last_name: contact.lastName,
          email: contact.email,
          gender: contact.gender,
          birthdate,
          phone: contact.phone || undefined,
          address1: contact.address1 || undefined,
          zip_code: contact.plz,
          city: contact.city,
          news_subscribed: newsSubscribed,
          locale,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? t("errorGeneric"));
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
      setSubmitting(false);
    }
  }

  return (
    <>
      {showFeeModal && <KursgebührModal onClose={() => setShowFeeModal(false)} />}

      <div className="mt-5 pt-5 border-t border-[#DBEAFE] space-y-5">
        {/* Personal data summary */}
        <div>
          <p className="text-[0.65rem] tracking-[0.12em] uppercase font-medium text-[#3D5573] mb-2">
            {t("yourData")}
          </p>
          <div className="text-sm text-[#1A3352] space-y-0.5">
            <p>{salutation && `${salutation} `}{contact.firstName} {contact.lastName}</p>
            <p className="text-[#3D5573]">{contact.email}</p>
            {contact.phone && <p className="text-[#3D5573]">{contact.phone}</p>}
            <p className="text-[#3D5573]">{birthdate}</p>
          </div>
        </div>

        {/* Appointment dates */}
        <div>
          <p className="text-[0.65rem] tracking-[0.12em] uppercase font-medium text-[#3D5573] mb-2">
            {t("yourAppointments")}
          </p>
          <div className="text-sm text-[#1A3352] space-y-1">
            <p>
              <span className="font-medium">{slotWeekday} {slot.time}, {slotDate}</span>
              {" — "}<span className="text-[#3D5573]">{t("personalInitiation")}</span>
            </p>
            {course.followUps.map((fu, i) => {
              const { weekday: fw, date: fd } = formatEventDate(fu.date, locale);
              return (
                <p key={i}>
                  <span className="font-medium">{fw} {fu.time}, {fd}</span>
                  {" — "}<span className="text-[#3D5573]">{i + 1}. Folgetreffen</span>
                </p>
              );
            })}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={check1} onChange={e => setCheck1(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#DBEAFE] accent-[#A5C3D7] flex-shrink-0" />
            <span className="text-xs text-[#3D5573] leading-relaxed">
              Bitte bestätigen Sie, dass Sie an <strong className="text-[#1A3352]">allen Treffen</strong> teilnehmen können. *
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={check2} onChange={e => setCheck2(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#DBEAFE] accent-[#A5C3D7] flex-shrink-0" />
            <span className="text-xs text-[#3D5573] leading-relaxed">
              Die{" "}
              <button
                type="button"
                onClick={() => setShowFeeModal(true)}
                className="text-[#A5C3D7] underline underline-offset-2 hover:text-[#1A3352] transition-colors"
              >
                {t("feeLinkText")}
              </button>
              {" "}ist mir bekannt. *
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={newsSubscribed} onChange={e => setNewsSubscribed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#DBEAFE] accent-[#A5C3D7] flex-shrink-0" />
            <span className="text-xs text-[#3D5573] leading-relaxed">{t("newsletterLabel")}</span>
          </label>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!check1 || !check2 || submitting}
            className="
              px-8 py-3 bg-[#2D6A4F] text-white
              text-[0.68rem] tracking-[0.18em] uppercase font-medium rounded-full
              transition-all duration-200
              hover:bg-[#245a41] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]
            "
          >
            {submitting ? t("submitting") : t("submitButton")}
          </button>
          <button type="button" onClick={onBack}
            className="text-[0.68rem] tracking-[0.12em] uppercase text-[#3D5573] hover:text-[#1A3352] transition-colors">
            {t("backButton")}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Slot grid for one teacher group ─────────────────────────────────────────

function TeacherSlotGroup({
  group,
  genderLabel,
  selectedPk,
  onSelect,
  onContinue,
}: {
  group: SlotGroup;
  genderLabel: string | null;
  selectedPk: number | null;
  onSelect: (slot: CourseSlot) => void;
  onContinue: () => void;
}) {
  const t = useTranslations("Courses");
  const groupHasSelected = group.slots.some(s => s.pk === selectedPk);

  return (
    <div className="mb-5">
      {genderLabel && (
        <p className="text-sm font-semibold text-[#1A3352] mb-3 tracking-wide text-center">
          {genderLabel}
        </p>
      )}
      <div className="flex items-start gap-4">
        {/* Teacher photo + name — shown once */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={group.teacher.teacherImage}
            alt={group.teacher.teacherName}
            className="w-14 h-14 rounded-full object-cover border border-[#DBEAFE]"
          />
          <span className="text-[0.7rem] text-[#3D5573] text-center leading-tight">
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

      {/* Weiter — only under the group that owns the selected slot */}
      {groupHasSelected && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onContinue}
            className="
              px-10 py-3
              bg-[#2D6A4F] text-white
              text-[0.72rem] tracking-[0.2em] uppercase font-medium
              rounded-full shadow-sm
              transition-all duration-200
              hover:bg-[#245a41] hover:shadow-md
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]
            "
          >
            {t("continueButton")} →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Step 1: slot selection ───────────────────────────────────────────────────

function SlotStep({
  course,
  selectedSlot,
  onSelect,
  onContinue,
  onShowAlternative,
}: {
  course: TMCourse;
  selectedSlot: CourseSlot | null;
  onSelect: (slot: CourseSlot) => void;
  onContinue: () => void;  // passed into each group
  onShowAlternative: () => void;
}) {
  const t = useTranslations("Courses");
  const locale = useLocale();
  const groups = groupSlots(course.slots, course.genderRestricted);

  return (
    <div className="mt-5 pt-5 border-t border-[#DBEAFE]">
      {/* Slot selection hint — hairline rule on each side */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-[#DBEAFE]" />
        <p className="text-[0.8rem] tracking-wide text-[#3D5573] shrink-0">
          {t("chooseSlotHint")}
        </p>
        <div className="flex-1 h-px bg-[#DBEAFE]" />
      </div>

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
          onContinue={onContinue}
        />
      ))}

      {/* Folgetreffen bar — flex so wrapped lines indent under the dates */}
      {course.followUps.length > 0 && (
        <div className="flex gap-2 mb-4 items-baseline">
          <span className="text-xs font-semibold text-[#1A3352] shrink-0">
            {t("followUpLabel")}:
          </span>
          <span className="text-xs text-[#3D5573]">
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
        className="text-xs text-[#A5C3D7] hover:text-[#1A3352] underline underline-offset-2 transition-colors"
      >
        {t("alternativeLink")}
      </button>
    </div>
  );
}

// ── Course card (collapsed + expanded) ──────────────────────────────────────

type Step = 1 | 2 | 3;

function CourseCard({
  course,
  isOpen,
  isAnyOpen,
  onToggle,
  onBooked,
}: {
  course: TMCourse;
  isOpen: boolean;
  isAnyOpen: boolean;
  onToggle: () => void;
  onBooked: () => void;
}) {
  const t = useTranslations("Courses");
  const locale = useLocale();
  const { weekday, date } = formatEventDate(course.date, locale);
  const teacherNames = uniqueFirstNames(course.slots);

  const [selectedSlot, setSelectedSlot] = useState<CourseSlot | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [showAlternative, setShowAlternative] = useState(false);
  const [contactData, setContactData] = useState<ContactData>(EMPTY_CONTACT);
  const [success, setSuccess] = useState(false);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedSlot(null);
      setStep(1);
      setShowAlternative(false);
      setSuccess(false);
    }
  }, [isOpen]);

  return (
    <li className="py-5 border-b border-[#DBEAFE] last:border-0">
      {/* Collapsed row — text left, button right, always on one line */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[0.85rem] tracking-[0.1em] uppercase text-[#1A3352]/60 whitespace-nowrap">
              {weekday}
            </span>
            <span className="font-[family-name:var(--font-jakarta)] font-semibold text-[1rem] text-[#1A3352] leading-snug whitespace-nowrap">
              {date}
            </span>
          </div>
          {teacherNames && (
            <span className="text-xs text-[#3D5573] italic">{teacherNames}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={[
            "inline-flex items-center gap-2 flex-shrink-0 ml-2",
            "px-5 py-2.5",
            "bg-[#2D6A4F] text-white",
            "text-[0.65rem] tracking-[0.16em] uppercase font-medium rounded-full",
            "transition-all duration-200",
            "hover:bg-[#245a41] hover:shadow-[0_4px_12px_rgba(45,106,79,0.3)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2",
            !isOpen && isAnyOpen ? "opacity-40" : "",
          ].join(" ")}
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
              onContinue={() => setStep(2)}
              onShowAlternative={() => setShowAlternative(true)}
            />
          )}

          {step === 1 && showAlternative && (
            <div className="mt-5 pt-5 border-t border-[#DBEAFE]">
              <IndividualAppointment initialOpen />
            </div>
          )}

          {step === 2 && (
            <ContactStep
              data={contactData}
              onChange={(field, value) => setContactData(prev => ({ ...prev, [field]: value }))}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && !success && selectedSlot && (
            <ReviewStep
              course={course}
              slot={selectedSlot}
              contact={contactData}
              onBack={() => setStep(2)}
              onSuccess={() => { setSuccess(true); onBooked(); }}
            />
          )}

          {success && (
            <div className="mt-5 pt-5 border-t border-[#DBEAFE] py-6">
              <p className="text-[#287E1A] font-medium text-sm mb-1">{t("successTitle")}</p>
              <p className="text-[#3D5573] text-sm">{t("successBody")}</p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

// ── Main section with pagination ─────────────────────────────────────────────

export default function Courses({ courses, locale }: { courses: TMCourse[]; locale: string }) {
  const t = useTranslations("Courses");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

  // Filter out courses that were just booked in this session
  const availableCourses = courses.filter(c => !bookedDates.has(c.date));

  function toggle(i: number) {
    setOpenIdx(openIdx === i ? null : i);
  }

  function markBooked(date: string) {
    setBookedDates(prev => new Set([...prev, date]));
    setOpenIdx(null);
  }

  const visibleCourses = showAll ? availableCourses : availableCourses.slice(0, INITIAL_COUNT);
  const hiddenCount = availableCourses.length - INITIAL_COUNT;

  if (courses.length === 0) {
    return (
      <section id="kurse" className="section bg-[#F8F5EF] pt-6 sm:pt-10">
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
    <section id="kurse" className="section bg-[#F8F5EF] pt-6 sm:pt-10">
      <div className="section-inner">
        <div className="text-center mb-6">
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight mb-3">
            {t("heading")}
          </h2>
        </div>

        <ul className="px-4">
          {visibleCourses.map((course, i) => (
            <CourseCard
              key={`${course.date}-${i}`}
              course={course}
              isOpen={openIdx === i}
              isAnyOpen={openIdx !== null}
              onToggle={() => toggle(i)}
              onBooked={() => markBooked(course.date)}
            />
          ))}
        </ul>

        <div className="px-4">
          {!showAll && hiddenCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="
                w-full mt-2 mb-1 py-3
                text-[0.68rem] tracking-[0.18em] uppercase font-medium
                text-[#3D5573] hover:text-[#1A3352]
                border border-dashed border-[#A5C3D7]/60 rounded-2xl
                hover:border-[#A5C3D7] hover:bg-[#A5C3D7]/5
                transition-all duration-200
              "
            >
              {t("showMore", { count: hiddenCount })}
            </button>
          )}
          <IndividualAppointment />
        </div>
      </div>
    </section>
  );
}
