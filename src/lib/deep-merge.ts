type Messages = { [key: string]: string | Messages };

// Per-key fallback merge for message catalogs: a partially-translated locale
// keeps the base (German) value for keys it hasn't translated yet, instead of
// losing the whole namespace to a shallow overwrite.
export function deepMergeMessages(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const existing = out[key];
    out[key] =
      existing && typeof existing === "object" && typeof value === "object"
        ? deepMergeMessages(existing, value)
        : value;
  }
  return out;
}
