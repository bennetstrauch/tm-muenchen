# ADR 0008 — GitHub API as Write Mechanism for Landing Page Copy Editing

## Status
Accepted

## Context

Landing page copy lives in `messages/de.json` (source of truth). A GitHub Action auto-translates changed keys into EN/FR/ES on every push to `main`. Jochen (TM teacher, Freiburg center admin) regularly reviews the copy and sends corrections via screenshots — Bennet applies them manually.

Two goals:
1. Let Jochen edit copy himself via a form in the existing admin panel
2. Notify Jochen automatically when Bennet pushes new or changed copy

The challenge: Vercel has a read-only filesystem, so the admin cannot write `de.json` directly at runtime. Two alternatives were considered:

**Option A — GitHub API commit:** The admin Texte tab reads `de.json`, shows a form, and on save commits the updated file to `main` via the GitHub API using a fine-grained token. The existing auto-translate Action fires automatically.

**Option B — Supabase copy overrides:** Save edits to a `copy_overrides` Supabase table and merge on top of `de.json` at render time. Requires a separate translation step (Claude API on save) and creates two sources of truth for copy.

## Decision

Use **Option A (GitHub API commit)**.

- `de.json` stays the single source of truth — no merge logic at render time
- The existing auto-translate pipeline is preserved with zero changes
- A GitHub fine-grained token scoped to contents:write on this repo is stored as a Vercel env var
- Commits from the admin panel use author `"TM Admin <admin-bot@tm-muenchen.de>"` so the notification Action can filter them out

A **`copy-subset.ts` config** lists which sections and keys are exposed in the form. Adding a new section to `de.json` does NOT automatically expose it — Bennet makes a deliberate second commit to add it to the config. This keeps the editable surface intentional.

A **second GitHub Action** (separate from translate.yml) fires on `de.json` changes, filters out commits by the admin bot and `github-actions[bot]`, and sends Jochen a human-readable German email via Resend listing old → new values for each changed key.

## Consequences

- A GitHub fine-grained token must be rotated if revoked (low operational burden for infrequent edits)
- Simultaneous edits by Jochen and Bennet could cause a conflict — acceptable given infrequent use; last write wins, git history preserves both
- Any tenant admin can reach the Texte tab; the UI notes that edits are global (all centers)
- Adding a new editable section requires a deliberate code step (add to `copy-subset.ts`) — this is a feature, not a bug
