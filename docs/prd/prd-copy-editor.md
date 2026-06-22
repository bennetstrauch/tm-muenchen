## Problem Statement

Jochen (TM teacher, Freiburg center admin) reviews the landing page copy and sends corrections to Bennet via screenshots. Bennet applies them manually. This creates unnecessary friction for both parties. Additionally, when Bennet adds new sections or rewrites existing copy, Jochen has no way to know until he happens to visit the page.

## Solution

1. A **Texte tab** in the existing admin panel lets Jochen edit a curated subset of the German landing page copy directly — no code, no screenshots, no middleman. On save, the change commits to `main` via GitHub API, triggering the existing auto-translate Action (EN/FR/ES updated automatically).

2. A **Copy-Änderungsbenachrichtigung** emails Jochen automatically when Bennet pushes changes to `de.json` — listing old → new values in German so he can review without opening the site.

## User Stories

1. As Jochen (copy editor), I want to open the admin panel and see a Texte tab, so that I know where to edit landing page copy.
2. As Jochen, I want the Texte tab to be absent when I log in to a center that is not enabled for copy editing, so that I am not confused by tabs that do not apply to my role.
3. As Jochen, I want the form to show human-readable section and field labels (not raw JSON keys), so that I can find the text I want to change without technical knowledge.
4. As Jochen, I want to edit multi-line copy blocks (e.g. ForWhom descriptions) in a textarea, so that I can make comfortable edits to longer text.
5. As Jochen, I want to see a clear note that my edits affect all TM centers globally, so that I understand the scope of my changes before saving.
6. As Jochen, I want to click Save and see a success confirmation, so that I know my change was applied.
7. As Jochen, I want my save to automatically update the English, French, and Spanish translations, so that I do not need to coordinate with Bennet for translation work.
8. As Jochen, I want to receive an email when Bennet changes landing page copy, so that I can proactively review it for accuracy and tone.
9. As Jochen, I want the notification email to show me exactly what changed (old value to new value, per string), so that I can quickly assess whether a correction is needed.
10. As Jochen, I do NOT want to receive an email when I make my own changes, so that I am not spammed with confirmations of my own work.
11. As Jochen, I do NOT want to receive an email when the auto-translate bot commits (EN/FR/ES updates), since those are derived from my own edits.
12. As Bennet, I want only tenants with `can_edit_copy = true` to see the Texte tab, so that other center admins do not accidentally edit global copy.
13. As Bennet, I want new sections I add to `de.json` to stay out of the editable subset until I explicitly add them, so that the editable surface stays intentional.
14. As Bennet, I want the commit in git to be clearly attributed to the admin bot (not Jochen's name), so that the notification filter can reliably skip it.

## Implementation Decisions

### DB migration
- Add `can_edit_copy boolean NOT NULL DEFAULT false` to the `tenants` table.
- Set `can_edit_copy = true` for the Freiburg tenant in the same migration.
- Add `can_edit_copy` to `TenantRow` type in `supabase.ts` and to `TenantConfig`.

### Copy subset config (`lib/copy-subset.ts`)
- Exports a typed config: array of sections, each with a human-readable label and an array of fields (key + label + type: `text` or `textarea`).
- Initial editable sections: `ForWhom` (item titles + descriptions), `WhyTm` (benefit titles + short/expanded descriptions), `HowItWorks` (step titles + descriptions), `WasAndereSagen` (quotes + extended quotes), `Hero` (headlines, subtitle), `AbschlussCta` (heading, body).
- Excluded: all UI chrome, aria labels, format strings with placeholders, nav labels, button copy, cookie banner.
- Adding a new section to the subset requires a deliberate code change to this config — not automatic when de.json gains a new section.

### GitHub API client (`lib/github-copy.ts`)
- `readDeCopy()` — reads `messages/de.json` from the repo via GitHub API using `GITHUB_COPY_TOKEN` env var. Returns content + SHA.
- `commitDeCopy(updated, sha)` — commits the updated file to `main`. Commit author: `"TM Admin Bot <admin-bot@tm-muenchen.de>"`, message: `"chore: update landing page copy via admin [skip-notify]"`. The `[skip-notify]` marker lets the notification Action filter it out.
- Throws on API error. Both functions are unit-tested with mocked fetch.

### API route (`/api/admin/texte`)
- `GET`: reads `de.json` via `readDeCopy()`, filters to subset keys, returns values.
- `PUT`: receives updated subset values, merges into full de.json (deep merge — only allowed keys overwritten), commits via `commitDeCopy()`.
- Protected by the existing admin session gate.
- Returns `{ ok: true }` on success, `{ error: string }` on failure.

### Texte tab (`app/admin/texte-tab.tsx`)
- Client component. On mount: fetches current values from `GET /api/admin/texte`.
- Renders sections from `copy-subset.ts` config: section heading, then one input or textarea per field.
- Global note at top: "Diese Texte gelten für alle TM-Zentren."
- One Save button for the whole form. Shows saving / success / error state.

### Admin tab wiring
- `AdminClient` receives new prop `canEditCopy: boolean` from the server page.
- `Tab` union type gains `texte` variant — only included in `VALID_TABS` and rendered when `canEditCopy` is true.
- `admin/page.tsx` reads `tenant.can_edit_copy` and passes it down.

### Copy-Änderungsbenachrichtigung (`.github/workflows/notify-copy-editor.yml`)
- Triggers on push to `main` when `messages/de.json` changes.
- If commit message contains `[skip-notify]` or author is `github-actions[bot]`, exits early.
- Computes diff: gets old and new versions of `de.json`, flattens to key-value maps, collects changed keys.
- Filters diff to subset keys only.
- Sends email via Resend API (plain HTTP) to Jochen's address (stored as `COPY_EDITOR_EMAIL` GitHub secret). Subject: "Seitentext geändert". Body: changed strings as old to new pairs, in German.
- `RESEND_API_KEY` and `COPY_EDITOR_EMAIL` stored as GitHub Actions secrets.

### Environment variables
- `GITHUB_COPY_TOKEN` — GitHub fine-grained token, `contents:write` scope on this repo. Added to Vercel env vars.
- `COPY_EDITOR_EMAIL` — Jochen's email. Added as GitHub Actions secret.

## Testing Decisions

Good tests verify observable behavior through public interfaces, not internals.

- **`lib/github-copy.ts`** — unit tests with mocked fetch (same pattern as `lib/tmw-infobooking.test.ts`): verify correct URL, Authorization header, request body shape, SHA passed in commit; verify throws on non-2xx.
- **`/api/admin/texte`** — unit tests (same pattern as `api/admin/einstellungen/route.test.ts`): mock Supabase tenant fetch + github-copy module; verify GET returns only subset keys; verify PUT merges correctly and calls commit; verify non-admin request is rejected.
- **`lib/copy-subset.ts`** — lightweight validation test: every key referenced in the config exists in `de.json` (prevents stale references after copy changes).

## Out of Scope

- Per-field save or autosave
- Rich-text / WYSIWYG editing
- Preview of changes before committing
- Conflict resolution for simultaneous edits (last write wins; git history preserves both)
- Extending copy editing to other tenants (can_edit_copy flag makes it easy to enable later)
- Notification for non-copy changes (new components, layout changes)
- Jochen editing event descriptions (already possible via Veranstaltungen tab)

## Further Notes

See ADR 0008 (`docs/adr/0008-github-api-as-copy-cms.md`) for the trade-off between GitHub API commit vs. Supabase copy overrides. CONTEXT.md sections "Copy-Editor" and "Copy-Änderungsbenachrichtigung" define the domain terms.

The `[skip-notify]` marker in the admin bot commit message is the filter mechanism — simpler than checking commit author names which can vary.
