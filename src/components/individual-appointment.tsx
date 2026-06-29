"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

const INPUT_CLS = `
  w-full border border-[#DBEAFE] rounded-md px-4 py-2.5
  text-sm text-[#1A3352] placeholder-[#7A9BB5]
  focus:outline-none focus:border-[#A5C3D7]
  bg-white
`;

type FormState = "idle" | "submitting" | "success" | "error";

export function IndividualAppointment({ initialOpen = false }: { initialOpen?: boolean }) {
  const t = useTranslations("Events");
  const locale = useLocale();
  const [open, setOpen] = useState(initialOpen);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/info-anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone") || undefined,
          message: fd.get("message") || undefined,
          locale,
          newsSubscribed: fd.get("newsSubscribed") === "on",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? t("formErrorUnknown"));
      }
      setFormState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("formErrorFailed"));
      setFormState("error");
    }
  }

  return (
    <div className="mt-4">
      {!open && formState !== "success" && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            group flex items-center justify-between gap-4 w-full
            px-5 py-4
            border border-dashed border-[#A5C3D7]/60 rounded-2xl
            text-[#3D5573] hover:text-[#1A3352] hover:border-[#A5C3D7] hover:bg-[#A5C3D7]/5
            transition-all duration-200
          "
        >
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
              className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
              <rect x="1" y="2.5" width="14" height="12.5" rx="1.5" stroke="currentColor" strokeWidth="1" />
              <path d="M1 6.5h14" stroke="currentColor" strokeWidth="1" />
              <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-medium tracking-wide">{t("individualAppointment")}</span>
          </div>
          <span className="text-[#A5C3D7] group-hover:translate-x-0.5 transition-transform" aria-hidden="true">→</span>
        </button>
      )}

      {open && formState !== "success" && (
        <form onSubmit={handleSubmit} className="py-5 px-1">
          <div className="mb-3">
            <input name="name" type="text" placeholder={t("formName")} required className={INPUT_CLS} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input name="email" type="email" placeholder={t("formEmail")} required className={INPUT_CLS} />
            <input name="phone" type="tel" placeholder={t("formPhone")} className={INPUT_CLS} />
          </div>
          <div className="mb-3">
            <label htmlFor="ia-message" className="block text-sm text-[#1A3352] mb-1.5">
              {t("infoAnfrageAvailability")}
            </label>
            <textarea
              id="ia-message"
              name="message"
              rows={3}
              placeholder={t("infoAnfragePlaceholder")}
              className={`${INPUT_CLS} resize-none`}
            />
          </div>
          <label className="flex items-center gap-2 mb-4 cursor-pointer group">
            <input
              name="newsSubscribed"
              type="checkbox"
              className="w-4 h-4 rounded border-[#DBEAFE] accent-[#A5C3D7] cursor-pointer"
            />
            <span className="text-xs text-[#3D5573] group-hover:text-[#1A3352] transition-colors">
              {t("formNewsSubscribed")}
            </span>
          </label>
          {formState === "error" && (
            <p className="text-red-600 text-xs mb-3">{errorMsg}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="submit"
              disabled={formState === "submitting"}
              className="
                inline-flex items-center gap-2 px-6 py-3
                bg-[#A5C3D7] text-[#1A3352]
                text-[0.68rem] tracking-[0.18em] uppercase font-medium rounded-full
                transition-all duration-300
                hover:bg-[#8BAAC3] hover:shadow-[0_4px_16px_rgba(165,195,215,0.4)]
                disabled:opacity-60 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A5C3D7]
              "
            >
              {formState === "submitting" ? t("formSubmitting") : t("infoAnfrageSubmit")}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[0.68rem] tracking-[0.12em] uppercase text-[#3D5573] hover:text-[#1A3352] transition-colors"
            >
              {t("formCancel")}
            </button>
          </div>
        </form>
      )}

      {formState === "success" && (
        <div className="py-6 px-1">
          <p className="text-[#287E1A] font-medium text-sm mb-1">{t("infoAnfrageSuccessTitle")}</p>
          <p className="text-[#3D5573] text-sm">{t("infoAnfrageSuccessBody")}</p>
        </div>
      )}
    </div>
  );
}
