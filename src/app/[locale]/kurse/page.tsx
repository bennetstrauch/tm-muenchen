import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function KursePage() {
  const locale = await getLocale();
  const base = locale === "de" ? "" : `/${locale}`;
  redirect(`${base}/#kurse`);
}
