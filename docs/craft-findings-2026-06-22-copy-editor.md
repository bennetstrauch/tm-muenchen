# Craft Review Findings — Copy-Editor feature (2026-06-22)

Commit reviewed: `148d49f` — feat: Copy-Editor — Texte tab + Copy-Änderungsbenachrichtigung (#99–#104)

All findings scored ≥ 80. Ordered by score descending within each angle.

---

## Robustness

### J (92) — Silent fetch failure on initial load in texte-tab.tsx

`texte-tab.tsx` lines 231–235:
```ts
useEffect(() => {
  fetch('/api/admin/texte')
    .then(r => r.json())
    .then((data: Record<string, string>) => setValues(data))
    .finally(() => setLoading(false));
}, []);
```
No `.catch()`. Network error, 401, or 500 swallows silently. `setLoading(false)` fires, form renders empty, user has no idea if the form is blank or broken.

**Fix:** Add a `loadError` state and render an error message. Check `r.ok` before calling `.json()`.

---

### K (88) — `r.json()` called unconditionally on non-ok responses

Same fetch in `texte-tab.tsx`. A 401 or 500 body gets parsed as `Record<string, string>` and silently written into `values`.

**Fix:** Check `r.ok` first; if false, throw or set error state.

---

### L (85) — 409 SHA conflict surfaces as unactionable generic 500

`route.ts` PUT handler: if GitHub returns 409 (stale SHA — another write happened between read and commit), the user sees "Fehler beim Speichern." with no indication of the cause.

**Fix:** Detect 409 in `commitDeCopy` and throw a distinct typed error. Route returns a specific message: "Jemand hat die Datei gleichzeitig bearbeitet. Bitte Seite neu laden."

---

## Simplicity

### D (88) — Regex-on-source-file to extract subset keys in YAML

`notify-copy-editor.yml` lines 82–88: extracts editable keys by running `matchAll(/key:\s*'([^']+)'/g)` on the `copy-subset.ts` source file, inside a shell substitution inside a `node -e` string inside YAML. Three levels of fragile nesting. Will silently produce wrong keys if source formatting changes.

**Fix:** Extract a plain `copy-subset.mjs` (or `copy-subset.json`) alongside `copy-subset.ts` that exports/contains the same key list. CI can `require()` it directly without regex or TS compilation.

---

## Domain coherence

### H (88) — Hardcoded München sender address in generic workflow

`notify-copy-editor.yml` line 107:
```yaml
from: 'TM München <muenchen@post.meditation.de>'
```
This is the Freiburg copy-editor notification sent from the München tenant's email. Wrong sender, can't be fixed without touching the workflow file.

**Fix:** Add `COPY_EDITOR_FROM_EMAIL` as a GitHub Actions secret (set to the appropriate sender), or reuse an existing `RESEND_FROM_EMAIL` secret.

---

### F (82) — Redundant overlapping author filter conditions

`notify-copy-editor.yml` lines 30–31:
```bash
if [[ "$AUTHOR" == "github-actions[bot]@users.noreply.github.com" ]] || \
   [[ "$AUTHOR" == *"github-actions"* ]]; then
```
The glob `*"github-actions"*` subsumes the exact email match entirely.

**Fix:** Delete the exact-match line, keep only the glob.

---

## Deep-module discipline

### N/B (82) — `getNestedValue` duplicated across module boundary

`getNestedValue` is defined privately in `route.ts` and then copied verbatim into `copy-subset.test.ts` because `route.ts` doesn't export it. Pure stable utility that has two independent callers.

**Fix:** Extract to `lib/nested.ts` (or `lib/dot-path.ts`), export `getNestedValue` and `setNestedValue` from there. Both `route.ts` and `copy-subset.test.ts` import from the shared location.

---

## Pattern consistency

### P (88) — New in-route auth pattern not established elsewhere

`texte/route.ts` introduces `parseCookieHeader()` + inline `isAuthorizedAdminApi()` call — an auth pattern not used in any other admin route. `einstellungen/route.ts` has no in-route auth; `email-send/route.ts` only checks a magic-link token header.

**Fix:** Either apply this pattern to all admin routes (makes `einstellungen` properly protected), or remove it from `texte/route.ts` and rely on the same external protection the others do. Make a conscious decision and document it.

---

### S (85) — `INPUT_CLS` defined identically in three admin tab files

`texte-tab.tsx`, `einstellungen-tab.tsx`, and `events.tsx` each declare their own local `INPUT_CLS` with near-identical Tailwind strings.

**Fix:** Extract to a shared constant — either `lib/admin-styles.ts` exporting `INPUT_CLS`, or a small `AdminInput` wrapper component. Use consistently across all admin tabs.

---

## Not addressed (scored < 80, dropped)

- `parseCookieHeader()` single-use helper (A: 15)
- `allSubsetKeys()` one-liner export (C: 45)
- `authHeader()` one-liner in github-copy.ts (E: 25)
- `// Simple grep…` comment in YAML (G: 45)
- `// human-readable German label` comment in copy-subset.ts (I: 38)
- `CopyFieldType` exported but uncalled (M: 45)
- `CopySection` exported but uncalled (O: 28)
- Double-condition tab render `{tab === 'texte' && canEditCopy && <TexteTab />}` (R: 62)
- Cookie read via two mechanisms (Q: 75 — just below threshold)
