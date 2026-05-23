import crypto from "node:crypto";
import { getSupabase } from "./supabase";
import GLOSSARY from "@/i18n/translation-glossary.json";

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
};

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function buildGlossaryText(locale: string): string {
  return Object.entries(GLOSSARY)
    .filter(([k]) => !k.startsWith("_"))
    .flatMap(([term, translations]) => {
      const t = translations as Record<string, string>;
      return t[locale] ? [`- "${term}" → "${t[locale]}"`] : [];
    })
    .join("\n");
}

async function translateViaClaude(text: string, locale: string, context: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const prompt = [
    `You are translating content for TM München, a Transcendental Meditation center in Munich.`,
    `Context: ${context}`,
    `Target language: ${LOCALE_NAMES[locale]}`,
    `Tone: warm, professional. Preserve line breaks and punctuation exactly.`,
    ``,
    `Glossary (always use these exact translations):`,
    buildGlossaryText(locale),
    ``,
    `Translate the following German text. Return ONLY the translated text, nothing else:`,
    ``,
    text,
  ].join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.content[0].text as string).trim();
}

/**
 * Returns a cached translation from Supabase, or fetches one from Claude and caches it.
 * Falls back to the original German text on any error so the page never breaks.
 *
 * @param text    German source text
 * @param locale  Target locale (e.g. "en", "fr", "es")
 * @param context Short description of what's being translated, e.g. "teacher bio"
 */
export async function getTranslation(
  text: string,
  locale: string,
  context = "marketing content"
): Promise<string> {
  if (locale === "de" || !text.trim()) return text;

  try {
    const supabase = getSupabase();
    const hash = sha256(text);

    const { data } = await supabase
      .from("translation_cache")
      .select("translated_text")
      .eq("source_hash", hash)
      .eq("locale", locale)
      .single();

    if (data) return data.translated_text;

    const translated = await translateViaClaude(text, locale, context);

    await supabase.from("translation_cache").upsert(
      { source_hash: hash, locale, translated_text: translated },
      { onConflict: "source_hash,locale", ignoreDuplicates: true }
    );

    return translated;
  } catch (err) {
    console.error("[translate] failed, falling back to German:", err);
    return text;
  }
}
